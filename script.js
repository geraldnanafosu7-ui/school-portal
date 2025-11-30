// ---------------- TOAST ----------------
function toast(msg, type = "info") {
  const t = document.getElementById("toast");
  if (!t) return alert(msg);

  t.textContent = msg;
  t.className = "toast"; // reset
  t.classList.add(type);
  t.classList.add("show");

  setTimeout(() => t.classList.remove("show"), 3000);
}

// ---------------- SIGN UP ----------------
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("suEmail").value.trim();
    const password = document.getElementById("suPassword").value.trim();
    const fullName = document.getElementById("suFullName").value.trim();
    const username = document.getElementById("suUsername").value.trim().toLowerCase();
    const phone = document.getElementById("suPhone").value.trim();
    const role = document.getElementById("suRole").value;

    if (!email || !password || password.length < 6 || !role) {
      return toast("❌ Please fill all required fields (password ≥ 6 chars)", "error");
    }

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection("users").doc(cred.user.uid).set({
        username, fullName, phone, email, role
      });
      toast("✅ Account created successfully! Please log in.", "success");
      signupForm.reset();
      document.getElementById("signupCard").classList.add("hidden");
    } catch (err) {
      toast("❌ " + err.message, "error");
    }
  });
}

// ---------------- LOGIN ----------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) return toast("❌ Enter both email and password", "error");

    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const doc = await db.collection("users").doc(cred.user.uid).get();
      const data = doc.data();
      if (!data) return toast("❌ No profile found. Contact admin.", "error");

      toast("✅ Login successful!", "success");
      if (data.role === "headteacher") {
        window.location.href = "headteacher.html";
      } else if (data.role === "teacher") {
        window.location.href = "teacher.html";
      } else {
        toast("❌ Unknown role. Contact admin.", "error");
      }
    } catch (err) {
      toast("❌ " + err.message, "error");
    }
  });
}

// ---------------- FORGOT PASSWORD ----------------
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", async e => {
    e.preventDefault();
    const email = document.getElementById("loginUsername").value.trim();
    if (!email) return toast("❌ Enter your email first", "error");
    try {
      await auth.sendPasswordResetEmail(email);
      toast("✅ Password reset email sent! Check your inbox.", "success");
    } catch (err) {
      toast("❌ " + err.message, "error");
    }
  });
}

// ---------------- USER GREETING ----------------
auth.onAuthStateChanged(async user => {
  const userDisplay = document.getElementById("userDisplayName");
  if (user) {
    const doc = await db.collection("users").doc(user.uid).get();
    const data = doc.data();
    if (userDisplay) userDisplay.textContent = data?.fullName || data?.username || user.email;
  }
});

// ---------------- LOGOUT ----------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    toast("✅ Logged out!", "success");
    setTimeout(() => window.location.href = "index.html", 1500);
  });
}

// ---------------- ANNOUNCEMENTS ----------------
const postBtn = document.getElementById("postAnnouncementBtn");
const announcementInput = document.getElementById("announcementInput");
const announcementList = document.getElementById("announcementList");

if (postBtn && announcementInput && announcementList) {
  postBtn.addEventListener("click", async () => {
    const text = announcementInput.value.trim();
    if (!text) return toast("❌ Please write an announcement", "error");
    const user = auth.currentUser;
    if (!user) return toast("❌ Not logged in", "error");
    await db.collection("announcements").add({ text, uid: user.uid, date: new Date().toISOString() });
    announcementInput.value = "";
    toast("✅ Announcement posted!", "success");
  });

  db.collection("announcements").orderBy("date").onSnapshot(snapshot => {
    announcementList.innerHTML = "";
    snapshot.forEach(doc => {
      const div = document.createElement("div");
      div.textContent = doc.data().text;
      announcementList.appendChild(div);
    });
  });
}

// ---------------- TEACHER LESSON NOTES ----------------
const notesInput = document.getElementById("notesInput");
const submitNotesBtn = document.getElementById("submitNotesBtn");
const notesList = document.getElementById("notesList");

if (submitNotesBtn && notesInput && notesList) {
  submitNotesBtn.addEventListener("click", async () => {
    const note = notesInput.value.trim();
    if (!note) return toast("❌ Please enter your notes", "error");
    const user = auth.currentUser;
    if (!user) return toast("❌ Not logged in", "error");
    await db.collection("lessonNotes").add({
      note,
      uid: user.uid,
      date: new Date().toISOString()
    });
    notesInput.value = "";
    toast("✅ Lesson notes submitted!", "success");
  });

  db.collection("lessonNotes").onSnapshot(snapshot => {
    notesList.innerHTML = "";
    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = doc.data().note;
      notesList.appendChild(li);
    });
  });
}

// ---------------- TEACHER SUMMARIES ----------------
const summaryInput = document.getElementById("summaryInput");
const submitSummaryBtn = document.getElementById("submitSummaryBtn");
const summaryList = document.getElementById("summaryList");

if (submitSummaryBtn && summaryInput && summaryList) {
  submitSummaryBtn.addEventListener("click", async () => {
    const text = summaryInput.value.trim();
    if (!text) return toast("❌ Please write a summary", "error");
    const user = auth.currentUser;
    if (!user) return toast("❌ Not logged in", "error");
    await db.collection("summaries").add({
      text,
      uid: user.uid,
      date: new Date().toISOString()
    });
    summaryInput.value = "";
    toast("✅ Summary submitted!", "success");
  });

  db.collection("summaries").onSnapshot(snapshot => {
    summaryList.innerHTML = "";
    snapshot.forEach(doc => {
      const div = document.createElement("div");
      div.textContent = doc.data().text;
      summaryList.appendChild(div);
    });
  });
}

// ---------------- ATTENDANCE ----------------
const boysInput = document.getElementById("boysInput");
const girlsInput = document.getElementById("girlsInput");
const updateClassBtn = document.getElementById("updateClassBtn");
const classDisplay = document.getElementById("classDisplay");

if (updateClassBtn && boysInput && girlsInput && classDisplay) {
  updateClassBtn.addEventListener("click", async () => {
    const boys = parseInt(boysInput.value.trim(), 10);
    const girls = parseInt(girlsInput.value.trim(), 10);
    if (isNaN(boys) || isNaN(girls)) return toast("❌ Enter valid numbers", "error");

    const user = auth.currentUser;
    if (!user) return toast("❌ Not logged in", "error");

    const record = { boys, girls, date: new Date().toLocaleString() };
    await db.collection("attendanceHistory").add({
      ...record,
      uid: user.uid
    });

    classDisplay.textContent = `Boys: ${boys}, Girls: ${girls}`;
    toast("✅ Class numbers updated!", "success");
  });

  db.collection("attendanceHistory").orderBy("date").onSnapshot(snapshot => {
    if (!snapshot.empty) {
      const latest = snapshot.docs[snapshot.docs.length - 1].data();
      classDisplay.textContent = `Boys: ${latest.boys}, Girls: ${latest.girls}`;
    }
  });
}

// ---------------- HEADTEACHER VIEW ATTENDANCE ----------------
const viewAttendanceBtn = document.getElementById("viewAttendanceBtn");
const attendanceReport = document.getElementById("attendanceReport");

if (viewAttendanceBtn && attendanceReport) {
  viewAttendanceBtn.addEventListener("click", async () => {
    const snapshot = await db.collection("attendanceHistory").get();
    if (snapshot.empty) {
      attendanceReport.textContent = "No attendance data available.";
      return;
    }

    let html = "<table class='attendance-table'><tr><th>Date</th><th>Boys</th><th>Girls</th></tr>";
    snapshot.forEach(doc => {
      const rec = doc.data();
      html += `<tr><td>${rec.date}</td><td>${rec.boys}</td><td>${rec.girls}</td></tr>`;
    });
    html += "</table>";
    attendanceReport.innerHTML = html;
  });
}

// ---------------- SETTINGS ----------------
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return toast("❌ No user logged in", "error");

    const newFullName = document.getElementById("updateFullName")?.value.trim();
    const newPhone = document.getElementById("updatePhone")?.value.trim();
    const newEmail = document.getElementById("updateEmail")?.value.trim();

    try {
      if (newEmail) await user.updateEmail(newEmail);

      const updates = {};
      if (newFullName) updates.fullName = newFullName;
      if (newPhone) updates.phone = newPhone;

      if (Object.keys(updates).length > 0) {
        await db.collection("users").doc(user.uid).update(updates);
      }

      toast("✅ Settings updated successfully!", "success");
    } catch (err) {
      toast("❌ Error updating settings: " + err.message, "error");
    }
  });
}

// ---------------- CHANGE PASSWORD ----------------
const changePasswordBtn = document.getElementById("changePasswordBtn");
if (changePasswordBtn) {
  changePasswordBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    const newPass = document.getElementById("newPassword").value.trim();
    if (!user) return toast("❌ No user logged in", "error");
    if (!newPass || newPass.length < 6) return toast("❌ Password must be at least 6 characters", "error");

    try {
      await user.updatePassword(newPass);
      toast("✅ Password updated successfully!", "success");
      document.getElementById("passwordForm").reset();
    } catch (err) {
      toast("❌ Error: " + err.message, "error");
    }
  });
}

// ---------------- MANAGE TEACHERS (Headteacher) ----------------
const teacherList = document.getElementById("teacherList");
if (teacherList) {
  db.collection("users").where("role", "==", "teacher").onSnapshot(snapshot => {
    teacherList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      teacherList.innerHTML += `<p>${data.fullName} (${data.email})</p>`;
    });
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

// ---------------- DOWNLOAD SUMMARIES ----------------
const downloadSummariesBtn = document.getElementById("downloadSummariesBtn");
if (downloadSummariesBtn) {
  downloadSummariesBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return toast("❌ No user logged in", "error");

    try {
      const snapshot = await db.collection("summaries")
        .where("uid", "==", user.uid)
        .orderBy("date")
        .get();

      if (snapshot.empty) return toast("❌ No summaries found", "error");

      let content = "My Summaries:\n\n";
      snapshot.forEach(doc => {
        const data = doc.data();
        content += `- ${new Date(data.date).toLocaleString()}: ${data.text}\n`;
      });

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "summaries.txt";
      a.click();
      URL.revokeObjectURL(url);

      toast("✅ Summaries downloaded!", "success");
    } catch (err) {
      toast("❌ Error: " + err.message, "error");
    }
  });
}

// ---------------- DOWNLOAD NOTES ----------------
const downloadNotesBtn = document.getElementById("downloadNotesBtn");
if (downloadNotesBtn) {
  downloadNotesBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return toast("❌ No user logged in", "error");

    try {
      const snapshot = await db.collection("lessonNotes")
        .where("uid", "==", user.uid)
        .orderBy("date")
        .get();

      if (snapshot.empty) return toast("❌ No notes found", "error");

      let content = "My Lesson Notes:\n\n";
      snapshot.forEach(doc => {
        const data = doc.data();
        content += `- ${new Date(data.date).toLocaleString()}: ${data.note}\n`;
      });

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lesson_notes.txt";
      a.click();
      URL.revokeObjectURL(url);

      toast("✅ Notes downloaded!", "success");
    } catch (err) {
      toast("❌ Error: " + err.message, "error");
    }
  });
}

// ---------------- THEME TOGGLES ----------------
const themeButtons = document.querySelectorAll(".theme-switcher button");
if (themeButtons.length) {
  themeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const label = btn.textContent.toLowerCase();
      if (label.includes("dark")) document.body.className = "theme-dark";
      else if (label.includes("blue")) document.body.className = "theme-blue";
      else if (label.includes("green")) document.body.className = "theme-green";
      else document.body.className = "theme-white";
    });
  });
}
