// ===== ELEMENT REFERENCES =====
const authorityImage = document.getElementById("authorityImage");
const authorityPreview = document.getElementById("authorityPreview");

const matchInfo = document.getElementById("matchInfo");
const confidence = document.getElementById("confidence");
const imageNotes = document.getElementById("imageNotes");

const dbPlaceholder = document.getElementById("dbPlaceholder");
const dbImage = document.getElementById("dbImage");

const details = document.getElementById("details");

const nameEl = document.getElementById("name");
const ageEl = document.getElementById("age");
const genderEl = document.getElementById("gender");
const contactEl = document.getElementById("contact");
const locationEl = document.getElementById("location");

const confirmBtn = document.getElementById("confirmBtn");
const denyBtn = document.getElementById("denyBtn");

let showRefBtn = document.getElementById("showRefBtn");

// ===== GLOBAL STATE =====
let currentMatchId = null;
let currentRefImageUrl = null;

const BASE_URL = "http://20.193.151.214:8000";

// ===== ENSURE BUTTON EXISTS =====
(function ensureShowRefButton() {
  if (!showRefBtn) {
    showRefBtn = document.createElement("button");
    showRefBtn.id = "showRefBtn";
    showRefBtn.textContent = "Show reference image";
    showRefBtn.style.display = "none";
    showRefBtn.style.marginTop = "12px";
    details.appendChild(showRefBtn);
  }
})();

// ===== TOGGLE DATABASE IMAGE =====
showRefBtn.addEventListener("click", () => {
  const isHidden = dbImage.style.display === "none";

  if (isHidden) {
    dbImage.style.display = "block";
    dbPlaceholder.style.display = "none";
    showRefBtn.textContent = "Hide reference image";
  } else {
    dbImage.style.display = "none";
    dbPlaceholder.style.display = "block";
    showRefBtn.textContent = "Show reference image";
  }
});

// ===== IMAGE UPLOAD HANDLER =====
authorityImage.addEventListener("change", async () => {
  const file = authorityImage.files?.[0];
  if (!file) return;

  authorityPreview.src = URL.createObjectURL(file);
  authorityPreview.style.display = "block";

  resetState();

  const formData = new FormData();
  formData.append("images", file);

  try {
    const res = await fetch(`${BASE_URL}/match-missing-person`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!data.matches || data.matches.length === 0) {
      confidence.textContent = "—";
      imageNotes.textContent =
        "No potential match found. Manual verification recommended.";
      matchInfo.style.display = "block";
      return;
    }

    const topMatch = data.matches[0];
    currentMatchId = topMatch.missing_person_id;

    confirmBtn.disabled = false;
    denyBtn.disabled = false;

    confidence.textContent = `${topMatch.confidence}%`;
    imageNotes.textContent =
      "AI suggests a possible match. Final verification must be done by authority.";

    matchInfo.style.display = "block";

    nameEl.textContent = topMatch.name || "Unknown";
    ageEl.textContent =
      topMatch.min_age && topMatch.max_age
        ? `${topMatch.min_age} – ${topMatch.max_age} years`
        : "Not specified";
    genderEl.textContent = topMatch.gender || "Not specified";
    contactEl.textContent = topMatch.contact || "Not available";
    locationEl.textContent = topMatch.location || "Not specified";

    // ===== DATABASE IMAGE LOGIC =====
    if (topMatch.reference_image) {
      let refPath = topMatch.reference_image.replace(/\\/g, "/");
      currentRefImageUrl = /^https?:\/\//i.test(refPath)
        ? refPath
        : `${BASE_URL}/${encodeURI(refPath)}`;

      dbImage.src = currentRefImageUrl;
      dbImage.style.display = "none";
      dbPlaceholder.style.display = "block";

      showRefBtn.style.display = "inline-block";
      showRefBtn.textContent = "Show reference image";
    } else {
      currentRefImageUrl = null;
      showRefBtn.style.display = "none";
    }

    details.style.display = "block";

  } catch (err) {
    console.error(err);
    confidence.textContent = "—";
    imageNotes.textContent = "System error. Please retry.";
    matchInfo.style.display = "block";
  }
});

// ===== DECISION HANDLERS =====
confirmBtn.addEventListener("click", () => submitDecision("confirm"));
denyBtn.addEventListener("click", () => submitDecision("deny"));

async function submitDecision(decision) {
  if (!currentMatchId) return;

  try {
    await fetch(`${BASE_URL}/authority-decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        missing_person_id: currentMatchId,
        decision
      })
    });

    alert(
      decision === "confirm"
        ? "Identity confirmed."
        : "Identity denied."
    );

    confirmBtn.disabled = true;
    denyBtn.disabled = true;

    // lock DB image
    dbImage.style.display = "none";
    dbPlaceholder.style.display = "block";
    showRefBtn.style.display = "none";

  } catch (err) {
    alert("Failed to record decision.");
  }
}

// ===== RESET =====
function resetState() {
  matchInfo.style.display = "none";
  details.style.display = "none";

  confidence.textContent = "";
  imageNotes.textContent = "";

  nameEl.textContent = "";
  ageEl.textContent = "";
  genderEl.textContent = "";
  contactEl.textContent = "";
  locationEl.textContent = "";

  confirmBtn.disabled = true;
  denyBtn.disabled = true;

  dbImage.style.display = "none";
  dbPlaceholder.style.display = "block";
  showRefBtn.style.display = "none";

  currentMatchId = null;
  currentRefImageUrl = null;
}