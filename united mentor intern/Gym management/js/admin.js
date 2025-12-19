// js/admin.js
import { getSession, clearSession } from "./auth.js";
import {
  readCollection,
  writeCollection,
  insertItem,
  deleteItem,
  updateItem,
  generateId,
} from "./storage.js";
import { logEvent } from "./logger.js";

const MEMBERS_KEY = "members";
const BILLS_KEY = "bills";
const NOTIFS_KEY = "notifications";

// Auth guard
const session = getSession();
if (!session) {
  window.location.href = "index.html";
} else {
  logEvent("ADMIN_DASHBOARD_VISIT", session);
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn?.addEventListener("click", () => {
  logEvent("LOGOUT", { from: "admin", session });
  clearSession();
  window.location.href = "index.html";
});

// Members CRUD
const addMemberForm = document.getElementById("addMemberForm");
const membersTableBody = document.querySelector("#membersTable tbody");
const memberFormMessage = document.getElementById("memberFormMessage");
let editingMemberId = null;

function loadMembers() {
  const members = readCollection(MEMBERS_KEY);
  membersTableBody.innerHTML = "";
  members.forEach((m) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.name}</td>
      <td>${m.email}</td>
      <td>${m.phone}</td>
      <td>${m.package}</td>
      <td>
        <button class="btn tiny" data-action="edit" data-id="${m.id}">Edit</button>
        <button class="btn tiny danger" data-action="delete" data-id="${m.id}">Delete</button>
      </td>
    `;
    membersTableBody.appendChild(tr);
  });

  membersTableBody.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === "delete") {
        deleteMember(id);
      } else {
        editMember(id);
      }
    });
  });
}

addMemberForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("memberName").value.trim();
  const email = document.getElementById("memberEmail").value.trim();
  const phone = document.getElementById("memberPhone").value.trim();
  const feePackage = document.getElementById("memberPackage").value;

  if (!name || !email) {
    memberFormMessage.textContent = "Name and email required.";
    return;
  }

  if (editingMemberId) {
    updateItem(MEMBERS_KEY, editingMemberId, { name, email, phone, package: feePackage });
    memberFormMessage.textContent = "Member updated.";
    logEvent("MEMBER_UPDATED", { id: editingMemberId, name, email });
    editingMemberId = null;
  } else {
    const id = generateId("m_");
    insertItem(MEMBERS_KEY, { id, name, email, phone, package: feePackage });
    memberFormMessage.textContent = "Member created.";
    logEvent("MEMBER_CREATED", { id, name, email });
  }
  addMemberForm.reset();
  loadMembers();
});

function deleteMember(id) {
  deleteItem(MEMBERS_KEY, id);
  logEvent("MEMBER_DELETED", { id });
  loadMembers();
}

function editMember(id) {
  const members = readCollection(MEMBERS_KEY);
  const m = members.find((x) => x.id === id);
  if (!m) return;
  document.getElementById("memberName").value = m.name;
  document.getElementById("memberEmail").value = m.email;
  document.getElementById("memberPhone").value = m.phone;
  document.getElementById("memberPackage").value = m.package;
  editingMemberId = id;
  memberFormMessage.textContent = "Edit mode: update fields then Save Member.";
}

// Bills
const createBillForm = document.getElementById("createBillForm");
const billFormMessage = document.getElementById("billFormMessage");

createBillForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("billMemberEmail").value.trim();
  const amount = parseFloat(document.getElementById("billAmount").value);
  const dueDate = document.getElementById("billDueDate").value;
  const notes = document.getElementById("billNotes").value.trim();

  if (!email || !amount) {
    billFormMessage.textContent = "Email and amount required.";
    return;
  }

  const id = generateId("b_");
  insertItem(BILLS_KEY, { id, memberEmail: email, amount, dueDate, notes, status: "unpaid" });
  billFormMessage.textContent = "Bill created.";
  logEvent("BILL_CREATED", { id, email, amount });
  createBillForm.reset();
});

// Notifications
const notificationForm = document.getElementById("notificationForm");
const notificationMessageStatus = document.getElementById("notificationMessageStatus");

notificationForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("notificationMessage").value.trim();
  if (!text) return;
  const id = generateId("n_");
  insertItem(NOTIFS_KEY, { id, text, audience: "members", createdAt: new Date().toISOString() });
  notificationMessageStatus.textContent = "Notification stored.";
  logEvent("NOTIFICATION_CREATED", { id, textLength: text.length });
  notificationForm.reset();
});

// Reports (CSV)
const exportMembersBtn = document.getElementById("exportMembersBtn");
const exportBillsBtn = document.getElementById("exportBillsBtn");
const reportMessage = document.getElementById("reportMessage");

exportMembersBtn?.addEventListener("click", () => {
  const rows = [["Name", "Email", "Phone", "Package"], ...readCollection(MEMBERS_KEY).map(m => [m.name, m.email, m.phone, m.package])];
  downloadCsv("members.csv", rows);
  reportMessage.textContent = "Members CSV downloaded.";
  logEvent("REPORT_MEMBERS_EXPORTED", { count: rows.length - 1 });
});

exportBillsBtn?.addEventListener("click", () => {
  const rows = [["Member Email", "Amount", "Due Date", "Status", "Notes"], ...readCollection(BILLS_KEY).map(b => [b.memberEmail, b.amount, b.dueDate, b.status, b.notes || ""])];
  downloadCsv("bills.csv", rows);
  reportMessage.textContent = "Bills CSV downloaded.";
  logEvent("REPORT_BILLS_EXPORTED", { count: rows.length - 1 });
});

function downloadCsv(filename, rows) {
  const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Supplements & Diet (mock)
const supplementList = document.getElementById("supplementList");
function loadSupplements() {
  if (!supplementList) return;
  const data = [
    { name: "Whey Protein", price: 2500 },
    { name: "Creatine Monohydrate", price: 1200 },
    { name: "BCAA", price: 1500 },
  ];
  supplementList.innerHTML = "";
  data.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ₹${item.price}`;
    supplementList.appendChild(li);
  });
}

const dietPlansContainer = document.getElementById("dietPlans");
function loadDietPlans() {
  if (!dietPlansContainer) return;
  const plans = [
    { name: "Weight Loss", details: "High protein, low carbs, caloric deficit." },
    { name: "Muscle Gain", details: "High protein, moderate carbs, caloric surplus." },
  ];
  dietPlansContainer.innerHTML = plans.map(p =>
    `<div class="diet-plan"><h4>${p.name}</h4><p>${p.details}</p></div>`
  ).join("");
}

// initial load
loadMembers();
loadSupplements();
loadDietPlans();
