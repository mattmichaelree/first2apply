import { DOMParser } from 'deno-dom-wasm';
import { z } from 'zod';

import { JobSiteParseResult, ParsedJob } from './parserTypes.ts';

const builtInJobSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().min(1),
  url: z.string().url(),
  companyName: z.string().min(1),
  companyLogo: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  isRemote: z.boolean().optional(),
  isHybrid: z.boolean().optional(),
  isOnSite: z.boolean().optional(),
});

const builtInPayloadSchema = z.object({
  jobs: z.array(builtInJobSchema),
});

const emptyResult: JobSiteParseResult = {
  jobs: [],
  listFound: false,
  elementsCount: 0,
};

export function parseBuiltinJobs({ siteId, html }: { siteId: number; html: string }): JobSiteParseResult {
  const marker = 'Builtin.jobMatchInit(';
  const document = new DOMParser().parseFromString(html, 'text/html');
  if (!document) return emptyResult;

  const script = Array.from(document.querySelectorAll('script')).find((element) =>
    element.textContent.includes(marker),
  );
  const scriptContent = script?.textContent ?? '';
  const markerIndex = scriptContent.indexOf(marker);
  if (markerIndex < 0) return emptyResult;

  const payloadStart = markerIndex + marker.length;
  const payloadEnd = scriptContent.lastIndexOf(');');
  if (payloadEnd < 0) return emptyResult;

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(scriptContent.slice(payloadStart, payloadEnd));
  } catch (error) {
    if (error instanceof SyntaxError) return emptyResult;
    throw error;
  }

  const payload = builtInPayloadSchema.safeParse(rawPayload);
  if (!payload.success) return emptyResult;

  const jobs = payload.data.jobs.map((job): ParsedJob => {
    const jobType = job.isRemote ? 'remote' : job.isHybrid ? 'hybrid' : job.isOnSite ? 'onsite' : undefined;

    return {
      siteId,
      externalId: String(job.id),
      externalUrl: job.url,
      title: job.title,
      companyName: job.companyName,
      companyLogo: job.companyLogo ?? undefined,
      location: job.location ?? undefined,
      jobType,
      labels: [],
      tags: [],
    };
  });

  return {
    jobs,
    listFound: true,
    elementsCount: jobs.length,
  };
}
