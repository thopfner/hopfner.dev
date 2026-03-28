begin;

create extension if not exists pgcrypto;

create table if not exists public.agent_jobs (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  status text not null default 'queued',
  requested_by uuid not null references auth.users (id),
  payload jsonb not null default '{}'::jsonb,
  worker_id text,
  claimed_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  cancel_requested_at timestamptz,
  cancel_requested_by uuid references auth.users (id),
  canceled_at timestamptz,
  canceled_by uuid references auth.users (id),
  failed_at timestamptz,
  failure_code text,
  failure_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_jobs_kind_check check (kind in ('site_build_noop')),
  constraint agent_jobs_status_check check (status in ('queued', 'claimed', 'running', 'completed', 'failed', 'canceled')),
  constraint agent_jobs_payload_object_check check (jsonb_typeof(payload) = 'object')
);

create table if not exists public.agent_job_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.agent_jobs (id) on delete cascade,
  run_number int not null,
  status text not null,
  worker_id text,
  claimed_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  heartbeat_at timestamptz,
  canceled_at timestamptz,
  failure_code text,
  failure_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agent_job_runs_status_check check (status in ('claimed', 'running', 'completed', 'failed', 'canceled')),
  constraint agent_job_runs_run_number_positive check (run_number > 0),
  constraint agent_job_runs_unique_per_job unique (job_id, run_number)
);

create table if not exists public.agent_job_logs (
  id bigserial primary key,
  job_id uuid not null references public.agent_jobs (id) on delete cascade,
  run_id uuid references public.agent_job_runs (id) on delete cascade,
  level text not null default 'info',
  message text not null,
  created_at timestamptz not null default now(),
  constraint agent_job_logs_level_check check (level in ('info', 'warn', 'error'))
);

create index if not exists agent_jobs_status_created_idx
  on public.agent_jobs (status, created_at asc);

create index if not exists agent_jobs_created_idx
  on public.agent_jobs (created_at desc);

create index if not exists agent_job_runs_job_run_number_idx
  on public.agent_job_runs (job_id, run_number desc);

create index if not exists agent_job_runs_status_claimed_idx
  on public.agent_job_runs (status, claimed_at asc);

create index if not exists agent_job_logs_job_created_idx
  on public.agent_job_logs (job_id, created_at asc, id asc);

create index if not exists agent_job_logs_run_created_idx
  on public.agent_job_logs (run_id, created_at asc, id asc);

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

  if v_kind not in ('site_build_noop') then
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
    payload
  )
  values (
    v_kind,
    'queued',
    p_requested_by,
    v_payload
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

create or replace function public.agent_cancel_job(
  p_job_id uuid,
  p_actor uuid default auth.uid()
)
returns public.agent_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.agent_jobs%rowtype;
  v_had_cancel_request boolean;
begin
  if p_job_id is null then
    raise exception 'job id is required';
  end if;

  if p_actor is null then
    raise exception 'actor is required';
  end if;

  select *
  into v_job
  from public.agent_jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'agent job not found';
  end if;

  v_had_cancel_request := v_job.cancel_requested_at is not null;

  if v_job.status = 'queued' then
    update public.agent_jobs
    set status = 'canceled',
        cancel_requested_at = coalesce(cancel_requested_at, now()),
        cancel_requested_by = coalesce(cancel_requested_by, p_actor),
        canceled_at = coalesce(canceled_at, now()),
        canceled_by = coalesce(canceled_by, p_actor),
        finished_at = coalesce(finished_at, now()),
        updated_at = now()
    where id = p_job_id
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
      'Queued job canceled before execution.'
    );

    return v_job;
  end if;

  if v_job.status in ('claimed', 'running') then
    update public.agent_jobs
    set cancel_requested_at = coalesce(cancel_requested_at, now()),
        cancel_requested_by = coalesce(cancel_requested_by, p_actor),
        updated_at = now()
    where id = p_job_id
    returning *
    into v_job;

    if not v_had_cancel_request then
      insert into public.agent_job_logs (
        job_id,
        level,
        message
      )
      values (
        v_job.id,
        'info',
        'Cancel requested.'
      );
    end if;
  end if;

  return v_job;
end;
$$;

alter table public.agent_jobs enable row level security;
alter table public.agent_job_runs enable row level security;
alter table public.agent_job_logs enable row level security;

create policy "agent_jobs_select_admin" on public.agent_jobs
for select to authenticated
using (public.is_admin());

create policy "agent_jobs_write_admin" on public.agent_jobs
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "agent_job_runs_select_admin" on public.agent_job_runs
for select to authenticated
using (public.is_admin());

create policy "agent_job_runs_write_admin" on public.agent_job_runs
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "agent_job_logs_select_admin" on public.agent_job_logs
for select to authenticated
using (public.is_admin());

create policy "agent_job_logs_write_admin" on public.agent_job_logs
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

revoke all on public.agent_jobs, public.agent_job_runs, public.agent_job_logs from authenticated;
revoke all on sequence public.agent_job_logs_id_seq from authenticated;
revoke all on function public.agent_enqueue_job(text, jsonb, uuid) from public;
revoke all on function public.agent_enqueue_job(text, jsonb, uuid) from authenticated;
revoke all on function public.agent_cancel_job(uuid, uuid) from public;
revoke all on function public.agent_cancel_job(uuid, uuid) from authenticated;

grant select on public.agent_jobs, public.agent_job_runs, public.agent_job_logs to service_role;
grant execute on function public.agent_enqueue_job(text, jsonb, uuid) to service_role;
grant execute on function public.agent_cancel_job(uuid, uuid) to service_role;

do $$
begin
  if exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'set_updated_at'
  ) then
    drop trigger if exists agent_jobs_set_updated_at on public.agent_jobs;
    create trigger agent_jobs_set_updated_at
    before update on public.agent_jobs
    for each row execute function public.set_updated_at();

    drop trigger if exists agent_job_runs_set_updated_at on public.agent_job_runs;
    create trigger agent_job_runs_set_updated_at
    before update on public.agent_job_runs
    for each row execute function public.set_updated_at();
  end if;
end
$$;

commit;
