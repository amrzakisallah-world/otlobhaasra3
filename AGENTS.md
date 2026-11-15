# AGENTS.md

- Static site, no build step. `netlify.toml` publishes `public/`.
- The whole app is `public/index.html`: inline CSS, inline script, and base64-embedded brand images.
- Data lives in the script: `B` (brands: name, color, image), `P` (products: [brand, name, list price]), `OFF` (reference "compare" prices by product index), `SELLERS` (WhatsApp numbers keyed by URL hash).
- Discount tiers are in `rate()`; delivery fee (30 EGP) is hard-coded in the message builder in `send()`.
- UI text is Egyptian Arabic, `dir="rtl"`. Keep it that way when editing copy.
- No backend: orders are sent via `https://wa.me/` links; customer details are remembered in localStorage only.
