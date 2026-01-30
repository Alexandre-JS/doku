const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const names = [
  'category_id',
  'id_categoria',
  'categoria_id',
  'category',
  'cat_id',
  'id_cat',
  'parent_id',
  'categoryid'
];

async function check() {
  for (const name of names) {
    const { error } = await supabase.from('document_templates').select(name).limit(1);
    if (!error) {
       console.log('FOUND COLUMN:', name);
    } else {
       console.log('COLUMN', name, 'NOT FOUND:', error.message);
    }
  }
}

check();
