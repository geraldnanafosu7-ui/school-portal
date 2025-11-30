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
// WELCOME MESSAGE
// =========================
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const doc = await db.collection("users").doc(user.uid).get();
    const welcomeEl = document.getElementById("welcomeMessage");
    if (welcomeEl && doc.exists) {
      const data = doc.data();
      welcomeEl.textContent = `Welcome, ${data.username || data.fullName || user.email.split('@')[0]} 👋`;
    }
  }
});

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
      div.className = "announcement-card fade-in";
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
      div.className = "announcement-card fade-in";
      div.textContent = doc.data().text;
      if (list) list.appendChild(div);
    });
  });
}

// =========================
// ATTENDANCE (Teacher + Headteacher)
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

    let html = "<table class='attendance-table fade-in'><tr><th>Date</th><th>Boys</th><th>Girls</th></tr>";
    snapshot.forEach(doc => {
      const rec = doc.data();
      html += `<tr>
                 <td>${new Date(rec.date).toLocaleString()}</td>
                 <td>${rec.boys}</td>
                 <td>${rec.girls}</td>
               </tr>`;
    });
    html += "</table>";
    report.innerHTML = html;
  });
}
