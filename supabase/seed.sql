-- Seed data: run AFTER migrations and AFTER at least one user has signed up.
-- In Supabase SQL Editor: run the migration first, then create a user via the app,
-- then run this script (replace 'admin@example.com' with the email you used).

-- Promote first user to admin (run once, change email to your sign-up email)
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'admin@example.com' limit 1);

-- Insert demo items for the first user in auth.users (run after first sign-up)
insert into public.items (title, description, created_by)
select 'Welcome item', 'First item in the app.', id from auth.users limit 1;

insert into public.items (title, description, created_by)
select 'Getting started', 'Edit or delete this from the dashboard.', id from auth.users limit 1;

insert into public.items (title, description, created_by)
select 'Demo item', 'Seed data for a populated first visit.', id from auth.users limit 1;
