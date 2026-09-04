(function () {
  const cfg = window.BR_CONFIG || {};
  const copy = window.BR_COPY || {};
  const IMPACT = cfg.impact || {};

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

  function formatPct(x) {
    const p = Math.round(x * 1000) / 10;
    const s = Number.isInteger(p) ? String(p) : p.toFixed(1);
    return s + "%";
  }

  function parseRevenue(raw) {
    const n = Number(String(raw || "").replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function picked(form, name, fallback) {
    const checked = form.querySelector("[name='" + name + "']:checked");
    if (checked) return checked.value;
    const el = form.querySelector("[name='" + name + "']");
    if (el && el.value) return el.value;
    return fallback;
  }

  function ratesFor(kind, product) {
    const socialMap = IMPACT.social || {};
    const directMap = IMPACT.direct || {};
    const k = socialMap[kind] ? kind : "restaurant";
    const social = socialMap[k] || [0.07, 0.09];
    const direct = directMap[k] || [0.04, 0.1];
    const o = IMPACT.overlap == null ? 0.85 : IMPACT.overlap;
    if (product === "direct") return { low: direct[0], high: direct[1] };
    if (product === "both") return { low: social[0] + o * direct[0], high: social[1] + o * direct[1] };
    return { low: social[0], high: social[1] };
  }

  function compute(revenue, kind, product) {
    const monthly = parseRevenue(revenue);
    const yearly = monthly * 12;
    const rates = ratesFor(kind, product);
    return {
      monthly: monthly,
      yearly: yearly,
      lowPct: rates.low,
      highPct: rates.high,
      lowEur: yearly * rates.low,
      highEur: yearly * rates.high,
    };
  }

  function fillSim(form, result) {
    const set = function (sel, val) {
      form.querySelectorAll(sel).forEach(function (n) {
        n.textContent = val;
      });
    };
    if (!result.monthly) {
      set("[data-sim-low]", "-");
      set("[data-sim-high]", "-");
      set("[data-sim-low-pct]", "");
      set("[data-sim-high-pct]", "");
      return;
    }
    set("[data-sim-low]", money(result.lowEur));
    set("[data-sim-high]", money(result.highEur));
    set("[data-sim-low-pct]", formatPct(result.lowPct));
    set("[data-sim-high-pct]", formatPct(result.highPct));
  }

  function bindSim(form) {
    const run = function () {
      const revenueEl = form.querySelector("[name=revenue]");
      const revenue = revenueEl ? revenueEl.value : "";
      const kind = picked(form, "kind", "restaurant");
      const product = picked(form, "product", "social");
      fillSim(form, compute(revenue, kind, product));
      try {
        sessionStorage.setItem("br-revenue", String(revenue || ""));
        sessionStorage.setItem("br-kind", kind);
        sessionStorage.setItem("br-product", product);
      } catch (e) {}
    };
    form.addEventListener("input", run);
    form.addEventListener("change", run);
    try {
      const savedRev = sessionStorage.getItem("br-revenue");
      const rev = form.querySelector("[name=revenue]");
      if (savedRev && rev && (rev.value === "" || rev.value === rev.getAttribute("placeholder"))) {
        rev.value = savedRev;
      }
      const savedKind = sessionStorage.getItem("br-kind");
      if (savedKind) {
        const radio = form.querySelector("[name=kind][value='" + savedKind + "']");
        const select = form.querySelector("select[name=kind]");
        if (radio) radio.checked = true;
        else if (select) select.value = savedKind;
      }
      const savedProduct = sessionStorage.getItem("br-product");
      if (savedProduct) {
        const radio = form.querySelector("[name=product][value='" + savedProduct + "']");
        if (radio) radio.checked = true;
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
