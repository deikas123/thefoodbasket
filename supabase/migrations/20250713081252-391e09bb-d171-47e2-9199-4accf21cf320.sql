-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the auto replenish processing to run daily at 9:00 AM
SELECT cron.schedule(
  'process-auto-replenish-daily',
  '0 9 * * *', -- Daily at 9:00 AM
  $$
  select
    net.http_post(
        url:='https://fwtqeukqejnpcbdufonl.supabase.co/functions/v1/process-auto-replenish',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dHFldWtxZWpucGNiZHVmb25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5ODY2MjcsImV4cCI6MjA1ODU2MjYyN30.Fkz-92PiDgCTjJu1VUHHQmh1e_yKPEeph84rkHwdlL0"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);