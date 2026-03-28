/**
 * Women Safety & Emergency Support
 * script.js — Shared JavaScript for all pages
 *
 * Sections:
 *  1. Hamburger / Mobile Nav
 *  2. SOS Button & Modal (countdown → sending → alert sent)
 *  3. Checklist interaction (safety.html)
 *  4. Report Unsafe Location form validation (safety.html)
 *  5. Community post form (community.html)
 *  6. Post like/reply interactions (community.html)
 *  7. Toast notification helper
 *  8. Active nav link highlight
 */

/* ============================================================
   UTILITY: Toast Notification
   Shows a small pop-up message at the bottom of the screen.
   @param {string} message  - Text to display
   @param {string} type     - 'success' | 'error' | '' (default dark)
   @param {number} duration - How long to show it (ms), default 3000
   ============================================================ */
function showToast(message, type = '', duration = 3000) {
  // Reuse existing toast element or create one
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast ${type}`;

  // Trigger show animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // Auto-hide after duration
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ============================================================
   1. HAMBURGER / MOBILE NAV TOGGLE
   Toggles the .open class on both the hamburger button and
   the nav-links list to show/hide the mobile menu.
   ============================================================ */
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    // Accessibility: update aria-expanded
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when a nav link is clicked (mobile UX)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });
}

/* ============================================================
   8. ACTIVE NAV LINK HIGHLIGHT
   Compares the current page filename to each nav link's href
   and adds the 'active' class to the matching link.
   ============================================================ */
function initActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) link.classList.add('active');
  });
}

/* ============================================================
   2. SOS BUTTON & MODAL — Core Feature
   ============================================================
   Flow:
     User clicks SOS button
       → Modal opens immediately
       → 3-second visual countdown (3 → 2 → 1)
       → "Sending alert..." loading state
       → After 1.5s simulated delay → "Alert Sent ✓" success
       → Modal auto-closes after 2s
       → Toast confirmation shown

   The user can also cancel during the countdown phase.
   A flag `sosCancelled` prevents the sequence from continuing
   if the user hits Cancel before it completes.
   ============================================================ */
function initSOS() {
  const sosBtn       = document.getElementById('sosBtn');
  const modalOverlay = document.getElementById('sosModal');
  if (!sosBtn || !modalOverlay) return;

  const countdownRing = document.getElementById('countdownNumber');
  const modalStatus   = document.getElementById('modalStatus');
  const modalIcon     = document.getElementById('modalIcon');
  const cancelBtn     = document.getElementById('sosCancelBtn');
  const modalTitle    = document.getElementById('modalTitle');
  const modalDesc     = document.getElementById('modalDesc');

  let sosCancelled = false;   // Flag to abort the sequence on cancel
  let countdownInterval = null;

  /* --- Open modal and start the SOS sequence --- */
  sosBtn.addEventListener('click', () => {
    sosCancelled = false;
    openSOSModal();
    runSOSSequence();
  });

  /* --- Cancel button: abort the sequence --- */
  cancelBtn.addEventListener('click', () => {
    sosCancelled = true;
    clearInterval(countdownInterval);
    closeSOSModal();
    showToast('SOS cancelled.', 'error');
  });

  /* --- Close modal when clicking the dark overlay background --- */
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay && sosCancelled) {
      closeSOSModal();
    }
  });

  /* Opens the modal and resets it to the initial countdown state */
  function openSOSModal() {
    // Reset UI to initial state
    countdownRing.textContent = '3';
    modalStatus.textContent   = '';
    modalStatus.className     = 'modal-status';
    modalIcon.textContent     = '🚨';
    modalTitle.textContent    = 'SOS Alert';
    modalDesc.textContent     = 'Sending your emergency alert. Stay calm.';
    cancelBtn.style.display   = 'inline-block';

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  /* Closes the modal and restores scroll */
  function closeSOSModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    clearInterval(countdownInterval);
  }

  /* -------------------------------------------------------
     SOS Sequence:
       Phase 1 — Countdown: 3 → 2 → 1  (1 second each)
       Phase 2 — Sending:   "Sending alert..." (1.5s)
       Phase 3 — Success:   "Alert Sent!" (2s then close)
     ------------------------------------------------------- */
  function runSOSSequence() {
    let count = 3;

    // Phase 1: tick down every second
    countdownInterval = setInterval(() => {
      if (sosCancelled) return; // Abort if cancelled

      count--;

      if (count > 0) {
        // Still counting down — update the ring number
        countdownRing.textContent = count;
      } else {
        // Countdown finished — move to Phase 2
        clearInterval(countdownInterval);
        startSendingPhase();
      }
    }, 1000);
  }

  /* Phase 2: Show "Sending alert..." spinner state */
  function startSendingPhase() {
    if (sosCancelled) return;

    // Hide the countdown ring, show a spinner icon
    countdownRing.textContent = '⏳';
    modalStatus.textContent   = 'Sending alert...';
    cancelBtn.style.display   = 'none'; // Can't cancel once sending

    // Simulate network delay (1.5 seconds)
    setTimeout(() => {
      if (!sosCancelled) showSuccessPhase();
    }, 1500);
  }

  /* Phase 3: Show "Alert Sent" success state */
  function showSuccessPhase() {
    countdownRing.textContent = '✅';
    modalIcon.textContent     = '✅';
    modalTitle.textContent    = 'Alert Sent!';
    modalDesc.textContent     = 'Your emergency contacts have been notified. Help is on the way.';
    modalStatus.textContent   = 'Alert delivered successfully';
    modalStatus.classList.add('success');

    // Auto-close after 2 seconds and show toast
    setTimeout(() => {
      closeSOSModal();
      showToast('Emergency alert sent successfully!', 'success', 4000);
    }, 2000);
  }
}

/* ============================================================
   3. CHECKLIST INTERACTION (safety.html)
   Toggles a 'checked' class on checklist items when the
   checkbox is ticked, applying a strikethrough style.
   ============================================================ */
function initChecklist() {
  document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const item = checkbox.closest('.checklist-item');
      item.classList.toggle('checked', checkbox.checked);
    });
  });
}

/* ============================================================
   4. REPORT UNSAFE LOCATION FORM VALIDATION (safety.html)
   Checks that required fields are not empty before "submitting".
   Shows inline error messages and a success toast on pass.
   ============================================================ */
function initReportForm() {
  const form = document.getElementById('reportForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // UI only — no real submission
    let valid = true;

    // Validate each required field
    form.querySelectorAll('[required]').forEach(field => {
      const errorEl = document.getElementById(field.id + 'Error');
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = 'var(--red)';
        if (errorEl) errorEl.classList.add('visible');
      } else {
        field.style.borderColor = '';
        if (errorEl) errorEl.classList.remove('visible');
      }
    });

    if (valid) {
      showToast('Report submitted successfully. Thank you!', 'success');
      form.reset();
    } else {
      showToast('Please fill in all required fields.', 'error');
    }
  });

  // Clear error styling as user types
  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      if (field.value.trim()) {
        field.style.borderColor = '';
        const errorEl = document.getElementById(field.id + 'Error');
        if (errorEl) errorEl.classList.remove('visible');
      }
    });
  });
}

/* ============================================================
   5. COMMUNITY POST FORM (community.html)
   Validates the textarea, then prepends a new post card to
   the posts feed using static/simulated data.
   ============================================================ */
function initCommunityForm() {
  const form        = document.getElementById('communityPostForm');
  const textarea    = document.getElementById('postContent');
  const charCount   = document.getElementById('charCount');
  const postsContainer = document.getElementById('postsContainer');
  if (!form || !textarea) return;

  const MAX_CHARS = 280;

  // Live character counter
  textarea.addEventListener('input', () => {
    const remaining = MAX_CHARS - textarea.value.length;
    if (charCount) {
      charCount.textContent = `${remaining} characters remaining`;
      charCount.style.color = remaining < 30 ? 'var(--red)' : '#aaa';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = textarea.value.trim();

    if (!content) {
      showToast('Please write something before posting.', 'error');
      textarea.focus();
      return;
    }

    if (content.length > MAX_CHARS) {
      showToast(`Post must be under ${MAX_CHARS} characters.`, 'error');
      return;
    }

    // Build and prepend the new post card
    if (postsContainer) {
      const card = createPostCard('You', content, 'Just now', '#e63946');
      postsContainer.insertBefore(card, postsContainer.firstChild);
    }

    textarea.value = '';
    if (charCount) charCount.textContent = `${MAX_CHARS} characters remaining`;
    showToast('Post shared with the community!', 'success');
  });
}

/* ============================================================
   6. POST LIKE / REPLY INTERACTIONS (community.html)
   Uses event delegation on the posts container so it works
   for both static posts and dynamically added ones.
   ============================================================ */
function initPostInteractions() {
  const postsContainer = document.getElementById('postsContainer');
  if (!postsContainer) return;

  postsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.post-action-btn');
    if (!btn) return;

    if (btn.dataset.action === 'like') {
      const countEl = btn.querySelector('.like-count');
      const isLiked = btn.classList.toggle('liked');
      if (countEl) {
        let count = parseInt(countEl.textContent) || 0;
        countEl.textContent = isLiked ? count + 1 : Math.max(0, count - 1);
      }
      btn.querySelector('i').className = isLiked ? 'fas fa-heart' : 'far fa-heart';
    }

    if (btn.dataset.action === 'reply') {
      showToast('Reply feature coming soon!', '');
    }

    if (btn.dataset.action === 'share') {
      showToast('Link copied to clipboard!', 'success');
    }
  });
}

/* Helper: creates a post card DOM element */
function createPostCard(name, content, time, avatarColor) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const card = document.createElement('div');
  card.className = 'post-card';
  card.innerHTML = `
    <div class="post-header">
      <div class="avatar" style="background:${avatarColor}">${initials}</div>
      <div class="post-author">
        <strong>${name}</strong>
        <span>${time}</span>
      </div>
    </div>
    <p class="post-body">${content}</p>
    <div class="post-actions">
      <button class="post-action-btn" data-action="like" aria-label="Like post">
        <i class="far fa-heart"></i>
        <span class="like-count">0</span>
      </button>
      <button class="post-action-btn" data-action="reply" aria-label="Reply to post">
        <i class="far fa-comment"></i> Reply
      </button>
      <button class="post-action-btn" data-action="share" aria-label="Share post">
        <i class="fas fa-share"></i> Share
      </button>
    </div>
  `;
  return card;
}

/* ============================================================
   INIT — Run all initializers when DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHamburger();
  initActiveNav();
  initSOS();
  initChecklist();
  initReportForm();
  initCommunityForm();
  initPostInteractions();
});
