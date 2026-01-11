document.addEventListener("DOMContentLoaded", () => {

  // ===== ELEMENT REFERENCES =====
  const signupBtn = document.getElementById("signupBtn");
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("consentModal");
  const checkbox = document.getElementById("consentCheck");
  const submitBtn = document.getElementById("submitBtn");

  const form = document.querySelector("form");
  const usernameInput = form.querySelector("input[type='text']");
  const passwordInput = form.querySelector("input[type='password']");

  let consentGiven = false;
  let authMode = "login"; // "login" | "signup"

  // ===== OPEN CONSENT MODAL =====
  signupBtn.addEventListener("click", () => {
    authMode = "signup";
    overlay.classList.add("active");
    modal.classList.add("active");
  });

  // ===== CLOSE MODAL =====
  overlay.addEventListener("click", resetConsentState);

  function resetConsentState() {
    overlay.classList.remove("active");
    modal.classList.remove("active");
    checkbox.checked = false;
    submitBtn.disabled = true;
    consentGiven = false;
    authMode = "login";
  }

  // ===== ENABLE SUBMIT =====
  checkbox.addEventListener("change", () => {
    submitBtn.disabled = !checkbox.checked;
  });

  // ===== ACCEPT CONSENT =====
  submitBtn.addEventListener("click", () => {
    consentGiven = true;
    overlay.classList.remove("active");
    modal.classList.remove("active");
  });

  // ===== FORM SUBMISSION =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      alert("Missing credentials");
      return;
    }

    if (authMode === "signup" && !consentGiven) {
      alert("Accept Terms & Conditions first");
      return;
    }

    const endpoint =
      authMode === "signup"
        ? "http://20.193.151.214:8000/authority/signup"
        : "http://20.193.151.214:8000/authority/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      // ===== USER ALREADY EXISTS HANDLING =====
      if (!response.ok) {
        if (
          authMode === "signup" &&
          data.detail === "USER_ALREADY_EXISTS"
        ) {
          alert("Account exists. Redirecting to dashboard.");

          if (data.token) {
            localStorage.setItem("authority_token", data.token);
          }

          window.location.href = "authority-dashboard.html";
          return;
        }

        alert(data.detail || "Request failed");
        return;
      }

      // ===== SUCCESS =====
      if (authMode === "signup") {
        alert("Signup successful. Please login.");
        resetConsentState();
      } else {
        alert("Login successful");
        localStorage.setItem("authority_token", data.token);
        window.location.href = "authority-dashboard.html";
      }

    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    }
  });
});