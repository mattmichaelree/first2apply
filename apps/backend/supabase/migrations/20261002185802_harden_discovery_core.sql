revoke execute on function public.handle_new_discovery_user() from anon, authenticated;

create index discovery_links_user_id_idx on public.discovery_links (user_id);
create index discovery_links_site_id_idx on public.discovery_links (site_id);
create index discovery_jobs_site_id_idx on public.discovery_jobs ("siteId");
create index discovery_jobs_link_id_idx on public.discovery_jobs (link_id);
create index discovery_html_dumps_user_id_idx on public.discovery_html_dumps (user_id);
create index discovery_notes_user_id_idx on public.discovery_notes (user_id);
create index discovery_notes_job_id_idx on public.discovery_notes (job_id);
