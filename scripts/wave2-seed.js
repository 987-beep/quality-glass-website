require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");

const STOCK = [
  ["Glass sheet 12x16in", "pcs", 20, 5],
  ["Glass sheet 16x20in", "pcs", 15, 5],
  ["Teak wood frame blank 12x16", "pcs", 10, 3],
  ["Teak wood frame blank 16x20", "pcs", 10, 3],
  ["Gold finish frame blank A4", "pcs", 12, 4],
  ["Mount board roll", "ft", 50, 10],
  ["Backing board 12x16", "pcs", 40, 10],
  ["Corner clips", "pcs", 200, 50],
  ["Photo paper glossy A4", "pcs", 100, 25],
  ["Hanging hooks", "pcs", 80, 20],
];
const BULK = [
  ["Standard 12x16 wood frame", 10, 650, 1],
  ["Standard 12x16 wood frame", 25, 600, 2],
  ["Gold finish 12x16 frame", 10, 1100, 3],
  ["Gold finish 12x16 frame", 25, 990, 4],
  ["Photo print A4 (glossy)", 50, 40, 5],
  ["Certificate frame A4", 20, 450, 6],
];

(async () => {
  const c = new Client({ connectionString: process.env.INSFORGE_DATABASE_URL });
  await c.connect();
  await c.query('INSERT INTO ops.maintenance_flag ("on") VALUES (true)');
  try {
    const n = await c.query("SELECT COUNT(*) c FROM public.stock_items");
    if (Number(n.rows[0].c) === 0) {
      await c.query(
        "INSERT INTO public.stock_items (name, unit, qty, low_threshold) VALUES " +
          STOCK.map((s, i) => `($${i * 4 + 1},$${i * 4 + 2},$${i * 4 + 3},$${i * 4 + 4})`).join(","),
        STOCK.flat()
      );
      console.log("stock items seeded");
    } else console.log("stock items already:", n.rows[0].c);

    const b = await c.query("SELECT COUNT(*) c FROM public.bulk_rates");
    if (Number(b.rows[0].c) === 0) {
      await c.query(
        "INSERT INTO public.bulk_rates (label, min_qty, unit_price, sort) VALUES " +
          BULK.map((r, i) => `($${i * 4 + 1},$${i * 4 + 2},$${i * 4 + 3},$${i * 4 + 4})`).join(","),
        BULK.flat()
      );
      console.log("bulk rates seeded");
    } else console.log("bulk rates already:", b.rows[0].c);
  } finally {
    await c.query("DELETE FROM ops.maintenance_flag");
  }
  console.log("DONE");
  await c.end();
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
