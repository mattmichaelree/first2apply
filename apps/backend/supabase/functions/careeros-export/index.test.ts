import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "jsr:@std/assert@1.0.14";

import {
  createHandler,
  type ExportHandlerDependencies,
  timingSafeDigestEqual,
} from "./index.ts";

const SYNC_TOKEN = "sync-secret";
const SUPABASE_URL = "https://hosted-project.supabase.co";
const SERVICE_ROLE_KEY = "service-role-secret";
const EXPORT_USER_ID = "00000000-0000-4000-8000-000000000001";

type FetchCall = {
  readonly input: string | URL | Request;
  readonly init?: RequestInit;
};

function createDependencies(
  fetchResponse: Response,
  overrides: Readonly<Record<string, string | undefined>> = {},
): {
  readonly calls: FetchCall[];
  readonly dependencies: ExportHandlerDependencies;
} {
  const calls: FetchCall[] = [];
  const values: Readonly<Record<string, string | undefined>> = {
    CAREEROS_EXPORT_TOKEN: SYNC_TOKEN,
    CAREEROS_EXPORT_USER_ID: EXPORT_USER_ID,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: SERVICE_ROLE_KEY,
    ...overrides,
  };

  return {
    calls,
    dependencies: {
      getEnv: (name) => values[name],
      fetch: (input, init) => {
        calls.push({ input, init });
        return Promise.resolve(fetchResponse.clone());
      },
    },
  };
}

function createRequest(
  body: string,
  token: string | null = SYNC_TOKEN,
  method = "POST",
): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (token !== null) headers.set("x-careeros-sync-token", token);

  return new Request("https://example.test/careeros-export", {
    method,
    headers,
    body: method === "POST" ? body : undefined,
  });
}

Deno.test("POST exports an owner-scoped sanitized page using stable ID pagination", async () => {
  const rawRows = [
    {
      id: 11,
      external_id: "external-11",
      external_url: "https://jobs.example/11",
      site: { provider: "linkedin" },
      title: "Lifecycle Operations Lead",
      company_name: "Example Co",
      company_logo: null,
      location: "Remote",
      created_at: "2026-10-07T12:00:00Z",
      updated_at: "2026-10-08T12:00:00Z",
      salary: "$150,000",
      tags: ["operations"],
      job_type: "full-time",
      status: "new",
      description: "Build reliable systems.",
      labels: ["priority"],
      link_id: 7,
      exclude_reason: null,
      user_id: "must-not-leak",
      credentials: "must-not-leak",
    },
    {
      id: 12,
      external_id: "external-12",
      external_url: "https://jobs.example/12",
      site: { provider: "greenhouse" },
      title: "Second result proves there is another page",
      company_name: "Another Co",
      company_logo: null,
      location: null,
      created_at: "2026-10-07T13:00:00Z",
      updated_at: "2026-10-08T13:00:00Z",
      salary: null,
      tags: [],
      job_type: null,
      status: "new",
      description: null,
      labels: [],
      link_id: null,
      exclude_reason: null,
    },
  ];
  const { calls, dependencies } = createDependencies(
    new Response(JSON.stringify(rawRows), { status: 200 }),
  );
  const handler = createHandler(dependencies);

  const response = await handler(
    createRequest(JSON.stringify({ after_id: 10, limit: 1 })),
  );
  const payload = await response.json();

  assertEquals(response.status, 200);
  assertEquals(payload, {
    jobs: [{
      id: 11,
      external_id: "external-11",
      external_url: "https://jobs.example/11",
      provider: "linkedin",
      title: "Lifecycle Operations Lead",
      company_name: "Example Co",
      company_logo: null,
      location: "Remote",
      created_at: "2026-10-07T12:00:00Z",
      updated_at: "2026-10-08T12:00:00Z",
      salary: "$150,000",
      tags: ["operations"],
      job_type: "full-time",
      status: "new",
      description: "Build reliable systems.",
      labels: ["priority"],
      link_id: 7,
      exclude_reason: null,
    }],
    has_more: true,
    next_after_id: 11,
  });
  assertEquals(calls.length, 1);

  const [call] = calls;
  assert(call !== undefined);
  const url = new URL(String(call.input));
  assertEquals(url.origin, SUPABASE_URL);
  assertEquals(url.pathname, "/rest/v1/discovery_jobs");
  assertEquals(url.searchParams.get("order"), "id.asc");
  assertEquals(url.searchParams.get("user_id"), `eq.${EXPORT_USER_ID}`);
  assertEquals(url.searchParams.get("id"), "gt.10");
  const select = url.searchParams.get("select") ?? "";
  assertStringIncludes(select, "site:discovery_sites!inner(provider)");
  assert(!select.includes("user_id"));
  assert(!select.includes("credentials"));

  const headers = new Headers(call.init?.headers);
  assertEquals(headers.get("range"), "0-1");
  assertEquals(headers.get("apikey"), SERVICE_ROLE_KEY);
  assertEquals(headers.get("authorization"), `Bearer ${SERVICE_ROLE_KEY}`);
  assert(!JSON.stringify(payload).includes("must-not-leak"));
});

Deno.test("POST applies ID cursor zero and limit one hundred defaults", async () => {
  const { calls, dependencies } = createDependencies(
    new Response(JSON.stringify([]), { status: 200 }),
  );

  const response = await createHandler(dependencies)(createRequest("{}"));

  assertEquals(response.status, 200);
  assertEquals(await response.json(), {
    jobs: [],
    has_more: false,
    next_after_id: 0,
  });
  assertEquals(new Headers(calls[0]?.init?.headers).get("range"), "0-100");
  const url = new URL(String(calls[0]?.input));
  assertEquals(url.searchParams.get("id"), "gt.0");
  assertEquals(url.searchParams.get("user_id"), `eq.${EXPORT_USER_ID}`);
});

Deno.test("non-POST requests return 405 without querying Supabase", async () => {
  const { calls, dependencies } = createDependencies(new Response("[]"));

  const response = await createHandler(dependencies)(
    createRequest("", null, "GET"),
  );

  assertEquals(response.status, 405);
  assertEquals(await response.json(), { error: "method_not_allowed" });
  assertEquals(calls.length, 0);
});

Deno.test("missing or incorrect sync tokens return 401 without querying Supabase", async () => {
  for (const token of [null, "incorrect"]) {
    const { calls, dependencies } = createDependencies(new Response("[]"));

    const response = await createHandler(dependencies)(
      createRequest("{}", token),
    );

    assertEquals(response.status, 401);
    assertEquals(await response.json(), { error: "unauthorized" });
    assertEquals(calls.length, 0);
  }
});

Deno.test("invalid JSON and pagination values return 400", async () => {
  const invalidBodies = [
    "{",
    "null",
    "[]",
    JSON.stringify({ after_id: -1 }),
    JSON.stringify({ after_id: 1.5 }),
    JSON.stringify({ limit: 0 }),
    JSON.stringify({ limit: 501 }),
    JSON.stringify({ limit: 1.5 }),
  ];

  for (const body of invalidBodies) {
    const { calls, dependencies } = createDependencies(new Response("[]"));

    const response = await createHandler(dependencies)(createRequest(body));

    assertEquals(response.status, 400, body);
    assertEquals(await response.json(), { error: "invalid_input" }, body);
    assertEquals(calls.length, 0, body);
  }
});

Deno.test("database and configuration failures return bounded 500 errors", async () => {
  const internalDetails = "password=secret host=db.internal";
  const failureCases = [
    createDependencies(new Response(internalDetails, { status: 503 })),
    createDependencies(new Response("[]"), {
      SUPABASE_SERVICE_ROLE_KEY: undefined,
    }),
    createDependencies(new Response("[]"), {
      CAREEROS_EXPORT_USER_ID: undefined,
    }),
  ];

  for (const { dependencies } of failureCases) {
    const response = await createHandler(dependencies)(createRequest("{}"));
    const body = await response.text();

    assertEquals(response.status, 500);
    assertEquals(body, '{"error":"internal_error"}');
    assert(!body.includes(internalDetails));
  }
});

Deno.test("token comparison hashes both values before constant-time comparison", async () => {
  assertEquals(await timingSafeDigestEqual("same-token", "same-token"), true);
  assertEquals(await timingSafeDigestEqual("same-token", "other-token"), false);
  assertEquals(await timingSafeDigestEqual("", "other-token"), false);
});
