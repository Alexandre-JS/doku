const { createClient } = require('@supabase/supabase-js');

// Use variáveis de ambiente para segurança
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devem estar definidas.');
    console.log('Dica: Execute com: NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/debug_db.js');
    process.exit(1);
}

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
