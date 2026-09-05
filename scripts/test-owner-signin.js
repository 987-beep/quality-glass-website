/* Probe the REAL auth endpoint with the combos the owner might be typing.
   Reports only HTTP status — never prints secrets. */
require('dotenv').config({ path: '.env.local' });
const URL = process.env.INSFORGE_URL;
const KEY = process.env.INSFORGE_API_KEY;

const combos = [
  'owneajmal69@qualityglass.in',   // exact email stored in DB
  'ownerajmal69@qualityglass.in',  // as typed on mobile (extra 'r')
];

(async () => {
  for (const email of combos) {
    const res = await fetch(`${URL}/api/auth/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ email, password: 'PASTE_PASSWORD_TO_TEST' }),
    });
    let body = '';
    try { const j = await res.json(); body = JSON.stringify(j).slice(0, 200); } catch { body = '(no json)'; }
    // redact any tokens from output
    body = body.replace(/"(accessToken|token|refreshToken)":"[^"]+"/g, '"$1":"…"');
    console.log(`${email} -> HTTP ${res.status}: ${body}`);
  }
})();
