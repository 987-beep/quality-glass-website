require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const TARGET_EMAILS = ['ajmalnic@gmail.com', 'vishishthgaurlittle@gmail.com'];

(async () => {
  const c = new Client({ connectionString: process.env.INSFORGE_DATABASE_URL });
  await c.connect();

  // 1. Map auth.users -> profiles
  const map = await c.query(`
    SELECT u.id, u.email, p.full_name, p.role, p.username
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    ORDER BY u.created_at`);
  console.log('accounts:');
  for (const r of map.rows) console.log(' ', r.id.slice(0, 8), '|', r.email, '|', r.full_name, '| role:', r.role);

  // 2. Current RLS policies on write-protected public tables
  const pol = await c.query(`
    SELECT tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname='public' AND tablename IN ('products','site_settings','coupons','reviews','orders')
    ORDER BY tablename, policyname`);
  console.log('\nRLS policies (public, key tables):');
  for (const r of pol.rows) {
    console.log(` - ${r.tablename} :: ${r.policyname}`);
    console.log(`   USING: ${String(r.qual).slice(0, 220)}`);
    if (r.with_check) console.log(`   CHECK: ${String(r.with_check).slice(0, 220)}`);
  }
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
