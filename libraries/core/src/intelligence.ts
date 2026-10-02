export type FilterStrictness = 'broad' | 'balanced' | 'strict';

export type UserSearchProfile = {
  id: number;
  user_id: string;
  target_titles: string[];
  target_skills: string[];
  excluded_skills: string[];
  salary_min?: number;
  preferred_locations: string[];
  remote_preferences: string[];
  seniority_preferences: string[];
  work_authorization?: string;
  created_at: Date;
  updated_at: Date;
};

export type UserFilterRule = {
  id: number;
  user_id: string;
  rule_type: string;
  operator: string;
  value_json: Record<string, unknown>;
  enabled: boolean;
  strictness: FilterStrictness;
  created_at: Date;
  updated_at: Date;
};

export type JobEnrichment = {
  id: number;
  job_id: number;
  normalized_title?: string;
  normalized_company?: string;
  normalized_location?: string;
  remote_type?: string;
  seniority_level?: string;
  salary_normalized_min?: number;
  salary_normalized_max?: number;
  employment_type?: string;
  required_skills: string[];
  excluded_geographies: string[];
  enrichment_version: string;
  created_at: Date;
  updated_at: Date;
};

export type JobScore = {
  id: number;
  job_id: number;
  user_id: string;
  fit_score?: number;
  urgency_score?: number;
  quality_score?: number;
  freshness_score?: number;
  overall_score?: number;
  score_version: string;
  created_at: Date;
  updated_at: Date;
};

export type JobFilterDecision = {
  id: number;
  job_id: number;
  user_id: string;
  decision: string;
  reason_short?: string;
  reason_long?: string;
  evidence_json: Record<string, unknown>;
  mode: FilterStrictness;
  decision_version: string;
  created_at: Date;
};

export type JobExplanation = {
  summary?: string;
  fit_reasons: string[];
  concerns: string[];
  filter_reasons: string[];
  evidence: Array<{
    label: string;
    value: string;
    source?: 'observed' | 'inferred' | 'user_rule';
  }>;
  mode: FilterStrictness;
  versions?: {
    enrichment?: string;
    score?: string;
    decision?: string;
  };
};
