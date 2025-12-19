// js/member.js
import { getSession, clearSession } from "./auth.js";
import { readCollection, updateItem } from "./storage.js";
import { logEvent } from "./logger.js";

const BILLS_KEY = "bills";
const NOTIFS_KEY = "notifications";

const session = getSession();
if (!session) {
  window.location.href = "index.html";
} else {
  logEvent("MEMBER_DASHBOARD_VISIT", session);
}

const logoutBtn = document.getElementById("logoutBtn");
const billsTableBody = document.querySelector("#memberBillsTable tbody");
const notificationsList = document.getElementById("memberNotifications");

logoutBtn?.addEventListener("click", () => {
  logEvent("LOGOUT", { from: "member", session });
  clearSession();
  window.location.href = "index.html";
});

function loadBills() {
  const all = readCollection(BILLS_KEY);
  const my = all.filter(b => b.memberEmail && b.memberEmail.toLowerCase() === session.email.toLowerCase());
  billsTableBody.innerHTML = "";
  my.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.amount}</td>
      <td>${d.dueDate}</td>
      <td>${d.status}</td>
      <td>${d.notes || ""}</td>
    `;
    billsTableBody.appendChild(tr);
  });
}

function loadNotifications() {
  const all = readCollection(NOTIFS_KEY);
  notificationsList.innerHTML = "";
  all.forEach(n => {
    const li = document.createElement("li");
    li.textContent = `${n.text} (${n.createdAt || ""})`;
    notificationsList.appendChild(li);
  });
}

loadBills();
loadNotifications();
