import type {
  FilterStrictness,
  JobEnrichment,
  JobExplanation,
  JobFilterDecision,
  JobScore,
  UserFilterRule,
  UserSearchProfile,
} from './intelligence';
import type { Job, JobStatus } from './types';

export interface ListRankedJobsParams {
  status?: JobStatus;
  search?: string;
  limit?: number;
  after?: string;
  strictness?: FilterStrictness;
  includeFiltered?: boolean;
}

export interface RankedJobRecord {
  job: Job;
  enrichment?: JobEnrichment | null;
  score?: JobScore | null;
  filterDecision?: JobFilterDecision | null;
  explanation?: JobExplanation | null;
}

export interface ListRankedJobsResult {
  jobs: RankedJobRecord[];
  nextPageToken?: string;
}

export interface UpsertUserSearchProfileInput {
  target_titles: string[];
  target_skills?: string[];
  excluded_skills?: string[];
  salary_min?: number;
  preferred_locations?: string[];
  remote_preferences?: string[];
  seniority_preferences?: string[];
  work_authorization?: string;
}

export interface UpsertUserFilterRuleInput {
  id?: number;
  rule_type: string;
  operator: string;
  value_json: Record<string, unknown>;
  enabled?: boolean;
  strictness?: FilterStrictness;
}

export interface JobIntelligenceSnapshot {
  jobId: number;
  enrichment?: JobEnrichment | null;
  score?: JobScore | null;
  filterDecision?: JobFilterDecision | null;
  explanation?: JobExplanation | null;
}

/**
 * Additive SDK surface for the future intelligence layer.
 *
 * This stays separate from the inherited SDK so existing desktop/web
 * implementations do not need to change until the new product layer is wired.
 */
export interface JobIntelligenceApiSdk {
  getUserSearchProfile(): Promise<UserSearchProfile | null>;
  upsertUserSearchProfile(input: UpsertUserSearchProfileInput): Promise<UserSearchProfile>;

  listUserFilterRules(): Promise<UserFilterRule[]>;
  upsertUserFilterRule(input: UpsertUserFilterRuleInput): Promise<UserFilterRule>;
  deleteUserFilterRule(ruleId: number): Promise<void>;

  listRankedJobs(params: ListRankedJobsParams): Promise<ListRankedJobsResult>;
  getJobIntelligence(jobId: number): Promise<JobIntelligenceSnapshot | null>;
}
