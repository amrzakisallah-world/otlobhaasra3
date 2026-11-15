# WhatsApp Order Page

A single-page, Arabic (RTL) product order form. Customers pick quantities from three product lines, see tiered discounts (20% / 25% at 1,000 EGP / 30% at 2,000 EGP) applied live, enter their details, and send the finished order as a pre-filled WhatsApp message.

## Tech
- Plain HTML, CSS and vanilla JavaScript in one file (`public/index.html`); brand images are embedded inline.
- Hosted on Netlify as a static site (no build step).

## Run locally
Open `public/index.html` in a browser, or run `netlify dev` from the project root.

## Seller links
Add `#a`, `#b` or `#c` to the URL to route orders to a specific seller's WhatsApp number (defaults to `a`). Numbers are set in the `SELLERS` object in the script.
