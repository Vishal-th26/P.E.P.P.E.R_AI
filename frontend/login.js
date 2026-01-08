// document.addEventListener("DOMContentLoaded", () => {

//   // ===== ELEMENT REFERENCES =====
//   const signupBtn = document.getElementById("signupBtn");
//   const overlay = document.getElementById("overlay");
//   const modal = document.getElementById("consentModal");
//   const checkbox = document.getElementById("consentCheck");
//   const submitBtn = document.getElementById("submitBtn");
//   const form = document.getElementById("loginForm");

//   let consentGiven = false;
//   let authMode = "login"; // "login" or "signup"

//   // ===== SIGNUP BUTTON =====
//   signupBtn.addEventListener("click", () => {
//     authMode = "signup";
//     overlay.classList.add("active");
//     modal.classList.add("active");
//   });

//   // ===== CLOSE MODAL (CANCEL) =====
//   overlay.addEventListener("click", () => {
//     overlay.classList.remove("active");
//     modal.classList.remove("active");
//     checkbox.checked = false;
//     submitBtn.disabled = true;
//     consentGiven = false;
//     authMode = "login";
//   });

//   // ===== ENABLE SUBMIT ONLY IF CHECKED =====
//   checkbox.addEventListener("change", () => {
//     submitBtn.disabled = !checkbox.checked;
//   });

//   // ===== ACCEPT CONSENT =====
//   submitBtn.addEventListener("click", () => {
//     consentGiven = true;
//     overlay.classList.remove("active");
//     modal.classList.remove("active");
//   });

//   // ===== FORM SUBMISSION (LOGIN / SIGNUP) =====
//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const username = document.getElementById("username").value.trim();
//     const password = document.getElementById("password").value;

//     if (!username || !password) {
//       alert("Missing credentials");
//       return;
//     }

//     // Signup requires consent
//     if (authMode === "signup" && !consentGiven) {
//       alert("Please accept the Terms & Conditions before signing up.");
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:8000/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ username, password })
//       });

//       let data = {};
//       try {
//         data = await response.json();
//       } catch {}

//       if (!response.ok) {
//         alert(data.detail || "Request failed");
//         return;
//       }

//       if (authMode === "signup") {
//         alert("Signup successful. You can now log in.");
//         consentGiven = false;
//         authMode = "login";
//         checkbox.checked = false;
//         submitBtn.disabled = true;
//       } else {
//         alert("Login successful");
//         // TODO: store JWT + redirect
//       }

//     } catch (error) {
//       console.error(error);
//       alert("Backend not reachable");
//     }
//   });

// });

//---------------------------------------------------------------------------------------------------------------------


document.addEventListener("DOMContentLoaded", () => {

  // ===== ELEMENT REFERENCES =====
  const signupBtn = document.getElementById("signupBtn");
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("consentModal");
  const checkbox = document.getElementById("consentCheck");
  const submitBtn = document.getElementById("submitBtn");
  const form = document.getElementById("loginForm");

  let consentGiven = false;
  let authMode = "login"; // "login" | "signup"

  // ===== OPEN CONSENT MODAL FOR SIGNUP =====
  signupBtn.addEventListener("click", () => {
    authMode = "signup";
    overlay.classList.add("active");
    modal.classList.add("active");
  });

  // ===== CLOSE MODAL (CANCEL) =====
  overlay.addEventListener("click", resetConsentState);

  function resetConsentState() {
    overlay.classList.remove("active");
    modal.classList.remove("active");
    checkbox.checked = false;
    submitBtn.disabled = true;
    consentGiven = false;
    authMode = "login";
  }

  // ===== ENABLE SUBMIT ONLY IF CHECKED =====
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

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
      alert("Missing credentials");
      return;
    }

    if (authMode === "signup" && !consentGiven) {
      alert("Accept Terms & Conditions before signing up.");
      return;
    }

    const endpoint =
      authMode === "signup"
        ? "http://127.0.0.1:8000/signup"
        : "http://localhost:8000/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Request failed");
        return;
      }

      if (authMode === "signup") {
        alert("Signup successful. Please log in.");
        resetConsentState();
      } else {
        alert("Login successful");
        localStorage.setItem("token", data.token);
         window.location.href = "user-dashboard.html";
      }

    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    }
  });
});


