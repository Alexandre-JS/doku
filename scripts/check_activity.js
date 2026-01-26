const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nevxzqlogmvppvfgkqgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldnh6cWxvZ212cHB2ZmdrcWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjk2MzAsImV4cCI6MjA4MTk0NTYzMH0.mG2mAebssITzc67Vb-qPosJ8G1u_acaGrV-LNTp-Xrc';
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
