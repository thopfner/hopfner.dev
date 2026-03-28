begin;

create or replace function public.agent_claim_next_job(
  p_worker_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.agent_jobs%rowtype;
  v_run public.agent_job_runs%rowtype;
  v_next_run_number integer;
begin
  if btrim(coalesce(p_worker_id, '')) = '' then
    raise exception 'worker id is required';
  end if;

  with next_job as (
    select j.id
    from public.agent_jobs j
    where j.status = 'queued'
    order by j.created_at asc
    for update skip locked
    limit 1
  )
  update public.agent_jobs as jobs
  set status = 'claimed',
      worker_id = p_worker_id,
      claimed_at = now(),
      updated_at = now()
  from next_job
  where jobs.id = next_job.id
  returning jobs.*
  into v_job;

  if not found then
    return null;
  end if;

  select coalesce(max(run_number), 0) + 1
  into v_next_run_number
  from public.agent_job_runs
  where job_id = v_job.id;

  insert into public.agent_job_runs (
    job_id,
    run_number,
    status,
    worker_id,
    claimed_at,
    heartbeat_at
  )
  values (
    v_job.id,
    v_next_run_number,
    'claimed',
    p_worker_id,
    now(),
    now()
  )
  returning *
  into v_run;

  insert into public.agent_job_logs (
    job_id,
    run_id,
    level,
    message
  )
  values (
    v_job.id,
    v_run.id,
    'info',
    format('Job claimed by worker %s.', p_worker_id)
  );

  return jsonb_build_object(
    'transition', 'claimed',
    'job', to_jsonb(v_job),
    'run', to_jsonb(v_run)
  );
end;
$$;

create or replace function public.agent_start_job_run(
  p_job_id uuid,
  p_run_id uuid,
  p_worker_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.agent_jobs%rowtype;
  v_run public.agent_job_runs%rowtype;
  v_transition text;
begin
  if p_job_id is null then
    raise exception 'job id is required';
  end if;
  if p_run_id is null then
    raise exception 'run id is required';
  end if;
  if btrim(coalesce(p_worker_id, '')) = '' then
    raise exception 'worker id is required';
  end if;

  select *
  into v_job
  from public.agent_jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'agent job not found';
  end if;

  select *
  into v_run
  from public.agent_job_runs
  where id = p_run_id
    and job_id = p_job_id
  for update;

  if not found then
    raise exception 'agent job run not found';
  end if;

  if v_job.cancel_requested_at is not null then
    update public.agent_jobs
    set status = 'canceled',
        finished_at = coalesce(finished_at, now()),
        canceled_at = coalesce(canceled_at, now()),
        canceled_by = coalesce(canceled_by, cancel_requested_by),
        worker_id = p_worker_id,
        updated_at = now()
    where id = p_job_id
    returning *
    into v_job;

    update public.agent_job_runs
    set status = 'canceled',
        started_at = coalesce(started_at, now()),
        finished_at = coalesce(finished_at, now()),
        heartbeat_at = now(),
        canceled_at = coalesce(canceled_at, now()),
        worker_id = p_worker_id,
        updated_at = now()
    where id = p_run_id
    returning *
    into v_run;

    insert into public.agent_job_logs (
      job_id,
      run_id,
      level,
      message
    )
    values (
      v_job.id,
      v_run.id,
      'warn',
      format('Job canceled before execution started by worker %s.', p_worker_id)
    );

    v_transition := 'canceled';
  else
    update public.agent_jobs
    set status = 'running',
        started_at = coalesce(started_at, now()),
        worker_id = p_worker_id,
        updated_at = now()
    where id = p_job_id
    returning *
    into v_job;

    update public.agent_job_runs
    set status = 'running',
        started_at = coalesce(started_at, now()),
        heartbeat_at = now(),
        worker_id = p_worker_id,
        updated_at = now()
    where id = p_run_id
    returning *
    into v_run;

    insert into public.agent_job_logs (
      job_id,
      run_id,
      level,
      message
    )
    values (
      v_job.id,
      v_run.id,
      'info',
      format('Job started by worker %s.', p_worker_id)
    );

    v_transition := 'running';
  end if;

  return jsonb_build_object(
    'transition', v_transition,
    'job', to_jsonb(v_job),
    'run', to_jsonb(v_run)
  );
end;
$$;

create or replace function public.agent_complete_job_run(
  p_job_id uuid,
  p_run_id uuid,
  p_worker_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.agent_jobs%rowtype;
  v_run public.agent_job_runs%rowtype;
  v_transition text;
begin
  if p_job_id is null then
    raise exception 'job id is required';
  end if;
  if p_run_id is null then
    raise exception 'run id is required';
  end if;
  if btrim(coalesce(p_worker_id, '')) = '' then
    raise exception 'worker id is required';
  end if;

  select *
  into v_job
  from public.agent_jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'agent job not found';
  end if;

  select *
  into v_run
  from public.agent_job_runs
  where id = p_run_id
    and job_id = p_job_id
  for update;

  if not found then
    raise exception 'agent job run not found';
  end if;

  if v_job.cancel_requested_at is not null then
    update public.agent_jobs
    set status = 'canceled',
        finished_at = coalesce(finished_at, now()),
        canceled_at = coalesce(canceled_at, now()),
        canceled_by = coalesce(canceled_by, cancel_requested_by),
        worker_id = p_worker_id,
        failure_code = null,
        failure_message = null,
        failed_at = null,
        updated_at = now()
    where id = p_job_id
    returning *
    into v_job;

    update public.agent_job_runs
    set status = 'canceled',
        finished_at = coalesce(finished_at, now()),
        heartbeat_at = now(),
        canceled_at = coalesce(canceled_at, now()),
        worker_id = p_worker_id,
        failure_code = null,
        failure_message = null,
        updated_at = now()
    where id = p_run_id
    returning *
    into v_run;

    insert into public.agent_job_logs (
      job_id,
      run_id,
      level,
      message
    )
    values (
      v_job.id,
      v_run.id,
      'warn',
      format('Job canceled by worker %s after cancel request.', p_worker_id)
    );

    v_transition := 'canceled';
  else
    update public.agent_jobs
    set status = 'completed',
        finished_at = coalesce(finished_at, now()),
        worker_id = p_worker_id,
        failure_code = null,
        failure_message = null,
        failed_at = null,
        updated_at = now()
    where id = p_job_id
    returning *
    into v_job;

    update public.agent_job_runs
    set status = 'completed',
        finished_at = coalesce(finished_at, now()),
        heartbeat_at = now(),
        worker_id = p_worker_id,
        failure_code = null,
        failure_message = null,
        updated_at = now()
    where id = p_run_id
    returning *
    into v_run;

    insert into public.agent_job_logs (
      job_id,
      run_id,
      level,
      message
    )
    values (
      v_job.id,
      v_run.id,
      'info',
      format('Job completed by worker %s.', p_worker_id)
    );

    v_transition := 'completed';
  end if;

  return jsonb_build_object(
    'transition', v_transition,
    'job', to_jsonb(v_job),
    'run', to_jsonb(v_run)
  );
end;
$$;

create or replace function public.agent_fail_job_run(
  p_job_id uuid,
  p_run_id uuid,
  p_worker_id text,
  p_failure_code text default 'worker_error',
  p_failure_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.agent_jobs%rowtype;
  v_run public.agent_job_runs%rowtype;
  v_failure_code text;
  v_failure_message text;
  v_transition text;
begin
  if p_job_id is null then
    raise exception 'job id is required';
  end if;
  if p_run_id is null then
    raise exception 'run id is required';
  end if;
  if btrim(coalesce(p_worker_id, '')) = '' then
    raise exception 'worker id is required';
  end if;

  v_failure_code := btrim(coalesce(p_failure_code, ''));
  if v_failure_code = '' then
    raise exception 'failure code is required';
  end if;

  v_failure_message := nullif(btrim(coalesce(p_failure_message, '')), '');

  select *
  into v_job
  from public.agent_jobs
  where id = p_job_id
  for update;

  if not found then
    raise exception 'agent job not found';
  end if;

  select *
  into v_run
  from public.agent_job_runs
  where id = p_run_id
    and job_id = p_job_id
  for update;

  if not found then
    raise exception 'agent job run not found';
  end if;

  if v_job.cancel_requested_at is not null then
    update public.agent_jobs
    set status = 'canceled',
        finished_at = coalesce(finished_at, now()),
        canceled_at = coalesce(canceled_at, now()),
        canceled_by = coalesce(canceled_by, cancel_requested_by),
        worker_id = p_worker_id,
        failure_code = null,
        failure_message = null,
        failed_at = null,
        updated_at = now()
    where id = p_job_id
    returning *
    into v_job;

    update public.agent_job_runs
    set status = 'canceled',
        finished_at = coalesce(finished_at, now()),
        heartbeat_at = now(),
        canceled_at = coalesce(canceled_at, now()),
        worker_id = p_worker_id,
        failure_code = null,
        failure_message = null,
        updated_at = now()
    where id = p_run_id
    returning *
    into v_run;

    insert into public.agent_job_logs (
      job_id,
      run_id,
      level,
      message
    )
    values (
      v_job.id,
      v_run.id,
      'warn',
      format('Job canceled by worker %s while processing failure state.', p_worker_id)
    );

    v_transition := 'canceled';
  else
    update public.agent_jobs
    set status = 'failed',
        finished_at = coalesce(finished_at, now()),
        failed_at = coalesce(failed_at, now()),
        failure_code = v_failure_code,
        failure_message = v_failure_message,
        worker_id = p_worker_id,
        updated_at = now()
    where id = p_job_id
    returning *
    into v_job;

    update public.agent_job_runs
    set status = 'failed',
        finished_at = coalesce(finished_at, now()),
        heartbeat_at = now(),
        failure_code = v_failure_code,
        failure_message = v_failure_message,
        worker_id = p_worker_id,
        updated_at = now()
    where id = p_run_id
    returning *
    into v_run;

    insert into public.agent_job_logs (
      job_id,
      run_id,
      level,
      message
    )
    values (
      v_job.id,
      v_run.id,
      'error',
      format(
        'Job failed in worker %s with code %s%s',
        p_worker_id,
        v_failure_code,
        case
          when v_failure_message is null then '.'
          else format(': %s.', v_failure_message)
        end
      )
    );

    v_transition := 'failed';
  end if;

  return jsonb_build_object(
    'transition', v_transition,
    'job', to_jsonb(v_job),
    'run', to_jsonb(v_run)
  );
end;
$$;

create or replace function public.agent_recover_stale_jobs(
  p_worker_id text,
  p_stale_before timestamptz
)
returns setof jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_job public.agent_jobs%rowtype;
  v_run public.agent_job_runs%rowtype;
  v_action text;
  v_stale_worker_id text;
begin
  if btrim(coalesce(p_worker_id, '')) = '' then
    raise exception 'worker id is required';
  end if;
  if p_stale_before is null then
    raise exception 'stale_before is required';
  end if;

  for v_row in
    select
      j.id as job_id,
      r.id as run_id,
      j.worker_id as stale_worker_id
    from public.agent_jobs j
    join public.agent_job_runs r
      on r.job_id = j.id
    where j.status in ('claimed', 'running')
      and r.status in ('claimed', 'running')
      and not exists (
        select 1
        from public.agent_job_runs newer
        where newer.job_id = r.job_id
          and newer.run_number > r.run_number
      )
      and coalesce(r.heartbeat_at, r.started_at, r.claimed_at, j.started_at, j.claimed_at, j.created_at) < p_stale_before
    order by coalesce(r.heartbeat_at, r.started_at, r.claimed_at, j.started_at, j.claimed_at, j.created_at) asc
    for update of j, r skip locked
  loop
    v_stale_worker_id := v_row.stale_worker_id;

    update public.agent_job_runs
    set status = 'failed',
        finished_at = coalesce(finished_at, now()),
        heartbeat_at = now(),
        failure_code = 'worker_recovered',
        failure_message = 'Recovered stale claimed/running attempt.',
        updated_at = now()
    where id = v_row.run_id
    returning *
    into v_run;

    select *
    into v_job
    from public.agent_jobs
    where id = v_row.job_id
    for update;

    if v_job.cancel_requested_at is not null then
      update public.agent_jobs
      set status = 'canceled',
          finished_at = coalesce(finished_at, now()),
          canceled_at = coalesce(canceled_at, now()),
          canceled_by = coalesce(canceled_by, cancel_requested_by),
          failure_code = null,
          failure_message = null,
          failed_at = null,
          updated_at = now()
      where id = v_row.job_id
      returning *
      into v_job;

      insert into public.agent_job_logs (
        job_id,
        run_id,
        level,
        message
      )
      values (
        v_job.id,
        v_run.id,
        'warn',
        format(
          'Recovered stale job run after worker %s became stale; job canceled because cancel was already requested.',
          coalesce(v_stale_worker_id, 'unknown')
        )
      );

      v_action := 'canceled';
    else
      update public.agent_jobs
      set status = 'queued',
          worker_id = null,
          claimed_at = null,
          started_at = null,
          finished_at = null,
          failure_code = null,
          failure_message = null,
          failed_at = null,
          updated_at = now()
      where id = v_row.job_id
      returning *
      into v_job;

      insert into public.agent_job_logs (
        job_id,
        run_id,
        level,
        message
      )
      values (
        v_job.id,
        v_run.id,
        'warn',
        format(
          'Recovered stale job run after worker %s became stale; job re-queued for retry.',
          coalesce(v_stale_worker_id, 'unknown')
        )
      );

      v_action := 'requeued';
    end if;

    return next jsonb_build_object(
      'action', v_action,
      'job', to_jsonb(v_job),
      'run', to_jsonb(v_run)
    );
  end loop;

  return;
end;
$$;

revoke all on function public.agent_claim_next_job(text) from public;
revoke all on function public.agent_claim_next_job(text) from authenticated;
revoke all on function public.agent_start_job_run(uuid, uuid, text) from public;
revoke all on function public.agent_start_job_run(uuid, uuid, text) from authenticated;
revoke all on function public.agent_complete_job_run(uuid, uuid, text) from public;
revoke all on function public.agent_complete_job_run(uuid, uuid, text) from authenticated;
revoke all on function public.agent_fail_job_run(uuid, uuid, text, text, text) from public;
revoke all on function public.agent_fail_job_run(uuid, uuid, text, text, text) from authenticated;
revoke all on function public.agent_recover_stale_jobs(text, timestamptz) from public;
revoke all on function public.agent_recover_stale_jobs(text, timestamptz) from authenticated;

grant execute on function public.agent_claim_next_job(text) to service_role;
grant execute on function public.agent_start_job_run(uuid, uuid, text) to service_role;
grant execute on function public.agent_complete_job_run(uuid, uuid, text) to service_role;
grant execute on function public.agent_fail_job_run(uuid, uuid, text, text, text) to service_role;
grant execute on function public.agent_recover_stale_jobs(text, timestamptz) to service_role;

commit;
