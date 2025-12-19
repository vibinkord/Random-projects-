// js/user.js
import { getSession, clearSession } from "./auth.js";
import { readCollection } from "./storage.js";
import { logEvent } from "./logger.js";

const MEMBERS_KEY = "members";

const session = getSession();
if (!session) {
  window.location.href = "index.html";
} else {
  logEvent("USER_DASHBOARD_VISIT", session);
}

const logoutBtn = document.getElementById("logoutBtn");
const searchForm = document.getElementById("searchForm");
const searchResults = document.getElementById("searchResults");

logoutBtn?.addEventListener("click", () => {
  logEvent("LOGOUT", { from: "user", session });
  clearSession();
  window.location.href = "index.html";
});

searchForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("searchEmail").value.trim().toLowerCase();
  if (!email) return;
  const members = readCollection(MEMBERS_KEY);
  const found = members.filter(m => m.email && m.email.toLowerCase() === email);
  if (found.length === 0) {
    searchResults.innerHTML = "<p>No records found.</p>";
  } else {
    searchResults.innerHTML = found.map(r => `
      <div class="card mt-1">
        <h3>${r.name}</h3>
        <p>Email: ${r.email}</p>
        <p>Phone: ${r.phone}</p>
        <p>Package: ${r.package}</p>
      </div>
    `).join("");
  }
  logEvent("SEARCH_PERFORMED", { email, resultCount: found.length });
});
