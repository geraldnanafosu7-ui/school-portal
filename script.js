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
    const oldPass = document.getElementById("oldPassword")?.value.trim();
    const newPass = document.getElementById("newPassword")?.value.trim();
    const confirmPass = document.getElementById("confirmPassword")?.value.trim();
    const newEmail = document.getElementById("updateEmail")?.value.trim();
    const newPhone = document.getElementById("updatePhone")?.value.trim();
    if (newPass && newPass !== confirmPass) return toast("Passwords do not match");
    if (oldPass && oldPass !== user.password) return toast("Old password incorrect");
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
  acceptNotesBtn.addEventListener("click", () => toast("Lesson notes accepted!"));
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
  viewAttendanceBtn.addEventListener("click", () => toast("Class attendance report loaded!"));
}

// ---------------- TEACHER SUMMARIES ----------------
const summaryInput = document.getElementById("summaryInput");
const submitSummaryBtn = document.getElementById("submitSummaryBtn");
const summaryList = document.getElementById("summaryList");

if (submitSummaryBtn) {
  submitSummaryBtn.addEventListener("click", () => {
    const text = summaryInput.value.trim();
    if (!text) return toast("Please write a summary");
    let summaries = JSON.parse(localStorage.getItem("summaries")) || [];
    summaries.push(text);
    localStorage.setItem("summaries", JSON.stringify(summaries));
    const div = document.createElement("div");
    div.textContent = text;
    summaryList.appendChild(div);
    summaryInput.value = "";
    toast("Summary submitted!");
  });
  let summaries = JSON.parse(localStorage.getItem("summaries")) || [];
  summaries.forEach(text => {
    const div = document.createElement("div");
    div.textContent = text;
    summaryList.appendChild(div);
  });
}

// ---------------- TEACHER CLASS NUMBERS ----------------
const boysInput = document.getElementById("boysInput");
const girlsInput = document.getElementById("girlsInput");
const updateClassBtn = document.getElementById("updateClassBtn");
const classDisplay = document.getElementById("classDisplay");

if (updateClassBtn) {
  updateClassBtn.addEventListener("click", () => {
    const boys = parseInt(boysInput.value.trim());
    const girls = parseInt(girlsInput.value.trim());
    if (isNaN(boys) || isNaN(girls)) return toast("Enter valid numbers");
    const classData = { boys, girls };
    localStorage.setItem("classNumbers", JSON.stringify(classData));
    classDisplay.textContent = `Boys: ${boys}, Girls: ${girls}`;
    toast("Class numbers updated!");
  });
  const saved = JSON.parse(localStorage.getItem("classNumbers"));
  if (saved) classDisplay.textContent = `Boys: ${saved.boys}, Girls: ${saved.girls}`;
}

// ---------------- TEACHER LESSON NOTES ----------------
const notesInput = document.getElementById("notesInput");
const submitNotesBtn = document.getElementById("submitNotesBtn");
const notesList = document.getElementById("notesList");

if (submitNotesBtn) {
  submitNotesBtn.addEventListener("click", () => {
    const note = notesInput.value.trim();
    if (!note) return toast("Please enter your notes");

    let notes = JSON.parse(localStorage.getItem("lessonNotes")) || [];
    notes.push(note);
    localStorage.setItem("lessonNotes", JSON.stringify(notes));

    const li = document.createElement("li");
    li.textContent = note;
    notesList.appendChild(li);

    notesInput.value = "";
    toast("Lesson notes submitted!");
  });

  let notes = JSON.parse(localStorage.getItem("lessonNotes")) || [];
  notes.forEach(note => {
    const li = document.createElement("li");
    li.textContent = note;
    notesList.appendChild(li);
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
