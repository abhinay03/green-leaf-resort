// Quick diagnostic - Check what Supabase URL the app is using
import { supabasePublic } from '@/lib/supabase/public-client';

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try a simple query
    const { data, error } = await supabasePublic
        .from('accommodations')
        .select('count')
        .limit(1);

    return Response.json({
        supabaseUrl: url,
        hasAnonKey: hasKey,
        testQuery: {
            success: !error,
            error: error ? { code: error.code, message: error.message } : null,
            data: data
        }
    });
}
