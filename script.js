// Utility: show toast messages
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

    if (!user) {
      return toast("Invalid login details");
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    toast("Login successful!");

    // Redirect by role
    if (user.role === "headteacher") {
      window.location.href = "headteacher.html";
    } else if (user.role === "teacher") {
      window.location.href = "teacher.html";
    }
  });
}
