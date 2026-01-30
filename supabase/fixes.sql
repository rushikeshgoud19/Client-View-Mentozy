-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create a Trigger Function to Handle New User creation
-- This function runs automatically whenever a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    COALESCE(new.raw_user_meta_data ->> 'role', 'student') -- Default to student if not specified
  );
  RETURN new;
END;
$$;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create the missing RPC function for Ad-hoc bookings
-- This was referenced in api.ts but missing in the schema
CREATE OR REPLACE FUNCTION create_booking_adhoc(
  p_student_id uuid,
  p_mentor_id bigint,
  p_start_time timestamptz
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_availability_id uuid;
  v_booking_id uuid;
  v_end_time timestamptz;
BEGIN
  -- Assume 1 hour duration by default
  v_end_time := p_start_time + interval '1 hour';

  -- 1. Create Availability Slot
  INSERT INTO public.mentor_availability (mentor_id, start_time, end_time, is_booked)
  VALUES (p_mentor_id, p_start_time, v_end_time, true)
  RETURNING id INTO v_availability_id;

  -- 2. Create Booking
  INSERT INTO public.bookings (student_id, mentor_id, availability_id, status)
  VALUES (p_student_id, p_mentor_id, v_availability_id, 'pending')
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$;
