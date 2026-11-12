const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
} as const;
const SELECT_COLUMNS = [
  "id",
  "external_id:externalId",
  "external_url:externalUrl",
  "site:discovery_sites!inner(provider)",
  "title",
  "company_name:companyName",
  "company_logo:companyLogo",
  "location",
  "created_at",
  "updated_at",
  "salary",
  "tags",
  "job_type:jobType",
  "status",
  "description",
  "labels",
  "link_id",
  "exclude_reason",
].join(",");

type Pagination = {
  readonly afterId: number;
  readonly limit: number;
};

type SanitizedJob = {
  readonly id: number;
  readonly external_id: string;
  readonly external_url: string;
  readonly provider: string;
  readonly title: string;
  readonly company_name: string;
  readonly company_logo: string | null;
  readonly location: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly salary: string | null;
  readonly tags: readonly string[];
  readonly job_type: string | null;
  readonly status: string;
  readonly description: string | null;
  readonly labels: readonly string[];
  readonly link_id: number | null;
  readonly exclude_reason: string | null;
};

export type ExportHandlerDependencies = Readonly<{
  getEnv: (name: string) => string | undefined;
  fetch: typeof fetch;
}>;

const DEFAULT_DEPENDENCIES: ExportHandlerDependencies = {
  getEnv: (name) => Deno.env.get(name),
  fetch: globalThis.fetch,
};

function jsonResponse(
  body: Readonly<Record<string, unknown>>,
  status: number,
  headers?: Readonly<Record<string, string>>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePagination(value: unknown): Pagination | null {
  if (!isRecord(value)) return null;
  if (Object.keys(value).some((key) => key !== "after_id" && key !== "limit")) {
    return null;
  }

  const afterId = value.after_id ?? 0;
  const limit = value.limit ?? DEFAULT_LIMIT;
  if (
    !Number.isInteger(afterId) || typeof afterId !== "number" || afterId < 0
  ) {
    return null;
  }
  if (
    !Number.isInteger(limit) || typeof limit !== "number" || limit < 1 ||
    limit > MAX_LIMIT
  ) return null;

  return { afterId, limit };
}

async function sha256(value: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

export async function timingSafeDigestEqual(
  left: string,
  right: string,
): Promise<boolean> {
  const [leftDigest, rightDigest] = await Promise.all([
    sha256(left),
    sha256(right),
  ]);
  let difference = 0;

  for (let index = 0; index < leftDigest.length; index += 1) {
    difference |= leftDigest[index] ^ rightDigest[index];
  }

  return difference === 0;
}

function requireString(
  row: Readonly<Record<string, unknown>>,
  key: string,
): string {
  const value = row[key];
  if (typeof value !== "string") {
    throw new TypeError(`Invalid database field: ${key}`);
  }
  return value;
}

function requireNumber(
  row: Readonly<Record<string, unknown>>,
  key: string,
): number {
  const value = row[key];
  if (typeof value !== "number") {
    throw new TypeError(`Invalid database field: ${key}`);
  }
  return value;
}

function nullableString(
  row: Readonly<Record<string, unknown>>,
  key: string,
): string | null {
  const value = row[key];
  if (value === null || typeof value === "string") return value;
  throw new TypeError(`Invalid database field: ${key}`);
}

function nullableNumber(
  row: Readonly<Record<string, unknown>>,
  key: string,
): number | null {
  const value = row[key];
  if (value === null || typeof value === "number") return value;
  throw new TypeError(`Invalid database field: ${key}`);
}

function requireStringArray(
  row: Readonly<Record<string, unknown>>,
  key: string,
): readonly string[] {
  const value = row[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new TypeError(`Invalid database field: ${key}`);
  }
  return value;
}

function sanitizeJob(value: unknown): SanitizedJob {
  if (!isRecord(value) || !isRecord(value.site)) {
    throw new TypeError("Invalid database row");
  }

  return {
    id: requireNumber(value, "id"),
    external_id: requireString(value, "external_id"),
    external_url: requireString(value, "external_url"),
    provider: requireString(value.site, "provider"),
    title: requireString(value, "title"),
    company_name: requireString(value, "company_name"),
    company_logo: nullableString(value, "company_logo"),
    location: nullableString(value, "location"),
    created_at: requireString(value, "created_at"),
    updated_at: requireString(value, "updated_at"),
    salary: nullableString(value, "salary"),
    tags: requireStringArray(value, "tags"),
    job_type: nullableString(value, "job_type"),
    status: requireString(value, "status"),
    description: nullableString(value, "description"),
    labels: requireStringArray(value, "labels"),
    link_id: nullableNumber(value, "link_id"),
    exclude_reason: nullableString(value, "exclude_reason"),
  };
}

function buildJobsUrl(
  supabaseUrl: string,
  ownerId: string,
  afterId: number,
): URL {
  const url = new URL("/rest/v1/discovery_jobs", supabaseUrl);
  url.searchParams.set("select", SELECT_COLUMNS);
  url.searchParams.set("user_id", `eq.${ownerId}`);
  url.searchParams.set("id", `gt.${afterId}`);
  url.searchParams.set("order", "id.asc");
  return url;
}

export function createHandler(
  dependencies: ExportHandlerDependencies = DEFAULT_DEPENDENCIES,
): (request: Request) => Promise<Response> {
  return async (request) => {
    if (request.method !== "POST") {
      return jsonResponse({ error: "method_not_allowed" }, 405, {
        allow: "POST",
      });
    }

    const expectedToken = dependencies.getEnv("CAREEROS_EXPORT_TOKEN") ?? "";
    const providedToken = request.headers.get("x-careeros-sync-token") ?? "";
    const tokenMatches = await timingSafeDigestEqual(
      providedToken,
      expectedToken,
    );
    if (
      providedToken.length === 0 || expectedToken.length === 0 || !tokenMatches
    ) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return jsonResponse({ error: "invalid_input" }, 400);
      }
      throw error;
    }

    const pagination = parsePagination(requestBody);
    if (pagination === null) {
      return jsonResponse({ error: "invalid_input" }, 400);
    }

    try {
      const supabaseUrl = dependencies.getEnv("SUPABASE_URL");
      const serviceRoleKey = dependencies.getEnv("SUPABASE_SERVICE_ROLE_KEY");
      const ownerId = dependencies.getEnv("CAREEROS_EXPORT_USER_ID");
      if (!supabaseUrl || !serviceRoleKey || !ownerId) {
        throw new TypeError("Missing Supabase configuration");
      }

      const response = await dependencies.fetch(
        buildJobsUrl(supabaseUrl, ownerId, pagination.afterId),
        {
          method: "GET",
          headers: {
            apikey: serviceRoleKey,
            authorization: `Bearer ${serviceRoleKey}`,
            range: `0-${pagination.limit}`,
            "range-unit": "items",
          },
        },
      );
      if (!response.ok) throw new TypeError("Supabase query failed");

      const rows: unknown = await response.json();
      if (!Array.isArray(rows)) {
        throw new TypeError("Invalid Supabase response");
      }

      const hasMore = rows.length > pagination.limit;
      const jobs = rows.slice(0, pagination.limit).map(sanitizeJob);
      return jsonResponse({
        jobs,
        has_more: hasMore,
        next_after_id: jobs.at(-1)?.id ?? pagination.afterId,
      }, 200);
    } catch (error) {
      const category = error instanceof Error ? error.name : "UnknownError";
      console.error("careeros-export failed", category);
      return jsonResponse({ error: "internal_error" }, 500);
    }
  };
}

if (import.meta.main) Deno.serve(createHandler());
