-- PROFESSIONAL SEED DATA FOR MENTOZY
-- Run this in your Supabase SQL Editor to populate the database with expert profiles and institutions.

-- 1. CLEANUP (Optional - Uncomment to clear existing test data)
-- DELETE FROM public.mentor_expertise;
-- DELETE FROM public.mentors;
-- DELETE FROM public.profiles WHERE role = 'mentor';

-- Note: Inserting into public.profiles for existing auth users is a bit tricky.
-- For this seed, we assume you might want to manually update your existing test profiles 
-- or we can provide a list of mentors that would need corresponding auth users.

-- Since I cannot create Auth users directly via SQL (they belong to auth schema),
-- the best approach is to provide a "Clean & Beautify" logic in the code 
-- OR a script that you can run in your terminal if you have the service role key.

-- However, I can provide a SQL script to UPDATE your current test entries 
-- to have professional names if you provide their IDs, 
-- or I can just focus on making the FALLBACK data so good that it covers the gaps.

-- LET'S DO THIS: I will provide a SEED script for TRACKS (which are public) 
-- and instructions on how to add a professional mentor via the UI.

-- Seeding Professional Mentors (Requires existing profiles)
-- This is an example of how to manually fix a 'wdasdwasd' profile
-- UPDATE public.profiles SET full_name = 'Rohal Sharma' WHERE id = 'YOUR_USER_ID';
-- UPDATE public.mentors SET bio = 'Senior Instructor at Mentozy', company = 'Mentozy' WHERE user_id = 'YOUR_USER_ID';

-- Seeding Tracks (Professional Look)
INSERT INTO public.tracks (title, level, description, duration_weeks, image_url) VALUES
('Full Stack Web Mastery', 'Beginner to Pro', 'Master the modern web stack from React to Node.js and SQL.', 24, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'),
('Advanced Data Science', 'Intermediate', 'Deep dive into machine learning, neural networks, and big data analytics.', 16, 'https://images.unsplash.com/photo-1551288049-bbbda536ad80');

-- Seeding Modules for Track 1
INSERT INTO public.track_modules (track_id, title, module_order) VALUES
(1, 'Foundations of HTML, CSS & JS', 1),
(1, 'React Framework & State Management', 2),
(1, 'Backend with Node.js & Express', 3),
(1, 'Database Design with PostgreSQL', 4);

-- Instructions: 
-- To clean up your "wdasdwasd" data, you can run:
-- DELETE FROM public.profiles WHERE full_name LIKE '%dasd%';
-- This will safely remove the test profiles you created.
