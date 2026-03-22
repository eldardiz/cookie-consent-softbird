# cookie-consent-softbird
GDPR Compliant Cookie Consent for https://softbird.fr

## Step 1 — Host the script

Upload `cookie-consent.js` to GitHub, then serve it via jsDelivr:

```
https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/cookie-consent.js
```

Or host it on any static file host (Cloudflare Pages, Netlify, your own CDN).

---

## Step 2 — Embed on each site (Webflow → Project Settings → Custom Code → Footer)

Minimal embed (all defaults):

```html
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/cookie-consent.js"></script>
```

With config (place BEFORE the script tag):

```html
<script>
window.CookieConsentConfig = {
  companyName:      "Axamo",
  privacyPolicyUrl: "/privacy-policy",
  accentColor:      "#1a1a1a",
  accentText:       "#ffffff",
  position:         "bottom",
  texts: {
    bannerTitle: "We use cookies",
    bannerBody:  "We use cookies to improve your experience."
  }
};
</script>
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/YOUR_REPO@main/cookie-consent.js"></script>
```

---

## Config options

| Option             | Default            | Values                                        |
|--------------------|--------------------|-----------------------------------------------|
| companyName        | "Our website"      | any string                                    |
| privacyPolicyUrl   | "/privacy-policy"  | any URL                                       |
| privacyPolicyText  | "Privacy Policy"   | any string                                    |
| storageKey         | "gdpr_consent"     | any string                                    |
| consentVersion     | "1.0"              | any string (bump to force re-consent)         |
| position           | "bottom"           | "bottom", "bottom-left", "bottom-right"       |
| accentColor        | "#111111"          | any CSS color                                 |
| accentText         | "#ffffff"          | any CSS color (text on accent bg)             |
| categories         | see below          | object of category configs                    |
| texts              | see below          | object of UI strings                          |

### categories

```js
categories: {
  analytics:   { enabled: true,  label: "Analytics",   description: "..." },
  marketing:   { enabled: true,  label: "Marketing",   description: "..." },
  preferences: { enabled: false, label: "Preferences", description: "..." }
}
```

Set `enabled: false` to hide a category entirely from the modal.

### texts (full list)

```js
texts: {
  bannerTitle:   "We use cookies",
  bannerBody:    "...",
  rejectAll:     "Reject all",
  acceptAll:     "Accept all",
  manage:        "Manage preferences",
  modalTitle:    "Cookie preferences",
  modalBody:     "...",
  necessary:     "Necessary",
  necessaryDesc: "Required for the website to function. Cannot be disabled.",
  save:          "Save preferences"
}
```

---

## Public API (call from any page script)

```js
CookieConsent.hasConsent('analytics')   // true | false
CookieConsent.hasConsent('marketing')   // true | false
CookieConsent.openPreferences()         // open the modal
CookieConsent.getConsent()              // full consent object
CookieConsent.reset()                   // clear + show banner (for testing)
```

### Listen for consent changes

```js
window.addEventListener('cookieConsentUpdated', function(e) {
  console.log(e.detail); // { analytics: true, marketing: false, ... }
  if (e.detail.analytics) {
    // load analytics script here
  }
});
```

---

## Google Consent Mode v2

If `gtag` is present on the page, consent updates are pushed automatically. Add this **before** your GTM/GA snippet to set defaults:

```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });
</script>
```

The consent script handles the `gtag('consent', 'update', {...})` call automatically after user interaction.

---

## To force re-consent across all sites

Bump `consentVersion` in the config (e.g. from `"1.0"` to `"1.1"`).
