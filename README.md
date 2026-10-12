# Dr. Anusri Adusumilli — EDGE Clinic Website & WhatsApp Booking Engine

A minimalist, aesthetic, and high-performance clinic website engineered specifically for **Dr. Anusri Adusumilli (MBBS, MD General Medicine)** at **EDGE Clinic | The Medical Centre**. Built with state-of-the-art **SEO**, **GEO (Local Search)**, and **AEO (Answer Engine Optimization for AI Search like Perplexity, ChatGPT & Gemini)**, featuring a full patient slot booking system with **instant Doctor & Patient WhatsApp alerts** and **automated 2-hour pre-appointment reminders**.

---

## 🌟 Key Highlights & Features

### 1. Doctor & Patient WhatsApp Notification Engine
- **Doctor & Clinic Desk Alert:** Immediately notifies Dr. Anusri & EDGE Clinic reception (`+91 63032 85050`) on WhatsApp with complete patient details (Name, Age, Phone, Symptoms, First-visit status, Slot time, and Service).
- **Patient Instant Confirmation:** Immediately sends an official appointment confirmation to the patient's WhatsApp with reference number, address, parking info, and guidelines.
- **Automated 2-Hour Reminder:** Automatically schedules and dispatches a pre-appointment reminder 2 hours prior to the patient's booked consultation.
- **Interactive Message Previews:** In-app WhatsApp chat bubble preview allows patients and clinic staff to preview message formats with one tap.

### 2. Verified Physician & Clinic Details
- **Doctor:** Dr. Anusri Adusumilli (MBBS, MD)
- **Clinic:** EDGE Clinic — The Medical Centre, Jubilee Hills, Hyderabad
- **Helpline & Direct WhatsApp:** `+91 63032 85050`
- **Consultation Hours:** Monday – Saturday: 9:00 AM – 4:00 PM (Sunday Closed)
- **Clinical Specializations:** Infections, Diabetes, Hypertension, Hypothyroidism, Multimorbidity, Geriatric Care, Health Screening, Adult Vaccination, and Undiagnosed Complex Conditions.

### 3. Minimalist & Aesthetic Healthcare Design System
- **Color Palette:** Deep Medical Slate Forest (`#0c3834`), Calm Sage (`#eef6f3`, `#2a8a7c`), and Warm Sand accents.
- **Typography:** Google Fonts *Plus Jakarta Sans* paired with *Newsreader* serif accents for clinical prestige.
- **Micro-Interactions:** Ambient glassmorphism, responsive date carousels, dynamic time slot pills, and ticket-style confirmation receipt.

### 4. Super SEO, GEO & AEO Architecture
- **Schema.org Structured Data:** Dual `@type: ["Physician", "MedicalBusiness"]` schema with GPS coordinates, hours, accepted payment modes, and neighborhood coverage (`areaServed`).
- **AEO (Answer Engine Optimization):** Dedicated `FAQPage` JSON-LD schema matching exact queries for Perplexity, ChatGPT, and Google AI Overviews.
- **NAP Consistency:** Structured Name, Address, and Phone formatting with 1-click **"Copy Full Address"** and Google Maps directions link.

---

## 🛠️ Configuration & Customization

All doctor details, notification templates, clinic contact numbers, and consultation fees are centralized in:  
👉 [`config.js`](file:///Users/suryatejgarikipati/.gemini/antigravity-ide/scratch/dr-anusri-clinic/config.js)

### Editing Notification Templates:
```javascript
// Located in config.js:
notifications: {
  doctorNotificationNumber: "916303285050",
  reminderLeadHours: 2,
  templates: {
    doctorAlert: (data) => `...`,
    patientConfirmation: (data) => `...`,
    patientReminder: (data) => `...`
  }
}
```

---

## 🚀 Running the Server & Notifications

The website runs on a native Node.js backend server with built-in REST endpoints:

```bash
# Start server
node server.js
```

### Endpoints:
- `http://localhost:3000` — Web app & booking portal
- `POST /api/book-appointment` — Dispatches doctor & patient notifications and schedules 2-hour reminder
- `GET /api/notifications` — View dispatched WhatsApp alerts log
- `GET /api/appointments` — View stored appointment bookings
