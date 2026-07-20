/* Top World Enterprises — live clock + countdown
   Uses real IANA zones: Africa/Casablanca is UTC+1 year-round and drops to
   UTC+0 during Ramadan; Europe/Paris observes DST. Never hardcode offsets. */

(function () {
  "use strict";

  var ZONES = [
    { id: "clock-casa", tz: "Africa/Casablanca" },
    { id: "clock-paris", tz: "Europe/Paris" }
  ];

  function timeIn(tz, date) {
    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: tz, hour: "2-digit", minute: "2-digit",
      second: "2-digit", hour12: false
    }).format(date);
  }

  /* Offset of a zone from UTC, in hours, at a given instant. */
  function offsetHours(tz, date) {
    var s = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, timeZoneName: "longOffset"
    }).formatToParts(date).find(function (p) { return p.type === "timeZoneName"; });
    if (!s) return 0;
    var m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(s.value);
    if (!m) return 0;
    return (m[1] === "-" ? -1 : 1) * (parseInt(m[2], 10) + (m[3] ? m[3] / 60 : 0));
  }

  function paintClocks() {
    var now = new Date();
    ZONES.forEach(function (z) {
      var el = document.getElementById(z.id);
      if (el) el.textContent = timeIn(z.tz, now);
    });

    var gapEl = document.getElementById("clock-gap");
    if (gapEl) {
      var gap = Math.abs(offsetHours("Europe/Paris", now) - offsetHours("Africa/Casablanca", now));
      gapEl.textContent = gap === 0
        ? "aucun décalage"
        : gap + (gap > 1 ? " heures" : " heure") + " de décalage";
    }
  }

  /* Countdown to the opt-in switchover: 11 August 2026, 00:00 Paris (UTC+2 in summer). */
  function paintCountdown() {
    var el = document.getElementById("loi-count");
    var lbl = document.getElementById("loi-count-label");
    if (!el) return;

    var target = new Date("2026-08-11T00:00:00+02:00");
    var days = Math.ceil((target - new Date()) / 86400000);

    if (days > 0) {
      el.textContent = days;
      if (lbl) lbl.textContent = days > 1 ? "jours restants" : "jour restant";
    } else {
      el.textContent = Math.abs(days);
      if (lbl) lbl.textContent = "jours depuis l'entrée en vigueur";
    }
  }

  /* Contact form → Web3Forms, submitted over fetch so the visitor never
     leaves the page. Shows an inline success/error message either way. */
  function wireContactForm() {
    var form = document.querySelector(".form[action*='web3forms']");
    if (!form) return;

    var status = form.querySelector(".form__status");
    var button = form.querySelector("button[type=submit]");
    var keyField = form.querySelector("input[name=access_key]");

    function show(kind, msg) {
      if (!status) return;
      status.textContent = msg;
      status.className = "form__status form__status--" + kind;
      status.hidden = false;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      /* Guard: the access key hasn't been pasted in yet. Fail loudly here
         rather than firing a doomed request that returns a cryptic error. */
      if (!keyField || keyField.value.indexOf("YOUR_WEB3FORMS") === 0) {
        show("err", "Le formulaire n'est pas encore configuré. Écrivez-nous directement à contact@topworldenterprises.com.");
        return;
      }

      var original = button ? button.textContent : "";
      if (button) { button.disabled = true; button.textContent = "Envoi…"; }
      if (status) status.hidden = true;

      fetch(form.action, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (res) {
          if (res.ok && res.data.success) {
            form.reset();
            show("ok", "Merci, votre message a bien été envoyé. Nous vous répondons sous un jour ouvré.");
          } else {
            show("err", "Désolé, l'envoi a échoué. Réessayez ou écrivez-nous à contact@topworldenterprises.com.");
          }
        })
        .catch(function () {
          show("err", "Problème de connexion. Réessayez ou écrivez-nous à contact@topworldenterprises.com.");
        })
        .finally(function () {
          if (button) { button.disabled = false; button.textContent = original; }
        });
    });
  }

  function start() {
    paintClocks();
    paintCountdown();
    wireContactForm();
    setInterval(paintClocks, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
