const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugActivity() {
    console.log('Checking Orders...');
    const { data: orders, error: oErr } = await supabase
        .from('orders')
        .select('id, created_at, status, amount, metadata')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (oErr) console.error('Orders Error:', oErr);
    else console.log('Recent Orders:', orders);

    console.log('\nChecking Templates...');
    const { data: templates, error: tErr } = await supabase
        .from('templates')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    if (tErr) console.error('Templates Error:', tErr);
    else console.log('Recent Templates:', templates);
}

debugActivity();
