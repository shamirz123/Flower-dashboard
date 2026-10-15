-- DESTRUCTIVE: deletes all dashboard tables and their data.
-- Only run this if you already ran an older version of schema.sql, then run schema.sql again.
drop table if exists public.usage_entries cascade;
drop table if exists public.supplier_feedback cascade;
drop table if exists public.check_items cascade;
drop table if exists public.box_checks cascade;
drop table if exists public.recipe_items cascade;
drop table if exists public.boxes cascade;
drop table if exists public.flowers cascade;
drop table if exists public.suppliers cascade;
drop table if exists public.profiles cascade;
drop function if exists public.is_admin();
