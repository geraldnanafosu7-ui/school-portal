// Toast helper
function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2000);
}

// Persist theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.className = savedTheme === "default" ? "" : `theme-${savedTheme}`;
}

// Theme toggle
document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const theme = btn.dataset.theme;
    document.body.className = theme === "default" ? "" : `theme-${theme}`;
    localStorage.setItem("theme", theme);
    toast(`${theme} theme applied`);
  });
});

// Sign-up (store multiple users)
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", e => {
    e.preventDefault();
    const user = {
      username: document.getElementById("suUsername").value.trim(),
      fullName: document.getElementById("suFullName").value.trim(),
      password: document.getElementById("suPassword").value.trim(),
      phone: document.getElementById("suPhone").value.trim(),
      email: document.getElementById("suEmail").value.trim(),
      role: document.getElementById("suRole").value
    };

    if (!user.role) return toast("Please select a role");

    let users = JSON.parse(localStorage.getItem("users")) || [];
    const exists = users.find(u => u.username === user.username);
    if (exists) return toast("Username already exists");

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    toast("Account created successfully! Please log in.");
  });
}

// Login (check against all users)
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    // Get all users from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Match ignoring case for username
    const user = users.find(u => u.username.toLowerCase() === username && u.password === password);

    if (!user) {
      toast("Invalid login details");
      return;
    }

    // Save logged-in user
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Redirect by role
    if (user.role === "headteacher") {
      window.location.href = "headteacher.html";
    } else if (user.role === "teacher") {
      window.location.href = "teacher.html";
    }
  });
}



// Logout (on dashboards)
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });
}
// Post Announcement (Headteacher)
const postAnnouncementBtn = document.getElementById("postAnnouncementBtn");
if (postAnnouncementBtn) {
  postAnnouncementBtn.addEventListener("click", () => {
    const input = document.getElementById("announcementInput");
    const list = document.getElementById("announcementList");
    const text = input.value.trim();
    if (!text) return toast("Write an announcement first");

    // Save to localStorage
    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    announcements.push(text);
    localStorage.setItem("announcements", JSON.stringify(announcements));

    // Show on page
    const item = document.createElement("p");
    item.textContent = text;
    list.appendChild(item);

    input.value = "";
    toast("Announcement posted");
  });
}

// Load announcements (Teacher dashboard)
const teacherAnnouncements = document.getElementById("teacherAnnouncements");
if (teacherAnnouncements) {
  const announcements = JSON.parse(localStorage.getItem("announcements")) || [];
  announcements.forEach(text => {
    const item = document.createElement("p");
    item.textContent = text;
    teacherAnnouncements.appendChild(item);
  });
}
// Sidebar navigation
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const label = btn.textContent.trim();
    document.querySelectorAll(".grid, #settingsSection").forEach(section => section.classList.add("hidden"));

    if (label.includes("Dashboard")) {
      document.querySelector(".grid").classList.remove("hidden");
    } else if (label.includes("Settings")) {
      document.getElementById("settingsSection").classList.remove("hidden");
    } else {
      toast(`${label} section coming soon`);
    }
  });
});

// Save Settings
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener("click", () => {
    const email = document.getElementById("updateEmail").value.trim();
    const phone = document.getElementById("updatePhone").value.trim();
    const oldPass = document.getElementById("oldPassword").value.trim();
    const newPass = document.getElementById("newPassword").value.trim();
    const confirmPass = document.getElementById("confirmPassword").value.trim();

    let user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return toast("No user found");

    if (oldPass && oldPass !== user.password) return toast("Old password incorrect");
    if (newPass && newPass !== confirmPass) return toast("Passwords do not match");

    if (newPass) user.password = newPass;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    localStorage.setItem("currentUser", JSON.stringify(user));
    toast("Settings updated");
  });
}



