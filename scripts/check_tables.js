const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nevxzqlogmvppvfgkqgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldnh6cWxvZ212cHB2ZmdrcWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjk2MzAsImV4cCI6MjA4MTk0NTYzMH0.mG2mAebssITzc67Vb-qPosJ8G1u_acaGrV-LNTp-Xrc';
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
