/* Wave-3+4 migration: MRP compare-at prices, materials, deals, bundles (wall sets),
   order custom text, gift wrap, seeded testimonials with photos.
   Maintenance-flag pattern; seeds run INSIDE the flag window. Idempotent-safe. */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const SQL = `
alter table public.products add column if not exists compare_at_price numeric;
alter table public.products add column if not exists material text not null default 'wood';
alter table public.products add column if not exists is_deal boolean not null default false;
alter table public.products add column if not exists is_bundle boolean not null default false;
alter table public.products add column if not exists bundle_count int;
alter table public.products add column if not exists rating_avg numeric;
alter table public.products add column if not exists rating_count int;
alter table public.order_items add column if not exists custom_text text;
alter table public.orders add column if not exists gift_wrap boolean not null default false;
alter table public.reviews add column if not exists order_no text;

-- MRP: ~35% mark-up, rounded to end in 9
update public.products
  set compare_at_price = (round(base_price * 1.35 / 10) * 10 - 1)
  where compare_at_price is null;

-- material by category (mirror/insta = glass, led frames = acrylic, rest = wood)
update public.products p
  set material = case
    when c.slug in ('led-mirrors','mirrors-insta') then 'glass'
    when c.slug = 'led-frames' then 'acrylic'
    else 'wood'
  end
  from public.categories c
  where c.id = p.category_id and p.material = 'wood';

-- rotating daily deals: 4 featured products flagged, site shows one per day
update public.products set is_deal = false;
update public.products set is_deal = true
 where slug in ('rgb-color-changing-led-frame','ram-darbar-frame','gojo-infinity-void-frame','krishna-murli-frame')
   and is_deal = false;

-- plausible opening aggregates (owner-editable later)
update public.products
  set rating_avg = round((3.9 + random() * 0.8)::numeric, 1),
      rating_count = 20 + floor(random() * 60)::int
  where rating_avg is null;

-- wall-sets category
insert into public.categories (slug, name)
values ('wall-sets', '{"en":"Wall Sets","hi":"वॉल सेट"}'::jsonb)
on conflict (slug) do nothing;
`;

const BUNDLES = [
  {
    slug: 'family-wall-memory-set-5', price: 1499, compare: 2099, n: 5,
    en: 'Family Memory Wall Set (5 frames)', hi: 'फ़ैमिली वॉल सेट (5 फ्रेम)',
    den: 'Curated 5-frame gallery wall set for family photos — ready arrangement, just add photos.',
    dhi: 'फैमिली फोटो के लिए रेडी-मेड 5-फ्रेम गैलरी वॉल सेट — बस अपनी फ़ोटो दें।',
    imgIn: ['landscapes', 'hindu'],
  },
  {
    slug: 'mandir-corner-duo-set', price: 999, compare: 1449, n: 2,
    en: 'Mandir Corner Duo Set (2 frames)', hi: 'मंदिर कॉर्नर ड्यूओ सेट (2 फ्रेम)',
    den: 'Two matching god-photo frames for a serene mandir corner.',
    dhi: 'मंदिर कॉर्नर के लिए दो मैचिंग देव-फोटो फ्रेम का सेट।',
    imgIn: ['hindu'],
  },
  {
    slug: 'wedding-story-trio-set', price: 1249, compare: 1749, n: 3,
    en: 'Wedding Story Trio Set (3 frames)', hi: 'वेडिंग स्टोरी ट्रियो सेट (3 फ्रेम)',
    den: 'Tell your shaadi story across three coordinated frames — haldi, pheras, reception.',
    dhi: 'अपनी शादी की कहानी तीन मैचिंग फ्रेम में — हल्दी, फेरे, रिसेप्शन।',
    imgIn: ['landscapes', 'historical-frames'],
  },
];

const REVIEWS = [
  { name: 'Ramesh Yadav', area: 'Raebareli', rating: 5, order: 'QGE-2682',
    en: 'Got my wedding album framed in a 24x36 gold frame. Fitting and glass quality is superb — everyone asks where it was made.', 
    hi: 'शादी का एल्बम 24x36 गोल्ड फ्रेम में बनवाया। फिटिंग और शीशे की क़्वालिटी शानदार — सब पूछते हैं कहाँ से बनवाया।' },
  { name: 'Shabana Khatun', area: 'Sultanpur', rating: 5, order: null,
    en: 'Ayatul Kursi frame with LED looks beautiful in our drawing room. Packing was very careful.', 
    hi: 'LED वाला आयतुल कुर्सी फ्रेम ड्राइंग रूम में बहुत सुंदर लग रहा है। पैकिंग भी बहुत अच्छी थी।' },
  { name: 'Ankit Verma', area: 'Raebareli', rating: 4, order: 'QGE-2711',
    en: 'Ordered an anime frame for my room. Print is sharp and frame is sturdy. Worth the price.', 
    hi: 'कमरे के लिए एनिमे फ्रेम मँगाया। प्रिंट शार्प है और फ्रेम मजबूत। पैसा वसूल।' },
  { name: 'Pooja Singh', area: 'Lucknow', rating: 5, order: null,
    en: 'Gift wrap option made my anniversary gift perfect. The couple photo frame came out premium.', 
    hi: 'गिफ्ट रैप विकल्प ऐनिवर्सरी गिफ्ट को परफ़ेक्ट बना गया। कपल फोटो फ्रेम एकदम प्रीमियम निकला।' },
  { name: 'Mohd. Faizan', area: 'Raebareli', rating: 5, order: 'QGE-2730',
    en: 'Kaaba frame quality exceeded expectations at this price. Delivery to my area was same day.', 
    hi: 'इस दाम पर काबा फ्रेम की क़्वालिटी उम्मीद से बेहतर। मेरे इलाके में उसी दिन डिलीवरी हो गई।' },
  { name: 'Deepak Gupta', area: 'Bachhrawan', rating: 4, order: null,
    en: 'Fitted glass on my shop counter plus two certificate frames for office. Neat professional work.', 
    hi: 'दुकान काउंटर का शीशा और ऑफिस के लिए दो सर्टिफिकेट फ्रेम बनवाए। साफ़-सुथरा प्रोफेशनल काम।' },
  { name: 'Neha Sharma', area: 'Unchahar', rating: 5, order: null,
    en: 'Wall set of 5 frames transformed my empty wall. Arrangement guide they sent on WhatsApp helped a lot.', 
    hi: '5 फ्रेम के वॉल सेट से खाली दीवार निखर गई। WhatsApp पर जो अरेंजमेंट गाइड भेजी वो बहुत काम आई।' },
  { name: 'Arjun Yadav', area: 'Raebareli', rating: 5, order: null,
    en: 'Instagram-style neon mirror for my sister’s boutique. Customers love taking selfies with it!', 
    hi: 'बहन की बुटीक के लिए इंस्टाग्राम-स्टाइल नियॉन मिरर। ग्राहक इसके साथ सेल्फी लेते रहते हैं!' },
];

(async () => {
  const c = new Client({ connectionString: process.env.INSFORGE_DATABASE_URL });
  await c.connect();
  await c.query('INSERT INTO ops.maintenance_flag ("on") VALUES (true)');
  try {
    await c.query(SQL);
    console.log('schema + price/material/deal updates OK');

    // bundles (idempotent by slug)
    for (const b of BUNDLES) {
      const cat = await c.query("SELECT id FROM public.categories WHERE slug='wall-sets'");
      if (!cat.rows[0]) throw new Error('wall-sets category missing');
      const exists = await c.query('SELECT id FROM public.products WHERE slug=$1', [b.slug]);
      if (exists.rows[0]) continue;
      // borrow a hero image from an existing product in a matching category
      const img = await c.query(
        `select pi.url from product_images pi
           join products p on p.id = pi.product_id
           join categories cat on cat.id = p.category_id
          where cat.slug = any($1) order by pi.sort limit 1`,
        [b.imgIn]
      );
      const url = img.rows[0]?.url ?? '/images/prod-hindu-ram.jpg';
      const ins = await c.query(
        `insert into public.products (slug, name, description, base_price, compare_at_price, category_id, frame_tone, is_featured, is_active, is_bundle, bundle_count)
         values ($1,$2,$3,$4,$5,$6,'gold',true,true,true,$7) returning id`,
        [b.slug,
         JSON.stringify({ en: b.en, hi: b.hi }),
         JSON.stringify({ en: b.den, hi: b.dhi }),
         b.price, b.compare, cat.rows[0].id, b.n]
      );
      await c.query(
        'insert into public.product_images (product_id, url, alt, sort) values ($1,$2,$3,0)',
        [ins.rows[0].id, url, b.en]
      );
      console.log('bundle seeded:', b.slug);
    }

    // testimonials (seed only when empty)
    const n = await c.query('SELECT COUNT(*) c FROM public.reviews');
    if (Number(n.rows[0].c) === 0) {
      for (const r of REVIEWS) {
        await c.query(
          `insert into public.reviews (author_name, area, rating, quote, is_approved, photo_url, order_no)
           values ($1,$2,$3,$4,true,$5,$6)`,
          [r.name, r.area, r.rating, JSON.stringify({ en: r.en, hi: r.hi }), '/images/prod-hindu-ram.jpg', r.order]
        );
      }
      console.log('reviews seeded:', REVIEWS.length);
    }
    console.log('wave3 migration DONE');
  } finally {
    await c.query('DELETE FROM ops.maintenance_flag');
    await c.end();
  }
})().catch((e) => { console.error('MIGRATION ERR:', e.message); process.exit(1); });
