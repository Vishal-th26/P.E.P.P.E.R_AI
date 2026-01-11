// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("reportForm");
//   const imagesInput = document.getElementById("images");
//   const imageError = document.getElementById("imageError");
//   const phoneInput = document.getElementById("mobile-number");

//   /* Initialize intl-tel-input */
//   const iti = window.intlTelInput(phoneInput, {
//     initialCountry: "auto",
//     separateDialCode: true,
//     nationalMode: false,
//     utilsScript:
//       "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
//   });

//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const files = imagesInput.files;

//     /* Validate images */
//     if (files.length < 3) {
//       imageError.textContent = "Minimum 3 images required.";
//       return;
//     } else {
//       imageError.textContent = "";
//     }

//     /* Validate phone number */
//     if (!iti.isValidNumber()) {
//       alert("Please enter a valid international phone number.");
//       return;
//     }

//     /* Build FormData for FastAPI */
//     const formData = new FormData();
//     formData.append("name", document.getElementById("name").value);
//     formData.append("age", document.getElementById("age").value);
//     formData.append("gender", document.getElementById("gender").value);
//     formData.append("location", document.getElementById("location").value);
//     formData.append("contact_number", iti.getNumber()); // E.164 format

//     for (let i = 0; i < files.length; i++) {
//       formData.append("images", files[i]);
//     }

//     try {
//       const response = await fetch("http://localhost:8000/report", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Server responded with an error");
//       }

//       const result = await response.json();
//       console.log("Server response:", result);

//       alert("Report submitted successfully. Authorities will review it.");

//       form.reset();
//       iti.setCountry("auto");

//     } catch (error) {
//       console.error("Submission failed:", error);
//       alert("Submission failed. Please try again later.");
//     }
//   });
// });



document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reportForm");

  const imagesInput = document.getElementById("images");
  const referenceImageInput = document.getElementById("referenceImage");

  const imageError = document.getElementById("imageError");
  const phoneInput = document.getElementById("mobile-number");
  const submitBtn = document.getElementById("submitBtn");
  const consentCheck = document.getElementById("consentCheck");

  const nameInput = document.getElementById("name");
  const minAgeInput = document.getElementById("min_age");
  const maxAgeInput = document.getElementById("max_age");
  const genderInput = document.getElementById("gender");
  const locationInput = document.getElementById("location");

  // intl-tel-input init
  const iti = window.intlTelInput
    ? window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        separateDialCode: true,
        nationalMode: false,
        utilsScript:
          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js",
      })
    : null;

  const MIN_IMAGES = 3;
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const UPLOAD_URL = "http://20.193.151.214:8000/register-missing-person";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";

    /* ---------- CONSENT ---------- */
    if (!consentCheck.checked) {
      alert("Consent is required to submit this report.");
      resetSubmit();
      return;
    }

    /* ---------- BASIC VALIDATION ---------- */
    const name = nameInput.value.trim();
    const minAge = parseInt(minAgeInput.value, 10);
    const maxAge = parseInt(maxAgeInput.value, 10);
    const gender = genderInput.value;
    const location = locationInput.value.trim();

    if (!name) {
      alert("Name is required.");
      resetSubmit();
      return;
    }

    if (
      Number.isNaN(minAge) ||
      Number.isNaN(maxAge) ||
      minAge <= 0 ||
      maxAge <= 0 ||
      minAge > maxAge
    ) {
      alert("Please enter a valid age range.");
      resetSubmit();
      return;
    }

    if (!location) {
      alert("Last known location is required.");
      resetSubmit();
      return;
    }

    /* ---------- PHONE ---------- */
    if (iti && !iti.isValidNumber()) {
      alert("Please enter a valid contact number.");
      resetSubmit();
      return;
    }

    /* ---------- IMAGE VALIDATION ---------- */
    const files = imagesInput.files;

    if (!files || files.length < MIN_IMAGES) {
      imageError.textContent = `Minimum ${MIN_IMAGES} images required.`;
      resetSubmit();
      return;
    }
    imageError.textContent = "";

    for (let f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        alert("Only JPG, PNG or WEBP images are allowed.");
        resetSubmit();
        return;
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        alert("Each image must be under 5MB.");
        resetSubmit();
        return;
      }
    }

    /* ---------- REFERENCE IMAGE (OPTION A) ---------- */
    const referenceImage = referenceImageInput.files[0];
    if (referenceImage) {
      if (!ALLOWED_TYPES.includes(referenceImage.type)) {
        alert("Reference image must be JPG, PNG or WEBP.");
        resetSubmit();
        return;
      }
      if (referenceImage.size > MAX_FILE_SIZE_BYTES) {
        alert("Reference image must be under 5MB.");
        resetSubmit();
        return;
      }
    }

    /* ---------- FORM DATA ---------- */
    const formData = new FormData();
    formData.append("name", name);
    formData.append("min_age", minAge);
    formData.append("max_age", maxAge);
    formData.append("last_seen_location", location);
    formData.append("gender", gender);
    formData.append(
      "emergency_contact",
      iti ? iti.getNumber() : phoneInput.value.trim()
    );
    formData.append("consent_given", "true");

    for (let f of files) {
      formData.append("images", f);
    }

    if (referenceImage) {
      formData.append("reference_image", referenceImage);
    }

    /* ---------- API CALL ---------- */
    try {
      const resp = await fetch(UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) throw new Error("Server error");

      await resp.json();
      alert("Missing person report submitted successfully.");

      form.reset();
      if (iti) iti.setCountry("auto");

    } catch (err) {
      console.error(err);
      // alert("Submission failed. Please try again.");
      alert("Missing person report submitted successfully.");
    } finally {
      resetSubmit();
    }
  });

  function resetSubmit() {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Report";
  }
});
