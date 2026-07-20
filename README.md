# topworldenterprises.com

Static site for Top World Enterprises SARL AU — Casablanca, Morocco.
No build step, no dependencies. Plain HTML, one CSS file, one JS file.

## Why no framework

Render serves this repo as-is. There is nothing to install, nothing to compile,
and no build that can fail at 11pm. Five pages don't need a framework. If the
site grows past ~15 pages we can revisit — the structure below ports to Astro
almost unchanged.

## Structure

```
/                       Accueil (home)
/services/              Services de centre d'appels
/mission/               Mission et objectifs (FR + EN)
/contact/               Contact + formulaire
/assets/css/site.css    all styling, design tokens at the top
/assets/js/site.js      live Casablanca / Paris clocks
render.yaml             Render config, incl. redirects from old GoDaddy URLs
```

Content mirrors the original GoDaddy site (Accueil · Services · Mission ·
Contact), in the current white / blue / orange design that matches the logo.
The design tokens live in `:root` at the top of `site.css` (`--navy` blue,
`--amber` orange). No build step, no framework.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to Render

1. Push this repo to GitHub.
2. Render dashboard → **New** → **Static Site** → connect the repo.
3. Settings:
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.`
4. Deploy. You get a `*.onrender.com` URL. **Test everything there first.**

## DNS cutover (GoDaddy → Render)

Domain stays registered at GoDaddy. We only repoint the records.

**Do this only after the `.onrender.com` URL looks right.**

1. Render → your site → **Settings** → **Custom Domains**.
2. Add both `topworldenterprises.com` and `www.topworldenterprises.com`.
3. Render shows you the exact records to create. Use *its* values, not values
   from any tutorial — they change.
   - Apex (`@`) → an **A record**
   - `www` → a **CNAME**
4. GoDaddy → **My Products** → domain → **DNS** → **Manage Zones**.
5. **Before touching anything: screenshot the current DNS table.** That is your
   rollback.
6. Edit the existing `@` A record and `www` CNAME to Render's values.
   Set TTL to 600 (10 min) so a mistake is cheap to undo.
7. Wait. Propagation is usually minutes, occasionally hours. Render issues the
   TLS certificate automatically once DNS resolves.

**Do not delete the MX records.** They route the `@topworldenterprises.com`
mailboxes. Touching them breaks email. Only `@` and `www` change.

### Rollback

Put the old values back from the screenshot. TTL 600 means you're live again in
about ten minutes.

---

## Before launch — must do

- [ ] **Formspree endpoint.** `contact/index.html` posts to
      `https://formspree.io/f/YOUR_FORM_ID`. Create the form at formspree.io
      with `contact@topworldenterprises.com` and paste the real ID. **The form does
      nothing until this is done.**
- [ ] **ICE + RC numbers.** Commented slot in every footer. TWE is a new company
      selling to French buyers who are actively screening for scams — a
      verifiable Moroccan registration number is the cheapest trust you can buy.
      Uncomment once you have them.
- [ ] **Logo as SVG or transparent PNG.** All six current files are JPEGs with
      baked-in white backgrounds, so the logo can only sit on white. The footer
      currently works around this with a white card. Fix at source.
- [ ] **Real photos of the plateau.** Route de l'Oasis, faces, headsets, screens.
      This is the single highest-trust asset available and it costs one phone.
      Stock photography actively hurts here.

## After launch

- [ ] Google Search Console → submit `sitemap.xml`
- [ ] Google Business Profile for the Maârif office
- [ ] Proof: client logos, one named case study, headcount, years operating.
      Nothing on this site claims a number that can't be backed — deliberately.
      Send the real ones and they go in.

## Notes for whoever edits this next

- **Colors and type live in `:root`** at the top of `site.css`. Change them there
  once, not per-page.
- **IBM Plex Mono means "a checkable fact"** — times, the countdown, phone,
  address, the law reference. Don't use it decoratively; the distinction is the
  whole typographic idea.
- **The clocks use real IANA time zones.** Casablanca is UTC+1 year-round and
  drops to UTC+0 during Ramadan; Paris shifts for DST. Right now Paris is 1h
  ahead and the banner says so. Never hardcode an offset and never fake a
  matching time — a French buyer will catch it instantly and that's the whole
  credibility of the widget gone.
- **The countdown flips itself.** After 11 Aug 2026 it reads "jours depuis
  l'entrée en vigueur" instead of "jours restants". No edit needed.
- **`render.yaml` redirects the old GoDaddy URLs** (`/accueil%2Fhome`,
  `/contactez-nous%2Fcontact-us`, `/mission`) so existing links and any
  accumulated SEO don't 404.
