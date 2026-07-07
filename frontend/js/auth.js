// Login & register page logic.
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuth(data.token, data.user);
    toast("Welcome back!");
    const dest = data.user.role === "admin" ? "admin/index.html" : "dashboard.html";
    setTimeout(() => (window.location.href = dest), 600);
  } catch (err) {
    toast(err.message);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  try {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setAuth(data.token, data.user);
    toast("Account created!");
    setTimeout(() => (window.location.href = "dashboard.html"), 600);
  } catch (err) {
    toast(err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (registerForm) registerForm.addEventListener("submit", handleRegister);
});
