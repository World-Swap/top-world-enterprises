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

  function start() {
    paintClocks();
    paintCountdown();
    setInterval(paintClocks, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
