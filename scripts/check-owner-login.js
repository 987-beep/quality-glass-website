/* Diagnose owner login: find the owner account, compare the typed password against the stored hash.
   Never prints the password — only PASS/FAIL and account metadata. */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const TYPED = 'PASTE_PASSWORD_TO_TEST'; // what the owner typed in the screenshot

(async () => {
  const c = new Client({ connectionString: process.env.INSFORGE_DATABASE_URL });
  await c.connect();

  const tables = await c.query(
    "SELECT table_schema||'.'||table_name t FROM information_schema.tables WHERE table_name ILIKE '%user%' OR table_name ILIKE '%profile%' OR table_name ILIKE '%account%' ORDER BY 1"
  );
  console.log('user-ish tables:', tables.rows.map(r => r.t).join(' | '));

  for (const { t } of tables.rows) {
    const [schema, name] = t.split('.');
    const cols = await c.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position",
      [schema, name]
    );
    const names = cols.rows.map(r => r.column_name);
    console.log('\n###', t, '-> cols:', names.join(','));
    const wanted = names.filter(n => /email|name|role|pass|verif|approv|user/i.test(n));
    if (!wanted.length) continue;
    const rows = await c.query(`SELECT ${wanted.map(w => '"' + w + '"').join(',')} FROM ${t} ORDER BY 1 LIMIT 20`).catch(e => ({ rows: [], error: e.message }));
    for (const r of rows.rows) {
      // redact anything password-like except first 12 chars to see hash type
      const out = {};
      for (const k of Object.keys(r)) {
        const v = String(r[k] ?? '');
        out[k] = /pass|hash/i.test(k) ? (v ? v.slice(0, 12) + '…(redacted)' : null) : r[k];
      }
      console.log(' row:', JSON.stringify(out));
    }
  }

  // Try bcrypt compare if we found a hash column anywhere
  for (const { t } of tables.rows) {
    const [schema] = t.split('.');
    const cols = await c.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 AND (column_name ILIKE '%password%' OR column_name ILIKE '%hash%')",
      [schema, t.split('.')[1]]
    );
    for (const { column_name: cn } of cols.rows) {
      const emailCol = (await c.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 AND column_name ILIKE '%email%' LIMIT 1",
        [schema, t.split('.')[1]]
      )).rows[0];
      const q = `SELECT ${emailCol ? '"' + emailCol.column_name + '",' : ''} "${cn}" FROM ${t} WHERE "${cn}" IS NOT NULL LIMIT 10`;
      const rs = await c.query(q).catch(() => ({ rows: [] }));
      for (const r of rs.rows) {
        const hash = r[cn];
        if (typeof hash === 'string' && hash.startsWith('$2')) {
          const ok = await bcrypt.compare(TYPED, hash);
          console.log(`\nbcrypt check on ${t}.${cn} for ${emailCol ? r[emailCol.column_name] : '(row)'} -> typed password matches: ${ok}`);
        }
      }
    }
  }
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
