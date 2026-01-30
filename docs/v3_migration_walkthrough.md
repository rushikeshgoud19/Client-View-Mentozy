# Mentozy V3 Schema Integration Walkthrough

## Overview
We have successfully integrated the **Mentozy V3 Database Schema** into the codebase. This involves aligning the Frontend API layer, Authentication/Onboarding flows, and creating the necessary Database Migration files to support the new normalized structure.

## 1. Database Schema
We saved the complete V3 Schema to `supabase/schema.sql`. This schema includes:
- **Profiles** (Role-based: Student, Mentor, Admin)
- **Learning System** (Tracks, Modules, Lessons)
- **Mentorship System** (Mentors, Expertise, Availability, Bookings)
- **Enrollments & Payments** (RLS protected)
- **RPC Function**: `create_booking_adhoc` added to support legacy UI "Instant Booking" by automatically creating availability slots.

## 2. API Layer Updates (`src/lib/api.ts`)
The API layer was refactored to bridge the gap between the normalized V3 database and the existing UI components.
- **Data Mapping**: Implemented mappers to transform joined DB results (e.g., `mentors` + `profiles`) into the flat interfaces expected by the UI.
- **Type Safety**: Introduced `DBMentor`, `DBTrack`, etc., to enforce schema compliance.
- **New Fields**: Added support for `years_experience`, `hourly_rate`, and `bio` in the Mentor interface.
- **Booking Logic**: Updated `createBooking` to use the `create_booking_adhoc` RPC, solving the compatibility issue between the new "Slot-based" schema and the old "Ad-hoc" booking UI.
- **Foreign Key Alignment**: Mapped `student_id` (DB) to `user_id` (UI) in Booking interfaces.

## 3. Onboarding Flow Updates
Reference code in `src/app/pages/`:
- **MentorOnboardingPage.tsx**: 
  - Removed reliance on missing `create_mentor_profile` RPC.
  - Implemented **Direct Table Inserts** for `mentors` and `mentor_expertise`, ensuring mentors are correctly registered in the new tables.
- **StudentOnboardingPage.tsx**:
  - Added explicit **Profile Upsert** after Signup. This ensures that student data (Grade, Interests, School) is correctly stored in the `profiles` table immediately after authentication, guarding against missing database triggers.

## Verification
- **Build Check**: Ran `npx tsc` (via manual check) to verify type safety.
- **Linting**: Fixed specific lint errors in `api.ts`.

## Next Steps for User
1. **Apply Migration**: Run the contents of `supabase/schema.sql` in your Supabase SQL Editor.
2. **Verify Triggers**: Ensure any `auth.users` triggers (if used) are compatible with `profiles` table strict RLS, or rely on the manual inserts we added.
