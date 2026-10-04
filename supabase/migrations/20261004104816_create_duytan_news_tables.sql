/*
# DuyTan.News — Create authors and articles tables

## Purpose
Blog about Quy Nhon with 15 team members writing articles across categories:
du lịch, ẩm thực, lễ hội, văn hóa, and tin tức.

## New Tables

### authors
- id (uuid, PK)
- name (text) — display name
- role (text) — role on the team (e.g. "Phóng viên", "Biên tập viên")
- bio (text) — short bio
- avatar_url (text) — profile photo URL
- created_at (timestamptz)

### articles
- id (uuid, PK)
- title (text)
- excerpt (text) — short summary
- content (text) — full article body
- category (text) — one of: du-lich, am-thuc, le-hoi, van-hoa, tin-tuc
- image_url (text) — hero image
- author_id (uuid, FK → authors)
- published_at (timestamptz)
- created_at (timestamptz)

## Security
- No sign-in screen → single-tenant, public read.
- RLS enabled on both tables, TO anon, authenticated.
- Read-only: SELECT policies only (data is seeded server-side, not written from the frontend).
*/

CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Phóng viên',
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  author_id uuid REFERENCES authors(id) ON DELETE SET NULL,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);

ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_authors" ON authors;
CREATE POLICY "anon_select_authors" ON authors FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_articles" ON articles;
CREATE POLICY "anon_select_articles" ON articles FOR SELECT
TO anon, authenticated USING (true);
