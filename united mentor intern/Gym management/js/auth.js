// auth.js
import { readCollection, writeCollection, generateId } from "./storage.js";
import { logEvent } from "./logger.js";

const USERS_KEY = "gym_users";
const SESSION_KEY = "gym_session";

/* ================= SESSION ================= */

export function setSessionLocal(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession() {
  const s = localStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* ================= USERS ================= */

function seedUsers() {
  if (!localStorage.getItem(USERS_KEY)) {
    const users = [
      {
        id: generateId(),
        name: "Admin",
        email: "admin@gym.com",
        password: "password",
        role: "admin",
      },
      {
        id: generateId(),
        name: "Member",
        email: "member@gym.com",
        password: "password",
        role: "member",
      },
      {
        id: generateId(),
        name: "User",
        email: "user@gym.com",
        password: "password",
        role: "user",
      },
    ];
    writeCollection(USERS_KEY, users);
  }
}

seedUsers();

/* ================= LOGIN ================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const users = readCollection(USERS_KEY);
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      alert("Invalid credentials");
      logEvent("LOGIN_FAILED", { email });
      return;
    }

    // 🔐 ROLE MUST COME FROM USER (NOT UI)
    const session = {
      uid: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    setSessionLocal(session);
    logEvent("LOGIN_SUCCESS", session);

    // 🚀 Redirect by actual role
    if (user.role === "admin") {
      window.location.href = "admin.html";
    } else if (user.role === "member") {
      window.location.href = "member.html";
    } else {
      window.location.href = "user.html";
    }
  });
});
