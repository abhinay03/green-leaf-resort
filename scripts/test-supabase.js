const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase Connection...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing environment variables:');
        console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓ Set' : '✗ Missing'}`);
        console.error(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✓ Set' : '✗ Missing'}`);
        process.exit(1);
    }

    console.log('✅ Environment variables found');
    console.log(`📍 Supabase URL: ${supabaseUrl}\n`);

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Test 1: Check profiles table
        console.log('Test 1: Checking profiles table...');
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (profilesError) {
            if (profilesError.code === '42P01') {
                console.log('⚠️  Profiles table does not exist yet');
                console.log('   👉 Run migrations in Supabase SQL Editor\n');
            } else {
                console.log(`⚠️  Error: ${profilesError.message}\n`);
            }
        } else {
            console.log('✅ Profiles table exists and is accessible\n');
        }

        // Test 2: Check accommodations table
        console.log('Test 2: Checking accommodations table...');
        const { data: accommodations, error: accomError } = await supabase
            .from('accommodations')
            .select('*')
            .limit(5);

        if (accomError) {
            if (accomError.code === '42P01') {
                console.log('⚠️  Accommodations table does not exist yet');
                console.log('   👉 Run migrations in Supabase SQL Editor\n');
            } else {
                console.log(`⚠️  Error: ${accomError.message}\n`);
            }
        } else {
            console.log(`✅ Accommodations table exists`);
            console.log(`   Found ${accommodations?.length || 0} accommodations\n`);
        }

        // Test 3: Check packages table
        console.log('Test 3: Checking packages table...');
        const { data: packages, error: packagesError } = await supabase
            .from('packages')
            .select('*')
            .limit(5);

        if (packagesError) {
            if (packagesError.code === '42P01') {
                console.log('⚠️  Packages table does not exist yet');
                console.log('   👉 Run migrations in Supabase SQL Editor\n');
            } else {
                console.log(`⚠️  Error: ${packagesError.message}\n`);
            }
        } else {
            console.log(`✅ Packages table exists`);
            console.log(`   Found ${packages?.length || 0} packages\n`);
        }

        // Test 4: Check bookings table
        console.log('Test 4: Checking bookings table...');
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('count')
            .limit(1);

        if (bookingsError) {
            if (bookingsError.code === '42P01') {
                console.log('⚠️  Bookings table does not exist yet');
                console.log('   👉 Run migrations in Supabase SQL Editor\n');
            } else {
                console.log(`⚠️  Error: ${bookingsError.message}\n`);
            }
        } else {
            console.log('✅ Bookings table exists and is accessible\n');
        }

        // Test 5: Check admin_users table
        console.log('Test 5: Checking admin_users table...');
        const { data: adminUsers, error: adminError } = await supabase
            .from('admin_users')
            .select('count')
            .limit(1);

        if (adminError) {
            if (adminError.code === '42P01') {
                console.log('⚠️  Admin users table does not exist yet');
                console.log('   👉 Run migrations in Supabase SQL Editor\n');
            } else {
                console.log(`⚠️  Error: ${adminError.message}\n`);
            }
        } else {
            console.log('✅ Admin users table exists and is accessible\n');
        }

        console.log('═══════════════════════════════════════════════════════════');
        console.log('✨ Connection Test Complete!\n');
        console.log('Next Steps:');
        console.log('1. If any tables are missing, run migrations:');
        console.log('   • Open scripts/_COMBINED_MIGRATION.sql');
        console.log('   • Copy contents to Supabase SQL Editor');
        console.log('   • Run the query\n');
        console.log('2. Start your development server:');
        console.log('   npm run dev\n');
        console.log('3. Test the application at http://localhost:3000');
        console.log('═══════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ Connection test failed:');
        console.error(error);
        console.log('\n💡 Troubleshooting:');
        console.log('   • Verify your Supabase project is active');
        console.log('   • Check that NEXT_PUBLIC_SUPABASE_URL is correct');
        console.log('   • Check that NEXT_PUBLIC_SUPABASE_ANON_KEY is correct');
        console.log('   • Visit https://supabase.com/dashboard to check project status\n');
    }
}

testSupabaseConnection();
