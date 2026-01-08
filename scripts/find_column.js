const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nevxzqlogmvppvfgkqgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldnh6cWxvZ212cHB2ZmdrcWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjk2MzAsImV4cCI6MjA4MTk0NTYzMH0.mG2mAebssITzc67Vb-qPosJ8G1u_acaGrV-LNTp-Xrc';
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
