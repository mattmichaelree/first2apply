import { throwError } from '@careeros/core';

import { OpenRouterConfig } from './openAI.ts';

export type CareerOsBackendEnv = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  openRouterConfig: OpenRouterConfig;
  mailerLiteApiKey?: string;
  mailerSendApiKey?: string;
  mezmoApiKey: string;
  careerosWebhookSecret: string;
  stripeSecretKey: string;
  stripeWebhookSigningSecret: string;
  webappUrl: string;
};

export function parseEnv(): CareerOsBackendEnv {
  return {
    supabaseUrl: Deno.env.get('SUPABASE_URL') ?? '',
    supabaseServiceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    openRouterConfig: {
      apiKey: Deno.env.get('OPENROUTER_API_KEY') ?? '',
    },
    mailerLiteApiKey: Deno.env.get('MAILERLITE_API_KEY'),
    mailerSendApiKey: Deno.env.get('MAILERSEND_API_KEY'),
    mezmoApiKey: Deno.env.get('MEZMO_API_KEY') ?? '',
    careerosWebhookSecret:
      Deno.env.get('CAREEROS_WEBHOOK_SECRET') ?? throwError('CAREEROS_WEBHOOK_SECRET is not set'),
    stripeSecretKey: Deno.env.get('STRIPE_SECRET_KEY') ?? '',
    stripeWebhookSigningSecret: Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') ?? '',
    webappUrl: Deno.env.get('WEBAPP_URL') ?? '',
  };
}
