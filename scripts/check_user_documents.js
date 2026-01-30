const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserDocuments() {
    console.log('Checking user_documents table...');
    // Try to select a non-existent column to trigger an error that might list available columns or just test existence
    const { data, error } = await supabase.from('user_documents').select('*').limit(1);
    
    if (error) {
        console.error('Error fetching table:', error.message);
    } else {
        if (data.length > 0) {
            console.log('Available columns from first row:', Object.keys(data[0]));
        } else {
            console.log('Table is empty, trying to guess columns via individual selects...');
            const columnsToTest = ['id', 'user_id', 'order_id', 'template_id', 'file_path', 'title', 'expires_at', 'created_at'];
            for (const col of columnsToTest) {
                const { error: colError } = await supabase.from('user_documents').select(col).limit(1);
                if (colError) {
                    console.log(`[x] ${col}: MISSING (${colError.message})`);
                } else {
                    console.log(`[v] ${col}: EXISTS`);
                }
            }
        }
    }
}

checkUserDocuments();
