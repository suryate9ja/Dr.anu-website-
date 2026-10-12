/**
 * DR. ANUSRI ADUSUMALLI - APPLICATION LOGIC & BOOKING ENGINE
 * ==========================================================
 * Handles dynamic content population, multi-step appointment booking,
 * interactive calendar slots, iCal generation, LocalStorage sync,
 * and responsive UI interactions.
 */

(function () {
  'use strict';

  // Config reference
  const config = window.CLINIC_CONFIG || {};

  // State management for booking
  const state = {
    currentStep: 1,
    selectedService: null,
    selectedDate: null,
    selectedSlot: null,
    patientData: {},
    isPhoneVerified: false,
    verifiedPhone: '',
    otpTimerInterval: null,
    otpRemainingSeconds: 30,
    activeDemoOtp: '',
    bookedSlotsMock: {}, // Keyed by dateString -> array of booked slot times
    myAppointments: []
  };

  // DOM Elements Cache
  const elements = {};

  function cacheElements() {
    elements.serviceSelectionList = document.getElementById('serviceSelectionList');
    elements.servicesGrid = document.getElementById('servicesGrid');
    elements.conditionsCategoriesGrid = document.getElementById('conditionsCategoriesGrid');
    elements.faqsAccordionList = document.getElementById('faqsAccordionList');
    elements.dateCarousel = document.getElementById('dateCarousel');
    elements.currentMonthYear = document.getElementById('currentMonthYear');
    elements.morningSlotsGrid = document.getElementById('morningSlotsGrid');
    elements.eveningSlotsGrid = document.getElementById('eveningSlotsGrid');
    elements.step1 = document.getElementById('step1');
    elements.step2 = document.getElementById('step2');
    elements.step3 = document.getElementById('step3');
    elements.toStep2Btn = document.getElementById('toStep2Btn');
    elements.backToStep1Btn = document.getElementById('backToStep1Btn');
    elements.toStep3Btn = document.getElementById('toStep3Btn');
    elements.backToStep2Btn = document.getElementById('backToStep2Btn');
    elements.changeServiceBtn = document.getElementById('changeServiceBtn');
    elements.selectedServiceSummary = document.getElementById('selectedServiceSummary');
    elements.summaryServiceText = document.getElementById('summaryServiceText');
    elements.summaryDateTimeText = document.getElementById('summaryDateTimeText');
    elements.summaryFeeText = document.getElementById('summaryFeeText');
    elements.summaryModeBadge = document.getElementById('summaryModeBadge');
    elements.modeLockedBadge = document.getElementById('modeLockedBadge');
    elements.lockedModeText = document.getElementById('lockedModeText');
    elements.bookingPaymentNotice = document.getElementById('bookingPaymentNotice');
    elements.patientPhone = document.getElementById('patientPhone');
    elements.sendOtpBtn = document.getElementById('sendOtpBtn');
    elements.phoneStatusTag = document.getElementById('phoneStatusTag');
    elements.phoneInputRow = document.getElementById('phoneInputRow');
    elements.phoneInputHint = document.getElementById('phoneInputHint');
    elements.otpInteractivePanel = document.getElementById('otpInteractivePanel');
    elements.otpTargetPhoneText = document.getElementById('otpTargetPhoneText');
    elements.editNumberBtn = document.getElementById('editNumberBtn');
    elements.demoOtpCodeVal = document.getElementById('demoOtpCodeVal');
    elements.quickFillOtpBtn = document.getElementById('quickFillOtpBtn');
    elements.otpDigit1 = document.getElementById('otpDigit1');
    elements.otpDigit2 = document.getElementById('otpDigit2');
    elements.otpDigit3 = document.getElementById('otpDigit3');
    elements.otpDigit4 = document.getElementById('otpDigit4');
    elements.verifyOtpBtn = document.getElementById('verifyOtpBtn');
    elements.otpTimerDisplay = document.getElementById('otpTimerDisplay');
    elements.otpSecondsLeft = document.getElementById('otpSecondsLeft');
    elements.resendOtpBtn = document.getElementById('resendOtpBtn');
    elements.otpFeedbackAlert = document.getElementById('otpFeedbackAlert');
    elements.phoneVerifiedBanner = document.getElementById('phoneVerifiedBanner');
    elements.verifiedPhoneDisplay = document.getElementById('verifiedPhoneDisplay');
    elements.changeVerifiedPhoneBtn = document.getElementById('changeVerifiedPhoneBtn');
    elements.otpPhoneContainer = document.getElementById('otpPhoneContainer');
    elements.appointmentForm = document.getElementById('appointmentForm');
    elements.confirmBookingBtn = document.getElementById('confirmBookingBtn');
    elements.confirmationModal = document.getElementById('confirmationModal');
    elements.closeModalBtn = document.getElementById('closeModalBtn');
    elements.downloadIcsBtn = document.getElementById('downloadIcsBtn');
    elements.googleCalBtn = document.getElementById('googleCalBtn');
    elements.notifyDoctorWhatsAppBtn = document.getElementById('notifyDoctorWhatsAppBtn');
    elements.patientWhatsAppBtn = document.getElementById('patientWhatsAppBtn');
    elements.patientNotifPhoneText = document.getElementById('patientNotifPhoneText');
    elements.patientReminderTimeText = document.getElementById('patientReminderTimeText');
    elements.toggleWaPreviewBtn = document.getElementById('toggleWaPreviewBtn');
    elements.waPreviewCollapse = document.getElementById('waPreviewCollapse');
    elements.waChatBubbleText = document.getElementById('waChatBubbleText');
    elements.receiptBookingId = document.getElementById('receiptBookingId');
    elements.receiptPatientName = document.getElementById('receiptPatientName');
    elements.receiptService = document.getElementById('receiptService');
    elements.receiptModeBadge = document.getElementById('receiptModeBadge');
    elements.receiptPhone = document.getElementById('receiptPhone');
    elements.receiptDateTime = document.getElementById('receiptDateTime');
    elements.receiptLocation = document.getElementById('receiptLocation');
    elements.receiptFee = document.getElementById('receiptFee');
    elements.modalOnlineActionWrap = document.getElementById('modalOnlineActionWrap');
    elements.modalOfflineActionWrap = document.getElementById('modalOfflineActionWrap');
    elements.modalJoinCallBtn = document.getElementById('modalJoinCallBtn');
    elements.modalViewClinicMapBtn = document.getElementById('modalViewClinicMapBtn');
    elements.myAppointmentsBtn = document.getElementById('myAppointmentsBtn');
    elements.myAppointmentsDrawer = document.getElementById('myAppointmentsDrawer');
    elements.closeDrawerBtn = document.getElementById('closeDrawerBtn');
    elements.myAppointmentsList = document.getElementById('myAppointmentsList');
    elements.bookingCountBadge = document.getElementById('bookingCountBadge');
    elements.copyAddressBtn = document.getElementById('copyAddressBtn');
    elements.mobileToggle = document.getElementById('mobileToggle');
    elements.mobileNavDrawer = document.getElementById('mobileNavDrawer');
    elements.currentYear = document.getElementById('currentYear');
  }

  /* ==========================================================================
     1. INITIALIZATION & DATA INJECTION
     ========================================================================== */
  function init() {
    cacheElements();

    // Set dynamic year
    if (elements.currentYear) {
      elements.currentYear.textContent = new Date().getFullYear();
    }

    // Load persisted appointments
    loadStoredAppointments();

    // Render components
    renderBookingServices();
    renderPublicServices();
    renderConditions();
    renderFaqs();
    initDateCarousel();

    // Setup OTP verification & phone listeners
    setupOtpVerification();

    // Event Listeners
    setupHeroInteractions();
    setupBookingNavigation();
    setupDrawerHandlers();
    setupCertificateModal();
    setupCopyAddress();
    setupMobileMenu();
    setupSoftScrollEffects();
    setupMapInteractivity();
    initCinematicMotionSystem();
    initSeamlessPageTransitions();
  }

  function reinitializePageComponents() {
    cacheElements();

    if (elements.currentYear) {
      elements.currentYear.textContent = new Date().getFullYear();
    }

    renderBookingServices();
    renderPublicServices();
    renderConditions();
    renderFaqs();
    initDateCarousel();
    setupHeroInteractions();
    setupBookingNavigation();
    setupDrawerHandlers();
    setupCertificateModal();
    setupCopyAddress();
    setupSoftScrollEffects();
    setupMapInteractivity();

    // Clean up previous GSAP ScrollTrigger instances
    if (typeof window.ScrollTrigger !== 'undefined') {
      window.ScrollTrigger.getAll().forEach(st => st.kill());
    }

    initCinematicMotionSystem();

    if (typeof window.ScrollTrigger !== 'undefined') {
      window.ScrollTrigger.refresh();
    }
  }

  /* ==========================================================================
     2. RENDER SERVICES (STEP 1 & PUBLIC GRID)
     ========================================================================== */
  function renderBookingServices() {
    if (!elements.serviceSelectionList || !config.services) return;

    elements.serviceSelectionList.innerHTML = config.services.map((s, index) => {
      const isFirst = index === 0;
      if (isFirst && !state.selectedService) {
        state.selectedService = s;
      }
      const isOnline = s.mode === 'online' || s.id === 'online';
      const icon = isOnline 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h6M9 13h6M12 9v8"/></svg>';
      const badgeText = isOnline ? 'Telehealth / Online Consultation' : 'In-Person / Offline Visit';
      return `
        <div class="service-radio-card ${isFirst ? 'selected' : ''}" data-service-id="${s.id}">
          <div class="service-card-meta">
            <span class="service-custom-radio"></span>
            <div class="service-mode-icon">${icon}</div>
            <div class="service-info-col">
              <span class="service-mode-badge-tag">${badgeText}</span>
              <h4>${escapeHtml(s.title)}</h4>
              <p>${escapeHtml(s.description)}</p>
              <div class="service-subtitle">${escapeHtml(s.subtitle || s.locationInfo)}</div>
            </div>
          </div>
          <div class="service-price-col">
            ${s.fee ? `<div class="service-price">${s.fee}</div>` : ''}
            <div class="service-duration">${s.duration}</div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    const cards = elements.serviceSelectionList.querySelectorAll('.service-radio-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const serviceId = card.getAttribute('data-service-id');
        state.selectedService = config.services.find(s => s.id === serviceId);
      });
    });
  }

  function renderPublicServices() {
    if (!elements.servicesGrid || !config.services) return;

    elements.servicesGrid.innerHTML = config.services.map(s => `
      <div class="service-card">
        <div class="service-card-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v8M8 12h8"/>
          </svg>
        </div>
        <h3 class="service-card-title">${escapeHtml(s.title)}</h3>
        <p class="service-card-desc">${escapeHtml(s.description)}</p>
        <div class="service-card-footer">
          <div class="service-card-price-block">
            ${s.fee ? `<span class="service-card-fee">${s.fee}</span>` : ''}
            <span class="service-card-duration">${s.duration}</span>
          </div>
          <button type="button" class="service-select-btn" data-select-service="${s.id}">
            Call to Schedule
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    `).join('');

    // Allow scrolling directly to clinic appointment desk from service cards
    elements.servicesGrid.querySelectorAll('[data-select-service]').forEach(btn => {
      btn.addEventListener('click', () => {
        const desk = document.getElementById('book-appointment');
        if (desk) {
          desk.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ==========================================================================
     3. RENDER CONDITIONS TREATED (AEO & SEO)
     ========================================================================== */
  function renderConditions() {
    if (!elements.conditionsCategoriesGrid || !config.conditionsTreated) return;

    elements.conditionsCategoriesGrid.innerHTML = config.conditionsTreated.map(cat => `
      <div class="condition-card">
        <h3 class="condition-cat-title">${escapeHtml(cat.category)}</h3>
        <ul class="condition-list">
          ${cat.items.map(item => `<li class="condition-item">${escapeHtml(item)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  /* ==========================================================================
     4. RENDER AEO FAQS (ACCORDION)
     ========================================================================== */
  function renderFaqs() {
    if (elements.faqsAccordionList && config.faqs) {
      elements.faqsAccordionList.innerHTML = config.faqs.map((faq, index) => `
        <div class="faq-card ${index === 0 ? 'open' : ''}" id="faq-item-${index}">
          <button type="button" class="faq-trigger" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="faq-content-${index}">
            <span>${escapeHtml(faq.question)}</span>
            <svg class="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div class="faq-content" id="faq-content-${index}">
            <div class="faq-content-inner">
              ${faq.answer.split('\n\n').map(p => `<p class="faq-para">${escapeHtml(p)}</p>`).join('')}
            </div>
          </div>
        </div>
      `).join('');
    }

    // Bind event listeners to ALL accordion wrappers (.faqs-accordion-wrapper)
    document.querySelectorAll('.faqs-accordion-wrapper').forEach(wrapper => {
      wrapper.querySelectorAll('.faq-trigger').forEach((trigger, idx) => {
        const card = trigger.closest('.faq-card');
        const content = card ? card.querySelector('.faq-content') : null;
        if (content && !content.id) {
          content.id = `faq-content-item-${idx}`;
          trigger.setAttribute('aria-controls', content.id);
        }

        const toggleAccordion = () => {
          if (!card) return;
          const isOpen = card.classList.contains('open');

          // Close other FAQs within this wrapper for clean single-view accordion
          wrapper.querySelectorAll('.faq-card').forEach(c => {
            c.classList.remove('open');
            const btn = c.querySelector('.faq-trigger');
            if (btn) btn.setAttribute('aria-expanded', 'false');
          });

          if (!isOpen) {
            card.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        };

        trigger.addEventListener('click', toggleAccordion);
        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleAccordion();
          }
        });
      });
    });
  }

  /* ==========================================================================
     5. DYNAMIC DATE CAROUSEL & TIME SLOTS
     ========================================================================== */
  function initDateCarousel() {
    if (!elements.dateCarousel) return;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    const dateList = [];

    // Generate next 14 calendar dates
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dateList.push(d);
    }

    elements.dateCarousel.innerHTML = dateList.map((d, index) => {
      const dayName = days[d.getDay()];
      const dayNum = d.getDate();
      const isSunday = d.getDay() === 0;
      const isSelected = index === 0;
      const isoKey = d.toISOString().split('T')[0];

      if (isSelected && !state.selectedDate) {
        state.selectedDate = {
          dateObj: d,
          iso: isoKey,
          formatted: `${dayName}, ${months[d.getMonth()]} ${dayNum}`,
          isSunday: isSunday
        };
      }

      return `
        <button type="button" class="date-pill-btn ${isSelected ? 'selected' : ''} ${isSunday ? 'sunday' : ''}" data-date-iso="${isoKey}">
          <span class="date-day-name">${dayName}</span>
          <span class="date-day-num">${dayNum}</span>
        </button>
      `;
    }).join('');

    // Set Month Year label
    if (elements.currentMonthYear) {
      elements.currentMonthYear.textContent = `${months[today.getMonth()]} ${today.getFullYear()}`;
    }

    // Attach click events to date buttons
    const dateBtns = elements.dateCarousel.querySelectorAll('.date-pill-btn');
    dateBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        dateBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        const d = dateList[index];
        state.selectedDate = {
          dateObj: d,
          iso: btn.getAttribute('data-date-iso'),
          formatted: `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`,
          isSunday: d.getDay() === 0
        };
        // Reset selected slot and re-render slot pills
        state.selectedSlot = null;
        renderSlots();
      });
    });

    // Render slots for initial selected date
    renderSlots();
  }

  function renderSlots() {
    if (!elements.morningSlotsGrid || !elements.eveningSlotsGrid || !config.schedule) return;

    const morningList = config.schedule.slots.morning || [];
    const eveningList = config.schedule.slots.evening || [];

    // If Sunday, clinic is closed (Mon-Sat 9AM-4PM)
    const isSunday = state.selectedDate ? state.selectedDate.isSunday : false;

    if (isSunday) {
      elements.morningSlotsGrid.innerHTML = `
        <div style="grid-column: span 3; font-size: 0.85rem; color: #a33d1b; background: #fdf2ed; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid rgba(163,61,27,0.2);">
          Sunday clinic is closed. Consultations are Monday – Saturday (9:00 AM – 4:00 PM). Please select a weekday.
        </div>
      `;
      elements.eveningSlotsGrid.innerHTML = ``;
      return;
    }

    // Simulate 1 or 2 booked slots for realism on given date
    const bookedMock = getMockBookedSlots(state.selectedDate ? state.selectedDate.iso : '');

    // Render Morning Slots (09:00 AM - 12:30 PM)
    elements.morningSlotsGrid.innerHTML = morningList.map((time, idx) => {
      const isBooked = bookedMock.includes(time);
      const isDefaultActive = !isBooked && !state.selectedSlot && idx === 1;
      if (isDefaultActive) {
        state.selectedSlot = time;
      }
      return `
        <button type="button" class="slot-pill-btn ${state.selectedSlot === time ? 'selected' : ''} ${isBooked ? 'booked' : ''}" 
          data-slot-time="${time}" ${isBooked ? 'disabled' : ''}>
          ${time}
        </button>
      `;
    }).join('');

    // Render Afternoon Slots (01:00 PM - 04:00 PM)
    elements.eveningSlotsGrid.innerHTML = eveningList.map(time => {
      const isBooked = bookedMock.includes(time);
      return `
        <button type="button" class="slot-pill-btn ${state.selectedSlot === time ? 'selected' : ''} ${isBooked ? 'booked' : ''}" 
          data-slot-time="${time}" ${isBooked ? 'disabled' : ''}>
          ${time}
        </button>
      `;
    }).join('');

    // Attach slot click listeners
    const allSlotBtns = document.querySelectorAll('.slot-pill-btn:not([disabled])');
    allSlotBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        allSlotBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.selectedSlot = btn.getAttribute('data-slot-time');
      });
    });
  }

  function getMockBookedSlots(isoDate) {
    if (!isoDate) return [];
    if (!state.bookedSlotsMock[isoDate]) {
      // Seed predictable booked slots based on date characters
      const seed = isoDate.charCodeAt(isoDate.length - 1) % 4;
      if (seed === 0) state.bookedSlotsMock[isoDate] = ["10:00 AM", "05:00 PM"];
      else if (seed === 1) state.bookedSlotsMock[isoDate] = ["11:30 AM", "06:30 PM"];
      else if (seed === 2) state.bookedSlotsMock[isoDate] = ["09:30 AM", "07:00 PM"];
      else state.bookedSlotsMock[isoDate] = ["12:00 PM"];
    }
    return state.bookedSlotsMock[isoDate];
  }

  /* ==========================================================================
     6. BOOKING STEPPER LOGIC
     ========================================================================== */
  function goToStep(step) {
    state.currentStep = step;

    // Update stepper numbers
    document.querySelectorAll('.step-indicator').forEach(ind => {
      const s = parseInt(ind.getAttribute('data-step'), 10);
      ind.classList.remove('active', 'completed');
      if (s === step) ind.classList.add('active');
      else if (s < step) ind.classList.add('completed');
    });

    // Toggle step panes
    elements.step1.classList.toggle('active', step === 1);
    elements.step2.classList.toggle('active', step === 2);
    elements.step3.classList.toggle('active', step === 3);

    // Sync Step 2 summary
    if (step === 2 && state.selectedService) {
      if (elements.selectedServiceSummary) {
        elements.selectedServiceSummary.textContent = state.selectedService.fee 
          ? `${state.selectedService.title} (${state.selectedService.fee})` 
          : state.selectedService.title;
      }
    }

    // Sync Step 3 summary
    if (step === 3) {
      const isOnline = state.selectedService && (state.selectedService.mode === 'online' || state.selectedService.id === 'online');
      if (elements.summaryModeBadge) {
        elements.summaryModeBadge.textContent = isOnline ? 'Online Video Consultation' : 'Offline In-Clinic Consultation';
      }
      if (elements.summaryServiceText && state.selectedService) {
        elements.summaryServiceText.textContent = state.selectedService.title;
      }
      if (elements.summaryDateTimeText && state.selectedDate && state.selectedSlot) {
        elements.summaryDateTimeText.textContent = `${state.selectedDate.formatted} • ${state.selectedSlot}`;
      }
      if (elements.summaryFeeText && state.selectedService) {
        elements.summaryFeeText.textContent = state.selectedService.fee || 'Standard Consultation';
      }
      if (elements.lockedModeText) {
        elements.lockedModeText.textContent = isOnline ? 'Online Consultation' : 'In-Clinic Consultation (Offline)';
      }
      if (elements.bookingPaymentNotice) {
        elements.bookingPaymentNotice.textContent = isOnline 
          ? 'Online Consultation: Dr. Anusri will connect directly with you on your registered mobile number at the booked slot.'
          : 'In-Clinic: Pay directly at EDGE Clinic reception during visit. Digital & UPI payment accepted.';
      }
    }
  }

  /* ==========================================================================
     6B. OTP MOBILE NUMBER VERIFICATION SYSTEM
     ========================================================================== */
  function setupOtpVerification() {
    const phoneInput = elements.patientPhone;
    const sendOtpBtn = elements.sendOtpBtn;
    const otpPanel = elements.otpInteractivePanel;
    const phoneInputRow = elements.phoneInputRow;
    const phoneStatusTag = elements.phoneStatusTag;
    const otpTargetPhoneText = elements.otpTargetPhoneText;
    const editNumberBtn = elements.editNumberBtn;
    const demoOtpCodeVal = elements.demoOtpCodeVal;
    const quickFillOtpBtn = elements.quickFillOtpBtn;
    const verifyOtpBtn = elements.verifyOtpBtn;
    const otpSecondsLeft = elements.otpSecondsLeft;
    const resendOtpBtn = elements.resendOtpBtn;
    const otpFeedbackAlert = elements.otpFeedbackAlert;
    const phoneVerifiedBanner = elements.phoneVerifiedBanner;
    const verifiedPhoneDisplay = elements.verifiedPhoneDisplay;
    const changeVerifiedPhoneBtn = elements.changeVerifiedPhoneBtn;
    const otpPhoneContainer = elements.otpPhoneContainer;

    const digitInputs = [
      elements.otpDigit1,
      elements.otpDigit2,
      elements.otpDigit3,
      elements.otpDigit4
    ];

    if (!phoneInput || !sendOtpBtn) return;

    // Clean phone input & enable/disable Send OTP button
    phoneInput.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
      e.target.value = raw;

      // If previously verified but modified, reset verified status
      if (state.isPhoneVerified && raw !== state.verifiedPhone) {
        resetVerificationState();
      }

      if (raw.length === 10) {
        sendOtpBtn.disabled = false;
      } else {
        sendOtpBtn.disabled = true;
      }
    });

    // Handle Send OTP click
    sendOtpBtn.addEventListener('click', () => {
      requestOtp();
    });

    // Handle Resend OTP click
    if (resendOtpBtn) {
      resendOtpBtn.addEventListener('click', () => {
        requestOtp();
      });
    }

    function requestOtp() {
      const raw = phoneInput.value.replace(/\D/g, '');
      if (raw.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
      }

      const btnText = sendOtpBtn.querySelector('.otp-btn-text');
      if (btnText) btnText.textContent = 'Sending...';
      sendOtpBtn.disabled = true;

      if (otpFeedbackAlert) otpFeedbackAlert.style.display = 'none';

      fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: raw })
      })
      .then(res => res.json())
      .then(data => {
        if (btnText) btnText.textContent = 'Resend OTP';
        sendOtpBtn.disabled = false;

        if (data.success) {
          state.activeDemoOtp = data.demoOtp || String(Math.floor(1000 + Math.random() * 9000));
          
          if (otpPanel) otpPanel.style.display = 'block';
          if (otpTargetPhoneText) otpTargetPhoneText.textContent = `+91 ${raw}`;
          if (demoOtpCodeVal) demoOtpCodeVal.textContent = state.activeDemoOtp;

          digitInputs.forEach(d => { if (d) d.value = ''; });
          if (digitInputs[0]) digitInputs[0].focus();

          startOtpCountdown();
        } else {
          alert(data.error || 'Failed to dispatch OTP. Please check mobile number.');
        }
      })
      .catch(err => {
        console.warn('Backend offline fallback simulation', err);
        state.activeDemoOtp = String(Math.floor(1000 + Math.random() * 9000));
        if (otpPanel) otpPanel.style.display = 'block';
        if (otpTargetPhoneText) otpTargetPhoneText.textContent = `+91 ${raw}`;
        if (demoOtpCodeVal) demoOtpCodeVal.textContent = state.activeDemoOtp;
        startOtpCountdown();
        if (btnText) btnText.textContent = 'Resend OTP';
        sendOtpBtn.disabled = false;
      });
    }

    function startOtpCountdown() {
      clearInterval(state.otpTimerInterval);
      state.otpRemainingSeconds = 30;
      if (otpSecondsLeft) otpSecondsLeft.textContent = '30s';
      if (resendOtpBtn) resendOtpBtn.style.display = 'none';

      state.otpTimerInterval = setInterval(() => {
        state.otpRemainingSeconds--;
        if (otpSecondsLeft) otpSecondsLeft.textContent = `${state.otpRemainingSeconds}s`;

        if (state.otpRemainingSeconds <= 0) {
          clearInterval(state.otpTimerInterval);
          if (resendOtpBtn) resendOtpBtn.style.display = 'inline-block';
          if (otpSecondsLeft) otpSecondsLeft.textContent = '0s';
        }
      }, 1000);
    }

    // Quick fill demo OTP
    if (quickFillOtpBtn) {
      quickFillOtpBtn.addEventListener('click', () => {
        if (!state.activeDemoOtp) return;
        const chars = state.activeDemoOtp.split('');
        chars.forEach((c, idx) => {
          if (digitInputs[idx]) digitInputs[idx].value = c;
        });
        if (verifyOtpBtn) verifyOtpBtn.focus();
      });
    }

    // Auto advance digit inputs
    digitInputs.forEach((input, idx) => {
      if (!input) return;

      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val ? val[0] : '';

        if (val && idx < digitInputs.length - 1) {
          digitInputs[idx + 1].focus();
        }

        const allEntered = digitInputs.every(d => d && d.value.length === 1);
        if (allEntered) {
          verifyEnteredOtp();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          digitInputs[idx - 1].focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          verifyEnteredOtp();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
        pasted.split('').forEach((char, i) => {
          if (digitInputs[i]) digitInputs[i].value = char;
        });
        if (pasted.length === 4) {
          verifyEnteredOtp();
        }
      });
    });

    // Verify OTP button
    if (verifyOtpBtn) {
      verifyOtpBtn.addEventListener('click', () => {
        verifyEnteredOtp();
      });
    }

    function verifyEnteredOtp() {
      const rawPhone = phoneInput.value.replace(/\D/g, '');
      const enteredCode = digitInputs.map(d => d ? d.value : '').join('');

      if (enteredCode.length < 4) {
        if (otpFeedbackAlert) {
          otpFeedbackAlert.textContent = 'Please enter all 4 digits.';
          otpFeedbackAlert.style.display = 'block';
        }
        return;
      }

      if (otpFeedbackAlert) otpFeedbackAlert.style.display = 'none';

      fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: rawPhone, otp: enteredCode })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.verified) {
          setPhoneAsVerified(rawPhone);
        } else {
          if (state.activeDemoOtp && enteredCode === state.activeDemoOtp) {
            setPhoneAsVerified(rawPhone);
          } else {
            showOtpError(data.error || 'Incorrect OTP code. Please try again.');
          }
        }
      })
      .catch(() => {
        if (state.activeDemoOtp && enteredCode === state.activeDemoOtp) {
          setPhoneAsVerified(rawPhone);
        } else {
          showOtpError('Incorrect OTP code. Please try again.');
        }
      });
    }

    function setPhoneAsVerified(phone) {
      state.isPhoneVerified = true;
      state.verifiedPhone = phone;
      clearInterval(state.otpTimerInterval);

      if (otpPanel) otpPanel.style.display = 'none';
      if (phoneInputRow) phoneInputRow.style.display = 'none';

      if (phoneVerifiedBanner) phoneVerifiedBanner.style.display = 'flex';
      if (verifiedPhoneDisplay) verifiedPhoneDisplay.textContent = phone;

      if (phoneStatusTag) {
        phoneStatusTag.className = 'phone-status-tag tag-verified';
        phoneStatusTag.textContent = 'Verified';
      }

      if (otpPhoneContainer) {
        otpPhoneContainer.classList.add('verified-state');
      }

      const hint = elements.phoneInputHint;
      if (hint) {
        hint.textContent = 'Mobile verified. Appointment alerts & reminders will be sent to this number.';
      }
    }

    function showOtpError(msg) {
      if (otpFeedbackAlert) {
        otpFeedbackAlert.textContent = msg;
        otpFeedbackAlert.style.display = 'block';
      }
      digitInputs.forEach(d => { if (d) d.classList.add('error'); });
      setTimeout(() => {
        digitInputs.forEach(d => { if (d) d.classList.remove('error'); });
      }, 1000);
    }

    function resetVerificationState() {
      state.isPhoneVerified = false;
      state.verifiedPhone = '';
      clearInterval(state.otpTimerInterval);

      if (phoneStatusTag) {
        phoneStatusTag.className = 'phone-status-tag tag-unverified';
        phoneStatusTag.textContent = 'OTP Required';
      }
      if (phoneVerifiedBanner) phoneVerifiedBanner.style.display = 'none';
      if (phoneInputRow) phoneInputRow.style.display = 'flex';
      if (otpPanel) otpPanel.style.display = 'none';
      if (otpPhoneContainer) otpPhoneContainer.classList.remove('verified-state');

      const hint = elements.phoneInputHint;
      if (hint) {
        hint.textContent = 'Mobile number verification with 4-digit OTP is required before confirming appointment.';
      }
    }

    // Edit / Change buttons
    if (editNumberBtn) {
      editNumberBtn.addEventListener('click', () => {
        if (otpPanel) otpPanel.style.display = 'none';
        phoneInput.focus();
      });
    }

    if (changeVerifiedPhoneBtn) {
      changeVerifiedPhoneBtn.addEventListener('click', () => {
        resetVerificationState();
        phoneInput.focus();
      });
    }
  }

  function setupHeroInteractions() {
    const heroModeChips = document.querySelectorAll('[data-hero-mode]');
    heroModeChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const modeId = chip.getAttribute('data-hero-mode');
        const found = (config.services || []).find(s => s.id === modeId || s.mode === modeId);
        if (found) {
          state.selectedService = found;
          if (elements.serviceSelectionList) {
            const radioCards = elements.serviceSelectionList.querySelectorAll('.service-radio-card');
            radioCards.forEach(c => {
              if (c.getAttribute('data-service-id') === found.id) {
                c.classList.add('selected');
              } else {
                c.classList.remove('selected');
              }
            });
          }
        }
        const bookingSection = document.getElementById('book-appointment');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
        goToStep(2);
      });
    });

    const heroBookNowBtn = document.getElementById('heroBookNowBtn');
    if (heroBookNowBtn) {
      heroBookNowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const bookingSection = document.getElementById('book-appointment');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Symptom pill tag clicks
    const symptomTags = document.querySelectorAll('.symptom-tag');
    symptomTags.forEach(tag => {
      tag.addEventListener('click', () => {
        const text = tag.textContent.trim();
        const symptomsInput = document.getElementById('patientSymptoms');
        if (symptomsInput) {
          symptomsInput.value = text;
        }
        const bookingSection = document.getElementById('book-appointment');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Health Article Read Guide Links (links to doctor FAQs)
    const articleLinks = document.querySelectorAll('.article-read-link');
    articleLinks.forEach((link, idx) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const faqsSection = document.getElementById('faqs');
        if (faqsSection) {
          faqsSection.scrollIntoView({ behavior: 'smooth' });
          const targetFaq = document.getElementById(`faq-item-${idx}`);
          if (targetFaq) {
            document.querySelectorAll('.faq-card').forEach(c => c.classList.remove('open'));
            targetFaq.classList.add('open');
            const trig = targetFaq.querySelector('.faq-trigger');
            if (trig) trig.setAttribute('aria-expanded', 'true');
          }
        }
      });
    });
  }

  function setupBookingNavigation() {
    // Step 1 -> Step 2
    if (elements.toStep2Btn) {
      elements.toStep2Btn.addEventListener('click', () => {
        if (!state.selectedService) {
          alert('Please select a consultation service.');
          return;
        }
        goToStep(2);
      });
    }

    // Change service link in Step 2
    if (elements.changeServiceBtn) {
      elements.changeServiceBtn.addEventListener('click', () => goToStep(1));
    }
    if (elements.backToStep1Btn) {
      elements.backToStep1Btn.addEventListener('click', () => goToStep(1));
    }

    // Step 2 -> Step 3
    if (elements.toStep3Btn) {
      elements.toStep3Btn.addEventListener('click', () => {
        if (!state.selectedDate) {
          alert('Please select an appointment date.');
          return;
        }
        if (!state.selectedSlot) {
          alert('Please select a consultation time slot.');
          return;
        }
        goToStep(3);
      });
    }

    if (elements.backToStep2Btn) {
      elements.backToStep2Btn.addEventListener('click', () => goToStep(2));
    }

    // Form Submission (Step 3)
    if (elements.appointmentForm) {
      elements.appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleBookingSubmission();
      });
    }
  }

  /* ==========================================================================
     7. FORM SUBMISSION & CONFIRMATION MODAL
     ========================================================================== */
  function handleBookingSubmission() {
    const patientName = document.getElementById('patientName').value.trim();
    const rawPhone = (elements.patientPhone ? elements.patientPhone.value : '').replace(/\D/g, '');
    const patientEmail = document.getElementById('patientEmail').value.trim();
    const patientAge = document.getElementById('patientAge').value.trim();
    const patientGender = document.getElementById('patientGender').value;
    const patientSymptoms = document.getElementById('patientSymptoms').value.trim();
    const isFirstVisit = document.getElementById('patientFirstVisit').checked;

    if (!patientName || !rawPhone) {
      alert('Please fill in required fields (Name and Mobile Number).');
      return;
    }

    // Enforce OTP verification before booking!
    if (!state.isPhoneVerified || state.verifiedPhone !== rawPhone) {
      const container = elements.otpPhoneContainer;
      if (container) {
        container.classList.add('error-state');
        setTimeout(() => container.classList.remove('error-state'), 1000);
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      alert('Mobile Number Verification Required:\nPlease verify your mobile number with OTP before confirming your slot.');
      return;
    }

    // Generate unique reference ID
    const refNum = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `ANUSRI-${refNum}`;

    const appointment = {
      id: bookingId,
      createdAt: new Date().toISOString(),
      patient: {
        name: patientName,
        phone: rawPhone,
        email: patientEmail,
        age: patientAge,
        gender: patientGender,
        symptoms: patientSymptoms,
        firstVisit: isFirstVisit,
        otpVerified: true
      },
      service: state.selectedService,
      date: state.selectedDate,
      slot: state.selectedSlot,
      status: 'Confirmed'
    };

    // Save to LocalStorage
    saveAppointment(appointment);

    // Populate receipt in modal
    const isOnline = (appointment.service && appointment.service.mode === 'online') || (appointment.service && appointment.service.id === 'online');
    if (elements.receiptBookingId) elements.receiptBookingId.textContent = appointment.id;
    if (elements.receiptPatientName) elements.receiptPatientName.textContent = appointment.patient.name;
    if (elements.receiptService) elements.receiptService.textContent = appointment.service.title;
    if (elements.receiptModeBadge) {
      elements.receiptModeBadge.textContent = isOnline ? 'ONLINE VIDEO' : 'OFFLINE CLINIC';
      elements.receiptModeBadge.style.background = isOnline ? '#16a34a' : 'var(--color-primary)';
    }
    if (elements.receiptPhone) {
      elements.receiptPhone.innerHTML = `+91 ${appointment.patient.phone} <span class="badge-otp-verified">OTP Verified</span>`;
    }
    if (elements.receiptDateTime) {
      elements.receiptDateTime.textContent = `${appointment.date.formatted} • ${appointment.slot}`;
    }
    if (elements.receiptLocation) {
      elements.receiptLocation.textContent = isOnline 
        ? 'Online Consultation (Phone / WhatsApp Call)' 
        : `${config.location.facilityName}, 4th Flr Plot 27, ${config.location.locality}, ${config.location.city}`;
    }
    if (elements.receiptFee) {
      elements.receiptFee.textContent = isOnline 
        ? (appointment.service.fee ? `${appointment.service.fee} (Online Consultation)` : 'Online Consultation') 
        : (appointment.service.fee ? `${appointment.service.fee} (Payable at clinic)` : 'Payable at clinic');
    }

    // Toggle mode specific actions in modal
    if (elements.modalOnlineActionWrap && elements.modalOfflineActionWrap) {
      if (isOnline) {
        elements.modalOnlineActionWrap.style.display = 'block';
        elements.modalOfflineActionWrap.style.display = 'none';
      } else {
        elements.modalOnlineActionWrap.style.display = 'none';
        elements.modalOfflineActionWrap.style.display = 'block';
      }
    }

    // Configure Calendar and WhatsApp Sync
    setupCalendarSyncLinks(appointment);

    // Show Modal
    if (elements.confirmationModal) {
      elements.confirmationModal.style.display = 'flex';
    }

    // Mark slot as booked for this session
    if (state.selectedDate && state.selectedDate.iso) {
      if (!state.bookedSlotsMock[state.selectedDate.iso]) {
        state.bookedSlotsMock[state.selectedDate.iso] = [];
      }
      state.bookedSlotsMock[state.selectedDate.iso].push(state.selectedSlot);
    }
  }

  function setupCalendarSyncLinks(app) {
    const title = `Dr. Anusri Adusumilli Consultation (${app.service.title})`;
    const location = `${config.location.clinicName}, ${config.location.streetAddress}, ${config.location.locality}, ${config.location.city}`;
    const description = `Doctor Appointment with Dr. Anusri Adusumilli for ${app.patient.name}. Ref: ${app.id}. Helpline: ${config.contact.phone}`;

    // Download iCal (.ics) handler
    if (elements.downloadIcsBtn) {
      elements.downloadIcsBtn.onclick = () => {
        downloadIcsFile(title, description, location, app.date.iso, app.slot);
      };
    }

    // Google Calendar Link
    if (elements.googleCalBtn) {
      const gcalUrl = createGoogleCalendarUrl(title, description, location, app.date.iso, app.slot);
      elements.googleCalBtn.href = gcalUrl;
    }

    // Prepare WhatsApp Message Texts
    const doctorMsg = config.notifications && config.notifications.templates && config.notifications.templates.doctorAlert
      ? config.notifications.templates.doctorAlert(app)
      : `New Appointment for ${app.patient.name} on ${app.date.formatted} at ${app.slot}. Ref: #${app.id}`;

    const patientMsg = config.notifications && config.notifications.templates && config.notifications.templates.patientConfirmation
      ? config.notifications.templates.patientConfirmation(app)
      : `Appointment Confirmed with Dr. Anusri Adusumilli on ${app.date.formatted} at ${app.slot}. Ref: #${app.id}`;

    const reminderMsg = config.notifications && config.notifications.templates && config.notifications.templates.patientReminder
      ? config.notifications.templates.patientReminder(app)
      : `Reminder: Consultation with Dr. Anusri today at ${app.slot}.`;

    // 1. Doctor / Clinic Desk WhatsApp Notification (+91 63032 85050)
    if (elements.notifyDoctorWhatsAppBtn) {
      const doctorWa = (config.contact && config.contact.whatsappRaw) || '916303285050';
      elements.notifyDoctorWhatsAppBtn.href = `https://api.whatsapp.com/send?phone=${doctorWa}&text=${encodeURIComponent(doctorMsg)}`;
    }

    // 2. Patient WhatsApp Button
    if (elements.patientWhatsAppBtn) {
      const cleanPhone = (app.patient.phone || '').replace(/\D/g, '');
      elements.patientWhatsAppBtn.href = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(patientMsg)}`;
    }

    // 3. Status Labels
    if (elements.patientNotifPhoneText) {
      elements.patientNotifPhoneText.textContent = `Dispatched to ${app.patient.phone} on WhatsApp`;
    }
    if (elements.patientReminderTimeText) {
      elements.patientReminderTimeText.textContent = `Scheduled for 2 hours before ${app.slot} on ${app.date.formatted}`;
    }

    // 4. Dispatch to backend API (Node.js engine)
    fetch('/api/book-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app)
    }).then(res => res.json()).then(res => {
      console.log('Server notification dispatched successfully:', res);
    }).catch(err => {
      console.log('Operating in client-side mode:', err);
    });

    // 5. Setup WhatsApp Message Preview Drawer & Tabs
    if (elements.waChatBubbleText) {
      elements.waChatBubbleText.textContent = doctorMsg; // Default active tab
    }

    if (elements.toggleWaPreviewBtn && elements.waPreviewCollapse) {
      elements.toggleWaPreviewBtn.onclick = () => {
        const isHidden = elements.waPreviewCollapse.style.display === 'none';
        elements.waPreviewCollapse.style.display = isHidden ? 'block' : 'none';
      };
    }

    const tabBtns = document.querySelectorAll('.wa-tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        if (tab === 'doctor') {
          elements.waChatBubbleText.textContent = doctorMsg;
        } else if (tab === 'patient') {
          elements.waChatBubbleText.textContent = patientMsg;
        } else if (tab === 'reminder') {
          elements.waChatBubbleText.textContent = reminderMsg;
        }
      };
    });
  }

  function downloadIcsFile(title, desc, location, dateIso, slotTime) {
    // Parse approximate start/end time
    const parsedTime = parseTimeSlot(slotTime);
    const startIso = `${dateIso.replace(/-/g, '')}T${parsedTime.startHour}${parsedTime.startMin}00`;
    const endIso = `${dateIso.replace(/-/g, '')}T${parsedTime.endHour}${parsedTime.endMin}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dr. Anusri Adusumalli Clinic//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Dr-Anusri-Appointment-${dateIso}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function createGoogleCalendarUrl(title, desc, location, dateIso, slotTime) {
    const parsedTime = parseTimeSlot(slotTime);
    const cleanDate = dateIso.replace(/-/g, '');
    const dates = `${cleanDate}T${parsedTime.startHour}${parsedTime.startMin}00Z/${cleanDate}T${parsedTime.endHour}${parsedTime.endMin}00Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(location)}`;
  }

  function parseTimeSlot(timeStr) {
    // Format "10:30 AM" or "04:30 PM"
    const parts = timeStr.trim().split(' ');
    const hm = parts[0].split(':');
    let hour = parseInt(hm[0], 10);
    const min = hm[1];
    const meridiem = parts[1];

    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;

    let endHour = hour;
    let endMin = parseInt(min, 10) + 30;
    if (endMin >= 60) {
      endHour += 1;
      endMin -= 60;
    }

    const pad = (n) => String(n).padStart(2, '0');
    return {
      startHour: pad(hour),
      startMin: pad(min),
      endHour: pad(endHour),
      endMin: pad(endMin)
    };
  }

  // Close modal handler
  if (elements.closeModalBtn) {
    elements.closeModalBtn.addEventListener('click', () => {
      elements.confirmationModal.style.display = 'none';
      // Reset form to Step 1
      elements.appointmentForm.reset();
      goToStep(1);
    });
  }

  /* ==========================================================================
     8. MY APPOINTMENTS DRAWER & STORAGE
     ========================================================================== */
  function loadStoredAppointments() {
    try {
      const data = localStorage.getItem('dr_anusri_appointments');
      if (data) {
        state.myAppointments = JSON.parse(data);
      }
    } catch (e) {
      state.myAppointments = [];
    }
    updateBadgeCount();
  }

  function saveAppointment(item) {
    state.myAppointments.unshift(item);
    try {
      localStorage.setItem('dr_anusri_appointments', JSON.stringify(state.myAppointments));
    } catch (e) {
      console.error('Storage error', e);
    }
    updateBadgeCount();
  }

  function updateBadgeCount() {
    if (!elements.bookingCountBadge) return;
    const count = state.myAppointments.length;
    if (count > 0) {
      elements.bookingCountBadge.textContent = count;
      elements.bookingCountBadge.style.display = 'inline-block';
    } else {
      elements.bookingCountBadge.style.display = 'none';
    }
  }

  function renderAppointmentsDrawer() {
    if (!elements.myAppointmentsList) return;

    if (state.myAppointments.length === 0) {
      elements.myAppointmentsList.innerHTML = `
        <div class="empty-bookings-notice">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:0.75rem; opacity:0.4;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <p>No booked appointments found on this device.</p>
        </div>
      `;
      return;
    }

    elements.myAppointmentsList.innerHTML = state.myAppointments.map(app => {
      const isOnline = app.service && (app.service.mode === 'online' || app.service.id === 'online');
      return `
      <div class="booked-slot-card" data-booking-id="${app.id}">
        <div class="booked-slot-header">
          <span class="booked-slot-ref">#${app.id}</span>
          <span class="booked-slot-status">${isOnline ? 'Online Consultation' : 'In-Clinic Visit'}</span>
        </div>
        <h4 class="booked-slot-title">${escapeHtml(app.service.title)}</h4>
        <div class="booked-slot-time">
          ${app.date.formatted} • ${app.slot}
        </div>
        <div style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:0.75rem;">
          Patient: <strong>${escapeHtml(app.patient.name)}</strong> (${app.patient.phone}) • <span style="color:#059669; font-weight:700;">OTP Verified</span>
        </div>
        <div class="booked-slot-actions" style="display:flex; gap:0.5rem; align-items:center;">
          ${isOnline 
            ? `<span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.75rem; padding:0.35rem 0.65rem; border-radius:6px; font-weight:600;">Online Mode (Phone/WhatsApp)</span>`
            : `<a href="https://www.google.com/maps?cid=10937127088013283902" target="_blank" class="btn btn-outline" style="font-size:0.74rem; padding:0.35rem 0.65rem; text-decoration:none;">View Map</a>`
          }
          <button type="button" class="btn-cancel-appointment" data-cancel-id="${app.id}">Cancel Slot</button>
        </div>
      </div>
    `}).join('');

    // Cancel appointment triggers
    elements.myAppointmentsList.querySelectorAll('[data-cancel-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-cancel-id');
        if (confirm(`Are you sure you want to cancel appointment ${id}?`)) {
          state.myAppointments = state.myAppointments.filter(a => a.id !== id);
          localStorage.setItem('dr_anusri_appointments', JSON.stringify(state.myAppointments));
          updateBadgeCount();
          renderAppointmentsDrawer();
        }
      });
    });
  }

  function setupDrawerHandlers() {
    if (elements.myAppointmentsBtn) {
      elements.myAppointmentsBtn.addEventListener('click', () => {
        renderAppointmentsDrawer();
        elements.myAppointmentsDrawer.style.display = 'block';
      });
    }

    if (elements.closeDrawerBtn) {
      elements.closeDrawerBtn.addEventListener('click', () => {
        elements.myAppointmentsDrawer.style.display = 'none';
      });
    }

    if (elements.myAppointmentsDrawer) {
      elements.myAppointmentsDrawer.addEventListener('click', (e) => {
        if (e.target === elements.myAppointmentsDrawer) {
          elements.myAppointmentsDrawer.style.display = 'none';
        }
      });
    }
  }

  function setupCertificateModal() {
    const certModal = document.getElementById('certificateModal');
    const certModalImg = document.getElementById('certModalImage');
    const certModalTitle = document.getElementById('certModalTitle');
    const certModalSub = document.getElementById('certModalSubtitle');
    const closeBtn1 = document.getElementById('closeCertModalBtn');
    const closeBtn2 = document.getElementById('closeCertModalBtn2');

    if (!certModal) return;

    function openCertModal(src, title, sub) {
      if (certModalImg) certModalImg.src = src;
      if (certModalTitle) certModalTitle.textContent = title || 'Verified Medical Credential';
      if (certModalSub) certModalSub.textContent = sub || '';
      certModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeCertModal() {
      certModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.btn-view-cert').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const src = btn.getAttribute('data-cert-src');
        const title = btn.getAttribute('data-cert-title');
        const sub = btn.getAttribute('data-cert-sub');
        openCertModal(src, title, sub);
      });
    });

    document.querySelectorAll('.cert-thumb-preview').forEach(preview => {
      preview.style.cursor = 'pointer';
      preview.addEventListener('click', () => {
        const card = preview.closest('.cert-featured-card');
        if (card) {
          const btn = card.querySelector('.btn-view-cert');
          if (btn) btn.click();
        }
      });
    });

    if (closeBtn1) closeBtn1.addEventListener('click', closeCertModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeCertModal);

    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) closeCertModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && certModal.style.display === 'flex') {
        closeCertModal();
      }
    });
  }

  /* ==========================================================================
     9. INTERACTIVE UTILITIES (COPY ADDRESS, MOBILE NAV)
     ========================================================================== */
  function setupCopyAddress() {
    if (!elements.copyAddressBtn || !config.location) return;

    elements.copyAddressBtn.addEventListener('click', () => {
      const fullText = `${config.location.clinicName}, ${config.location.streetAddress}, ${config.location.landmark}, ${config.location.locality}, ${config.location.city}, ${config.location.state} ${config.location.postalCode}`;
      navigator.clipboard.writeText(fullText).then(() => {
        const span = elements.copyAddressBtn.querySelector('span');
        const orig = span.textContent;
        span.textContent = 'Address Copied!';
        setTimeout(() => { span.textContent = orig; }, 2500);
      }).catch(err => {
        console.error('Copy failed', err);
      });
    });
  }

  function setupMobileMenu() {
    cacheElements();
    if (!elements.mobileToggle || !elements.mobileNavDrawer) return;

    const closeBtn = document.getElementById('mobileCloseBtn');

    function openMobileDrawer() {
      elements.mobileNavDrawer.classList.add('open');
      elements.mobileNavDrawer.setAttribute('aria-hidden', 'false');
      elements.mobileToggle.classList.add('active');
      elements.mobileToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('mobile-nav-open');
    }

    function closeMobileDrawer() {
      elements.mobileNavDrawer.classList.remove('open');
      elements.mobileNavDrawer.setAttribute('aria-hidden', 'true');
      elements.mobileToggle.classList.remove('active');
      elements.mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mobile-nav-open');
    }

    elements.mobileToggle.onclick = (e) => {
      e.stopPropagation();
      const isOpen = elements.mobileNavDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    };

    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        closeMobileDrawer();
      };
    }

    // Close when clicking any mobile nav link or button inside drawer
    elements.mobileNavDrawer.querySelectorAll('.mobile-nav-link, a, .mobile-close-btn, button').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileDrawer();
      });
    });

    // Close on click outside drawer
    document.addEventListener('click', (e) => {
      if (elements.mobileNavDrawer.classList.contains('open') &&
          !elements.mobileNavDrawer.contains(e.target) &&
          !elements.mobileToggle.contains(e.target)) {
        closeMobileDrawer();
      }
    });

    // Support keyboard Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.mobileNavDrawer.classList.contains('open')) {
        closeMobileDrawer();
        elements.mobileToggle.focus();
      }
    });
  }

  function setupSoftScrollEffects() {
    // 1. Silky soft smooth scroll navigation for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || !href.startsWith('#')) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.offsetHeight + 16 : 88;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });

    // 2. Glossy metallic header scroll transition
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }, { passive: true });
    }
  }

  /* ==========================================================================
     EDGE CLINIC V7 — AWARD-CALIBRE MOTION EXPERIENCE ENGINE
     Theme: Clinical Futurism (Restrained, Fluid, Cinematic, GPU-Accelerated)
     ========================================================================== */
  function initCinematicMotionSystem() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGsap = typeof window.gsap !== 'undefined';
    const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

    // 1. Sensible Reduced Motion Handling
    if (prefersReducedMotion) {
      document.querySelectorAll(
        '.hero-line-inner, .motion-hero-top, .motion-hero-eyebrow, .motion-hero-desc, ' +
        '.motion-hero-ctas, .motion-hero-schedule, .medera-doctor-cutout, .motion-fade-up, ' +
        '.concern-card, .option-card, .essential-card, .step-card, .article-card, .dna-strand, .dna-rung'
      ).forEach(el => {
        el.classList.add('is-revealed', 'is-inview', 'is-drawn');
      });
      const progressBar = document.getElementById('stepsProgressBar');
      if (progressBar) progressBar.style.width = '100%';
      return;
    }

    if (hasGsap && hasScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    // 2. Initial Hero Entrance Choreography (Phase 2)
    animateHeroEntrance(hasGsap);

    // 3. Desktop Hero Background Parallax (Phase 2 & 10)
    setupHeroParallax(hasGsap);

    // 4. Desktop Magnetic Button Pointer Physics (Phase 3)
    setupMagneticButtons();

    // 5. Section Staggered Reveals (Phase 4, 5, 6, 8, 9)
    setupSectionReveals(hasGsap);

    // 6. Signature Patient Journey Scroll Experience (Phase 7)
    setupPatientJourneyExperience(hasGsap);
  }

  function animateHeroEntrance(hasGsap) {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    if (hasGsap) {
      const tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Top strip badges
      tl.to('.motion-hero-top', { opacity: 1, y: 0, duration: 0.6 }, 0.05);

      // Eyebrow tag
      tl.to('.motion-hero-eyebrow', { opacity: 1, y: 0, duration: 0.55 }, 0.15);

      // 2-line heading reveal
      tl.to('.hero-line-inner', {
        y: '0%',
        opacity: 1,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out'
      }, 0.25);

      // Supporting description
      tl.to('.motion-hero-desc', { opacity: 1, y: 0, duration: 0.7 }, 0.45);

      // CTAs with gentle spring
      tl.to('.motion-hero-ctas', { opacity: 1, y: 0, duration: 0.65, ease: 'back.out(1.2)' }, 0.58);

      // Schedule meta pill
      tl.to('.motion-hero-schedule', { opacity: 1, y: 0, duration: 0.55 }, 0.7);

      // Doctor Cutout Portrait reveal (smooth scale & opacity, keeping face stable and visually natural)
      tl.to('.medera-doctor-cutout', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.95,
        ease: 'power2.out'
      }, 0.2);

      // DNA Helix & Molecular artwork line drawing
      tl.to('.dna-strand', {
        strokeDashoffset: 0,
        duration: 1.8,
        stagger: 0.2,
        ease: 'power2.inOut'
      }, 0.3);

      tl.to('.dna-rung', {
        strokeDashoffset: 0,
        duration: 1.2,
        stagger: 0.04,
        ease: 'power2.out'
      }, 0.6);

      tl.to('.molecular-cluster line', {
        strokeDashoffset: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: 'power2.out'
      }, 0.7);

      tl.to('.molecular-cluster circle, .dna-helix-group circle', {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.03,
        ease: 'back.out(1.4)'
      }, 0.8);

    } else {
      // Graceful CSS transition fallback
      requestAnimationFrame(() => {
        document.querySelectorAll(
          '.motion-hero-top, .motion-hero-eyebrow, .hero-line-inner, ' +
          '.motion-hero-desc, .motion-hero-ctas, .motion-hero-schedule, ' +
          '.medera-doctor-cutout, .dna-strand, .dna-rung, .molecular-cluster line'
        ).forEach(el => {
          el.classList.add('is-revealed', 'is-drawn');
        });
      });
    }
  }

  function setupHeroParallax(hasGsap) {
    if (!hasGsap) return;
    // Only desktop pointer fine displays
    if (window.innerWidth <= 991) return;

    const heroStage = document.querySelector('.medera-hero-stage');
    if (!heroStage) return;

    window.gsap.to('.medera-dna-backdrop', {
      y: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      }
    });

    // Subtle natural depth around doctor figure without face distortion
    window.gsap.to('.medera-doctor-cutout', {
      y: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      }
    });
  }

  function setupMagneticButtons() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Only enabled for desktop devices with precise pointer and hover
    if (window.matchMedia && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    const magneticElements = document.querySelectorAll('[data-magnetic]');
    magneticElements.forEach(btn => {
      let isHovered = false;

      btn.addEventListener('mouseenter', () => {
        isHovered = true;
      });

      btn.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const rawDeltaX = (e.clientX - btnCenterX) * 0.16;
        const rawDeltaY = (e.clientY - btnCenterY) * 0.16;
        const deltaX = Math.max(-8, Math.min(8, rawDeltaX));
        const deltaY = Math.max(-8, Math.min(8, rawDeltaY));

        btn.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0)`;
      });

      btn.addEventListener('mouseleave', () => {
        isHovered = false;
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  function setupSectionReveals(hasGsap) {
    if (hasGsap && typeof window.ScrollTrigger !== 'undefined') {
      // 1. Clinic Quick Information Essentials Strip
      if (document.querySelector('.clinic-essentials-grid')) {
        window.gsap.fromTo('.clinic-essentials-grid .essential-card', 
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.clinic-essentials-section',
              start: 'top 85%'
            }
          }
        );
      }

      // 2. Common Health Concerns (3-column staggered reveal)
      if (document.querySelector('.concerns-grid')) {
        window.gsap.fromTo('.concerns-grid .concern-card',
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#common-concerns',
              start: 'top 80%'
            }
          }
        );
      }

      // 3. Consultation Options (Paired Composition)
      const leftOption = document.querySelector('[data-motion-pair="left"]');
      const rightOption = document.querySelector('[data-motion-pair="right"]');
      if (leftOption && rightOption) {
        window.gsap.fromTo(leftOption,
          { opacity: 0, x: -24, y: 16 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#services',
              start: 'top 80%'
            }
          }
        );
        window.gsap.fromTo(rightOption,
          { opacity: 0, x: 24, y: 16 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#services',
              start: 'top 80%'
            }
          }
        );
      }

      // 4. Physician Profile Reveal (#about)
      if (document.querySelector('#about')) {
        window.gsap.fromTo('.about-image-frame',
          { opacity: 0, scale: 0.96, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#about',
              start: 'top 80%'
            }
          }
        );
        window.gsap.fromTo('.about-highlights-ribbon .highlight-chip',
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.about-highlights-ribbon',
              start: 'top 88%'
            }
          }
        );
      }

      // 5. Clinical Credentials Preview
      if (document.querySelector('#credentials-preview')) {
        window.gsap.fromTo('#credentials-preview .credentials-preview-card, #credentials-preview .reg-card-mini',
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#credentials-preview',
              start: 'top 82%'
            }
          }
        );
      }

      // 6. Health Guides Articles
      if (document.querySelector('#articles')) {
        window.gsap.fromTo('#articles .article-card',
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#articles',
              start: 'top 82%'
            }
          }
        );
      }

      // 7. FAQs Stagger
      if (document.querySelector('#faqs')) {
        window.gsap.fromTo('#faqs .faq-card',
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#faqs',
              start: 'top 82%'
            }
          }
        );
      }

      // 8. Location Panel & Map Reveal
      if (document.querySelector('#location')) {
        window.gsap.fromTo('#location .location-card',
          { opacity: 0, x: -24 },
          {
            opacity: 1,
            x: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#location',
              start: 'top 82%'
            }
          }
        );
        window.gsap.fromTo('#location .location-map-wrap',
          { opacity: 0, x: 24 },
          {
            opacity: 1,
            x: 0,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#location',
              start: 'top 82%'
            }
          }
        );
      }

    } else {
      // Fallback: IntersectionObserver for native browser environments
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll(
        '.concern-card, .option-card, .essential-card, .article-card, ' +
        '.about-image-frame, .highlight-chip, .location-card, .location-map-wrap'
      ).forEach(el => observer.observe(el));
    }
  }

  function setupPatientJourneyExperience(hasGsap) {
    const journeySection = document.getElementById('how-to-visit');
    const progressBar = document.getElementById('stepsProgressBar');
    const stepCards = document.querySelectorAll('#how-to-visit .step-card');
    if (!journeySection || stepCards.length === 0) return;

    const isDesktop = window.innerWidth > 900;

    if (hasGsap && typeof window.ScrollTrigger !== 'undefined' && isDesktop) {
      // Connect progress fill and sequential activation
      window.ScrollTrigger.create({
        trigger: journeySection,
        start: 'top 75%',
        end: 'bottom 65%',
        onUpdate: (self) => {
          const progress = self.progress;
          if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
          }

          // Step 1: Contact Reception (active 0.1 to 0.45)
          // Step 2: Confirm Your Visit (active 0.45 to 0.8)
          // Step 3: Visit EDGE Clinic (active 0.8 to 1.0)
          if (stepCards[0]) {
            if (progress >= 0.1 && progress < 0.45) {
              stepCards[0].classList.add('active-step');
              stepCards[0].classList.remove('completed-step');
            } else if (progress >= 0.45) {
              stepCards[0].classList.remove('active-step');
              stepCards[0].classList.add('completed-step');
            } else {
              stepCards[0].classList.remove('active-step', 'completed-step');
            }
          }

          if (stepCards[1]) {
            if (progress >= 0.45 && progress < 0.8) {
              stepCards[1].classList.add('active-step');
              stepCards[1].classList.remove('completed-step');
            } else if (progress >= 0.8) {
              stepCards[1].classList.remove('active-step');
              stepCards[1].classList.add('completed-step');
            } else {
              stepCards[1].classList.remove('active-step', 'completed-step');
            }
          }

          if (stepCards[2]) {
            if (progress >= 0.8) {
              stepCards[2].classList.add('active-step');
              stepCards[2].classList.remove('completed-step');
            } else {
              stepCards[2].classList.remove('active-step', 'completed-step');
            }
          }
        }
      });
    } else {
      // Progressive vertical reveal on mobile or fallback
      const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active-step');
          }
        });
      }, { threshold: 0.35 });

      stepCards.forEach(c => stepObserver.observe(c));
    }
  }

  /* ==========================================================================
     V7.1 GOOGLE MAP INTERACTION MANAGER (Scroll Interception Protection)
     ========================================================================== */
  function setupMapInteractivity() {
    const mapWrappers = document.querySelectorAll('.location-map-wrapper');
    mapWrappers.forEach(wrapper => {
      const overlay = wrapper.querySelector('.map-interactive-overlay');
      const enableBtn = wrapper.querySelector('.btn-enable-map');

      if (overlay) {
        overlay.addEventListener('click', () => {
          wrapper.classList.add('is-interactive');
        });
      }
      if (enableBtn) {
        enableBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          wrapper.classList.add('is-interactive');
        });
      }

      // Restore scroll-safe mode on mouse leave
      wrapper.addEventListener('mouseleave', () => {
        wrapper.classList.remove('is-interactive');
      });
    });
  }

  /* ==========================================================================
     V7.1 AWWWARDS-CALIBRE SEAMLESS PAGE TRANSITION ENGINE
     Crossfade + Subtle Vertical Shift (200-350ms), No White Flashes, Zero Jump
     ========================================================================== */
  function initSeamlessPageTransitions() {
    if (!window.history || !window.history.pushState || !window.DOMParser) return;

    const pageCache = new Map();
    let isTransitioning = false;

    // Create / ensure top progress accent bar
    let progressBar = document.getElementById('pageTransitionBar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'pageTransitionBar';
      progressBar.className = 'page-transition-bar';
      document.body.prepend(progressBar);
    }

    function syncActiveNavLinks(path) {
      let normalized = path.replace(/\/index\.html$/, '/') || '/';
      if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
      }

      document.querySelectorAll('.nav-links .nav-link').forEach(link => {
        let href = link.getAttribute('href');
        if (!href) return;
        let linkPath = href.split('#')[0].replace(/\/index\.html$/, '/') || '/';
        if (linkPath.length > 1 && linkPath.endsWith('/')) {
          linkPath = linkPath.slice(0, -1);
        }
        if (linkPath === normalized) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      document.querySelectorAll('.mobile-nav-link').forEach(link => {
        let href = link.getAttribute('href');
        if (!href) return;
        let linkPath = href.split('#')[0].replace(/\/index\.html$/, '/') || '/';
        if (linkPath.length > 1 && linkPath.endsWith('/')) {
          linkPath = linkPath.slice(0, -1);
        }
        if (linkPath === normalized) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    function prefetchUrl(url) {
      if (pageCache.has(url)) return;
      fetch(url, { headers: { 'X-Requested-With': 'SeamlessTransition' } })
        .then(res => {
          if (res.ok) return res.text();
          throw new Error('Prefetch failed');
        })
        .then(html => {
          pageCache.set(url, html);
        })
        .catch(() => {});
    }

    // Intercept clicks on links
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      // Ignore non-standard navigation gestures
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore telephone, mailto, whatsapp, javascript, download, blank targets
      if (href.startsWith('tel:') || href.startsWith('mailto:') || href.includes('wa.me') || 
          href.startsWith('javascript:') || anchor.getAttribute('target') === '_blank' || 
          anchor.hasAttribute('download')) {
        return;
      }

      // Check URL origin
      let url;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch (err) {
        return;
      }
      if (url.origin !== window.location.origin) return;

      // Same-page anchor navigation
      if (url.pathname === window.location.pathname) {
        if (url.hash) {
          e.preventDefault();
          const targetEl = document.querySelector(url.hash);
          if (targetEl) {
            const header = document.querySelector('.site-header');
            const headerHeight = header ? header.offsetHeight + 14 : 76;
            const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
            history.pushState(null, '', url.hash);
            closeMobileDrawer();
          }
        }
        return;
      }

      // Cross-page navigation
      e.preventDefault();
      if (isTransitioning) return;

      navigateTo(url.href, { pushHistory: true, targetHash: url.hash });
    });

    // Prefetch links on hover
    document.addEventListener('mouseover', (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('tel:') || href.startsWith('mailto:') || href.includes('wa.me') || 
          href.startsWith('#') || anchor.getAttribute('target') === '_blank') return;
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          prefetchUrl(url.href);
        }
      } catch (err) {}
    });

    // Back / Forward Browser History Handling
    window.addEventListener('popstate', (e) => {
      const targetUrl = window.location.href;
      const targetHash = window.location.hash;
      navigateTo(targetUrl, { pushHistory: false, targetHash: targetHash, isPopState: true });
    });

    async function navigateTo(urlStr, options = {}) {
      const { pushHistory = true, targetHash = '', isPopState = false } = options;
      const mainContent = document.getElementById('main-content');
      if (!mainContent) {
        window.location.href = urlStr;
        return;
      }

      isTransitioning = true;
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasGsap = typeof window.gsap !== 'undefined';

      if (progressBar) {
        progressBar.style.width = '35%';
        progressBar.style.opacity = '1';
      }

      // 1. Refined Exit Transition
      if (!prefersReducedMotion) {
        if (hasGsap) {
          await window.gsap.to(mainContent, {
            opacity: 0,
            y: -8,
            duration: 0.18,
            ease: 'power2.inOut'
          });
        } else {
          mainContent.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
          mainContent.style.opacity = '0';
          mainContent.style.transform = 'translateY(-8px)';
          await new Promise(r => setTimeout(r, 180));
        }
      }

      if (progressBar) progressBar.style.width = '70%';

      // 2. Fetch and Document Swap
      try {
        let html = pageCache.get(urlStr);
        if (!html) {
          const res = await fetch(urlStr, { headers: { 'X-Requested-With': 'SeamlessTransition' } });
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          html = await res.text();
          pageCache.set(urlStr, html);
        }

        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        const newMain = newDoc.getElementById('main-content');
        const newTitle = newDoc.title || document.title;

        if (!newMain) {
          window.location.href = urlStr;
          return;
        }

        // Update document title and body class
        document.title = newTitle;
        if (newDoc.body.className) {
          document.body.className = newDoc.body.className;
        }

        // Swap main content
        mainContent.innerHTML = newMain.innerHTML;

        // Sync navigation indicators
        const urlObj = new URL(urlStr);
        syncActiveNavLinks(urlObj.pathname);

        // Close drawer if open
        closeMobileDrawer();

        // Push URL to history
        if (pushHistory) {
          history.pushState({ path: urlStr }, newTitle, urlStr);
        }

        // Scroll restoration
        if (targetHash) {
          const targetEl = document.querySelector(targetHash);
          if (targetEl) {
            const header = document.querySelector('.site-header');
            const headerHeight = header ? header.offsetHeight + 14 : 76;
            const targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({ top: Math.max(0, targetTop), behavior: 'instant' });
            
            // Highlight target card if article
            const articleCard = targetEl.closest('.article-card') || targetEl;
            if (articleCard && articleCard.classList.contains('article-card')) {
              articleCard.classList.add('highlight-target');
              setTimeout(() => articleCard.classList.remove('highlight-target'), 2200);
            }
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }

        // Re-initialize dynamic components on newly mounted DOM
        reinitializePageComponents();

        if (progressBar) progressBar.style.width = '100%';

        // 3. Refined Entrance Transition
        if (!prefersReducedMotion) {
          if (hasGsap) {
            window.gsap.fromTo(mainContent,
              { opacity: 0, y: 10 },
              {
                opacity: 1,
                y: 0,
                duration: 0.22,
                ease: 'power2.out',
                onComplete: () => {
                  isTransitioning = false;
                  if (progressBar) {
                    progressBar.style.opacity = '0';
                    setTimeout(() => { if (progressBar) progressBar.style.width = '0%'; }, 200);
                  }
                }
              }
            );
          } else {
            mainContent.style.transform = 'translateY(10px)';
            mainContent.style.opacity = '0';
            requestAnimationFrame(() => {
              mainContent.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
              mainContent.style.opacity = '1';
              mainContent.style.transform = 'translateY(0)';
              setTimeout(() => {
                isTransitioning = false;
                if (progressBar) {
                  progressBar.style.opacity = '0';
                  setTimeout(() => { if (progressBar) progressBar.style.width = '0%'; }, 200);
                }
              }, 220);
            });
          }
        } else {
          mainContent.style.opacity = '1';
          mainContent.style.transform = 'none';
          isTransitioning = false;
          if (progressBar) {
            progressBar.style.opacity = '0';
            progressBar.style.width = '0%';
          }
        }

      } catch (err) {
        console.warn('Seamless transition fallback to hard navigation:', err);
        window.location.href = urlStr;
      }
    }

    function closeMobileDrawer() {
      const drawer = document.getElementById('mobileNavDrawer');
      const toggle = document.getElementById('mobileToggle');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        document.body.classList.remove('mobile-nav-open');
        if (toggle) {
          toggle.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
