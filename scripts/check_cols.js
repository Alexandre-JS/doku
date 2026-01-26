const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nevxzqlogmvppvfgkqgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldnh6cWxvZ212cHB2ZmdrcWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjk2MzAsImV4cCI6MjA4MTk0NTYzMH0.mG2mAebssITzc67Vb-qPosJ8G1u_acaGrV-LNTp-Xrc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log('Fetching one order to see columns...');
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Columns:', Object.keys(data[0] || {}));
    }
}

checkColumns();
