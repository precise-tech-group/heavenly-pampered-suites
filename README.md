# Heavenly Pampered Suites

A production-ready marketing website for Heavenly Pampered Suites, a salon-suite
rental business that leases private, fully equipped mini-salons to independent
beauty and wellness professionals (hairstylists, barbers, estheticians, nail
technicians, massage therapists, and similar).

Built as a static site with plain HTML5, CSS3, and vanilla JavaScript — no
frameworks, build step, or dependencies. It can be hosted anywhere that serves
static files (GitHub Pages, Netlify, S3, any standard web host).

## Structure

```
/
├── index.html          Home page
├── suites.html         Suites page (gallery, lightbox, "who it's for")
├── contact.html         Contact page (inquiry form, FAQ)
├── assets/
│   ├── css/
│   │   ├── style.css        Design tokens, components, layout
│   │   └── responsive.css   Breakpoints, touch-device overrides
│   ├── js/
│   │   ├── main.js          Nav, mobile drawer, lightbox, FAQ, form validation
│   │   └── animations.js    Scroll reveal, parallax, 3D tilt, magnetic buttons
│   └── images/               Licensed real photography (see Credits)
└── README.md
```

## Running locally

No build step is required. Serve the folder with any static file server, e.g.:

```
npx serve .
```

or simply open `index.html` in a browser (some browsers restrict `fetch`/module
behavior under `file://`, but this site uses neither, so opening directly also
works).

## Contact form

The inquiry form on `contact.html` performs full client-side validation but is
**not** wired to a backend or form service, since none was supplied. Submitting
it surfaces a clear message directing visitors to call or email directly. The
validated field values are collected in `submitForm()` inside
`assets/js/main.js` — connect a service (Formspree, Netlify Forms, a custom
API endpoint, etc.) by replacing that function's body with a `fetch()` call.

## Image credits

All photography is real, licensed, royalty-free stock photography downloaded
from [Unsplash](https://unsplash.com) and [Pexels](https://pexels.com) and
stored locally in `assets/images/`. No placeholder, generated, or hotlinked
imagery is used.

## Accessibility & performance notes

- Semantic landmarks, heading hierarchy, labeled form fields, and visible
  focus states throughout.
- Mobile navigation drawer and image lightbox are both fully keyboard
  operable with focus trapping and `Escape` support.
- All scroll-driven animation is gated behind `prefers-reduced-motion`.
- Below-the-fold images use `loading="lazy"`; the hero image on each page
  uses `fetchpriority="high"`.
- 3D tilt and magnetic-button effects are only enabled for fine-pointer,
  hover-capable devices and are disabled on touch devices.
