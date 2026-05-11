/* =========================================================
   CONTACT.JS — Dark Theme / Modern UI (matches your gym.css)
   Drop-in replacement for your current contact.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  const formKey = "alphaGymContactForm";

  const nameInput = form.querySelector('input[name="Name"]');
  const emailInput = form.querySelector('input[name="Email"]');
  const phoneInput = form.querySelector('input[name="Phone"]');
  const messageInput = form.querySelector('textarea[name="Message"]');
  const paymentSelect = form.querySelector('select[name="Payment Method"]');

  const clearBtn = document.querySelector(".clear-btn");
  const submitBtn = form.querySelector(".form-btn");

  const MAX_MESSAGE_LENGTH = 300;

  /* ==========================
     1) Inject Theme Styles (for JS-made UI)
     - Progress bar
     - Draft popup
     - Payment info
     - Success modal
     - Phone modal
  ========================== */
  const injectStyle = document.createElement("style");
  injectStyle.textContent = `
    /* --- JS UI: shared --- */
    .ui-card {
      border-radius: 18px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
    }

    /* --- Scroll progress bar (top) --- */
    #scrollProgress{
      position: fixed;
      top: 0; left: 0;
      height: 4px;
      width: 0%;
      z-index: 2000;
      background: rgba(99, 102, 241, 0.9);
      box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25);
    }

    /* --- Draft popup --- */
    .draft-popup{
      position: fixed;
      right: 18px;
      bottom: 90px;
      z-index: 2000;
      padding: 10px 12px;
      border-radius: 999px;
      font-weight: 900;
      letter-spacing: .2px;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 200ms ease, transform 200ms ease;
      background: rgba(34, 211, 238, 0.16);
      border: 1px solid rgba(34, 211, 238, 0.30);
      box-shadow: 0 18px 45px rgba(0,0,0,0.55);
      color: rgba(232,238,247,0.95);
      user-select: none;
      pointer-events: none;
    }
    .draft-popup.show{
      opacity: 1;
      transform: translateY(0);
    }

    /* --- Form completion bar --- */
    .form-progress-wrap{
      margin-bottom: 14px;
      padding: 14px 14px;
      border-radius: 18px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
    }
    .form-progress-text{
      font-size: 12px;
      font-weight: 800;
      color: rgba(232,238,247,0.75);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .form-progress-bar{
      height: 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08);
      overflow: hidden;
    }
    .form-progress-fill{
      height: 100%;
      width: 0%;
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(34,211,238,0.85), rgba(99,102,241,0.85));
      transition: width 250ms ease;
    }

    /* --- Payment info box --- */
    .payment-info{
      margin-top: 10px;
      padding: 12px 12px;
      border-radius: 16px;
      display: none;
      font-size: 0.95rem;
      color: rgba(232,238,247,0.78);
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
    }
    .payment-info strong{ color: rgba(232,238,247,0.92); }

    /* --- Character counter --- */
    .char-counter{
      font-size: 12px;
      text-align: right;
      margin-top: 6px;
      color: rgba(232,238,247,0.55);
      font-weight: 800;
    }

    /* --- Valid / invalid visuals (instead of harsh inline borders) --- */
    .is-valid{
      border-color: rgba(34,197,94,0.55) !important;
      box-shadow: 0 0 0 4px rgba(34,197,94,0.10) !important;
    }
    .is-invalid{
      border-color: rgba(239,68,68,0.65) !important;
      box-shadow: 0 0 0 4px rgba(239,68,68,0.10) !important;
    }

    /* --- Success Modal --- */
    .success-modal{
      position: fixed;
      inset: 0;
      z-index: 4000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
    }
    .success-backdrop{
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(6px);
    }
    .success-box{
      position: relative;
      z-index: 2;
      width: min(460px, 94%);
      padding: 18px 16px;
      border-radius: 18px;
      background: rgba(12,16,22,0.92);
      border: 1px solid rgba(255,255,255,0.10);
      box-shadow: 0 22px 60px rgba(0,0,0,0.65);
      text-align: center;
      transform: translateY(6px);
      animation: popIn 200ms ease forwards;
    }
    .success-box h2{
      margin: 0 0 8px;
      font-size: 1.4rem;
    }
    .success-box p{
      margin: 0 0 14px;
      color: rgba(232,238,247,0.75);
    }
    .success-actions{
      display: grid;
      gap: 10px;
    }
    .success-btn{
      width: 100%;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: #fff;
      font-weight: 900;
      cursor: pointer;
      transition: transform 160ms ease, background 160ms ease, border 160ms ease;
    }
    .success-btn.primary{
      background: rgba(99,102,241,0.26);
      border: 1px solid rgba(99,102,241,0.48);
      box-shadow: 0 14px 28px rgba(99,102,241,0.16);
    }
    .success-btn:hover{
      transform: translateY(-1px);
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
    }
    @keyframes popIn{
      to { transform: translateY(0); }
    }

    /* --- Phone Modal --- */
    #phoneModal{
      position: fixed;
      inset: 0;
      display: none;
      z-index: 4500;
      padding: 18px;
    }
    .phone-modal-backdrop{
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.65);
      backdrop-filter: blur(6px);
    }
    .phone-modal{
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%) scale(0.96);
      width: min(420px, 94%);
      background: rgba(12,16,22,0.92);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 18px;
      box-shadow: 0 22px 60px rgba(0,0,0,0.65);
      color: rgba(232,238,247,0.92);
      padding: 18px 16px;
      text-align: center;
      animation: phonePop 180ms ease forwards;
    }
    @keyframes phonePop{
      to { transform: translate(-50%,-50%) scale(1); }
    }
    .phone-modal h3{
      margin: 0 0 8px;
    }
    .phone-number{
      margin: 12px 0;
      font-size: 1.2rem;
      letter-spacing: 1px;
      color: rgba(232,238,247,0.85);
    }
    .phone-actions{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .phone-actions button{
      border: 1px solid rgba(255,255,255,0.12);
      padding: 12px 14px;
      border-radius: 14px;
      cursor: pointer;
      background: rgba(255,255,255,0.06);
      color: #fff;
      font-weight: 900;
      transition: transform 160ms ease, background 160ms ease, border 160ms ease;
    }
    .phone-actions button:hover{
      transform: translateY(-1px);
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.18);
    }
    #copyNumber{
      background: rgba(34,211,238,0.16);
      border: 1px solid rgba(34,211,238,0.30);
    }
    #closeModal{
      background: rgba(239,68,68,0.14);
      border: 1px solid rgba(239,68,68,0.30);
    }

    /* --- Small tap animation --- */
    .call-animate{
      animation: tapPulse 220ms ease;
    }
    @keyframes tapPulse{
      50% { transform: scale(0.98); }
    }
  `;
  document.head.appendChild(injectStyle);

  /* ==========================
     2) Scroll progress bar (top)
  ========================== */
  let scrollBar = document.getElementById("scrollProgress");
  if (!scrollBar) {
    scrollBar = document.createElement("div");
    scrollBar.id = "scrollProgress";
    document.body.appendChild(scrollBar);
  }

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollBar.style.width = progress + "%";
  });

  /* ==========================
     3) Progress bar (form completion)
  ========================== */
  const progressWrap = document.createElement("div");
  progressWrap.className = "form-progress-wrap";

  const progressText = document.createElement("div");
  progressText.className = "form-progress-text";
  progressText.innerHTML = `<span>Form Completion</span><span id="progressPercent">0%</span>`;

  const progressBar = document.createElement("div");
  progressBar.className = "form-progress-bar";

  const progressFill = document.createElement("div");
  progressFill.className = "form-progress-fill";

  progressBar.appendChild(progressFill);
  progressWrap.appendChild(progressText);
  progressWrap.appendChild(progressBar);

  form.prepend(progressWrap);

  const progressPercentEl = progressText.querySelector("#progressPercent");

  function updateProgress() {
    const requiredFields = [...form.querySelectorAll("[required]")];
    const filled = requiredFields.filter((f) =>
      (f.value || "").toString().trim(),
    ).length;
    const percent = Math.round((filled / requiredFields.length) * 100);

    progressFill.style.width = percent + "%";
    progressPercentEl.textContent = percent + "%";
  }

  /* ==========================
     4) Payment info box (theme)
  ========================== */
  const paymentInfo = document.createElement("div");
  paymentInfo.className = "payment-info";
  paymentSelect?.parentElement?.appendChild(paymentInfo);

  function updatePaymentInfo() {
    if (!paymentSelect) return;
    const method = paymentSelect.value;

    if (!method) {
      paymentInfo.style.display = "none";
      return;
    }

    paymentInfo.style.display = "block";

    if (method === "GCash") {
      paymentInfo.innerHTML =
        "📱 <strong>GCash:</strong> Payment instructions will be sent after you submit the form.";
    } else if (method === "Online Bank") {
      paymentInfo.innerHTML =
        "🏦 <strong>Online Bank:</strong> Bank details will be sent after you submit the form.";
    } else if (method === "Cash") {
      paymentInfo.innerHTML =
        "💵 <strong>Cash:</strong> Pay at the front desk when you visit Alpha Gym.";
    } else {
      paymentInfo.style.display = "none";
    }
  }

  paymentSelect?.addEventListener("change", () => {
    updatePaymentInfo();
    updateProgress();
  });

  /* ==========================
     5) Draft popup (theme)
  ========================== */
  const popup = document.createElement("div");
  popup.className = "draft-popup";
  popup.textContent = "Draft Saved ✅";
  document.body.appendChild(popup);

  let popupTimer;
  function showPopup() {
    clearTimeout(popupTimer);
    popup.classList.add("show");
    popupTimer = setTimeout(() => popup.classList.remove("show"), 900);
  }

  /* ==========================
     6) Character counter (theme)
  ========================== */
  const counter = document.createElement("div");
  counter.className = "char-counter";
  counter.textContent = `0 / ${MAX_MESSAGE_LENGTH}`;
  messageInput?.parentElement?.appendChild(counter);

  function updateCounter() {
    if (!messageInput) return;

    const length = messageInput.value.length;
    if (length > MAX_MESSAGE_LENGTH) {
      messageInput.value = messageInput.value.slice(0, MAX_MESSAGE_LENGTH);
    }
    counter.textContent = `${messageInput.value.length} / ${MAX_MESSAGE_LENGTH}`;

    const ratio = messageInput.value.length / MAX_MESSAGE_LENGTH;
    if (ratio > 0.9) counter.style.color = "rgba(245, 158, 11, 0.95)";
    else counter.style.color = "rgba(232,238,247,0.55)";
  }

  /* ==========================
     7) Validation helpers (theme classes)
  ========================== */
  function setValid(input) {
    if (!input) return;
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  }

  function setInvalid(input) {
    if (!input) return;
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
  }

  function validateEmail() {
    if (!emailInput) return;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    pattern.test(emailInput.value.trim())
      ? setValid(emailInput)
      : setInvalid(emailInput);
  }

  function validatePhone() {
    if (!phoneInput) return;
    const digits = phoneInput.value.replace(/\D/g, "");
    digits.length === 11 ? setValid(phoneInput) : setInvalid(phoneInput);
  }

  function validateRequired(input) {
    if (!input) return;
    input.value.trim() ? setValid(input) : setInvalid(input);
  }

  /* ==========================
     8) Phone auto format
  ========================== */
  function formatPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length < 11) return digits;
    return digits.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
  }

  phoneInput?.addEventListener("input", () => {
    phoneInput.value = formatPhone(phoneInput.value);
    validatePhone();
    updateProgress();
  });

  /* ==========================
     9) Live validation
  ========================== */
  nameInput?.addEventListener("input", () => {
    validateRequired(nameInput);
    updateProgress();
  });

  emailInput?.addEventListener("input", () => {
    validateEmail();
    updateProgress();
  });

  messageInput?.addEventListener("input", () => {
    validateRequired(messageInput);
    updateCounter();
    updateProgress();
  });

  form.addEventListener("change", updateProgress);

  /* ==========================
     10) Load saved data
  ========================== */
  const savedData = JSON.parse(localStorage.getItem(formKey)) || {};
  [...form.elements].forEach((field) => {
    if (field.name && savedData[field.name]) {
      field.value = savedData[field.name];
    }
  });

  updateCounter();
  updateProgress();
  updatePaymentInfo();

  /* ==========================
     11) Save draft
  ========================== */
  let draftTimer;
  form.addEventListener("input", () => {
    const data = {};
    [...form.elements].forEach((field) => {
      if (field.name) data[field.name] = field.value;
    });
    localStorage.setItem(formKey, JSON.stringify(data));

    // debounce popup so it doesn't flash too much
    clearTimeout(draftTimer);
    draftTimer = setTimeout(showPopup, 150);
  });

  /* ==========================
     12) Clear form
  ========================== */
  clearBtn?.addEventListener("click", () => {
    if (!confirm("Are you sure you want to clear the form?")) return;

    form.reset();
    localStorage.removeItem(formKey);

    // remove validation styles
    [nameInput, emailInput, phoneInput, messageInput].forEach((el) => {
      if (!el) return;
      el.classList.remove("is-valid", "is-invalid");
    });

    paymentInfo.style.display = "none";
    updateCounter();
    updateProgress();
  });

  /* ==========================
     13) Success modal (theme)
     NOTE: Formspree redirects by default.
     To show modal without leaving page, prevent default + fetch.
  ========================== */
  function showSuccessMessage() {
    const modal = document.createElement("div");
    modal.className = "success-modal";

    modal.innerHTML = `
      <div class="success-backdrop"></div>
      <div class="success-box">
        <h2>✅ Message Sent!</h2>
        <p>Thank you for contacting Alpha Gym. We'll get back to you soon.</p>
        <div class="success-actions">
          <button class="success-btn primary" id="successClose">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector("#successClose")?.addEventListener("click", close);
    modal.querySelector(".success-backdrop")?.addEventListener("click", close);
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") close();
      },
      { once: true },
    );
  }

  // Intercept submit and send via fetch so you stay on the page.
  form.addEventListener("submit", async (e) => {
    // If you prefer normal Formspree redirect, delete this whole submit listener.
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    try {
      const formData = new FormData(form);

      const res = await fetch(form.action, {
        method: form.method || "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        showSuccessMessage();
        form.reset();
        localStorage.removeItem(formKey);
        paymentInfo.style.display = "none";
        updateCounter();
        updateProgress();

        [nameInput, emailInput, phoneInput, messageInput].forEach((el) => {
          if (!el) return;
          el.classList.remove("is-valid", "is-invalid");
        });
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Network error. Please check your internet and try again.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }
  });

  /* =========================================================
     PHONE MODAL (Desktop) + Direct Call (Mobile)
     Uses your existing #phoneLink
  ========================================================= */
  const phoneLink = document.getElementById("phoneLink");
  if (phoneLink) {
    const PHONE_NUMBER = "0954 302 9792";
    const PHONE_TEL = "+639543029792";

    // Create modal once
    let phoneModal = document.getElementById("phoneModal");
    if (!phoneModal) {
      phoneModal = document.createElement("div");
      phoneModal.id = "phoneModal";
      phoneModal.innerHTML = `
        <div class="phone-modal-backdrop"></div>
        <div class="phone-modal">
          <h3>📞 Call Us</h3>
          <p class="phone-number">${PHONE_NUMBER}</p>
          <div class="phone-actions">
            <button id="copyNumber">📋 Copy</button>
            <button id="closeModal">❌ Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(phoneModal);
    }

    function isMobile() {
      return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    function showModal() {
      phoneModal.style.display = "block";
    }

    function hideModal() {
      phoneModal.style.display = "none";
    }

    phoneLink.addEventListener("click", (e) => {
      if (isMobile()) {
        phoneLink.classList.add("call-animate");
        setTimeout(() => {
          phoneLink.classList.remove("call-animate");
          window.location.href = `tel:${PHONE_TEL}`;
        }, 150);
      } else {
        e.preventDefault();
        showModal();
      }
    });

    phoneModal
      .querySelector("#closeModal")
      ?.addEventListener("click", hideModal);
    phoneModal
      .querySelector(".phone-modal-backdrop")
      ?.addEventListener("click", hideModal);

    phoneModal
      .querySelector("#copyNumber")
      ?.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(PHONE_NUMBER);
          const btn = phoneModal.querySelector("#copyNumber");
          btn.textContent = "✅ Copied";
          setTimeout(() => (btn.textContent = "📋 Copy"), 1200);
        } catch {
          alert("Copy failed. Please copy manually: " + PHONE_NUMBER);
        }
      });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideModal();
    });
  }

  /* =========================================================
     Contact page reveal animation (your HTML uses .reveal)
     Adds .show as you scroll
  ========================================================= */
  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
      });
    },
    { threshold: 0.15 },
  );
  revealItems.forEach((el) => revealObserver.observe(el));
});

document.addEventListener("DOMContentLoaded", () => {
  // ===== Booking buttons -> auto-fill inquiry dropdown =====
  const inquiry = document.getElementById("inquiryType");
  document.querySelectorAll(".booking-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-fill");
      if (inquiry) inquiry.value = value;
      document
        .getElementById("contactForm")
        ?.scrollIntoView({ behavior: "smooth" });
    });
  });

  // ===== Clear form button =====
  const clearBtn = document.getElementById("clearForm");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const form = document.querySelector(".contact-form-container form");
      form?.reset();
    });
  }

  // ===== Branch selector data =====
  const branchData = {
    north: {
      address: "Gym Branch 1",
      phoneDisplay: "0969 482 8850",
      phoneTel: "09xxxxxxxxx",
      hours: "Mon – Sun: 6:00 AM – 10:00 PM",
      map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.3919758625643!2d120.97249247517578!3d14.633677176265847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b5c2be868bd5%3A0x664960ab70cb4248!2sRoshan%20Gym!5e0!3m2!1sen!2sph!4v1778498505419!5m2!1sen!2sph",
      directions:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.3919758625643!2d120.97249247517578!3d14.633677176265847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b5c2be868bd5%3A0x664960ab70cb4248!2sRoshan%20Gym!5e0!3m2!1sen!2sph!4v1778498505419!5m2!1sen!2sph",
      img: "../Images/gym-demo1.jpeg",
    },
    south: {
      address: "Gym Branch 2",
      phoneDisplay: "0969 482 8850",
      phoneTel: "09xxxxxxxxx",
      hours: "Mon – Sun: 6:00 AM – 10:00 PM",
      map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.3919758625643!2d120.97249247517578!3d14.633677176265847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b5c2be868bd5%3A0x664960ab70cb4248!2sRoshan%20Gym!5e0!3m2!1sen!2sph!4v1778498505419!5m2!1sen!2sph",
      directions:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3860.3919758625643!2d120.97249247517578!3d14.633677176265847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b5c2be868bd5%3A0x664960ab70cb4248!2sRoshan%20Gym!5e0!3m2!1sen!2sph!4v1778498505419!5m2!1sen!2sph",
      img: "../Images/alpha-pic-1.png",
    },
  };

  const picker = document.getElementById("branchPicker");
  const map = document.getElementById("branchMap");
  const addr = document.getElementById("branchAddress");
  const phone = document.getElementById("branchPhone");
  const hours = document.getElementById("branchHours");
  const directions = document.getElementById("branchDirections");
  const copyBtn = document.getElementById("copyBranch");

  const setBranch = (key) => {
    const b = branchData[key];
    if (!b) return;
    if (addr) addr.textContent = b.address;
    if (phone) {
      phone.textContent = b.phoneDisplay;
      phone.href = `tel:${b.phoneTel}`;
    }
    if (hours) hours.textContent = b.hours;
    if (map) map.src = b.map;
    if (directions) directions.href = b.directions;
  };

  if (picker) {
    picker.addEventListener("change", () => setBranch(picker.value));
    setBranch(picker.value);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = addr?.textContent || "";
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy Address"), 1200);
      } catch {
        copyBtn.textContent = "Copy failed";
        setTimeout(() => (copyBtn.textContent = "Copy Address"), 1200);
      }
    });
  }

  // ===== FAQ Accordion =====
  document.querySelectorAll(".faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      // close others
      document.querySelectorAll(".faq-q").forEach((other) => {
        if (other !== q) other.classList.remove("active");
      });
      q.classList.toggle("active");
    });
  });
});

const params = new URLSearchParams(window.location.search);
const type = params.get("type");

const inquirySelect = document.getElementById("inquiryType");
if (inquirySelect && type) {
  const map = {
    trial: "Free Trial Session",
    tour: "Gym Tour",
    membership: "Membership Inquiry",
    coaching: "Personal Coaching",
    barber: "Barber Appointment",
  };

  const value = map[type];
  if (value) inquirySelect.value = value;
}

// Optional: focus the form for faster action
const formSection = document.getElementById("contactForm");
if (formSection) {
  setTimeout(() => {
    inquirySelect?.focus();
  }, 250);
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const type = (params.get("type") || "").toLowerCase();

  const inquiry = document.getElementById("inquiryType");
  if (!inquiry) return;

  const map = {
    trial: "Free Trial Session",
    tour: "Gym Tour",
    barber: "Barber Appointment",
    membership: "Membership Inquiry",
    coach: "Personal Coaching",
  };

  if (map[type]) inquiry.value = map[type];
});