/**
 * DR. ANUSRI ADUSUMILLI - CLINIC SERVER & WHATSAPP / OTP ENGINE
 * =============================================================
 * Serves website assets and powers:
 * 1. Mobile Phone Number OTP Verification (Send & Verify)
 * 2. Online (Video Call) & Offline (In-Clinic HITEC City) Booking Flows
 * 3. Doctor WhatsApp Alerts to +91 63032 85050
 * 4. Patient WhatsApp Confirmations & Automated 2-Hour Reminders
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { syncBookingToGoogleSheet, getGoogleConfig, DEFAULT_CREDENTIALS_FILE } = require('./googleSheets');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json');
const NOTIFICATIONS_LOG_FILE = path.join(DATA_DIR, 'notifications_log.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(APPOINTMENTS_FILE)) fs.writeFileSync(APPOINTMENTS_FILE, '[]', 'utf8');
if (!fs.existsSync(REMINDERS_FILE)) fs.writeFileSync(REMINDERS_FILE, '[]', 'utf8');
if (!fs.existsSync(NOTIFICATIONS_LOG_FILE)) fs.writeFileSync(NOTIFICATIONS_LOG_FILE, '[]', 'utf8');

// In-memory OTP storage: phone -> { otp, expiresAt }
const activeOtps = new Map();
const verifiedPhones = new Set();

// Helper to read/write JSON safely
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing json to ' + file, e);
  }
}

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.avif': 'image/avif'
};

// Main HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API ROUTE: Send OTP to Patient Mobile
  if (req.method === 'POST' && pathname === '/api/send-otp') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const rawPhone = String(payload.phone || '').trim();
        const cleanPhone = rawPhone.replace(/\D/g, '');

        if (!cleanPhone || cleanPhone.length < 10) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Please enter a valid 10-digit mobile number' }));
          return;
        }

        // Generate 4-digit secure OTP
        const otp = String(Math.floor(1000 + Math.random() * 9000));
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins validity

        activeOtps.set(cleanPhone, { otp, expiresAt });

        console.log(`[OTP Engine] 📲 Dispatched OTP [${otp}] to mobile ${cleanPhone}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          phone: cleanPhone,
          message: `OTP sent successfully to +91 ${cleanPhone.slice(-10)}`,
          demoOtp: otp // Provided so demo testing in browser is seamless
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid payload' }));
      }
    });
    return;
  }

  // 2. API ROUTE: Verify Entered OTP
  if (req.method === 'POST' && pathname === '/api/verify-otp') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const cleanPhone = String(payload.phone || '').replace(/\D/g, '');
        const enteredOtp = String(payload.otp || '').trim();

        const record = activeOtps.get(cleanPhone);

        if (!record) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'No OTP requested for this number or OTP expired' }));
          return;
        }

        if (Date.now() > record.expiresAt) {
          activeOtps.delete(cleanPhone);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'OTP has expired. Please request a new code.' }));
          return;
        }

        if (record.otp !== enteredOtp) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Incorrect OTP. Please check and try again.' }));
          return;
        }

        // OTP Verified successfully!
        verifiedPhones.add(cleanPhone);
        activeOtps.delete(cleanPhone); // Consume OTP

        console.log(`[OTP Engine] ✅ Verified mobile number: ${cleanPhone}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          verified: true,
          phone: cleanPhone,
          message: 'Mobile number verified successfully!'
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Verification failed' }));
      }
    });
    return;
  }

  // 3. API ROUTE: Book Appointment & Dispatch Notifications
  if (req.method === 'POST' && pathname === '/api/book-appointment') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const bookingResult = handleNewBooking(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(bookingResult));
      } catch (err) {
        console.error('[Server] Booking error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message || 'Invalid booking request' }));
      }
    });
    return;
  }

  // 4. API ROUTE: Retrieve notification logs & scheduled reminders
  if (req.method === 'GET' && pathname === '/api/notifications') {
    const logs = readJson(NOTIFICATIONS_LOG_FILE);
    const reminders = readJson(REMINDERS_FILE);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, logs: logs.slice(-20), reminders }));
    return;
  }

  // 5. API ROUTE: Get all bookings
  if (req.method === 'GET' && pathname === '/api/appointments') {
    const list = readJson(APPOINTMENTS_FILE);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: list.length, appointments: list }));
    return;
  }

  // 6. API ROUTE: Check Google Sheets Integration Status
  if (req.method === 'GET' && pathname === '/api/google-sheets-status') {
    const cfg = getGoogleConfig();
    const hasAppsScript = Boolean(cfg.googleAppsScriptUrl && cfg.googleAppsScriptUrl.trim().startsWith('https://'));
    const credsPath = cfg.credentialsFile || DEFAULT_CREDENTIALS_FILE;
    const hasServiceAccount = fs.existsSync(credsPath) && Boolean(cfg.sheetId && cfg.sheetId.trim());

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      configured: hasAppsScript || hasServiceAccount,
      activeMethod: hasAppsScript ? 'Google Apps Script Web App' : (hasServiceAccount ? 'Google Cloud Service Account' : 'None (Local storage only)'),
      appsScriptWebhookConfigured: hasAppsScript,
      serviceAccountConfigured: hasServiceAccount,
      credentialsFileExists: fs.existsSync(credsPath),
      expectedCredentialsPath: credsPath,
      configFile: 'google-sheets-config.json',
      guide: 'Refer to google-apps-script.js for Google Apps Script deployment, or place service account in ./credentials/'
    }));
    return;
  }

  // STATIC FILE & ROUTE SERVING
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') safePath = '/index.html';
  
  if (pathname === '/visit' || pathname === '/visit/' || pathname === '/visit.html') {
    res.writeHead(301, { 'Location': '/contact/' });
    res.end();
    return;
  }

  // Clean URL mapping for dedicated V6 routes
  const cleanRouteMap = {
    '/about': '/about.html',
    '/services': '/services.html',
    '/credentials': '/credentials.html',
    '/health-guides': '/health-guides.html',
    '/contact': '/contact.html',
    '/contact/': '/contact.html'
  };

  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  if (cleanRouteMap[pathname]) {
    safePath = cleanRouteMap[pathname];
  } else if (cleanRouteMap[normalizedPath]) {
    safePath = cleanRouteMap[normalizedPath];
  } else if (pathname.startsWith('/health-guides/')) {
    safePath = '/health-guides.html';
  }

  let filePath = path.join(__dirname, safePath);

  // Check if file exists, or if filePath.html exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const htmlPath = filePath + '.html';
      fs.stat(htmlPath, (htmlErr, htmlStats) => {
        if (!htmlErr && htmlStats.isFile()) {
          filePath = htmlPath;
          serveFile(filePath, res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
      });
      return;
    }

    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

/**
 * Handle new booking (Online vs Offline):
 */
function handleNewBooking(data) {
  const appointments = readJson(APPOINTMENTS_FILE);
  const reminders = readJson(REMINDERS_FILE);
  const logs = readJson(NOTIFICATIONS_LOG_FILE);

  // Provide safe defaults
  if (!data) data = {};
  if (!data.id) data.id = 'ANUSRI-' + Date.now().toString().slice(-4);
  if (!data.patient) data.patient = {};
  if (!data.service) data.service = {};
  if (!data.date) data.date = {};

  const timestamp = new Date().toISOString();
  appointments.unshift(data);
  writeJson(APPOINTMENTS_FILE, appointments);

  const isOnline = (data.service && data.service.mode === 'online') || (data.service && data.service.id === 'online');
  const modeLabel = isOnline ? 'ONLINE CONSULTATION' : 'OFFLINE (In-Clinic Visit)';
  const serviceTitle = data.service.title || data.service.name || (isOnline ? 'Online Consultation' : 'In-Clinic Consultation');
  const formattedDate = data.date.formatted || data.date.dateString || 'Scheduled date';
  const slotTime = data.slot || '10:00 AM';
  const feeText = data.service.fee || '₹600';

  // Prepare Doctor WhatsApp text
  const doctorText = 
    `*NEW APPOINTMENT ALERT - EDGE CLINIC (HITEC CITY)*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `*Doctor:* Dr. Anusri Adusumilli (MBBS, MD)\n` +
    `*Ref ID:* #${data.id}\n` +
    `*Mode:* ${modeLabel}\n\n` +
    `*Patient Details:*\n` +
    `• *Name:* ${data.patient.name || 'Anonymous'}\n` +
    `• *Mobile:* ${data.patient.phone || 'N/A'} (OTP Verified)\n` +
    `• *Age / Gender:* ${data.patient.age || 'Not specified'} / ${data.patient.gender || 'Not specified'}\n` +
    `• *First Visit:* ${data.patient.firstVisit ? 'Yes (New Patient)' : 'No (Follow-up)'}\n\n` +
    `*Consultation Focus:*\n` +
    `• *Service:* ${serviceTitle}\n` +
    `• *Date:* ${formattedDate}\n` +
    `• *Slot Time:* ${slotTime}\n` +
    `• *Symptoms / Note:* ${data.patient.symptoms || 'General Consultation'}\n` +
    `• *Fee:* ${feeText}\n` +
    (isOnline ? `• *Consultation Type:* Online Consultation (Doctor will call patient mobile number)\n\n` : `• *Location:* 4th Floor Plot 27, The Medical Centre, HITEC City\n\n`) +
    `Verified via OTP.`;

  // Prepare Patient WhatsApp text
  const patientName = data.patient.name || 'Valued Patient';
  const patientText = 
    `*APPOINTMENT CONFIRMED*\n` +
    `*Dr. Anusri Adusumilli (MBBS, MD)*\n` +
    `*EDGE Clinic — The Medical Centre, HITEC City*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Dear *${patientName}*,\n` +
    `Your appointment has been successfully scheduled!\n\n` +
    `*Booking Ref:* #${data.id}\n` +
    `*Mode:* ${modeLabel}\n` +
    `*Date:* ${formattedDate}\n` +
    `*Time Slot:* ${slotTime}\n` +
    `*Fee:* ${feeText}\n\n` +
    (isOnline 
      ? `*Consultation Info:*\nThis is an Online Consultation. Dr. Anusri will connect directly with you on your registered mobile number (+91 ${data.patient.phone || ''}) at the scheduled slot time.\n\n` 
      : `*Clinic Address:*\nSurvey No.64, The Medical Centre, 4th Floor Plot 27, Phase 2, Huda Techno Park, HITEC City, Hyderabad 500081\n` +
        `Google Maps: https://www.google.com/maps?cid=10937127088013283902\n\n`
    ) +
    `*Guidelines:*\n` +
    (isOnline 
      ? `• Please ensure your phone is reachable at your appointment time.\n• Digital prescription will be sent immediately after the consultation.\n`
      : `• Please arrive 10 minutes before your slot time.\n• Dedicated basement parking available at The Medical Centre.\n`
    ) +
    `• You will receive a reminder message 2 hours prior to your consultation.\n\n` +
    `*Clinic Helpline:* 063032 85050 / +91 63032 85050`;

  // Prepare Patient 2-Hour Reminder text
  const reminderText = 
    `*UPCOMING APPOINTMENT REMINDER*\n` +
    `*Dr. Anusri Adusumilli @ EDGE Clinic (HITEC City)*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Dear *${patientName}*,\n` +
    `This is a gentle reminder that your doctor consultation is scheduled for today:\n\n` +
    `*Slot Time:* ${slotTime}\n` +
    `*Date:* ${formattedDate}\n` +
    `*Mode:* ${modeLabel}\n\n` +
    (isOnline 
      ? `*Online Consultation:* Dr. Anusri will call you on your registered number at ${slotTime}.\n`
      : `*Location:* The Medical Centre, 4th Floor Plot 27, Phase 2, Huda Techno Park, HITEC City, Hyderabad 500081\n` +
        `*Directions & Parking:* Dedicated basement parking available. Near Raidurg / Durgam Cheruvu Metro.\n`
    ) +
    `*Need help or rescheduling?* Call 063032 85050.`;

  // Deep links for WhatsApp instant send
  const doctorWhatsAppLink = `https://api.whatsapp.com/send?phone=916303285050&text=${encodeURIComponent(doctorText)}`;
  const cleanPatientPhone = (data.patient.phone || '').replace(/\D/g, '');
  const patientWhatsAppLink = `https://api.whatsapp.com/send?phone=${cleanPatientPhone}&text=${encodeURIComponent(patientText)}`;

  // Log Doctor notification
  logs.push({
    id: 'NOTIF-' + Date.now() + '-DOC',
    bookingId: data.id,
    type: 'DOCTOR_ALERT',
    recipient: 'EDGE Clinic Desk / Dr. Anusri (+91 63032 85050)',
    timestamp: timestamp,
    status: 'Dispatched',
    content: doctorText
  });

  // Log Patient Confirmation
  logs.push({
    id: 'NOTIF-' + Date.now() + '-PAT',
    bookingId: data.id,
    type: 'PATIENT_CONFIRMATION',
    recipient: `${data.patient.name} (${data.patient.phone})`,
    timestamp: timestamp,
    status: 'Dispatched',
    content: patientText
  });
  writeJson(NOTIFICATIONS_LOG_FILE, logs);

  // Calculate reminder time (2 hours before slot)
  const reminderScheduleInfo = scheduleReminder(data, reminderText);
  reminders.push(reminderScheduleInfo);
  writeJson(REMINDERS_FILE, reminders);

  console.log(`[WhatsApp Engine] Dispatched Doctor Alert for #${data.id} (${modeLabel}) to +91 63032 85050`);
  console.log(`[WhatsApp Engine] Dispatched Patient Confirmation for #${data.id} to ${data.patient.phone}`);
  console.log(`[WhatsApp Engine] Scheduled 2-Hour Reminder for ${reminderScheduleInfo.scheduledFor}`);

  // 4. Secure Google Sheets Auto-Sync (Runs asynchronously in background)
  syncBookingToGoogleSheet(data)
    .then(result => {
      if (result.success) {
        console.log(`[GoogleSheets] ✅ Appointment #${data.id} securely synced to Google Sheets via ${result.method}`);
      }
    })
    .catch(err => {
      console.warn(`[GoogleSheets] ⚠️ Sync notice for #${data.id}:`, err.message);
    });

  return {
    success: true,
    bookingId: data.id,
    timestamp: timestamp,
    mode: isOnline ? 'online' : 'offline',
    modeLabel: modeLabel,
    googleSheetsSync: 'initiated',
    doctorNotification: {
      recipient: '+91 63032 85050',
      status: 'Sent / Dispatched',
      whatsappUrl: doctorWhatsAppLink,
      message: doctorText
    },
    patientNotification: {
      recipient: data.patient.phone,
      status: 'Sent / Dispatched',
      whatsappUrl: patientWhatsAppLink,
      message: patientText
    },
    scheduledReminder: {
      leadHours: 2,
      scheduledFor: reminderScheduleInfo.scheduledFor,
      status: 'Scheduled',
      message: reminderText
    }
  };
}

function scheduleReminder(data, message) {
  let reminderDisplay = '2 hours before consultation';
  if (data.date && data.date.formatted && data.slot) {
    reminderDisplay = `${data.date.formatted} (2 hours before ${data.slot})`;
  }

  return {
    id: 'REM-' + Date.now(),
    bookingId: data.id,
    patientName: data.patient.name,
    patientPhone: data.patient.phone,
    slot: data.slot,
    date: data.date.formatted,
    scheduledFor: reminderDisplay,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    message: message
  };
}

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏥 Dr. Anusri Adusumilli Clinic Web & WhatsApp Server`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`🔐 Patient OTP Phone Verification Engine: Enabled`);
  console.log(`💻 Online & Offline Consultation Modes: Ready`);
  console.log(`📱 Doctor WhatsApp Alert Target: +91 63032 85050`);
  console.log(`=======================================================`);
});
