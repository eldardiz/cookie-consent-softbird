(function () {
  'use strict';

  // ─── defaults ────────────────────────────────────────────────────────────────
  var CFG = Object.assign({
    companyName:      'Our website',
    privacyPolicyUrl: '/privacy-policy',
    privacyPolicyText:'Privacy Policy',
    storageKey:       'gdpr_consent',
    consentVersion:   '1.0',
    position:         'bottom',        // 'bottom' | 'bottom-left' | 'bottom-right'
    accentColor:      '#111111',
    accentText:       '#ffffff',
    poweredBy: {
      label: 'Softbird',
      url:   'https://softbird.agency',
      logo:  ''   // set to an image URL to show a logo instead of text
    },
    categories: {
      analytics:   { enabled: true, label: 'Analytiques',   description: 'Nous aident à comprendre comment les visiteurs utilisent le site (ex. Google Analytics).' },
      marketing:   { enabled: true, label: 'Marketing',     description: 'Utilisés pour la publicité et le suivi des campagnes (ex. Meta Pixel, Google Ads).' },
      preferences: { enabled: true, label: 'Préférences',   description: 'Mémorisent vos paramètres comme la langue, la région ou le thème.' }
    },
    texts: {
      bannerTitle:   'Nous utilisons des cookies',
      bannerBody:    'Nous utilisons des cookies pour améliorer votre expérience. Certains sont essentiels, d\'autres nous aident à comprendre comment vous utilisez le site.',
      rejectAll:     'Tout refuser',
      acceptAll:     'Tout accepter',
      manage:        'Gérer les préférences',
      modalTitle:    'Préférences cookies',
      modalBody:     'Choisissez les cookies que vous autorisez. Vous pouvez modifier vos préférences à tout moment.',
      necessary:     'Nécessaires',
      necessaryDesc: 'Indispensables au fonctionnement du site. Ne peuvent pas être désactivés.',
      save:          'Enregistrer mes préférences'
    }
  }, window.CookieConsentConfig || {});

  // deep-merge nested objects
  var userCFG = window.CookieConsentConfig || {};
  if (userCFG.texts)      CFG.texts      = Object.assign({}, CFG.texts,      userCFG.texts);
  if (userCFG.categories) CFG.categories = Object.assign({}, CFG.categories, userCFG.categories);
  if (userCFG.poweredBy)  CFG.poweredBy  = Object.assign({}, CFG.poweredBy,  userCFG.poweredBy);

  var T  = CFG.texts;
  var PB = CFG.poweredBy;

  // ─── helpers ─────────────────────────────────────────────────────────────────
  function getConsent() {
    try { return JSON.parse(localStorage.getItem(CFG.storageKey)); } catch (e) { return null; }
  }

  function saveConsent(prefs) {
    var record = { timestamp: new Date().toISOString(), version: CFG.consentVersion, necessary: true };
    Object.keys(CFG.categories).forEach(function (k) { record[k] = !!prefs[k]; });
    localStorage.setItem(CFG.storageKey, JSON.stringify(record));
    dispatchUpdate(record);
    return record;
  }

  function dispatchUpdate(consent) {
    try { window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: consent })); } catch (e) {}
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage:       consent.analytics   ? 'granted' : 'denied',
        ad_storage:              consent.marketing   ? 'granted' : 'denied',
        ad_user_data:            consent.marketing   ? 'granted' : 'denied',
        ad_personalization:      consent.marketing   ? 'granted' : 'denied',
        functionality_storage:   consent.preferences ? 'granted' : 'denied',
        personalization_storage: consent.preferences ? 'granted' : 'denied'
      });
    }
  }

  // ─── powered-by badge ────────────────────────────────────────────────────────
  function poweredByHTML() {
    if (!PB || !PB.label) return '';
    var inner = PB.logo
      ? '<img src="' + PB.logo + '" alt="' + PB.label + '" style="height:13px;width:auto;vertical-align:middle;display:inline-block;">'
      : '<span class="cc-pb-name">' + PB.label + '</span>';
    return [
      '<a href="' + PB.url + '" target="_blank" rel="noopener" class="cc-pb" title="Cookie banner by ' + PB.label + '">',
        '<span class="cc-pb-by">Cookies by</span>',
        inner,
      '</a>'
    ].join('');
  }

  // ─── styles ──────────────────────────────────────────────────────────────────
  var accent    = CFG.accentColor;
  var accentTxt = CFG.accentText;

  var posCSS = {
    'bottom':       'bottom:1.25rem;left:50%;transform:translateX(-50%);max-width:800px;width:calc(100% - 2.5rem);',
    'bottom-left':  'bottom:1.25rem;left:1.25rem;max-width:460px;width:calc(100% - 2.5rem);',
    'bottom-right': 'bottom:1.25rem;right:1.25rem;max-width:460px;width:calc(100% - 2.5rem);'
  }[CFG.position] || 'bottom:1.25rem;left:50%;transform:translateX(-50%);max-width:800px;width:calc(100% - 2.5rem);';

  var css = [
    '#cc-banner{display:none;position:fixed;' + posCSS,
      'background:#fff;border-radius:14px;box-shadow:0 8px 40px rgba(0,0,0,.13);',
      'padding:1rem 1.5rem .75rem;z-index:999997;',
      'font-family:system-ui,-apple-system,sans-serif;border:1px solid #e8e8e8;}',
    '#cc-banner.cc-open{display:block;}',

    '.cc-bi{display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;}',
    '.cc-bt{flex:1;min-width:180px;}',
    '.cc-bt strong{display:block;font-size:14px;font-weight:600;color:#111;margin-bottom:.2rem;}',
    '.cc-bt p{margin:0;font-size:12.5px;color:#666;line-height:1.5;}',
    '.cc-bt a{color:#111;}',
    '.cc-ba{display:flex;gap:.5rem;flex-shrink:0;flex-wrap:wrap;}',

    '.cc-btn{padding:.55rem .9rem;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;',
      'border:1.5px solid #d4d4d4;background:#fff;color:#111;transition:opacity .15s;white-space:nowrap;line-height:1;}',
    '.cc-btn:hover{opacity:.75;}',
    '.cc-btn-primary{background:' + accent + ';color:' + accentTxt + ';border-color:' + accent + ';}',

    /* powered-by badge */
    '.cc-foot{display:flex;justify-content:flex-end;margin-top:.5rem;}',
    '.cc-pb{display:inline-flex;align-items:center;gap:5px;text-decoration:none;',
      'padding:3px 8px 3px 6px;border-radius:6px;border:1px solid #eee;background:#fafafa;',
      'transition:border-color .15s,background .15s;}',
    '.cc-pb:hover{border-color:#ddd;background:#f3f3f3;}',
    '.cc-pb-by{font-size:9px;color:#bbb;letter-spacing:.05em;text-transform:uppercase;font-weight:500;}',
    '.cc-pb-name{font-size:11px;font-weight:600;color:#888;letter-spacing:.01em;}',
    '.cc-pb:hover .cc-pb-name{color:#555;}',

    /* overlay & modal */
    '#cc-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:999998;',
      'align-items:center;justify-content:center;padding:1rem;}',
    '#cc-overlay.cc-open{display:flex;}',
    '#cc-modal{background:#fff;border-radius:14px;max-width:520px;width:100%;',
      'padding:2rem 2rem 1.25rem;box-shadow:0 20px 60px rgba(0,0,0,.2);',
      'font-family:system-ui,-apple-system,sans-serif;max-height:90vh;overflow-y:auto;}',
    '#cc-modal h2{margin:0 0 .3rem;font-size:18px;font-weight:600;color:#111;}',
    '.cc-sub{font-size:13px;color:#666;margin:0 0 1.25rem;line-height:1.6;}',
    '.cc-sub a{color:#111;}',

    '.cc-row{display:flex;align-items:flex-start;justify-content:space-between;',
      'gap:1rem;padding:.7rem 0;border-top:1px solid #ebebeb;}',
    '.cc-ri strong{display:block;font-size:13px;font-weight:600;color:#111;margin-bottom:2px;}',
    '.cc-ri span{font-size:12px;color:#888;line-height:1.5;}',

    '.cc-tgl{position:relative;width:40px;height:22px;flex-shrink:0;margin-top:1px;}',
    '.cc-tgl input{opacity:0;width:0;height:0;position:absolute;}',
    '.cc-trk{position:absolute;inset:0;background:#ddd;border-radius:999px;cursor:pointer;transition:background .2s;}',
    '.cc-tgl input:checked+.cc-trk{background:' + accent + ';}',
    '.cc-tgl input:disabled+.cc-trk{background:#bbb;cursor:not-allowed;}',
    '.cc-tmb{position:absolute;top:3px;left:3px;width:16px;height:16px;',
      'background:#fff;border-radius:50%;pointer-events:none;transition:transform .2s;}',
    '.cc-tgl input:checked~.cc-tmb{transform:translateX(18px);}',

    '.cc-mba{display:flex;gap:.625rem;margin-top:1.25rem;flex-wrap:wrap;}',
    '.cc-mba .cc-btn{flex:1;min-width:110px;text-align:center;}',
    '.cc-modal-foot{display:flex;justify-content:flex-end;',
      'margin-top:.875rem;padding-top:.75rem;border-top:1px solid #f0f0f0;}',

    '@media(max-width:500px){',
      '.cc-bi{flex-direction:column;align-items:stretch;}',
      '.cc-ba{justify-content:stretch;}',
      '.cc-ba .cc-btn{flex:1;}',
    '}'
  ].join('');

  var styleTag = document.createElement('style');
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  // ─── banner ──────────────────────────────────────────────────────────────────
  var banner = document.createElement('div');
  banner.id = 'cc-banner';
  banner.innerHTML = [
    '<div class="cc-bi">',
      '<div class="cc-bt">',
        '<strong>' + T.bannerTitle + '</strong>',
        '<p>' + T.bannerBody + ' <a href="' + CFG.privacyPolicyUrl + '" target="_blank">' + CFG.privacyPolicyText + '</a></p>',
      '</div>',
      '<div class="cc-ba">',
        '<button class="cc-btn" id="cc-reject">'  + T.rejectAll + '</button>',
        '<button class="cc-btn" id="cc-manage">'  + T.manage    + '</button>',
        '<button class="cc-btn cc-btn-primary" id="cc-accept">' + T.acceptAll + '</button>',
      '</div>',
    '</div>',
    '<div class="cc-foot">' + poweredByHTML() + '</div>'
  ].join('');

  // ─── modal ───────────────────────────────────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.id = 'cc-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  var rows = [
    '<div class="cc-row">',
      '<div class="cc-ri">',
        '<strong>' + T.necessary + '</strong>',
        '<span>' + T.necessaryDesc + '</span>',
      '</div>',
      '<label class="cc-tgl">',
        '<input type="checkbox" checked disabled>',
        '<div class="cc-trk"></div><div class="cc-tmb"></div>',
      '</label>',
    '</div>'
  ];

  Object.keys(CFG.categories).forEach(function (k) {
    var cat = CFG.categories[k];
    if (!cat.enabled) return;
    rows.push([
      '<div class="cc-row">',
        '<div class="cc-ri">',
          '<strong>' + cat.label + '</strong>',
          '<span>' + cat.description + '</span>',
        '</div>',
        '<label class="cc-tgl">',
          '<input type="checkbox" id="cc-' + k + '">',
          '<div class="cc-trk"></div><div class="cc-tmb"></div>',
        '</label>',
      '</div>'
    ].join(''));
  });

  overlay.innerHTML = [
    '<div id="cc-modal">',
      '<h2>' + T.modalTitle + '</h2>',
      '<p class="cc-sub">' + T.modalBody + ' <a href="' + CFG.privacyPolicyUrl + '" target="_blank">' + CFG.privacyPolicyText + '</a></p>',
      rows.join(''),
      '<div class="cc-mba">',
        '<button class="cc-btn" id="cc-modal-reject">' + T.rejectAll + '</button>',
        '<button class="cc-btn" id="cc-modal-accept">' + T.acceptAll + '</button>',
        '<button class="cc-btn cc-btn-primary" id="cc-save">' + T.save + '</button>',
      '</div>',
      '<div class="cc-modal-foot">' + poweredByHTML() + '</div>',
    '</div>'
  ].join('');

  document.body.appendChild(banner);
  document.body.appendChild(overlay);

  // ─── actions ─────────────────────────────────────────────────────────────────
  function hideBanner() { banner.classList.remove('cc-open'); }
  function showBanner() { banner.classList.add('cc-open'); }
  function hideModal()  { overlay.classList.remove('cc-open'); }

  function showModal() {
    var existing = getConsent();
    Object.keys(CFG.categories).forEach(function (k) {
      var inp = document.getElementById('cc-' + k);
      if (inp) inp.checked = existing ? !!existing[k] : false;
    });
    overlay.classList.add('cc-open');
  }

  function acceptAll() {
    var p = {}; Object.keys(CFG.categories).forEach(function (k) { p[k] = true; });
    saveConsent(p); hideBanner(); hideModal();
  }

  function rejectAll() {
    var p = {}; Object.keys(CFG.categories).forEach(function (k) { p[k] = false; });
    saveConsent(p); hideBanner(); hideModal();
  }

  function savePreferences() {
    var p = {};
    Object.keys(CFG.categories).forEach(function (k) {
      var inp = document.getElementById('cc-' + k);
      p[k] = inp ? inp.checked : false;
    });
    saveConsent(p); hideBanner(); hideModal();
  }

  // ─── events ──────────────────────────────────────────────────────────────────
  document.getElementById('cc-accept').addEventListener('click', acceptAll);
  document.getElementById('cc-reject').addEventListener('click', rejectAll);
  document.getElementById('cc-manage').addEventListener('click', showModal);
  document.getElementById('cc-modal-accept').addEventListener('click', acceptAll);
  document.getElementById('cc-modal-reject').addEventListener('click', rejectAll);
  document.getElementById('cc-save').addEventListener('click', savePreferences);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) hideModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideModal(); });

  // ─── init ────────────────────────────────────────────────────────────────────
  if (!getConsent()) showBanner();

  // ─── public API ──────────────────────────────────────────────────────────────
  window.CookieConsent = {
    getConsent:      getConsent,
    openPreferences: showModal,
    showBanner:      showBanner,
    hasConsent: function (cat) { var c = getConsent(); return c ? !!c[cat] : false; },
    reset:      function ()    { localStorage.removeItem(CFG.storageKey); showBanner(); }
  };

})();
