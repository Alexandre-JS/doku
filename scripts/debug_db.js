const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nevxzqlogmvppvfgkqgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldnh6cWxvZ212cHB2ZmdrcWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjk2MzAsImV4cCI6MjA4MTk0NTYzMH0.mG2mAebssITzc67Vb-qPosJ8G1u_acaGrV-LNTp-Xrc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: t1, error: e1 } = await supabase.from('templates').select('id, title').limit(5);
    console.log('--- templates ---');
    if (e1) console.log('Error:', e1.message);
    else console.log('Data:', t1);

    const { data: t2, error: e2 } = await supabase.from('document_templates').select('id, title').limit(5);
    console.log('--- document_templates ---');
    if (e2) console.log('Error:', e2.message);
    else console.log('Data:', t2);
}
check();
