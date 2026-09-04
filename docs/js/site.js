(function () {
  const cfg = window.BR_CONFIG || {};
  const copy = window.BR_COPY || {};
  const F = cfg.formula || {
    lucaMid: 0.07,
    lucaLow: 0.05,
    lucaHigh: 0.09,
    starLiftIfSilent: 0.12,
    conversionIfSilent: 0.02,
    defaultReplyRate: 0.1,
  };

  const menuBtn = document.querySelector("[data-menu]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const CONSENT_KEY = "br-consent";
  const banner = document.querySelector("[data-cookie-banner]");
  function setConsent(granted) {
    const state = granted ? "granted" : "denied";
    try {
      localStorage.setItem(CONSENT_KEY, state);
    } catch (e) {}
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: state,
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
  }
  let choice = null;
  try {
    choice = localStorage.getItem(CONSENT_KEY);
  } catch (e) {}
  if (choice === "granted") setConsent(true);
  else if (choice === "denied") setConsent(false);
  if (banner) {
    if (!choice) banner.hidden = false;
    function closeBanner(granted) {
      setConsent(granted);
      banner.hidden = true;
    }
    const accept = banner.querySelector("[data-cookie-accept]");
    const refuse = banner.querySelector("[data-cookie-refuse]");
    if (accept) accept.addEventListener("click", function () { closeBanner(true); });
    if (refuse) refuse.addEventListener("click", function () { closeBanner(false); });
  }
  document.querySelectorAll("[data-cookie-open]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (banner) banner.hidden = false;
    });
  });

  function money(n) {
    if (!isFinite(n)) return "-";
    const abs = Math.abs(n);
    const formatted = new Intl.NumberFormat(document.documentElement.lang || "es", {
      maximumFractionDigits: 0,
    }).format(Math.round(abs));
    return (n < 0 ? "−" : "") + formatted + " €";
  }

  function compute(revenue, replyRate) {
    const R = Number(revenue) || 0;
    const gap = Math.max(0, Math.min(1, 1 - replyRate));
    const lift = (F.starLiftIfSilent || 0.12) * gap;
    const expected = R * lift * (F.lucaMid || 0.07);
    const rangeLow = R * lift * (F.lucaLow || 0.05);
    const rangeHigh = R * lift * (F.lucaHigh || 0.09);
    return {
      R,
      gap,
      expected,
      fullLow: rangeLow,
      fullHigh: rangeHigh,
      netMonthExpected: expected - cfg.priceMonth,
      netYearExpected: expected * 12 - cfg.priceYear,
      netMonthFullLow: rangeLow - cfg.priceMonth,
      netMonthFullHigh: rangeHigh - cfg.priceMonth,
      netYearFullLow: rangeLow * 12 - cfg.priceYear,
      netYearFullHigh: rangeHigh * 12 - cfg.priceYear,
    };
  }

  function fillCompact(el, result) {
    const strong = el.querySelector("[data-compact-amount]");
    if (!strong) return;
    if (!result.R) {
      strong.textContent = "-";
      return;
    }
    strong.textContent = money(result.netMonthFullHigh);
  }

  function fillFull(root, result) {
    const set = function (sel, val) {
      const n = root.querySelector(sel);
      if (n) n.textContent = val;
    };
    if (!result.R) {
      set("[data-full-high]", "-");
      set("[data-full-month]", "-");
      set("[data-full-year]", "-");
      return;
    }
    set("[data-full-high]", money(result.fullHigh));
    set("[data-full-month]", money(result.netMonthFullHigh));
    set("[data-full-year]", money(result.netYearFullHigh));
  }

  function bindSim(form) {
    const run = function () {
      const revenue = form.querySelector("[name=revenue]").value;
      const reply = Number(form.querySelector("[name=reply]").value);
      const result = compute(revenue, reply);
      const compact = form.querySelector("[data-compact-result]");
      if (compact) fillCompact(compact, result);
      fillFull(form, result);
      try {
        sessionStorage.setItem("br-revenue", String(revenue || ""));
      } catch (e) {}
    };
    form.addEventListener("input", run);
    form.addEventListener("change", run);
    try {
      const saved = sessionStorage.getItem("br-revenue");
      if (saved && form.querySelector("[name=revenue]") && !form.querySelector("[name=revenue]").value) {
        form.querySelector("[name=revenue]").value = saved;
      }
    } catch (e) {}
    run();
  }

  document.querySelectorAll("[data-sim]").forEach(bindSim);

  function track(name) {
    if (typeof window.gtag === "function") window.gtag("event", name);
  }
  document.querySelectorAll(".btn-wa, .wa-fab").forEach(function (a) {
    a.addEventListener("click", function () {
      track("whatsapp_click");
    });
  });

  document.querySelectorAll(".step-grid details").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      const grid = d.closest(".step-grid");
      if (!grid) return;
      grid.querySelectorAll("details[open]").forEach(function (other) {
        if (other !== d) other.open = false;
      });
    });
  });

  function formatTrust(n) {
    return new Intl.NumberFormat(document.documentElement.lang || "en", {
      maximumFractionDigits: 0,
    }).format(n);
  }

  document.querySelectorAll("[data-trust-ticker]").forEach(function (el) {
    const node = el.querySelector("[data-trust-count]");
    if (!node) return;
    const base = Number(el.getAttribute("data-trust-base")) || 500;
    const key = "br-trust-n";
    let n = base;
    try {
      const stored = Number(sessionStorage.getItem(key));
      if (Number.isFinite(stored) && stored >= base) n = stored;
    } catch (e) {}

    const start = 0;
    const dur = 3000;
    const t0 = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      node.textContent = formatTrust(Math.round(start + (n - start) * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function schedule() {
      const jitter = (Math.random() * 2 - 1) * 90 * 1000;
      const wait = Math.max(30 * 1000, 4 * 60 * 1000 + jitter);
      setTimeout(function () {
        n += 1;
        node.textContent = formatTrust(n);
        try {
          sessionStorage.setItem(key, String(n));
        } catch (e) {}
        schedule();
      }, wait);
    }
    schedule();
  });

  document.querySelectorAll("[data-interest-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = new FormData(form);
      const lines = [];
      data.forEach(function (v, k) {
        if (String(v).trim()) lines.push(k + ": " + v);
      });
      const body = lines.join("\n");
      const wa = form.getAttribute("data-wa");
      const mail = form.getAttribute("data-mail");
      if (e.submitter && e.submitter.value === "email") {
        location.href =
          "mailto:" +
          mail +
          "?subject=" +
          encodeURIComponent("BabyRock Social") +
          "&body=" +
          encodeURIComponent(body);
      } else if (wa) {
        location.href = "https://wa.me/" + wa + "?text=" + encodeURIComponent(body);
      } else {
        location.href =
          "mailto:" +
          mail +
          "?subject=" +
          encodeURIComponent("BabyRock Social") +
          "&body=" +
          encodeURIComponent(body);
      }
    });
  });
})();
