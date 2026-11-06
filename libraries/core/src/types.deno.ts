import type {
  JobEnrichment,
  JobFilterDecision,
  JobScore,
  UserFilterRule,
  UserSearchProfile,
} from './intelligence.deno.ts';

export enum SiteProvider {
  linkedin = 'linkedin',
  glassdoor = 'glassdoor',
  indeed = 'indeed',
  remoteok = 'remoteok',
  weworkremotely = 'weworkremotely',
  dice = 'dice',
  flexjobs = 'flexjobs',
  bestjobs = 'bestjobs',
  echojobs = 'echojobs',
  remotive = 'remotive',
  remoteio = 'remoteio',
  builtin = 'builtin',
  naukri = 'naukri',
  robertHalf = 'robertHalf',
  zipRecruiter = 'zipRecruiter',
  usaJobs = 'usaJobs',
  talent = 'talent',
  hiringCafe = 'hiringCafe',

  custom = 'custom',
}

export const JOB_LABELS = {
  CONSIDERING: 'Considering',
  SUBMITTED: 'Submitted',
  INTERVIEWING: 'Interviewing',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  GHOSTED: 'Ghosted',
} as const;

export type JobLabel = (typeof JOB_LABELS)[keyof typeof JOB_LABELS];

export type User = {
  id: string;
  email: string;
};

export type JobSite = {
  id: number;
  provider: SiteProvider;
  name: string;
  urls: string[];
  queryParamsToRemove?: string[];
  blacklisted_paths: string[];
  created_at: string;
  logo_url: string;
  deprecated: boolean;
  incognito_support: boolean;
};

export type Link = {
  id: number;
  url: string;
  title: string;
  user_id: string;
  site_id: number;
  created_at: string;
  scrape_failure_count: number;
  last_scraped_at: string;
  scrape_failure_email_sent: boolean;
};

export type JobType = 'remote' | 'hybrid' | 'onsite';
export type JobStatus = 'new' | 'applied' | 'archived' | 'deleted' | 'processing' | 'excluded_by_advanced_matching';

export type Job = {
  id: number;
  user_id: string;
  externalId: string;
  externalUrl: string;
  siteId: number;
  title: string;
  companyName: string;
  companyLogo?: string;
  jobType?: JobType;
  location?: string;
  salary?: string;
  tags: string[];
  description?: string;
  status: JobStatus;
  labels: JobLabel[];
  created_at: Date;
  updated_at: Date;
  link_id?: number;
  exclude_reason?: string;
};

export type Review = {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  rating: number;
  created_at: Date;
};

export type HtmlDump = {
  id: number;
  user_id: string;
  url: string;
  html: string;
  created_at: Date;
  webpage_runtime_data?: WebPageRuntimeData;
};

export type Note = {
  id: number;
  created_at: Date;
  user_id: string;
  job_id: number;
  text: string;
  files: string[];
};

export type SubscriptionTier = 'basic' | 'pro';

export type Profile = {
  id: number;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_end_date: string;
  subscription_tier: SubscriptionTier;
  is_trial: boolean;
};

export type StripeBillingPlan = {
  tier: SubscriptionTier;
  monthlyCheckoutLink: string;
  quarterlyCheckoutLink: string;
  biannuallyCheckoutLink: string;
  yearlyCheckoutLink: string;
};

export type StripeConfig = {
  customerPortalLink: string;
  plans: StripeBillingPlan[];
};

export type AdvancedMatchingConfig = {
  id: number;
  user_id: string;
  blacklisted_companies: string[];
  chatgpt_prompt: string;
  ai_api_cost: number;
  ai_api_input_tokens_used: number;
  ai_api_output_tokens_used: number;
};

export type WebPageRuntimeData = Partial<Record<SiteProvider, ProviderRuntimeData>>;
export type LinkedinRuntimeData = {
  type: SiteProvider.linkedin;
  comoRehydration: string;
};

export type ProviderRuntimeData = LinkedinRuntimeData;

export type DbSchema = {
  public: {
    Tables: {
      discovery_sites: {
        Row: JobSite;
        Insert: Pick<JobSite, 'name' | 'urls'>;
        Update: never;
        Relationships: [];
      };
      discovery_links: {
        Row: Link;
        Insert: Pick<Link, 'url' | 'title' | 'site_id'>;
        Update: {
          title?: string;
          url?: string;
          scrape_failure_count?: number;
          last_scraped_at?: Date;
          scrape_failure_email_sent?: boolean;
        };
        Relationships: [];
      };
      discovery_jobs: {
        Row: Job;
        Insert: Pick<
          Job,
          | 'siteId'
          | 'externalId'
          | 'externalUrl'
          | 'title'
          | 'companyName'
          | 'companyLogo'
          | 'location'
          | 'salary'
          | 'tags'
          | 'jobType'
          | 'status'
          | 'link_id'
        >;
        Update: Pick<Job, 'status'> | Pick<Job, 'description'> | Pick<Job, 'labels'>;
        Relationships: [];
      };
      discovery_reviews: {
        Row: Review;
        Insert: Pick<Review, 'title' | 'description' | 'rating'>;
        Update: Pick<Review, 'title' | 'description' | 'rating'>;
        Relationships: [];
      };
      discovery_html_dumps: {
        Row: HtmlDump;
        Insert: Pick<HtmlDump, 'url' | 'html' | 'webpage_runtime_data'>;
        Update: never;
        Relationships: [];
      };
      discovery_profiles: {
        Row: Profile;
        Insert: never;
        Update: Pick<
          Profile,
          'stripe_customer_id' | 'stripe_subscription_id' | 'subscription_end_date' | 'subscription_tier' | 'is_trial'
        >;
        Relationships: [];
      };
      discovery_notes: {
        Row: Note;
        Insert: Pick<Note, 'job_id' | 'text' | 'files'>;
        Update: Partial<Pick<Note, 'text' | 'files'>>;
        Relationships: [];
      };
      discovery_advanced_matching: {
        Row: AdvancedMatchingConfig;
        Insert: Pick<AdvancedMatchingConfig, 'blacklisted_companies' | 'chatgpt_prompt'>;
        Update: Partial<Pick<AdvancedMatchingConfig, 'blacklisted_companies' | 'chatgpt_prompt'>>;
        Relationships: [];
      };
      user_search_profiles: {
        Row: UserSearchProfile;
        Insert: Pick<
          UserSearchProfile,
          | 'user_id'
          | 'target_titles'
          | 'target_skills'
          | 'excluded_skills'
          | 'salary_min'
          | 'preferred_locations'
          | 'remote_preferences'
          | 'seniority_preferences'
          | 'work_authorization'
          | 'updated_at'
        >;
        Update: Partial<
          Pick<
            UserSearchProfile,
            | 'target_titles'
            | 'target_skills'
            | 'excluded_skills'
            | 'salary_min'
            | 'preferred_locations'
            | 'remote_preferences'
            | 'seniority_preferences'
            | 'work_authorization'
            | 'updated_at'
          >
        >;
        Relationships: [];
      };
      user_filter_rules: {
        Row: UserFilterRule;
        Insert: Pick<
          UserFilterRule,
          'user_id' | 'rule_type' | 'operator' | 'value_json' | 'enabled' | 'strictness' | 'updated_at'
        >;
        Update: Partial<
          Pick<UserFilterRule, 'rule_type' | 'operator' | 'value_json' | 'enabled' | 'strictness' | 'updated_at'>
        >;
        Relationships: [];
      };
      job_enrichments: {
        Row: JobEnrichment;
        Insert: Pick<
          JobEnrichment,
          | 'job_id'
          | 'normalized_title'
          | 'normalized_company'
          | 'normalized_location'
          | 'remote_type'
          | 'seniority_level'
          | 'salary_normalized_min'
          | 'salary_normalized_max'
          | 'employment_type'
          | 'required_skills'
          | 'excluded_geographies'
          | 'enrichment_version'
        >;
        Update: Partial<
          Pick<
            JobEnrichment,
            | 'normalized_title'
            | 'normalized_company'
            | 'normalized_location'
            | 'remote_type'
            | 'seniority_level'
            | 'salary_normalized_min'
            | 'salary_normalized_max'
            | 'employment_type'
            | 'required_skills'
            | 'excluded_geographies'
            | 'enrichment_version'
          >
        >;
        Relationships: [];
      };
      job_scores: {
        Row: JobScore;
        Insert: Pick<
          JobScore,
          | 'job_id'
          | 'user_id'
          | 'fit_score'
          | 'urgency_score'
          | 'quality_score'
          | 'freshness_score'
          | 'overall_score'
          | 'score_version'
        >;
        Update: Partial<
          Pick<
            JobScore,
            | 'fit_score'
            | 'urgency_score'
            | 'quality_score'
            | 'freshness_score'
            | 'overall_score'
            | 'score_version'
          >
        >;
        Relationships: [];
      };
      job_filter_decisions: {
        Row: JobFilterDecision;
        Insert: Pick<
          JobFilterDecision,
          | 'job_id'
          | 'user_id'
          | 'decision'
          | 'reason_short'
          | 'reason_long'
          | 'evidence_json'
          | 'mode'
          | 'decision_version'
        >;
        Update: Partial<
          Pick<
            JobFilterDecision,
            'decision' | 'reason_short' | 'reason_long' | 'evidence_json' | 'mode' | 'decision_version'
          >
        >;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      discovery_list_jobs: {
        Params: {
          jobs_status: JobStatus;
          jobs_after: string | null;
          jobs_page_size: number;
          jobs_search?: string;
          jobs_site_ids?: number[];
          jobs_link_ids?: number[];
          jobs_labels?: string[];
        };
        Args: {};
        Returns: Job[];
      };
      discovery_count_jobs: {
        Params: {
          jobs_status?: JobStatus;
          jobs_search?: string;
          jobs_site_ids?: number[];
          jobs_link_ids?: number[];
          jobs_labels?: string[];
        };
        Args: {};
        Returns: Array<{
          status: JobStatus;
          job_count: number;
        }>;
      };
      get_user_id_by_email: {
        Params: { email: string };
        Args: {};
        Returns: { id: string };
      };
      discovery_count_chatgpt_usage: {
        Params: {
          for_user_id: string;
          cost_increment: number;
          input_tokens_increment: number;
          output_tokens_increment: number;
        };
        Args: {};
        Returns: {};
      };
      discovery_log_ai_usage: {
        Params: {
          for_user_id: string;
          cost_increment: number;
          input_tokens_increment: number;
          output_tokens_increment: number;
        };
        Args: {};
        Returns: undefined;
      };
    };
  };
};
