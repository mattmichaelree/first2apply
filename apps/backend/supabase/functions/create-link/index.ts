import { DbSchema, Link } from '@careeros/core';
import { getExceptionMessage } from '@careeros/core';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

import { CORS_HEADERS } from '../_shared/cors.ts';
import { getEdgeFunctionContext } from '../_shared/edgeFunctions.ts';
import { cleanJobUrl } from '../_shared/jobSite.ts';
import { createLoggerWithMeta } from '../_shared/logger.ts';
import { checkUserSubscription } from '../_shared/subscription.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const logger = createLoggerWithMeta({
    function: 'create-link',
  });
  let inFlightLink: Link | null = null;
  try {
    const context = await getEdgeFunctionContext({
      logger,
      req,
      checkAuthorization: true,
    });
    const { user, supabaseClient } = context;

    const { title, url } = (await req.json()) as {
      title: string;
      url: string;
    };
    logger.info(`Creating link: ${title} - ${url}`);

    // list all job sites from db
    const { data, error: selectError } = await supabaseClient.from('discovery_sites').select('*');
    if (selectError) throw new Error(selectError.message);
    const allJobSites = data ?? [];

    const { hasCustomJobsParsing } = await checkUserSubscription({
      userId: user.id,
      ...context,
    });

    // check how many links the user has already created
    const { data: existingLinks, error: listLinksErr } = await supabaseClient
      .from('discovery_links')
      .select('*')
      .eq('user_id', user.id);
    if (listLinksErr) throw new Error(listLinksErr.message);
    const userLinkCount = existingLinks?.length ?? 0;
    const HARD_MAX_LINKS_PER_USER = 100;

    if (userLinkCount >= HARD_MAX_LINKS_PER_USER) {
      throw new Error(
        `You have reached the maximum number of links (${HARD_MAX_LINKS_PER_USER}) allowed per user. Please delete some links before creating new ones. If you think this is a mistake, please contact our support team.`,
      );
    }

    // insert a new link in the db
    const { cleanUrl, site } = cleanJobUrl({
      url,
      allJobSites,
      hasCustomJobsParsing,
    });

    // check if the site is deprecated
    if (site.deprecated) {
      throw new Error(
        `Site ${site.name} is deprecated and no longer supported. Please contact our support team if you need help.`,
      );
    }
    // for now we only allow a limited number of custom parsed links per user because the feature is still in beta
    const existingCustomParsedLinks = existingLinks?.filter(
      (link) => allJobSites.find((site) => site.id === link.site_id)?.provider === 'custom',
    );
    const existingCustomParsedLinksCount = existingCustomParsedLinks?.length ?? 0;
    const CUSTOM_PARSING_MAX_LINKS_PER_USER = 10;
    if (site.provider === 'custom' && existingCustomParsedLinksCount >= CUSTOM_PARSING_MAX_LINKS_PER_USER) {
      throw new Error(
        `You have reached the maximum number of links (${CUSTOM_PARSING_MAX_LINKS_PER_USER}) with custom jobs parsing allowed per user. Please delete some links before creating new ones with custom parsing. If you think this is a mistake, please contact our support team.`,
      );
    }

    const { data: createdLinks, error } = await supabaseClient
      .from('discovery_links')
      .insert({
        url: cleanUrl,
        title,
        site_id: site.id,
      })
      .select('*');
    if (error) throw error;
    logger.info(`created link for site ${site.name} (${site.id})`);

    const [link] = createdLinks ?? [];
    inFlightLink = link;

    logger.info(`successfully created link: ${link.id}`);

    return new Response(JSON.stringify({ link, newJobs: [] }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (error) {
    logger.error(getExceptionMessage(error));

    // if we have created a link but something else failed, delete the link
    // this will also cascade and delete all jobs associated with the link
    if (inFlightLink) {
      const supabaseClient = createClient<DbSchema>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
      const { error: deleteError } = await supabaseClient
        .from('discovery_links')
        .delete()
        .eq('id', inFlightLink.id);
      if (deleteError) {
        logger.error(`failed to delete link ${inFlightLink.id}: ${deleteError.message}`);
      }
    }

    return new Response(JSON.stringify({ errorMessage: getExceptionMessage(error, true) }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      // until this is fixed: https://github.com/supabase/functions-js/issues/45
      // we have to return 200 and handle the error on the client side
      // status: 400,
    });
  }
});
