// =========================
// TOAST NOTIFICATIONS
// =========================
function toast(message, type = "info") {
  const toastEl = document.getElementById("toast");
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.className = "toast show " + type;
  setTimeout(() => {
    toastEl.className = "toast";
  }, 3000);
}

// =========================
// SIGNUP
// =========================
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("suEmail").value.trim();
    const password = document.getElementById("suPassword").value.trim();
    const fullName = document.getElementById("suFullName").value.trim();
    const username = document.getElementById("suUsername").value.trim();
    const phone = document.getElementById("suPhone").value.trim();
    const role = document.getElementById("suRole").value;

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection("users").doc(cred.user.uid).set({
        fullName,
        username,
        phone,
        email,
        role,
        uid: cred.user.uid,
        createdAt: new Date().toISOString()
      });
      toast("✅ Account created successfully!", "success");
      window.location.href = role === "headteacher" ? "headteacher.html" : "teacher.html";
    } catch (err) {
      toast("❌ Signup failed: " + err.message, "error");
    }
  });
}

// =========================
// LOGIN
// =========================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      const doc = await db.collection("users").doc(cred.user.uid).get();
      if (!doc.exists) return toast("❌ No user profile found", "error");
      const role = doc.data().role;
      toast("✅ Login successful!", "success");
      window.location.href = role === "headteacher" ? "headteacher.html" : "teacher.html";
    } catch (err) {
      toast("❌ Login failed: " + err.message, "error");
    }
  });
}

// =========================
// FORGOT PASSWORD
// =========================
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", async () => {
    const email = document.getElementById("loginUsername").value.trim();
    if (!email) return toast("❌ Enter your email first", "error");
    try {
      await auth.sendPasswordResetEmail(email);
      toast("📧 Password reset email sent!", "success");
    } catch (err) {
      toast("❌ Error: " + err.message, "error");
    }
  });
}

// =========================
// LOGOUT
// =========================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    window.location.href = "index.html";
  });
}

// =========================
// TEACHER: NOTES
// =========================
const submitNotesBtn = document.getElementById("submitNotesBtn");
if (submitNotesBtn) {
  submitNotesBtn.addEventListener("click", async () => {
    const note = document.getElementById("notesInput").value.trim();
    const user = auth.currentUser;
    if (!note) return toast("❌ Note cannot be empty", "error");
    try {
      await db.collection("lessonNotes").add({
        note,
        uid: user.uid,
        date: new Date().toISOString()
      });
      toast("✅ Note saved!", "success");
      document.getElementById("notesInput").value = "";
    } catch (err) {
      toast("❌ Error: " + err.message, "error");
    }
  });

  db.collection("lessonNotes").onSnapshot(snapshot => {
    const notesList = document.getElementById("notesList");
    notesList.innerHTML = "";
    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = doc.data().note;
      notesList.appendChild(li);
    });
  });
}

// =========================
// TEACHER: SUMMARIES
// =========================
const submitSummaryBtn = document.getElementById("submitSummaryBtn");
if (submitSummaryBtn) {
  submitSummaryBtn.addEventListener("click", async () => {
    const summary = document.getElementById("summaryInput").value.trim();
    const user = auth.currentUser;
    if (!summary) return toast("❌ Summary cannot be empty", "error");
    try {
      await db.collection("summaries").add({
        text: summary,
        uid: user.uid,
        date: new Date().toISOString()
      });
      toast("✅ Summary saved!", "success");
      document.getElementById("summaryInput").value = "";
    } catch (err) {
      toast("❌ Error: " + err.message, "error");
    }
  });

  db.collection("summaries").onSnapshot(snapshot => {
    const summaryList = document.getElementById("summaryList");
    summaryList.innerHTML = "";
    snapshot.forEach(doc => {
      const div = document.createElement("div");
      div.textContent = doc.data().text;
      summaryList.appendChild(div);
    });
  });
}

// =========================
// ANNOUNCEMENTS
// =========================
const postAnnouncementBtn = document.getElementById("postAnnouncementBtn");
if (postAnnouncementBtn) {
  postAnnouncementBtn.addEventListener("click", async () => {
    const text = document.getElementById("announcementInput").value.trim();
    if (!text) return toast("❌ Announcement cannot be empty", "error");
    try {
      await db.collection("announcements").add({
        text,
        date: new Date().toISOString()
      });
      toast("✅ Announcement posted!", "success");
      document.getElementById("announcementInput").value = "";
    } catch (err) {
      toast("❌ Error: " + err.message, "error");
    }
  });

  db.collection("announcements").orderBy("date").onSnapshot(snapshot => {
    const list = document.getElementById("announcementList");
    if (list) list.innerHTML = "";
    snapshot.forEach(doc => {
      const div = document.createElement("div");
      div.textContent = doc.data().text;
      if (list) list.appendChild(div);
    });
  });
}

// =========================
// TEACHER: ATTENDANCE
// =========================
const updateClassBtn = document.getElementById("updateClassBtn");
if (updateClassBtn) {
  updateClassBtn.addEventListener("click", async () => {
    const boys = parseInt(document.getElementById("boysInput").value) || 0;
    const girls = parseInt(document.getElementById("girlsInput").value) || 0;
    try {
      await db.collection("attendanceHistory").add({
        boys,
        girls,
        date: new Date().toISOString()
      });
      toast("✅ Attendance updated!", "success");
    } catch (err) {
      toast("❌ Error: " + err.message, "error");
    }
  });

  db.collection("attendanceHistory").orderBy("date").onSnapshot(snapshot => {
    const classDisplay = document.getElementById("classDisplay");
    if (!classDisplay) return;
    if (!snapshot.empty) {
      const latest = snapshot.docs[snapshot.docs.length - 1].data();
      classDisplay.textContent = `${latest.boys} boys, ${latest.girls} girls`;
    } else {
      classDisplay.textContent = "No data yet";
    }
  });
}

// =========================
// HEADTEACHER: VIEW ATTENDANCE REPORT
// =========================
const viewAttendanceBtn = document.getElementById("viewAttendanceBtn");
if (viewAttendanceBtn) {
  viewAttendanceBtn.addEventListener("click", async () => {
    const snapshot = await db.collection("attendanceHistory").get();
    const report = document.getElementById("attendanceReport");
    if (!report) return;
    if (snapshot.empty) {
      report.textContent = "No attendance data available.";
      return;
    }
    let html = "<table class='attendance-table'><tr><th>Date</th><th>Boys</th><th>Girls</th></tr>";
    snapshot.forEach(doc => {
      const rec = doc.data();
      html += `<tr><td>${new Date(rec.date).toLocaleString()}</td><td>${rec.boys}</td><td>${rec.girls}</td></tr>`;
    });
    html += "</table>";
    report.innerHTML = html;
  });
}

// =========================
// SETTINGS + PASSWORD CHANGE
// =========================
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

// =========================
// DASHBOARD STATS (Headteacher)
// =========================
const statTeachers = document.getElementById("statTeachers");
const statNotes = document.getElementById("statNotes");
const statSummaries = document.getElementById("statSummaries");
const statClass = document.getElementById("statClass");

if (statTeachers) {
  db.collection("users").where("role", "==", "teacher").onSnapshot(snapshot => {
    statTeachers.textContent = snapshot.size;
  });
}
if (statNotes) {
  db.collection("lessonNotes").onSnapshot(snapshot => {
    statNotes.textContent = snapshot.size;
  });
}
if (statSummaries) {
  db.collection("summaries").onSnapshot(snapshot => {
    statSummaries.textContent = snapshot.size;
  });
}
if (statClass) {
  db.collection("attendanceHistory").orderBy("date").onSnapshot(snapshot => {
    if (!snapshot.empty) {
      const latest = snapshot.docs[snapshot.docs.length - 1].data();
      statClass.textContent = `${latest.boys} boys, ${latest.girls} girls`;
    } else {
      statClass.textContent = "0 boys, 0 girls";
    }
  });
}

// =========================
// TEACHER DASHBOARD STATS
// =========================
const mySummaries = document.getElementById("mySummaries");
const myNotes = document.getElementById("myNotes");
const myClass = document.getElementById("myClass");

if (mySummaries) {
  db.collection("summaries").onSnapshot(snapshot => {
    mySummaries.textContent = snapshot.size;
  });
}
if (myNotes) {
  db.collection("lessonNotes").onSnapshot(snapshot => {
    myNotes.textContent = snapshot.size;
  });
}
if (myClass) {
  db.collection("attendanceHistory").orderBy("date").onSnapshot(snapshot => {
    if (!snapshot.empty) {
      const latest = snapshot.docs[snapshot.docs.length - 1].data();
      myClass.textContent = `${latest.boys} boys, ${latest.girls} girls`;
    } else {
      myClass.textContent = "0 boys, 0 girls";
    }
  });
}

// =========================
// MANAGE TEACHERS (Headteacher)
// =========================
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

// =========================
// DOWNLOAD SUMMARIES
// =========================
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

// =========================
// DOWNLOAD NOTES
// =========================
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

// =========================
// THEME TOGGLES
// =========================
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

// =========================
// NAVIGATION
// =========================
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
