
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanup() {
    console.log('--- Database Cleanup Started ---');

    // 1. Fetch profiles that look like test data
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .or('full_name.ilike.%dasd%,full_name.ilike.%test%,full_name.ilike.%ghgh%');

    if (pError) {
        console.error('Error fetching profiles:', pError);
    } else {
        console.log(`Found ${profiles?.length || 0} profiles to clean.`);
        for (const profile of (profiles || [])) {
            console.log(`Updating profile: "${profile.full_name}" -> "Rohal Sharma"`);
            const { error: uError } = await supabase
                .from('profiles')
                .update({ full_name: 'Rohal Sharma', phone: '9988776655' })
                .eq('id', profile.id);

            if (uError) console.warn(`Failed to update profile ${profile.id}:`, uError.message);
            else console.log(`✓ Updated profile ${profile.id}`);
        }
    }

    // 2. Fetch mentors that look like test data
    const { data: mentors, error: mError } = await supabase
        .from('mentors')
        .select('*, profiles(full_name)')
        .or('bio.ilike.%dasd%,company.ilike.%dasd%,bio.ilike.%ghgh%');

    if (mError) {
        console.error('Error fetching mentors:', mError);
    } else {
        console.log(`Found ${mentors?.length || 0} mentor records to clean.`);
        for (const mentor of (mentors || [])) {
            console.log(`Updating mentor: "${mentor.profiles?.full_name}"`);
            const { error: umError } = await supabase
                .from('mentors')
                .update({
                    bio: 'Senior Instructor at Mentozy with over 10 years of experience in Full Stack Development.',
                    company: 'Mentozy',
                    hourly_rate: 150
                })
                .eq('id', mentor.id);

            if (umError) console.warn(`Failed to update mentor ${mentor.id}:`, umError.message);
            else console.log(`✓ Updated mentor ${mentor.id}`);
        }
    }

    console.log('--- Cleanup Finished ---');
}

cleanup();
