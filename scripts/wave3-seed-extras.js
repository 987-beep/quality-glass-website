/* Wave-3 extras: stagger created_at for NEW badges + seed FIRST100 coupon. */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.INSFORGE_DATABASE_URL });
  await c.connect();
  await c.query('INSERT INTO ops.maintenance_flag ("on") VALUES (true)');
  try {
    // 5 products staggered within the last 10 days -> NEW badge demos right away
    const slugs = [
      'krishna-murli-frame', 'makkah-kaaba-frame', 'jinwoo-shadow-monarch-frame',
      'sunset-lamp-led-frame', 'wedding-story-trio-set',
    ];
    let i = 1;
    for (const slug of slugs) {
      await c.query(
        'update public.products set created_at = now() - $1::interval where slug = $2',
        [`${i} days`, slug]
      );
      i += 2;
    }
    console.log('created_at staggered for NEW badges');

    // FIRST100 coupon (Santi pattern) — flat ₹100 off first big order
    const ex = await c.query("select id from public.coupons where code = 'FIRST100'");
    if (!ex.rows[0]) {
      await c.query(
        `insert into public.coupons (code, percent_off, min_order, is_active, note, amount_off)
         values ('FIRST100', null, 999, true, 'Welcome offer — flat ₹100 off your order of ₹999+', 100)`
      );
      console.log('FIRST100 coupon seeded');
    }
    console.log('extras DONE');
  } finally {
    await c.query('DELETE FROM ops.maintenance_flag');
    await c.end();
  }
})().catch((e) => { console.error('ERR:', e.message); process.exit(1); });
