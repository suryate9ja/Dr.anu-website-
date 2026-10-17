/**
 * DR. ANUSRI ADUSUMILLI - CLINIC CONFIGURATION & CONTENT SETTINGS
 * ==============================================================
 * Official verified clinical details directly provided by Dr. Anusri Adusumilli:
 * MBBS, MD (General Medicine) | Consultant General Physician at Edge Clinic, HITEC City
 * Telangana State Medical Council: APMC/FMR/94201
 */

const CLINIC_CONFIG = {
  // Doctor & Profile Info
  doctor: {
    fullName: "Dr. Anusri Adusumilli",
    displayName: "Dr. Anusri Adusumilli",
    prefix: "Dr.",
    firstName: "Anusri",
    lastName: "Adusumilli",
    title: "Consultant General Physician",
    degrees: "MBBS, MD (General Medicine)",
    experienceYears: "6.5+",
    experienceExact: "6.5 years",
    clinicAffiliation: "Edge Clinic • The Medical Centre, HITEC City",
    registrationNumber: "APMC/FMR/94201",
    registrationAuthority: "Telangana State Medical Council",
    languages: ["Telugu", "English", "Hindi", "Kannada"],
    languagesDisplay: "Telugu, English, Hindi, Kannada",
    scopeNotice: "Adult & Geriatric Medicine (Ages 18+) • Pediatric care not provided",
    pediatricExclusion: "Do not provide Paediatric care",
    profilePhoto: "./assets/images/dr-anusri-headshot-hero.jpg",
    posterPhoto: "./assets/images/dr-anusri-headshot-hero.jpg",
    headshotSquare: "./assets/images/dr-anusri-headshot-square.jpg",
    headshotFull: "./assets/images/dr-anusri-enhanced-full.jpg",
    clinicPhoto: "./assets/images/clinic-interior.jpg",
    announcementPhoto: "./assets/images/edge-clinic-announcement.png",
    bioShort: "Compassionate Consultant General Physician with 6.5+ years of experience specializing in infectious diseases, diabetes, hypertension, hypothyroidism, adult vaccination, multimorbidity, geriatric care, and undiagnosed rare diseases.",
    bioIntro: "I am a compassionate general physician with expertise in treating various communicable diseases, chronic health conditions, geriatric care and preventive medicine.",
    philosophy: "I chose medicine because it is a beautiful blend of observation, mystery, problem-solving, and empathy. It offers a unique opportunity to understand the intricacies of nature and the human body while using that knowledge to alleviate suffering and make a meaningful difference in people's lives.\n\nMy approach to consultation is rooted in attentive listening, empathetic understanding, and a thorough clinical examination. I believe in explaining the diagnosis, the nature of the disease, and its prognosis in a clear and comprehensive manner, empowering patients to make informed decisions about their health and treatment.",
    
    // Specialized Clinical Training & Prior Appointments
    specializedTraining: [
      {
        id: "cleveland-epilepsy",
        title: "Clinical Neurophysiology, EEG and Epilepsy Course",
        certificateTitle: "Certificate of Attendance",
        institution: "Cleveland Clinic (The Epilepsy Center)",
        division: "Neurological Institute & Center for International Medical Education",
        location: "Cleveland, Ohio, USA",
        dates: "September 23 – December 13, 2024",
        directors: "Jessica Fecker, MD, MEd (MEHP) & Steven Kawczak, PhD",
        certificateImage: "./assets/images/certificates/cleveland-clinic-epilepsy-certificate.png",
        badge: "International Certification • USA",
        icon: "neuro",
        skills: ["Clinical Neurophysiology", "EEG Interpretation", "Seizure Diagnostics", "Complex Neurological Evaluation"]
      },
      {
        id: "apollo-jipmer-neurology",
        title: "Advanced Neurology & Internal Medicine Training",
        certificateTitle: "Clinical Registrar & Senior Residency",
        institution: "Apollo Hospitals (Jubilee Hills) & JIPMER",
        division: "Department of Neurology & Department of General Medicine",
        location: "Hyderabad & Puducherry, India",
        dates: "Academic Tenure",
        badge: "Advanced Specialty Training",
        icon: "medicine",
        skills: ["Cerebrovascular & Stroke Care", "Cognitive Health & Memory Assessment", "Neuro-Infectious Diseases", "Complex Acute Medicine"]
      }
    ],
    careerMilestones: [
      {
        role: "Consultant General Physician",
        institution: "Edge Clinic",
        location: "HITEC City, Hyderabad",
        period: "Current"
      },
      {
        role: "Academic Registrar in Neurology Department",
        institution: "Apollo Hospital",
        location: "Jubilee Hills, Hyderabad",
        period: "Past"
      },
      {
        role: "Senior Resident in General Medicine Department",
        institution: "Apollo Institute of Medical Sciences",
        location: "Hyderabad",
        period: "Past"
      },
      {
        role: "Senior Resident in Neurology Department",
        institution: "JIPMER",
        location: "Puducherry",
        period: "Past"
      }
    ],
    awards: [
      {
        id: "tnscon-2023-award",
        title: "Second Prize — Award Poster Presentation Competition",
        awardRank: "Second Prize",
        event: "7th Annual Telangana Neurosciences Society Conference (TNSCON 2023)",
        organizer: "Telangana Neurosciences Society (TNS)",
        venue: "Hyderabad International Convention Centre (HICC), Hyderabad",
        date: "March 3 – 5, 2023 (Awarded on March 5, 2023)",
        certificateImage: "./assets/images/certificates/tnscon-award-poster-presentation.jpg",
        badge: "State Research Honor • TNSCON 2023",
        icon: "award"
      }
    ]
  },

  // Contact Details & Direct Patient Channels
  // [FLAG FOR CLINIC CONFIRMATION]: The doctor's submitted intake form and website contain differing phone references.
  // In accordance with V8 specifications, all patient contact actions route to EDGE Clinic reception.
  // Official reception phone (+91 63032 85050) and WhatsApp (+91 63032 85050) are flagged for formal verification.
  contact: {
    doctorPhone: "+91 6303285050",
    doctorPhoneDisplay: "+91 63032 85050",
    whatsapp: "+91 6303285050",
    whatsappRaw: "916303285050",
    clinicReceptionPhone: "+91 63032 85050",
    clinicReceptionClean: "+916303285050",
    email: "anusri.adusumilli@gmail.com",
    altEmail: "anupeadia@yahoo.com",
    instagram: "https://www.instagram.com/dr.anusriadusumilli",
    instagramHandle: "@dr.anusriadusumilli",
    website: "https://edge.clinic",
    googleMapsUrl: "https://www.google.com/maps?cid=10937127088013283902"
  },

  // Exact Verified Location (HITEC City, Hyderabad 500081)
  location: {
    clinicName: "Edge Clinic",
    facilityName: "The Medical Centre",
    buildingFloor: "4th Floor, Plot 27, Phase 2",
    parkName: "Huda Techno Park, Survey No.64",
    streetAddress: "The Medical Centre, near Raidurg Metro Station, Phase 2",
    fullAddress: "The Medical Centre, near Raidurg Metro Station, Phase 2, HITEC City, Hyderabad, Telangana, 500081, India",
    landmark: "near Raidurg Metro Station, Phase 2, HITEC City",
    locality: "HITEC City",
    city: "Hyderabad",
    state: "Telangana",
    postalCode: "500081",
    country: "India",
    countryCode: "IN",
    latitude: 17.4474,
    longitude: 78.3762,
    walkInPolicy: "Walk-ins Welcome & Appointments Available",
    parkingInfo: "Dedicated basement visitor & valet parking available at The Medical Centre",
    transitInfo: "Directly accessible near Raidurg Metro Station (Blue Line Terminal, HITEC City IT Corridor)",
    neighborhoodsServed: [
      "HITEC City",
      "Madhapur",
      "Gachibowli",
      "Kondapur",
      "Financial District",
      "Jubilee Hills",
      "Raidurg"
    ]
  },

  // Consultation Types: Strictly Online and Offline
  services: [
    {
      id: "offline",
      mode: "offline",
      title: "In-Clinic Consultation (Offline)",
      subtitle: "In-Person Clinical Visit • Edge Clinic, HITEC City",
      duration: "25 - 30 Mins",
      badge: "In-Person Visit",
      description: "Comprehensive physical examination, vitals screening, diagnostics evaluation, and personalized treatment roadmap. Walk-ins & scheduled slots welcome.",
      locationInfo: "The Medical Centre, near Raidurg Metro Station, 4th Floor Plot 27, Phase 2, HITEC City",
      paymentInfo: "Payable at clinic desk (Cash, UPI, Cards)"
    },
    {
      id: "online",
      mode: "online",
      title: "Online Consultation",
      subtitle: "Remote Consultation via Phone / WhatsApp Call",
      duration: "20 - 25 Mins",
      badge: "Online Consultation",
      description: "Direct consultation for symptoms, lab report evaluation, medical advice, and digital prescriptions. Doctor connects directly via phone or WhatsApp at your slot.",
      locationInfo: "Online Consultation (Doctor will call your registered number)",
      paymentInfo: "Digital payment prior to consultation"
    }
  ],

  // Timings & Schedules (Doctor 9AM - 4PM, Facility 9AM - 9:30PM)
  schedule: {
    doctorConsultation: "Monday – Saturday: 9:00 AM – 4:00 PM",
    facilityHours: "Monday – Sunday: 9:00 AM – 9:30 PM (All 7 Days)",
    walkInNote: "Walk-ins welcome during consultation hours (9AM – 4PM) or call clinic reception at +91 63032 85050.",
    slots: {
      morning: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM"],
      evening: ["01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"]
    }
  },

  // Common Search Keywords & Symptoms
  searchKeywords: [
    "Fever", "Cough", "Headache", "Running Nose", "Flu", "Adult Vaccination", 
    "Health Check Up", "BP (Blood Pressure)", "Sugar (Diabetes)", "Thyroid", "Breathlessness", "Fatigue"
  ],

  // OTP Verification Settings
  otpConfig: {
    enabled: true,
    digits: 4,
    expirySeconds: 300,
    resendCooldownSeconds: 30,
    demoMode: true
  },

  // WhatsApp Notification & Automated Reminder System
  notifications: {
    enabled: true,
    doctorNotificationNumber: "916303285050",
    doctorNotificationName: "EDGE Clinic / Dr. Anusri Desk",
    reminderLeadHours: 2,
    sendViaBackend: true,
    templates: {
      doctorAlert: (data) => {
        const isOnline = data.service.mode === 'online';
        return `*NEW APPOINTMENT ALERT - EDGE CLINIC*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `*Doctor:* Dr. Anusri Adusumilli, MBBS, MD (APMC/FMR/94201)\n` +
          `*Ref ID:* #${data.id}\n` +
          `*Mode:* ${isOnline ? 'ONLINE CONSULTATION' : 'OFFLINE (In-Clinic Visit)'}\n\n` +
          `*Verified Patient Details:*\n` +
          `• *Name:* ${data.patient.name}\n` +
          `• *Mobile:* ${data.patient.phone} (OTP Verified)\n` +
          `• *Age / Gender:* ${data.patient.age || 'Not specified'} / ${data.patient.gender || 'Not specified'}\n` +
          `• *First Visit:* ${data.patient.firstVisit ? 'Yes (New Patient)' : 'No (Follow-up)'}\n\n` +
          `*Consultation Details:*\n` +
          `• *Service:* ${data.service.title}\n` +
          `• *Date:* ${data.date.formatted}\n` +
          `• *Slot Time:* ${data.slot}\n` +
          `• *Symptoms / Note:* ${data.patient.symptoms || 'General Consultation'}\n` +
          `• *Fee:* ${data.service.fee}\n` +
          (isOnline ? `• *Connection:* Doctor will call patient mobile number\n\n` : `• *Location:* The Medical Centre, near Raidurg Metro Station, HITEC City\n\n`) +
          `Mobile number OTP-verified.`;
      },

      patientConfirmation: (data) => {
        const isOnline = data.service.mode === 'online';
        return `*APPOINTMENT CONFIRMED*\n` +
          `*Dr. Anusri Adusumilli, MBBS, MD (General Medicine)*\n` +
          `*Edge Clinic — The Medical Centre, HITEC City*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Dear *${data.patient.name}*,\n` +
          `Your appointment has been successfully scheduled!\n\n` +
          `*Booking Ref:* #${data.id}\n` +
          `*Mode:* ${isOnline ? 'ONLINE CONSULTATION' : 'OFFLINE (In-Clinic Visit)'}\n` +
          `*Date:* ${data.date.formatted}\n` +
          `*Time Slot:* ${data.slot}\n` +
          `*Consultation Fee:* ${data.service.fee}\n\n` +
          (isOnline 
            ? `*Consultation Info:*\nDr. Anusri will connect directly with you on your mobile number (+91 ${data.patient.phone}) at the scheduled slot time.\n\n` 
            : `*Clinic Address:*\nThe Medical Centre, near Raidurg Metro Station, Phase 2, HITEC City, Hyderabad 500081\n` +
              `Google Maps: https://www.google.com/maps?cid=10937127088013283902\n\n`
          ) +
          `*Helpful Guidelines:*\n` +
          (isOnline 
            ? `• Please keep your phone reachable at the booked time slot.\n• Digital prescription will be sent immediately after the consultation.\n`
            : `• Please arrive 10 minutes prior to your slot time.\n• Patients can also walk in anytime between 9AM–4PM Mon–Sat.\n• Dedicated basement parking available at The Medical Centre.\n`
          ) +
          `• Reminder will be sent to your WhatsApp 2 hours prior to consultation.\n\n` +
          `*EDGE Clinic Helpline / WhatsApp:* +91 63032 85050`;
      },

      patientReminder: (data) => {
        const isOnline = data.service.mode === 'online';
        return `*UPCOMING APPOINTMENT REMINDER*\n` +
          `*Dr. Anusri Adusumilli @ Edge Clinic*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Dear *${data.patient.name}*,\n` +
          `This is a gentle reminder that your consultation is scheduled for today:\n\n` +
          `*Slot Time:* ${data.slot}\n` +
          `*Date:* ${data.date.formatted}\n` +
          `*Mode:* ${isOnline ? 'Online Consultation' : 'Offline In-Clinic Consultation'}\n\n` +
          (isOnline 
            ? `*Note:* Dr. Anusri will call you on your registered number at ${data.slot}.\n`
            : `*Location:* The Medical Centre, near Raidurg Metro Station, Phase 2, HITEC City 500081\n`
          ) +
          `*EDGE Clinic Helpline / Reschedule:* +91 63032 85050`;
      }
    }
  },

  // Key Highlights
  highlights: [
    { number: "6.5+", label: "Years Experience", detail: "Internal Medicine & General Practice" },
    { number: "4", label: "Languages Spoken", detail: "Telugu, English, Hindi, Kannada" },
    { number: "HITEC City", label: "Prime Location", detail: "Near Raidurg Metro, Phase 2" },
    { number: "9AM - 4PM", label: "Doctor Timings", detail: "Monday through Saturday" }
  ],

  // Conditions Treated (Minimal, scannable clinical tags)
  conditionsTreated: [
    { 
      category: "Infectious & Acute Illnesses", 
      icon: "infectious",
      items: [
        "Viral Fevers, Dengue & Malaria Workup", 
        "Cough, Seasonal Flu & Bronchitis", 
        "Gastroenteritis & Acute Infection", 
        "Urinary Tract Infections (UTI)", 
        "Acute Headaches & Sinusitis"
      ] 
    },
    { 
      category: "Diabetes & Chronic Metabolic Care", 
      icon: "metabolic",
      items: [
        "Type-2 & Type-1 Diabetes Management", 
        "Hypertension (High Blood Pressure)", 
        "Hypothyroidism & Hormone Titration", 
        "Cholesterol & Fatty Liver Care", 
        "Metabolic Health & Lifestyle Guidance"
      ] 
    },
    { 
      category: "Multimorbidity & Complex Cases", 
      icon: "multimorbid",
      items: [
        "Multiple Co-existing Health Conditions", 
        "Undiagnosed & Persistent Symptoms", 
        "Medication Reconciliation & Safety", 
        "Unexplained Chronic Fatigue Workup", 
        "Autoimmune & Secondary Disorders"
      ] 
    },
    { 
      category: "Geriatric Care & Prevention", 
      icon: "geriatric",
      items: [
        "Comprehensive Senior Citizen Care", 
        "Adult Vaccinations (Flu, HPV, Pneumococcal)", 
        "Annual Preventive Health Screenings", 
        "Breathlessness & Chest Symptom Check", 
        "Adult Fitness & Wellness Roadmaps"
      ] 
    }
  ],

  // 5 Practical Featured FAQs for Homepage (Walk-ins, Scheduling, Fees, Online Consults, Timings & Location)
  faqs: [
    {
      question: "Can I walk in for a consultation, or is an appointment mandatory?",
      answer: "Walk-ins are welcome Monday to Saturday between 9:00 AM and 4:00 PM at EDGE Clinic, HITEC City. To enquire about availability or arrange your visit in advance, call or WhatsApp reception."
    },
    {
      question: "How do I schedule a consultation with Dr. Anusri?",
      answer: "Consultations with Dr. Anusri Adusumilli are coordinated by the EDGE Clinic reception team. Call or WhatsApp reception at +91 63032 85050 to enquire about availability and arrange your visit."
    },
    {
      question: "What payment modes are accepted for consultations?",
      answer: "We accept Cash, UPI, Debit/Credit Cards, and popular digital payments at EDGE Clinic reception."
    },
    {
      question: "Are online consultations available?",
      answer: "Online consultations are subject to clinic confirmation. Please check with EDGE Clinic reception at +91 63032 85050 to enquire about current remote follow-up availability."
    },
    {
      question: "Where is EDGE Clinic located and what are the consultation timings?",
      answer: "EDGE Clinic is at The Medical Centre (4th Floor, Plot 27), HITEC City, 250m from Raidurg Metro Station. Outpatient hours are Monday to Saturday, 9:00 AM to 4:00 PM."
    }
  ],

  // Clinical Health Articles (Concise teasers)
  articles: [
    {
      id: "fatigue-underlying-causes",
      title: "Understanding Chronic Fatigue: When Tiredness Signals an Underlying Condition",
      category: "Diagnostic Medicine",
      readTime: "3 min read",
      date: "Clinical Article",
      summary: "How clinical evaluations uncover treatable root causes like anaemia, thyroid shifts, metabolic imbalances, and vitamin deficiencies.",
      author: "Clinical Review • Dr. Anusri"
    },
    {
      id: "adult-vaccinations-guide",
      title: "The Adult Vaccination Roadmap: Why Vaccines Aren't Just for Children",
      category: "Preventive Care",
      readTime: "3 min read",
      date: "Preventive Care",
      summary: "From annual influenza to pneumococcal and hepatitis immunizations: key vaccines recommended for adult and senior protection.",
      author: "Clinical Review • Dr. Anusri"
    },
    {
      id: "managing-multimorbidity",
      title: "Navigating Multi-Morbidity: Managing Diabetes, BP & Thyroid Together",
      category: "Chronic Care",
      readTime: "3 min read",
      date: "Internal Medicine",
      summary: "Balancing simultaneous chronic conditions through holistic medication reviews, organ protection, and unified care.",
      author: "Clinical Review • Dr. Anusri"
    },
    {
      id: "forgetfulness-vs-dementia",
      title: "Forgetfulness vs Dementia: Normal Lapses Compared to Cognitive Decline",
      category: "Brain Health",
      readTime: "3 min read",
      date: "Neurology Insights",
      summary: "Differentiating reversible stress and vitamin-related memory lapses from early neurocognitive changes.",
      author: "Clinical Review • Dr. Anusri"
    }
  ]
};

// Export or expose globally
// Export or expose globally
if (typeof window !== "undefined") {
  window.CLINIC_CONFIG = CLINIC_CONFIG;
}
