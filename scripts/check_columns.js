const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nevxzqlogmvppvfgkqgc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ldnh6cWxvZ212cHB2ZmdrcWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNjk2MzAsImV4cCI6MjA4MTk0NTYzMH0.mG2mAebssITzc67Vb-qPosJ8G1u_acaGrV-LNTp-Xrc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  // Let's try to query with specific columns to see if they exist
  const { error: e1 } = await supabase.from('category_document_templates').select('category_id, template_id').limit(1);
  if (!e1) {
     console.log('COLUMNS: category_id, template_id');
     return;
  }
  console.log('FAILED with category_id, template_id:', e1.message);

  const { error: e2 } = await supabase.from('category_document_templates').select('id_categoria, id_template').limit(1);
  if (!e2) {
     console.log('COLUMNS: id_categoria, id_template');
     return;
  }
  console.log('FAILED with id_categoria, id_template:', e2.message);
}

check();
