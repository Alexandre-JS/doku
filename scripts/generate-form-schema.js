// scripts/generate-form-schema.js
// Uso: node scripts/generate-form-schema.js <template-slug>
const fs = require('fs');
const path = require('path');

const knownProfileFields = new Set([
  'full_name','father_name','mother_name','bi_number','bi_date_issue','bi_local_issue',
  'nuit','birth_date','province','district','neighborhood','address_details','phone_number'
]);

function extractPlaceholders(template) {
  const re = /\{\{\s*([^{}\s]+)\s*\}\}/g;
  const set = new Set();
  let m;
  while ((m = re.exec(template)) !== null) {
    set.add(m[1]);
  }
  return Array.from(set);
}

function mapToField(id) {
  const isProfile = knownProfileFields.has(id);
  const type = id.includes('date') ? 'date' : (id === 'request_details' || id === 'requestDetails' || id.includes('details') ? 'textarea' : 'text');
  return {
    id,
    label: id.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    type,
    source: isProfile ? 'profile' : 'user_input'
  };
}

// For local test: read template from local file in repo or paste template string here
const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/generate-form-schema.js <template-slug>');
  process.exit(1);
}

// You can put template HTML in a file named data/<slug>.html for local generation
const filePath = path.join(__dirname, '..', 'data', `${slug}.html`);
let templateContent = '';
if (fs.existsSync(filePath)) {
  templateContent = fs.readFileSync(filePath, 'utf8');
} else {
  console.error('No local template file found at', filePath);
  process.exit(1);
}

const placeholders = extractPlaceholders(templateContent);
console.log('Found placeholders:', placeholders);

const grouped = [
  {
    section: 'Dados Pessoais',
    fields: placeholders.filter(p => ['full_name','father_name','mother_name','bi_number','bi_date_issue','bi_local_issue','nuit','birth_date','district'].includes(p)).map(mapToField)
  },
  {
    section: 'Outros',
    fields: placeholders.filter(p => !['full_name','father_name','mother_name','bi_number','bi_date_issue','bi_local_issue','nuit','birth_date','district'].includes(p)).map(mapToField)
  }
].filter(s => s.fields && s.fields.length);

// Determina o layout baseado no slug
const layoutType = slug.includes('declaracao') || slug.includes('compromisso') ? 'DECLARATION' : 
                   slug.includes('carta') ? 'LETTER' : 'OFFICIAL';

const finalSchema = {
  layout_type: layoutType,
  sections: grouped
};

const json = JSON.stringify(finalSchema, null, 2);
console.log('Generated form_schema:', json);

// Optional: if --apply and you have DB connection configured, update the DB
// Usage to apply (example):
//   DATABASE_URL="postgres://user:pass@host:5432/dbname" node scripts/generate-form-schema.js compromisso-de-honra --apply

if (process.argv.includes('--apply')) {
  const { Client } = require('pg');
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set. Set it in the environment before running with --apply.');
    process.exit(2);
  }

  (async () => {
    const client = new Client({ connectionString: DATABASE_URL });
    try {
      await client.connect();
      const query = `UPDATE public.document_templates SET form_schema = $1 WHERE slug = $2 RETURNING id, slug`;
      const values = [finalSchema, slug];
      const res = await client.query(query, values);
      if (res.rowCount === 0) {
        console.error('No template updated. Check that the slug exists:', slug);
        process.exit(3);
      }
      console.log('Updated template:', res.rows[0]);
    } catch (err) {
      console.error('Error applying update to DB:', err.message || err);
      process.exit(4);
    } finally {
      await client.end();
    }
  })();
}
