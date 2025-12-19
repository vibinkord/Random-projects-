// js/admin-ui.js
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const navButtons = Array.from(document.querySelectorAll(".nav-btn"));
const sections = Array.from(document.querySelectorAll(".section"));
const logoutTop = document.getElementById("logoutBtnTop");

// Toggle sidebar (mobile)
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    sidebarToggle.setAttribute("aria-expanded", sidebar.classList.contains("open"));
  });
}

// Nav click: show section, set active class & smooth scroll
navButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const target = btn.dataset.section;
    if (!target) return;
    // show/hide
    sections.forEach(sec => sec.classList.toggle("active", sec.id === `section-${target}`));
    // active states
    navButtons.forEach(b => b.classList.toggle("active", b === btn));
    // close sidebar on small screens
    if (window.innerWidth < 1000 && sidebar) sidebar.classList.remove("open");
    // focus top of main
    const active = document.querySelector(".section.active");
    if (active) active.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ensure a default active nav
(function init() {
  const preset = navButtons.find(b => b.classList.contains("active"));
  if (!preset && navButtons.length) navButtons[0].classList.add("active");
})();

// Logout top button (if present) — tries to trigger existing logout button logic from admin.js
if (logoutTop) {
  logoutTop.addEventListener("click", () => {
    // if there is another logout button (id=logoutBtn) trigger click, else just redirect
    const existing = document.getElementById("logoutBtn");
    if (existing) existing.click();
    else {
      // try clear session if defined
      if (window.clearSession) { try { window.clearSession(); } catch {} }
      window.location.href = "index.html";
    }
  });
}

// accessibility: allow nav activation by Enter/Space
navButtons.forEach(b => {
  b.setAttribute('tabindex', '0');
  b.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') b.click();
  });
});
// Theme toggle
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("theme-dark");
    const isDark = document.body.classList.contains("theme-dark");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-pressed", String(isDark));
  });
}
