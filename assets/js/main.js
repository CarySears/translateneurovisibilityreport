/* Translate Neuroscience · Audit & Growth Plan
   Tabs, pager, heatmaps, speed bars, print. No dependencies. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tablist .tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var order = tabs.map(function (t) { return t.getAttribute("href").slice(1); });
  var tabBar = document.querySelector(".tabs");

  // ---------- 1. Prev / next buttons at the bottom of every tab ----------
  panels.forEach(function (panel) {
    var i = order.indexOf(panel.id);
    if (i < 0) return;
    var pager = document.createElement("nav");
    pager.className = "pager";
    pager.setAttribute("aria-label", "Previous and next tab");
    var prev = order[i - 1], next = order[i + 1];
    var label = function (id) { return tabs[order.indexOf(id)].textContent.trim(); };
    pager.innerHTML =
      (prev ? '<a href="#' + prev + '"><svg class="icon"><use href="#i-arrow-left"/></svg><span><small>Previous: </small>' + label(prev) + "</span></a>" : "<span></span>") +
      (next ? '<a href="#' + next + '"><span><small>Next: </small>' + label(next) + '</span><svg class="icon"><use href="#i-arrow-right"/></svg></a>' : "<span></span>");
    panel.appendChild(pager);
  });

  // ---------- 2. Show one tab at a time, driven by the URL hash ----------
  function show(id, scroll) {
    if (order.indexOf(id) < 0) id = order[0];
    panels.forEach(function (p) { p.classList.toggle("active", p.id === id); });
    tabs.forEach(function (t) {
      var on = t.getAttribute("href") === "#" + id;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if (on && t.scrollIntoView) {
        var list = t.parentElement;
        list.scrollTo({ left: t.offsetLeft - list.clientWidth / 2 + t.clientWidth / 2, behavior: "smooth" });
      }
    });
    if (scroll) {
      // The tab bar is sticky, so its on-screen top is 0 once you have
      // scrolled. Measure the new section and park it just under the tabs.
      var panel = document.getElementById(id);
      var y = panel ? panel.getBoundingClientRect().top + window.scrollY - tabBar.offsetHeight : 0;
      window.scrollTo(0, Math.max(0, y));
    }
  }

  window.addEventListener("hashchange", function () {
    var id = location.hash.slice(1);
    if (order.indexOf(id) >= 0) show(id, true);
  });
  // Links to other tabs anywhere on the page (cards, pager) just change the hash.
  // Keep the page from jumping to the hidden element.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (order.indexOf(id) >= 0) {
      e.preventDefault();
      if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
      show(id, true);
    }
  });
  window.addEventListener("popstate", function () { show(location.hash.slice(1), true); });

  // Keyboard: left / right arrows move between tabs
  document.querySelector(".tablist").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    n.focus(); n.click();
  });

  show(location.hash.slice(1), false);

  // ---------- 3. In-tab jump buttons (Proposed Blueprint stages) ----------
  document.querySelectorAll("[data-jump]").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.getAttribute("data-jump"));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ---------- 4. Maps heatmaps: 13 x 13 grid, every point "not found" ----------
  // To show real ranks later, add data-ranks="3,7,–,..." (169 values, row by row).
  document.querySelectorAll(".heatgrid").forEach(function (grid) {
    var n = parseInt(grid.getAttribute("data-size") || "13", 10);
    var ranks = (grid.getAttribute("data-ranks") || "").split(",");
    var center = Math.floor((n * n) / 2);
    for (var i = 0; i < n * n; i++) {
      var cell = document.createElement("span");
      if (i === center) { cell.className = "center"; }
      else { cell.textContent = (ranks[i] || "–").trim(); }
      grid.appendChild(cell);
    }
  });

  // ---------- 5. Speed bars from data-value / data-target ----------
  document.querySelectorAll(".meter").forEach(function (m) {
    var v = parseFloat(m.getAttribute("data-value"));
    var t = parseFloat(m.getAttribute("data-target"));
    if (!isFinite(v) || !isFinite(t)) return;
    var max = Math.max(v, t) * 1.15;
    m.querySelector(".fill").style.width = Math.min(100, (v / max) * 100) + "%";
    m.querySelector(".target").style.left = "calc(" + (t / max) * 100 + "% - 1px)";
  });

  // ---------- 6. Print / Save PDF (prints every tab in order) ----------
  var printBtn = document.getElementById("print-btn");
  if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
})();
