ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

UPDATE users
SET username = CASE email
  WHEN 'hello@linkmind.ai' THEN 'jaehyeok'
  WHEN 'min@linkmind.ai' THEN 'min'
  WHEN 'ara@linkmind.ai' THEN 'ara'
  WHEN 'system@linkmind.ai' THEN 'system'
  ELSE split_part(email, '@', 1)
END
WHERE username IS NULL;

UPDATE users
SET password_hash = crypt('1234', gen_salt('bf'))
WHERE password_hash IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;

ALTER TABLE users
  ALTER COLUMN username SET NOT NULL;

ALTER TABLE users
  ALTER COLUMN password_hash SET NOT NULL;

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

