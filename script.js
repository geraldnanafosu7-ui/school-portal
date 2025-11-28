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

// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) return toast("No account found. Please sign up first.");
    if (user.username === username && user.password === password) {
      if (user.role === "headteacher") {
        window.location.href = "headteacher.html";
      } else if (user.role === "teacher") {
        window.location.href = "teacher.html";
      } else {
        toast("Role missing. Please sign up again.");
      }
    } else {
      toast("Invalid login details");
    }
  });
}

// Sign-up
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
    localStorage.setItem("currentUser", JSON.stringify(user));

    if (user.role === "headteacher") {
      window.location.href = "headteacher.html";
    } else if (user.role === "teacher") {
      window.location.href = "teacher.html";
    } else {
      toast("Invalid role selected");
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
