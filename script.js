// ---------------- TOAST ----------------
function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return alert(msg);
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3000);
}

// ---------------- SIGN UP ----------------
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", e => {
    e.preventDefault();

    const user = {
      username: document.getElementById("suUsername").value.trim().toLowerCase(),
      fullName: document.getElementById("suFullName").value.trim(),
      password: document.getElementById("suPassword").value.trim(),
      phone: document.getElementById("suPhone").value.trim(),
      email: document.getElementById("suEmail").value.trim(),
      role: document.getElementById("suRole").value
    };

    if (!user.username || !user.password || !user.role) {
      return toast("Please fill all required fields");
    }

    let users = [];
    try {
      const stored = JSON.parse(localStorage.getItem("users"));
      if (Array.isArray(stored)) users = stored;
    } catch (e) {
      users = [];
    }

    const exists = users.find(u => u.username === user.username);
    if (exists) return toast("Username already exists");

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    toast("Account created successfully! Please log in.");
    signupForm.reset();
  });
}

// ---------------- LOGIN ----------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    let users = [];
    try {
      const stored = JSON.parse(localStorage.getItem("users"));
      if (Array.isArray(stored)) users = stored;
    } catch (e) {
      users = [];
    }

    const user = users.find(u => u.username.toLowerCase() === username && u.password === password);

    if (!user) {
      toast("Invalid login details");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    toast("Login successful!");

    if (user.role === "headteacher") {
      window.location.href = "headteacher.html";
    } else if (user.role === "teacher") {
      window.location.href = "teacher.html";
    }
  });
}

// ---------------- THEMES ----------------
document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.body.className = "theme-" + btn.dataset.theme;
    localStorage.setItem("theme", btn.dataset.theme);
  });
});
const savedTheme = localStorage.getItem("theme");
if (savedTheme) document.body.className = "theme-" + savedTheme;

// ---------------- LOGOUT ----------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  });
}

// ---------------- HEADTEACHER ANNOUNCEMENTS ----------------
const postBtn = document.getElementById("postAnnouncementBtn");
const announcementInput = document.getElementById("announcementInput");
const announcementList = document.getElementById("announcementList");

if (postBtn) {
  postBtn.addEventListener("click", () => {
    const text = announcementInput.value.trim();
    if (!text) return toast("Please write an announcement");

    let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
    announcements.push(text);
    localStorage.setItem("announcements", JSON.stringify(announcements));

    const div = document.createElement("div");
    div.textContent = text;
    announcementList.appendChild(div);

    announcementInput.value = "";
    toast("Announcement posted!");
  });

  let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
  announcements.forEach(text => {
    const div = document.createElement("div");
    div.textContent = text;
    announcementList.appendChild(div);
  });
}

// ---------------- HEADTEACHER SETTINGS ----------------
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener("click", () => {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const oldPass = document.getElementById("oldPassword").value.trim();
    const newPass = document.getElementById("newPassword").value.trim();
    const confirmPass = document.getElementById("confirmPassword").value.trim();
    const newEmail = document.getElementById("updateEmail").value.trim();
    const newPhone = document.getElementById("updatePhone").value.trim();

    if (newPass && newPass !== confirmPass) {
      return toast("Passwords do not match");
    }
    if (oldPass && oldPass !== user.password) {
      return toast("Old password incorrect");
    }

    if (newPass) user.password = newPass;
    if (newEmail) user.email = newEmail;
    if (newPhone) user.phone = newPhone;

    users = users.map(u => u.username === user.username ? user : u);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));

    toast("Settings updated successfully!");
  });
}

// ---------------- HEADTEACHER DASHBOARD BUTTONS ----------------
const acceptNotesBtn = document.querySelector(".accent-green .btn");
if (acceptNotesBtn) {
  acceptNotesBtn.addEventListener("click", () => {
    toast("Lesson notes accepted!");
  });
}

const deleteTeacherBtn = document.querySelector(".accent-orange .btn");
if (deleteTeacherBtn) {
  deleteTeacherBtn.addEventListener("click", () => {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.filter(u => u.role !== "teacher");
    localStorage.setItem("users", JSON.stringify(users));
    toast("All teacher accounts deleted!");
  });
}

const viewAttendanceBtn = document.querySelector(".accent-purple .btn");
if (viewAttendanceBtn) {
  viewAttendanceBtn.addEventListener("click", () => {
    toast("Class attendance report loaded!");
  });
}

// ---------------- TEACHER LESSONS ----------------
const lessonForm = document.getElementById("lessonForm");
const lessonList = document.getElementById("lessonList");

if (lessonForm) {
  lessonForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = document.getElementById("lessonTitle").value.trim();
    if (!title) return toast("Lesson title required");

    let lessons = JSON.parse(localStorage.getItem("lessons")) || [];
    lessons.push(title);
    localStorage.setItem("lessons", JSON.stringify(lessons));

    const li = document.createElement("li");
    li.textContent = title;
    lessonList.appendChild(li);

    lessonForm.reset();
    toast("Lesson added!");
  });

  let lessons = JSON.parse(localStorage.getItem("lessons")) || [];
  lessons.forEach(title => {
    const li = document.createElement("li");
    li.textContent = title;
    lessonList.appendChild(li);
  });
}

// ---------------- TEACHER ANNOUNCEMENTS ----------------
const teacherAnnouncements = document.getElementById("teacherAnnouncements");
if (teacherAnnouncements) {
  let announcements = JSON.parse(localStorage.getItem("announcements")) || [];
  announcements.forEach(text => {
    const div = document.createElement("div");
    div.textContent = text;
    teacherAnnouncements.appendChild(div);
  });
}

// ---------------- TEACHER SETTINGS ----------------
const saveTeacherSettingsBtn = document.getElementById("saveTeacherSettingsBtn");
if (saveTeacherSettingsBtn) {
  saveTeacherSettingsBtn.addEventListener("click", () => {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const newPass = document.getElementById("newPassword").value.trim();
    const confirmPass = document.getElementById("confirmPassword").value.trim();

    if (newPass && newPass !== confirmPass) {
      return toast("Passwords do not match");
    }

    if (newPass) user.password = newPass;

    users = users.map(u => u.username === user.username ? user : u);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));

    toast("Settings updated successfully!");
  });
}


  // ---------------- NAVIGATION ----------------
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll("main section");

if (navItems.length && sections.length) {
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      // Remove active class from all
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      // Hide all sections
      sections.forEach(sec => sec.classList.add("hidden"));

      // Show the target section
      const targetId = item.dataset.target;
      if (targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.remove("hidden");
      }
    });
  });
}


