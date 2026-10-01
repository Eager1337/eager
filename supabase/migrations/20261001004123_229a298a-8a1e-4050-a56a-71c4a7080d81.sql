INSERT INTO public.admin_credentials (id, username, password_hash, salt)
VALUES ('global', 'Eagerbeaver', '4a5704b3036fd974a190a667d68661cdde0920646f4cb3bf14599df57129c386', '945ee8ea8f7ffdb5c41cacff17e58bca')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  salt = EXCLUDED.salt,
  updated_at = now();