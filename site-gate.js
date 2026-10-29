/* Site gate — client-side password overlay (202610231540).
   Only a SHA-256 hash is stored here. Unlock state is kept in localStorage. */
(function () {
  var HASH = "61beb972fbc625d54b251ab817aac02ce646405a52f030eefcc1aeb9baac7373";
  var KEY = "sst-site-unlocked";
  var root = document.documentElement;
  try { if (localStorage.getItem(KEY) === HASH) return; } catch (e) {}
  root.classList.add("site-locked");

  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }

  /* Fallback SHA-256 for contexts without crypto.subtle (e.g. plain http on a LAN IP) */
  function sha256Fallback(str) {
    var bytes = unescape(encodeURIComponent(str)), K = [], H = [], i, j;
    var isP = function (n) { for (var f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
    for (var c = 2, n = 0; n < 64; c++) if (isP(c)) { if (n < 8) H[n] = (Math.pow(c, 1 / 2) * 4294967296) | 0; K[n++] = (Math.pow(c, 1 / 3) * 4294967296) | 0; }
    var w = [], l = bytes.length * 8;
    for (i = 0; i < bytes.length; i++) w[i >> 2] |= bytes.charCodeAt(i) << ((3 - i) % 4) * 8;
    w[l >> 5] |= 0x80 << (24 - l % 32);
    w[(((l + 64) >> 9) << 4) + 15] = l;
    var r = function (x, n) { return (x >>> n) | (x << (32 - n)); };
    for (j = 0; j < w.length; j += 16) {
      var a = H.slice(0), W = [];
      for (i = 0; i < 64; i++) {
        if (i < 16) W[i] = w[j + i] | 0;
        else { var s0 = r(W[i-15],7) ^ r(W[i-15],18) ^ (W[i-15] >>> 3), s1 = r(W[i-2],17) ^ r(W[i-2],19) ^ (W[i-2] >>> 10); W[i] = (W[i-16] + s0 + W[i-7] + s1) | 0; }
        var t1 = (a[7] + (r(a[4],6) ^ r(a[4],11) ^ r(a[4],25)) + ((a[4] & a[5]) ^ (~a[4] & a[6])) + K[i] + W[i]) | 0;
        var t2 = ((r(a[0],2) ^ r(a[0],13) ^ r(a[0],22)) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]))) | 0;
        a = [(t1 + t2) | 0].concat(a); a[4] = (a[4] + t1) | 0; a.pop();
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + a[i]) | 0;
    }
    return H.map(function (x) { return ("00000000" + (x >>> 0).toString(16)).slice(-8); }).join("");
  }

  function digest(str) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(hex).catch(function () { return sha256Fallback(str); });
    }
    return Promise.resolve(sha256Fallback(str));
  }

  function build() {
    if (document.getElementById("site-gate")) return;
    var g = document.createElement("div");
    g.id = "site-gate";
    g.setAttribute("role", "dialog");
    g.setAttribute("aria-modal", "true");
    g.setAttribute("aria-labelledby", "sg-title");
    g.innerHTML =
      '<div class="sg__bg" aria-hidden="true"></div><div class="sg__shade" aria-hidden="true"></div>' +
      '<div class="sg__brand">Sardinia<span>Slow Tourism</span></div>' +
      '<div class="sg__card">' +
        '<span class="sg__pill">Anteprima privata</span>' +
        '<h1 class="sg__title" id="sg-title">Area riservata</h1>' +
        '<p class="sg__text">Il sito è in fase di sviluppo. Inserisci la password per continuare.</p>' +
        '<p class="sg__demo">Questa è una versione demo del sito, ancora in lavorazione: c\'è ancora molto da modificare e completare. Alcuni contenuti (immagini e testi) sono stock o senza licenza e verranno rimossi o sostituiti nella versione finale. Per ora il sito si vede meglio da computer: la versione per telefono è ancora in lavorazione. I testi attuali sono provvisori: una volta completate tutte le schede faremo il copywriting della home per migliorare SEO e visibilità.</p>' +
        '<form class="sg__form" novalidate>' +
          '<div class="sg__field"><label for="sg-pass" class="sg-visually-hidden" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Password</label>' +
          '<input class="sg__input" id="sg-pass" type="password" placeholder="Password" autocomplete="current-password" required /></div>' +
          '<button class="sg__btn" type="submit">Entra <svg class="ico-ne" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="vertical-align:-2px"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg></button>' +
          '<p class="sg__error" aria-live="polite"></p>' +
        '</form>' +
      '</div>' +
      '<div class="sg__foot">Barbagia · Sardegna</div>';
    document.body.appendChild(g);
    var form = g.querySelector("form"), input = g.querySelector("input"), card = g.querySelector(".sg__card"), err = g.querySelector(".sg__error");
    setTimeout(function () { try { input.focus(); } catch (e) {} }, 300);
    input.addEventListener("input", function () { form.classList.remove("is-error"); });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      digest(input.value).then(function (h) {
        if (h === HASH) {
          try { localStorage.setItem(KEY, HASH); } catch (e) {}
          root.classList.remove("site-locked");
          g.classList.add("is-leaving");
          setTimeout(function () { g.remove(); window.dispatchEvent(new Event("resize")); }, 650);
        } else {
          err.textContent = "Password errata";
          form.classList.add("is-error");
          card.classList.remove("is-shaking"); void card.offsetWidth; card.classList.add("is-shaking");
          input.select();
        }
      });
    });
  }
  if (document.body) build(); else document.addEventListener("DOMContentLoaded", build);
})();
