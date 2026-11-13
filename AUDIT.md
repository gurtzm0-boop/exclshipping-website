# Page audit — site-v4 landing preview

**Page:** `/workspace/site-v4/index.html` (local only, `http://127.0.0.1:8765/` when served)  
**Date (SAST):** 12 November 2026, Africa/Johannesburg (UTC+2)  
**Viewports:** 390 / 640 (200% zoom proxy of 1280) / 1280

Legend: **P** = Pass, **F** = Fail, **N** = N/A.

This is a review build, not a live page. A Fail on a placeholder or unwired item does not mean the layout should be hidden; it means the page is not ready to publish.

---

## Blocking

| P | F | N | Check | Note |
|---|---|---|---|---|
| P |   |   | Correct EXCL Shipping logo, crisp, home link with an accessible name. | White logo, `aria-label="EXCL Shipping home"`, image `alt=""`. |
| P |   |   | No invented facts. Placeholders obviously temporary. | Gold dashed marks. No prices, certifications, clients or figures invented. |
| P |   |   | `lang` and character encoding. | `lang="en-ZA"`, `charset=utf-8`. |
| P |   |   | Unique, descriptive title and meta description. | From the wording pack (50/60 and 150/155). |
| P |   |   | One H1; heading levels not skipped. | H1 hero, H2 sections, H3 categories / steps / points, H4 tile names. |
| P |   |   | Main landmark and skip link. | `<main id="main">`. Skip link visible on focus. |
| P |   |   | Contact visible immediately, including at 390px. | Header button, phone, mobile bar (Call / WhatsApp / Contact Us). |
| P |   |   | Primary CTA clearly labelled; tested brand-red styling. | “Contact us for pricing” and “Request a quote”. Buttons use `#C8121A` on white text (contrast ≈ 5.9:1). `#ED1C24` on white is only ≈ 4.38:1 and is not used for button text. |
| P |   |   | Keyboard, visible focus, sticky bar does not fully hide the focused item. | `:focus-visible` outlines. `scroll-padding` / `scroll-margin` for the sticky header and mobile bar. |
| P |   |   | Targets at least 24×24 CSS px. | Buttons, nav, form fields and the mobile bar are ≥ 2.75rem. |
| P |   |   | Text contrast ≥ 4.5:1 (3:1 large text). UI/focus ≥ 3:1. Brand red measured. | Body is white / off-white / `#A9A9A9` on `#0A0A0A` or `#141414`. See button note above. |
| P |   |   | Meaning is not by colour alone. | Facts use a red arrow plus text; placeholders are dashed and labelled. |
| P |   |   | Width/height or aspect ratio on images; LCP image not lazy. | Tiles `aspect-ratio: 4/5` and width/height attributes. Hero first slide is in the HTML, `fetchpriority="high"`, preloaded, not lazy. Rotation slides are added after load in the same absolutely positioned layer, so there is no layout shift. |
| P |   |   | Specific alt on meaningful images; decorative `alt=""`. | Service tiles have short descriptive alts. Logo alt is empty; accessible name is on the link. |
| P |   |   | Contact form: four fields, labels with for/id, types, autocomplete, errors next to fields, privacy-notice link. | Name, email, mobile, message. Honeypot present. Errors are specific. Privacy links to the placeholder page. |
| P |   |   | Usable at 390px; no layout horizontal scroll; form usable with the mobile keyboard. | `scrollWidth === 390`. Form fields and Send Message fit between the header and the mobile bar. |
| P |   |   | Usable at 1280px; body measure limited; hierarchy clear. | |
| P |   |   | Motion is gentle and can be avoided. | Hero crossfade: 7 s per slide, 2 s fade, 4% slow zoom, no flashing. Off under `prefers-reduced-motion` (onion photo only) and with Data Saver. Pauses when the tab is hidden. Decorative (`aria-hidden`, `alt=""`), so no controls are needed. |
| P |   |   | Text readable at 200% zoom. | Checked at a 640px viewport (1280 at 200%). No horizontal overflow. |

---

## Design, UX and content

| P | F | N | Check | Note |
|---|---|---|---|---|
| P |   |   | Type and spacing use a shared scale. | Barlow / Barlow Condensed from the brand kit. |
| P |   |   | Visual hierarchy is clear. | |
| P |   |   | Navigation labels are plain. | Products, How it works, About, Contact. This is the only real page, so no “current” state beyond Home. |
|   | F |   | Footer includes confirmed contact routes and Privacy (and PAIA once it exists). | Phone and email are shown. Privacy and Terms are placeholder pages. Office address is a placeholder. PAIA is not present. |
| P |   |   | Category or product copy is factual, not filler. | From approved adverts and the wording pack. Onions uses “7 kg and 10 kg” (confirmed by Gert); potatoes uses “Washed or Brushed” from the approved advert. |
|   |   | P/F | Photography looks professional. | Onions and eclairs are strong. Small originals were AI- or EDSR-upscaled and are still soft (see README “Image pass”). Shipping/relocation images are AI-generated and used as background-style tiles. |
|   |   | N | WhatsApp uses `https://wa.me/` + international digits once confirmed. | Control is on the page but not linked until Gert confirms a number. |
| P |   |   | Click-to-call uses `tel:+27…` and the number is visible as text. | Displayed as 079 897 5960. |
|   |   | N | Office hours include SAST if shown. | Hours are not shown. |
| P |   |   | Help/contact controls in a consistent place. | Header, strip, footer, mobile bar. |

---

## Performance, SEO and code quality

| P | F | N | Check | Note |
|---|---|---|---|---|
|   |   | N | Lab LCP ≤ 2.5 s, CLS ≤ 0.1, Lighthouse scores. | Lighthouse not run. Local Chromium check after the hero rotation: LCP is the onion hero at about 0.1 s, hero CLS 0 (0.001 header shift from font swap, also present before). Images are responsive WebP+JPEG with reserved ratios. |
| P |   |   | Modern image formats with JPEG fallback, srcset/sizes or picture. | |
| P |   |   | Fonts are WOFF2 (with WOFF fallback), limited, not all lazy-discovered. | Four faces, preloaded ExtraBold and Regular. `font-display: swap`. |
| P |   |   | Minimal CSS/JS; script deferred. | |
|   |   | N | Self-canonical URL, trailing-slash policy, HTTPS when live. | Local preview, `noindex,nofollow`. No public URL. |
| P |   |   | Open Graph title, description and image are present. | `og:image` is a local asset path, fine for this preview. |
| P |   |   | JSON-LD only confirmed facts. | Organization name, alternate name, telephone, email. No URL, address or invented fields. |
| P |   |   | No hreflang. | |
| P |   |   | No leftover debug or broken in-page links. | Privacy, terms and about are present as placeholders. W3C Nu validator was not run. |
|   |   | N | Lighthouse Accessibility and SEO. | Not run. |

---

## Forms, security and legal

| P | F | N | Check | Note |
|---|---|---|---|---|
| P |   |   | Form is clearly unwired in this review build, with no fake success. | Action is `https://example.invalid/form-endpoint-placeholder`. Valid submit shows a preview notice, not a sent-message success. |
| P |   |   | Honeypot present and hidden. | `company_url`, off-screen, `tabindex="-1"`. |
|   | F |   | Success and failure states tested against a real inbox. | Outstanding until the endpoint is wired. Intended success line is ready in the script notice. |
|   | F |   | Privacy notice covers what the form collects and why (POPIA s18). | Placeholder only. |
|   |   | N | No marketing or analytics cookies. | None present. |
|   |   | N | Live/staging HTTPS and security headers. | Local preview only. |

---

## Launch-only

All N/A (old URL map, sitemap, robots.txt, analytics, owner approval to publish). This page must not be published until Gert approves it.

---

**Lighthouse (mobile):** not recorded.

**Result:** Ready for review as a local preview. **Not ready to publish.** Outstanding fails are the unwired form, the placeholder privacy notice, and the unconfirmed footer details — not layout blocks.

**Open placeholders:** see `README.md`.
