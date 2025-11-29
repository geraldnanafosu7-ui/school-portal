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
    if (!user.username || !user.password || !user.role) return toast("Please fill all required fields");
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(u => u.username === user.username)) return toast("Username already exists");
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
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return toast("Invalid login details");
    localStorage.setItem("currentUser", JSON.stringify(user));
    toast("Login successful!");
    if (user.role === "headteacher") {
      window.location.href = "headteacher.html";
    } else if (user.role === "teacher") {
      window.location.href = "teacher.html";
    }
  });
}

// ---------------- USER GREETING ----------------
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const userDisplay = document.getElementById("userDisplayName");
if (currentUser && userDisplay) {
  userDisplay.textContent = currentUser.fullName || currentUser.username;
}

// ---------------- THEMES ----------------
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeOptions = document.getElementById("themeOptions");

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    if (!themeOptions) return;
    themeOptions.classList.toggle("hidden");
  });
}

document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.body.className = "theme-" + btn.dataset.theme;
    localStorage.setItem("theme", btn.dataset.theme);
    toast(`Theme changed to ${btn.dataset.theme}`);
  });
});
const savedTheme = localStorage.getItem("theme");
if (savedTheme) document.body.className = "theme-" + savedTheme;

// ---------------- LOGOUT ----------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    toast("Logged out!");
    setTimeout(() => window.location.href = "index.html", 1500);
  });
}

// ---------------- HEADTEACHER ANNOUNCEMENTS ----------------
const postBtn = document.getElementById("postAnnouncementBtn");
const announcementInput = document.getElementById("announcementInput");
const announcementList = document.getElementById("announcementList");

if (postBtn && announcementInput && announcementList) {
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
  announcementList.innerHTML = "";
  announcements.forEach(text => {
    const div = document.createElement("div");
    div.textContent = text;
    announcementList.appendChild(div);
  });
}

// ---------------- SETTINGS (Headteacher & Teacher) ----------------
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener("click", () => {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (!user) return toast("No user logged in");

    const oldPass = document.getElementById("oldPassword")?.value.trim();
    const newPass = document.getElementById("newPassword")?.value.trim();
    const confirmPass = document.getElementById("confirmPassword")?.value.trim();
    const newEmail = document.getElementById("updateEmail")?.value.trim();
    const newPhone = document.getElementById("updatePhone")?.value.trim();
    const newFullName = document.getElementById("updateFullName")?.value.trim();
    const newTheme = document.getElementById("updateTheme")?.value;

    if (newPass && newPass !== confirmPass) return toast("Passwords do not match");
    if (newPass && oldPass !== user.password) return toast("Old password incorrect");

    if (newPass) user.password = newPass;
    if (newEmail) user.email = newEmail;
    if (newPhone) user.phone = newPhone;
    if (newFullName) user.fullName = newFullName;
    if (newTheme) {
      document.body.className = "theme-" + newTheme;
      localStorage.setItem("theme", newTheme);
    }

    users = users.map(u => (u.username === user.username ? user : u));
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));
    toast("Settings updated successfully!");

    const nameEl = document.getElementById("userDisplayName");
    if (nameEl) nameEl.textContent = user.fullName || user.username;
  });
}

// ---------------- HEADTEACHER DASHBOARD DATA ----------------
const teacherRecords = document.getElementById("teacherRecords");
if (teacherRecords) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  teacherRecords.innerHTML = "";
  users.filter(u => u.role === "teacher").forEach(t => {
    const div = document.createElement("div");
    div.textContent = `${t.fullName || t.username} (${t.username}) - ${t.email || "no email"}`;
    teacherRecords.appendChild(div);
  });
}

const headNotesList = document.getElementById("headNotesList");
if (headNotesList) {
  let notes = JSON.parse(localStorage.getItem("lessonNotes")) || [];
  headNotesList.innerHTML = "";
  notes.forEach(note => {
    const li = document.createElement("li");
    li.textContent = note;
    headNotesList.appendChild(li);
  });
}

// ---------------- HEADTEACHER SUMMARY STATS ----------------
const statTeachers = document.getElementById("statTeachers");
const statNotes = document.getElementById("statNotes");
const statSummaries = document.getElementById("statSummaries");
const statClass = document.getElementById("statClass");

if (statTeachers) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  statTeachers.textContent = users.filter(u => u.role === "teacher").length;
}
if (statNotes) {
  let notes = JSON.parse(localStorage.getItem("lessonNotes")) || [];
  statNotes.textContent = notes.length;
}
if (statSummaries) {
  let summaries = JSON.parse(localStorage.getItem("summaries")) || [];
  statSummaries.textContent = summaries.length;
}
if (statClass) {
  let classData = JSON.parse(localStorage.getItem("classNumbers"));
  statClass.textContent = classData ? `${classData.boys} boys, ${classData.girls} girls` : "0 boys, 0 girls";
}

// ---------------- HEADTEACHER VIEW ATTENDANCE ----------------
const viewAttendanceBtn = document.getElementById("viewAttendanceBtn");
const attendanceReport = document.getElementById("attendanceReport");
const downloadAttendanceBtn = document.getElementById("downloadAttendanceBtn");

if (viewAttendanceBtn && attendanceReport) {
  viewAttendanceBtn.addEventListener("click", () => {
    let history = JSON.parse(localStorage.getItem("attendanceHistory")) || [];
    if (!history.length) {
      attendanceReport.textContent = "No attendance data available.";
      return;
    }

    let html = "<table class='attendance-table'><tr><th>Date</th><th>Boys</th><th>Girls</th></tr>";
    history.forEach(rec => {
      html += `<tr><td>${rec.date}</td><td>${rec.boys}</td><td>${rec.girls}</td></tr>`;
    });
    html += "</table>";
    attendanceReport.innerHTML = html;
  });
}

if (downloadAttendanceBtn) {
  downloadAttendanceBtn.addEventListener("click", () => {
    let history = JSON.parse(localStorage.getItem("attendanceHistory")) || [];
    if (!history.length) return toast("No attendance history to download");

    let csv = "Date,Boys,Girls\n";
    history.forEach(rec => {
      csv += `${rec.date},${rec.boys},${rec.girls}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ---------------- TEACHER DOWNLOAD SUMMARIES ----------------
const downloadSummariesBtn = document.getElementById("downloadSummariesBtn");
if (downloadSummariesBtn) {
  downloadSummariesBtn.addEventListener("click", () => {
    let summaries = JSON.parse(localStorage.getItem("summaries")) || [];
    if (!summaries.length) return toast("No summaries to download");

    let csv = "Summary\n";
    summaries.forEach(text => {
      csv += `"${text.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summaries.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ---------------- TEACHER DOWNLOAD NOTES ----------------
const downloadNotesBtn = document.getElementById("downloadNotesBtn");
if (downloadNotesBtn) {
  downloadNotesBtn.addEventListener("click", () => {
    let notes = JSON.parse(localStorage.getItem("lessonNotes")) || [];
    if (!notes.length) return toast("No notes to download");

    let csv = "Note\n";
    notes.forEach(text => {
      csv += `"${text.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lesson_notes.csv";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ---------------- NAVIGATION ----------------
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll("main section, .main > .grid");

if (navItems.length && sections.length) {
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      sections.forEach(sec => sec.classList.add("hidden"));

      const targetId = item.dataset.target;
      if (targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.remove("hidden");
      } else {
        const dashboardGrid = document.getElementById("dashboardSection");
        if (dashboardGrid) dashboardGrid.classList.remove("hidden");
      }
    });
  });

  const defaultDashboard = document.getElementById("dashboardSection");
  if (defaultDashboard) defaultDashboard.classList.remove("hidden");
}
