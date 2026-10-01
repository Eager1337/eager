-- Security hardening: atomic rate limiting and server-only secrets.

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  hits integer NOT NULL DEFAULT 0,
  blocked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.rate_limit_buckets FROM public, anon, authenticated;
GRANT ALL ON public.rate_limit_buckets TO service_role;
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer,
  p_block_seconds integer DEFAULT 0
)
RETURNS TABLE(allowed boolean, retry_after_seconds integer, hits integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  now_ts timestamptz := now();
  row_data public.rate_limit_buckets%ROWTYPE;
  next_hits integer;
  retry integer := 0;
BEGIN
  IF p_key IS NULL OR length(p_key) < 8 OR p_key !~ '^[a-zA-Z0-9:_-]+$'
     OR p_limit < 1 OR p_limit > 1000
     OR p_window_seconds < 1 OR p_window_seconds > 86400
     OR p_block_seconds < 0 OR p_block_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters';
  END IF;

  INSERT INTO public.rate_limit_buckets(key, window_started_at, hits, blocked_until, updated_at)
  VALUES (p_key, now_ts, 0, NULL, now_ts)
  ON CONFLICT (key) DO NOTHING;

  SELECT * INTO row_data
  FROM public.rate_limit_buckets
  WHERE key = p_key
  FOR UPDATE;

  IF row_data.blocked_until IS NOT NULL AND row_data.blocked_until > now_ts THEN
    retry := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (row_data.blocked_until - now_ts)))::integer);
    RETURN QUERY SELECT false, retry, row_data.hits;
    RETURN;
  END IF;

  IF row_data.window_started_at <= now_ts - make_interval(secs => p_window_seconds) THEN
    next_hits := 1;
    UPDATE public.rate_limit_buckets
    SET window_started_at = now_ts, hits = next_hits, blocked_until = NULL, updated_at = now_ts
    WHERE key = p_key;
  ELSE
    next_hits := row_data.hits + 1;
    UPDATE public.rate_limit_buckets
    SET hits = next_hits,
        blocked_until = CASE WHEN next_hits > p_limit AND p_block_seconds > 0
          THEN now_ts + make_interval(secs => p_block_seconds) ELSE NULL END,
        updated_at = now_ts
    WHERE key = p_key;
  END IF;

  IF next_hits > p_limit THEN
    retry := GREATEST(1, p_block_seconds);
    RETURN QUERY SELECT false, retry, next_hits;
    RETURN;
  END IF;
  RETURN QUERY SELECT true, 0, next_hits;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer, integer) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer, integer) TO service_role;

REVOKE ALL ON public.admin_credentials FROM authenticated, anon, public;
GRANT ALL ON public.admin_credentials TO service_role;
REVOKE ALL ON public.admin_totp FROM authenticated, anon, public;
GRANT ALL ON public.admin_totp TO service_role;
REVOKE ALL ON public.wishlist_items FROM authenticated, anon, public;
GRANT ALL ON public.wishlist_items TO service_role;

-- Published builder rows may contain prompts, source URLs and generated HTML.
-- Public routes now use the server-only client and return only selected fields.
DROP POLICY IF EXISTS "Anyone can view published builds" ON public.ai_site_builds;
REVOKE SELECT ON public.ai_site_builds FROM anon;


CREATE INDEX IF NOT EXISTS rate_limit_buckets_updated_at_idx ON public.rate_limit_buckets(updated_at);

CREATE OR REPLACE FUNCTION public.purge_old_rate_limit_buckets()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE deleted_count integer;
BEGIN
  DELETE FROM public.rate_limit_buckets WHERE updated_at < now() - interval '2 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_old_rate_limit_buckets() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_rate_limit_buckets() TO service_role;

SELECT cron.unschedule('purge-old-rate-limit-buckets')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-old-rate-limit-buckets');
SELECT cron.schedule('purge-old-rate-limit-buckets', '15 3 * * *', $$ SELECT public.purge_old_rate_limit_buckets(); $$);
