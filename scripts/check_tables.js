const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'category_document_templates',
  'document_template_categories',
  'document_templates_categories',
  'template_categories',
  'categories_templates',
  'templates_categories'
];

async function check() {
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (!error) {
      console.log('FOUND:', t);
      // Let's also check column names
      const { data } = await supabase.from(t).select('*').limit(1);
      console.log('COLUMNS:', data ? Object.keys(data[0] || {}) : 'no data');
      return;
    } else {
      console.log('NOT FOUND:', t, error.message);
    }
  }
  console.log('NONE FOUND');
}

check();
