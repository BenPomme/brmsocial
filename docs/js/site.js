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

  function money(n) {
    if (!isFinite(n)) return "—";
    const abs = Math.abs(n);
    const formatted = new Intl.NumberFormat(document.documentElement.lang || "es", {
      maximumFractionDigits: 0,
    }).format(Math.round(abs));
    return (n < 0 ? "−" : "") + formatted + " €";
  }

  function pct(n) {
    if (!isFinite(n)) return "—";
    return Math.round(n * 100) + " %";
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
      strong.textContent = "—";
      return;
    }
    strong.textContent = money(result.netMonthExpected);
  }

  function fillFull(root, result) {
    const set = function (sel, val) {
      const n = root.querySelector(sel);
      if (n) n.textContent = val;
    };
    if (!result.R) return;
    set("[data-expected-gross]", money(result.expected));
    set("[data-expected-month]", money(result.netMonthExpected));
    set("[data-expected-year]", money(result.netYearExpected));
    set("[data-expected-roi-month]", pct(result.netMonthExpected / cfg.priceMonth));
    set("[data-expected-roi-year]", pct(result.netYearExpected / cfg.priceYear));
    set(
      "[data-full-gross]",
      money(result.fullLow) + " – " + money(result.fullHigh)
    );
    set(
      "[data-full-month]",
      money(result.netMonthFullLow) + " – " + money(result.netMonthFullHigh)
    );
    set(
      "[data-full-year]",
      money(result.netYearFullLow) + " – " + money(result.netYearFullHigh)
    );
    const already = root.querySelector("[data-already]");
    if (already) already.hidden = result.gap > 0.05;
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
