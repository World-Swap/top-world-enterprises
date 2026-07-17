/* Top World Enterprises — qualifier
 *
 * Catches, qualifies, scores and routes every inbound visitor. 24/7. Nobody
 * touches it.
 *
 * Deliberately NOT an LLM. Five branching questions need a decision tree, not
 * a language model. This way: no API key on a static site, no per-lead cost,
 * no latency, no downtime, no hallucinated pricing at 2am. It just works,
 * forever, for free.
 *
 * SETUP — two constants below:
 *   FORM_ID  Formspree form id (same one as the contact page)
 *   CAL_URL  Cal.com booking link for Kossa
 */

(function () {
  "use strict";

  var FORM_ID = "YOUR_FORM_ID";
  var CAL_URL = "https://cal.com/kossa/20min";

  var EN = document.documentElement.lang === "en";
  var T = EN ? {
    launch: "Talk to us", title: "A few quick questions",
    sub: "20 seconds. Then we'll know if we can help.",
    back: "Back", booked: "Book your slot",
    hiTitle: "Sounds like a fit.",
    hiBody: "Pick a time with Kossa directly — 20 minutes, no salesperson in between.",
    loTitle: "Thanks — leave us your email.",
    loBody: "Kossa will come back to you personally within one working day.",
    email: "Work email", send: "Send", sent: "Got it. Kossa will be in touch.",
    err: "Something went wrong. Email kossa@topworldenterprises.com directly."
  } : {
    launch: "Parlez-nous", title: "Quelques questions rapides",
    sub: "20 secondes. Ensuite on saura si on peut vous aider.",
    back: "Retour", booked: "Réserver votre créneau",
    hiTitle: "Ça correspond à ce que nous faisons.",
    hiBody: "Choisissez un créneau directement avec Kossa — 20 minutes, sans commercial entre vous et le plateau.",
    loTitle: "Merci — laissez-nous votre e-mail.",
    loBody: "Kossa vous répondra personnellement sous un jour ouvré.",
    email: "E-mail professionnel", send: "Envoyer", sent: "C'est noté. Kossa vous recontacte.",
    err: "Une erreur est survenue. Écrivez à kossa@topworldenterprises.com."
  };

  /* Questions. `s` = score. Tier 1 (permanence / service client) scores highest:
     no EU data transfer, no procurement, one decision-maker, fast yes. */
  var Q = EN ? [
    { k: "service", q: "What do you need?", a: [
      { t: "Someone to answer the phone", s: 3 },
      { t: "Customer service", s: 3 },
      { t: "Appointment setting", s: 2 },
      { t: "Telesales / qualification", s: 2 },
      { t: "Back-office (BPO)", s: 1 },
      { t: "Not sure yet", s: 1 }
    ]},
    { k: "postes", q: "How many seats, roughly?", a: [
      { t: "1–2", s: 2 }, { t: "3–5", s: 3 }, { t: "6–10", s: 3 },
      { t: "11–25", s: 2 }, { t: "More than 25", s: 1 }
    ]},
    { k: "langues", q: "Which languages?", a: [
      { t: "French only", s: 3 }, { t: "French + English", s: 2 },
      { t: "French + Arabic", s: 3 }, { t: "All three", s: 2 }
    ]},
    { k: "echeance", q: "When would you start?", a: [
      { t: "As soon as possible", s: 3 },
      { t: "Before 11 August", s: 3 },
      { t: "In 1–3 months", s: 2 },
      { t: "Just looking for now", s: 0 }
    ]}
  ] : [
    { k: "service", q: "Vous cherchez quoi ?", a: [
      { t: "Quelqu'un pour répondre au téléphone", s: 3 },
      { t: "Du service client", s: 3 },
      { t: "De la prise de rendez-vous", s: 2 },
      { t: "De la télévente / qualification", s: 2 },
      { t: "Du back-office (BPO)", s: 1 },
      { t: "Je ne sais pas encore", s: 1 }
    ]},
    { k: "postes", q: "Combien de postes, à peu près ?", a: [
      { t: "1 à 2", s: 2 }, { t: "3 à 5", s: 3 }, { t: "6 à 10", s: 3 },
      { t: "11 à 25", s: 2 }, { t: "Plus de 25", s: 1 }
    ]},
    { k: "langues", q: "Quelles langues ?", a: [
      { t: "Français uniquement", s: 3 }, { t: "Français + anglais", s: 2 },
      { t: "Français + arabe", s: 3 }, { t: "Les trois", s: 2 }
    ]},
    { k: "echeance", q: "Vous démarreriez quand ?", a: [
      { t: "Dès que possible", s: 3 },
      { t: "Avant le 11 août", s: 3 },
      { t: "Dans 1 à 3 mois", s: 2 },
      { t: "Je me renseigne", s: 0 }
    ]}
  ];

  var state = { i: 0, score: 0, answers: {}, open: false };
  var root, panel;

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }

  function render() {
    panel.innerHTML = "";

    if (state.i < Q.length) {
      var q = Q[state.i];
      var head = el("div", "qz__head");
      head.appendChild(el("p", "qz__step", (state.i + 1) + "/" + Q.length));
      head.appendChild(el("h3", "qz__q", q.q));
      panel.appendChild(head);

      var list = el("div", "qz__opts");
      q.a.forEach(function (opt) {
        var b = el("button", "qz__opt", opt.t);
        b.type = "button";
        b.addEventListener("click", function () {
          state.answers[q.k] = opt.t;
          state.score += opt.s;
          state.i++;
          render();
        });
        list.appendChild(b);
      });
      panel.appendChild(list);

      if (state.i > 0) {
        var back = el("button", "qz__back", "← " + T.back);
        back.type = "button";
        back.addEventListener("click", function () {
          state.i--;
          var pk = Q[state.i];
          var prev = state.answers[pk.k];
          pk.a.forEach(function (o) { if (o.t === prev) state.score -= o.s; });
          delete state.answers[pk.k];
          render();
        });
        panel.appendChild(back);
      }
      return;
    }

    // Max score is 12. 9+ means: right service, sane size, real timeline.
    var hot = state.score >= 9;
    panel.appendChild(el("h3", "qz__q", hot ? T.hiTitle : T.loTitle));
    panel.appendChild(el("p", "qz__body", hot ? T.hiBody : T.loBody));

    var form = el("form", "qz__form");
    var input = el("input");
    input.type = "email";
    input.required = true;
    input.placeholder = T.email;
    input.className = "qz__input";
    form.appendChild(input);

    var send = el("button", "btn btn--primary qz__send", hot ? T.booked : T.send);
    send.type = "submit";
    form.appendChild(send);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      send.disabled = true;

      var payload = new FormData();
      payload.append("email", input.value);
      payload.append("_subject", (hot ? "[CHAUD " : "[FROID ") + state.score + "/12] Lead site — TWE");
      Object.keys(state.answers).forEach(function (k) { payload.append(k, state.answers[k]); });
      payload.append("score", state.score + "/12");
      payload.append("page", location.pathname);

      fetch("https://formspree.io/f/" + FORM_ID, {
        method: "POST", body: payload, headers: { Accept: "application/json" }
      }).then(function (r) {
        if (!r.ok) throw new Error("post failed");
        panel.innerHTML = "";
        if (hot) {
          // Hot lead goes straight to the calendar. No waiting on a human.
          var frame = el("iframe", "qz__cal");
          frame.src = CAL_URL + "?embed=true&email=" + encodeURIComponent(input.value);
          frame.title = "Cal.com";
          panel.appendChild(frame);
        } else {
          panel.appendChild(el("h3", "qz__q", T.sent));
        }
      }).catch(function () {
        send.disabled = false;
        var e = el("p", "qz__err", T.err);
        form.appendChild(e);
      });
    });

    panel.appendChild(form);
  }

  function build() {
    root = el("div", "qz");

    var launch = el("button", "qz__launch");
    launch.type = "button";
    launch.setAttribute("aria-expanded", "false");
    launch.appendChild(el("span", "qz__dot"));
    launch.appendChild(el("span", null, T.launch));

    var box = el("div", "qz__box");
    box.hidden = true;

    var bar = el("div", "qz__bar");
    bar.appendChild(el("span", "qz__title", T.title));
    var close = el("button", "qz__close", "×");
    close.type = "button";
    close.setAttribute("aria-label", EN ? "Close" : "Fermer");
    bar.appendChild(close);
    box.appendChild(bar);

    panel = el("div", "qz__panel");
    box.appendChild(panel);

    function toggle(on) {
      state.open = on;
      box.hidden = !on;
      launch.setAttribute("aria-expanded", String(on));
      if (on && state.i === 0) render();
    }
    launch.addEventListener("click", function () { toggle(!state.open); });
    close.addEventListener("click", function () { toggle(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && state.open) toggle(false);
    });

    root.appendChild(box);
    root.appendChild(launch);
    document.body.appendChild(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
