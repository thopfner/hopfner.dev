begin;

alter table public.agent_jobs
  add column if not exists result jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.agent_jobs'::regclass
      and conname = 'agent_jobs_result_object_check'
  ) then
    alter table public.agent_jobs
      add constraint agent_jobs_result_object_check
      check (jsonb_typeof(result) = 'object');
  end if;
end
$$;

alter table public.agent_jobs
  drop constraint if exists agent_jobs_kind_check;

alter table public.agent_jobs
  add constraint agent_jobs_kind_check
  check (kind in ('site_build_noop', 'site_build_draft'));

create or replace function public.agent_enqueue_job(
  p_kind text,
  p_payload jsonb default '{}'::jsonb,
  p_requested_by uuid default auth.uid()
)
returns public.agent_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind text;
  v_payload jsonb;
  v_job public.agent_jobs%rowtype;
begin
  v_kind := btrim(coalesce(p_kind, ''));
  if v_kind = '' then
    raise exception 'job kind is required';
  end if;

  if v_kind not in ('site_build_noop', 'site_build_draft') then
    raise exception 'unsupported agent job kind: %', v_kind;
  end if;

  if p_requested_by is null then
    raise exception 'requested_by is required';
  end if;

  v_payload := coalesce(p_payload, '{}'::jsonb);
  if jsonb_typeof(v_payload) <> 'object' then
    raise exception 'payload must be a JSON object';
  end if;

  insert into public.agent_jobs (
    kind,
    status,
    requested_by,
    payload,
    result
  )
  values (
    v_kind,
    'queued',
    p_requested_by,
    v_payload,
    '{}'::jsonb
  )
  returning *
  into v_job;

  insert into public.agent_job_logs (
    job_id,
    level,
    message
  )
  values (
    v_job.id,
    'info',
    'Job queued.'
  );

  return v_job;
end;
$$;

create or replace function public.agent_update_job_result(
  p_job_id uuid,
  p_result jsonb,
  p_merge boolean default true
)
returns public.agent_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
  v_job public.agent_jobs%rowtype;
begin
  if p_job_id is null then
    raise exception 'job id is required';
  end if;

  v_result := coalesce(p_result, '{}'::jsonb);
  if jsonb_typeof(v_result) <> 'object' then
    raise exception 'job result must be a JSON object';
  end if;

  update public.agent_jobs
  set result = case
        when p_merge then coalesce(result, '{}'::jsonb) || v_result
        else v_result
      end,
      updated_at = now()
  where id = p_job_id
  returning *
  into v_job;

  if not found then
    raise exception 'agent job not found';
  end if;

  return v_job;
end;
$$;

revoke all on function public.agent_enqueue_job(text, jsonb, uuid) from public;
revoke all on function public.agent_enqueue_job(text, jsonb, uuid) from authenticated;
revoke all on function public.agent_update_job_result(uuid, jsonb, boolean) from public;
revoke all on function public.agent_update_job_result(uuid, jsonb, boolean) from authenticated;

grant execute on function public.agent_enqueue_job(text, jsonb, uuid) to service_role;
grant execute on function public.agent_update_job_result(uuid, jsonb, boolean) to service_role;

commit;
