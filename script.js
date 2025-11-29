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
  signupForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("suEmail").value.trim();
    const password = document.getElementById("suPassword").value.trim();
    const fullName = document.getElementById("suFullName").value.trim();
    const username = document.getElementById("suUsername").value.trim().toLowerCase();
    const phone = document.getElementById("suPhone").value.trim();
    const role = document.getElementById("suRole").value;

    if (!email || !password || !role) return toast("Please fill all required fields");

    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection("users").doc(cred.user.uid).set({
        username,
        fullName,
        phone,
        email,
        role
      });
      toast("Account created successfully! Please log in.");
      signupForm.reset();
    } catch (err) {
      toast(err.message);
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

    try {
      await auth.signInWithEmailAndPassword(email, password);
      toast("Login successful!");
    } catch (err) {
      toast("Invalid login details: " + err.message);
    }
  });
}

// ---------------- USER GREETING + REDIRECT ----------------
auth.onAuthStateChanged(async user => {
  const userDisplay = document.getElementById("userDisplayName");
  if (user) {
    const doc = await db.collection("users").doc(user.uid).get();
    const data = doc.data();
    if (userDisplay) userDisplay.textContent = data?.fullName || data?.username || user.email;

    if (data?.role === "headteacher") {
      window.location.href = "headteacher.html";
    } else if (data?.role === "teacher") {
      window.location.href = "teacher.html";
    }
  }
});

// ---------------- LOGOUT ----------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    toast("Logged out!");
    setTimeout(() => window.location.href = "index.html", 1500);
  });
}

// ---------------- HEADTEACHER ANNOUNCEMENTS ----------------
const postBtn = document.getElementById("postAnnouncementBtn");
const announcementInput = document.getElementById("announcementInput");
const announcementList = document.getElementById("announcementList");

if (postBtn && announcementInput && announcementList) {
  postBtn.addEventListener("click", async () => {
    const text = announcementInput.value.trim();
    if (!text) return toast("Please write an announcement");
    await db.collection("announcements").add({
      text,
      date: new Date().toISOString()
    });
    announcementInput.value = "";
    toast("Announcement posted!");
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
    if (!note) return toast("Please enter your notes");
    const user = auth.currentUser;
    await db.collection("lessonNotes").add({
      note,
      uid: user.uid,
      date: new Date().toISOString()
    });
    notesInput.value = "";
    toast("Lesson notes submitted!");
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
    if (!text) return toast("Please write a summary");
    const user = auth.currentUser;
    await db.collection("summaries").add({
      text,
      uid: user.uid,
      date: new Date().toISOString()
    });
    summaryInput.value = "";
    toast("Summary submitted!");
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

// ---------------- TEACHER CLASS NUMBERS ----------------
const boysInput = document.getElementById("boysInput");
const girlsInput = document.getElementById("girlsInput");
const updateClassBtn = document.getElementById("updateClassBtn");
const classDisplay = document.getElementById("classDisplay");

if (updateClassBtn && boysInput && girlsInput && classDisplay) {
  updateClassBtn.addEventListener("click", async () => {
    const boys = parseInt(boysInput.value.trim(), 10);
    const girls = parseInt(girlsInput.value.trim(), 10);
    if (isNaN(boys) || isNaN(girls)) return toast("Enter valid numbers");

    const record = { boys, girls, date: new Date().toLocaleString() };
    const user = auth.currentUser;
    await db.collection("attendanceHistory").add({
      ...record,
      uid: user.uid
    });

    classDisplay.textContent = `Boys: ${boys}, Girls: ${girls}`;
    toast("Class numbers updated!");
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
    if (!user) return toast("No user logged in");

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

      toast("Settings updated successfully!");
    } catch (err) {
      toast("Error updating settings: " + err.message);
    }
  });
}

// ---------------- HEADTEACHER SUMMARY STATS ----------------
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

// ---------------- TEACHER ANNOUNCEMENTS (sync from Headteacher) ----------------
const teacherAnnouncements = document.getElementById("teacherAnnouncements");
if (teacherAnnouncements) {
  db.collection("announcements").orderBy("date").onSnapshot(snapshot => {
    teacherAnnouncements.innerHTML = "";
    snapshot.forEach(doc => {
      const div = document.createElement("div");
      div.textContent = doc.data().text;
      teacherAnnouncements.appendChild(div);
    });
  });
}

// ---------------- TEACHER SUMMARY STATS ----------------
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

// ---------------- NAVIGATION ----------------
const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll("main section, .main > .grid");

if (navItems.length && sections.length) {
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      // remove active highlight
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      // hide all sections
      sections.forEach(sec => sec.classList.add("hidden"));

      // show target section
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

  // Ensure dashboard visible on initial load
  const defaultDashboard = document.getElementById("dashboardSection");
  if (defaultDashboard) defaultDashboard.classList.remove("hidden");
}
