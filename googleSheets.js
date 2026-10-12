/**
 * SECURE GOOGLE SHEETS SYNC MODULE
 * =================================
 * Securely logs consultation booking data to Google Sheets from the server.
 * 
 * Supports TWO secure integration methods (Neither exposes credentials to browser):
 * 
 * Method 1: Google Apps Script Web App (Easiest & Free)
 *   - Configure "googleAppsScriptUrl" in google-sheets-config.json
 *   - Server relays booking data via secure HTTPS POST
 * 
 * Method 2: Google Cloud Service Account (Direct Sheets REST API v4)
 *   - Put your downloaded service account JSON at:
 *     ./credentials/google-service-account.json
 *   - Configure "sheetId" in google-sheets-config.json
 *   - Uses native Node.js crypto for JWT OAuth2 signing (zero dependencies)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const CONFIG_PATH = path.join(__dirname, 'google-sheets-config.json');
const CREDENTIALS_DIR = path.join(__dirname, 'credentials');
const DEFAULT_CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'google-service-account.json');

// Ensure credentials directory exists
if (!fs.existsSync(CREDENTIALS_DIR)) {
  fs.mkdirSync(CREDENTIALS_DIR, { recursive: true });
}

/**
 * Read configuration safely
 */
function getGoogleConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch (err) {
    console.warn('[GoogleSheets] Failed to parse google-sheets-config.json:', err.message);
  }
  return {};
}

/**
 * Format a booking payload into clean row fields for Google Sheets
 */
function formatBookingRow(booking) {
  const patient = booking.patient || {};
  const service = booking.service || {};
  const dateObj = booking.date || {};

  const bookingId = booking.id || `ANUSRI-${Date.now().toString().slice(-4)}`;
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const patientName = patient.name || 'Anonymous';
  const patientPhone = patient.phone || '';
  const isOnline = (service.mode === 'online' || service.id === 'online');
  const mode = isOnline ? 'Online Consultation' : 'In-Clinic (Offline)';
  const serviceName = service.title || service.name || (isOnline ? 'Online Consultation' : 'In-Clinic Consultation');
  const appointmentDate = dateObj.formatted || dateObj.dateString || '';
  const slot = booking.slot || '';
  const fee = service.fee || '₹600';
  const firstVisit = patient.firstVisit ? 'Yes' : 'No';
  const status = 'Confirmed (OTP Verified)';
  const consultationInfo = isOnline ? 'Online Consultation (Phone / WhatsApp)' : 'EDGE Clinic, The Medical Centre, HITEC City';

  return {
    rowValues: [
      bookingId,
      timestamp,
      patientName,
      patientPhone,
      mode,
      serviceName,
      appointmentDate,
      slot,
      fee,
      firstVisit,
      status,
      consultationInfo
    ],
    objectData: {
      bookingId,
      timestamp,
      patientName,
      patientPhone,
      mode,
      serviceName,
      appointmentDate,
      slot,
      fee,
      firstVisit,
      status,
      consultationInfo
    }
  };
}

/**
 * METHOD 1: Send via Google Apps Script Web App (HTTP POST Relay)
 */
function sendViaAppsScript(webAppUrl, payload) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(webAppUrl);
      const postData = JSON.stringify(payload);

      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        // Apps Script responds with a 302 redirect to googleusercontent.com when successful
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location);
          const redirectOptions = {
            hostname: redirectUrl.hostname,
            path: redirectUrl.pathname + redirectUrl.search,
            method: 'GET' // Follow redirect
          };

          const redirectReq = https.request(redirectOptions, (redRes) => {
            let redData = '';
            redRes.on('data', chunk => { redData += chunk; });
            redRes.on('end', () => {
              if (redRes.statusCode >= 200 && redRes.statusCode < 300) {
                if (redData.includes('Script function not found')) {
                  reject(new Error('Google Apps Script error: "Script function not found: doPost". Code.gs still has default template or was not saved before deployment.'));
                  return;
                }
                resolve({ success: true, method: 'apps-script-redirect', status: redRes.statusCode, data: redData });
              } else {
                reject(new Error(`Apps Script redirect failed with HTTP status ${redRes.statusCode}: ${redData.slice(0, 150)}`));
              }
            });
          });
          redirectReq.on('error', err => reject(err));
          redirectReq.end();
          return;
        }

        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            if (data.includes('Script function not found')) {
              reject(new Error('Google Apps Script error: "Script function not found: doPost". Code.gs does not contain doPost or was not deployed with a New version.'));
              return;
            }
            resolve({ success: true, method: 'apps-script', status: res.statusCode, data });
          } else if (res.statusCode === 401 || res.statusCode === 403) {
            reject(new Error(`Google Apps Script returned HTTP ${res.statusCode} Unauthorized. Please check your deployment settings: "Who has access" must be set to "Anyone".`));
          } else {
            reject(new Error(`Google Apps Script returned HTTP status ${res.statusCode}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(postData);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Base64 URL Encoder for JWT
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * METHOD 2: OAuth2 JWT Token generation for Google Service Account (Native Node.js Crypto)
 */
function getServiceAccountAccessToken(serviceAccount) {
  return new Promise((resolve, reject) => {
    try {
      const now = Math.floor(Date.now() / 1000);
      const header = { alg: 'RS256', typ: 'JWT' };
      const claim = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
      };

      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedClaim = base64UrlEncode(JSON.stringify(claim));
      const signatureInput = `${encodedHeader}.${encodedClaim}`;

      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signatureInput);
      const signature = signer.sign(serviceAccount.private_key, 'base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const jwt = `${signatureInput}.${signature}`;
      const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;

      const options = {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.access_token) {
              resolve(parsed.access_token);
            } else {
              reject(new Error(`Failed to get Google OAuth token: ${body}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', err => reject(err));
      req.write(postData);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Append row to Google Sheet using Google Sheets REST API v4
 */
function appendRowViaServiceAccount(accessToken, spreadsheetId, rowValues, sheetName = 'Sheet1') {
  return new Promise((resolve, reject) => {
    try {
      const range = encodeURIComponent(`${sheetName}!A1`);
      const pathUrl = `/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
      const postData = JSON.stringify({
        values: [rowValues]
      });

      const options = {
        hostname: 'sheets.googleapis.com',
        path: pathUrl,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, method: 'service-account', response: JSON.parse(body) });
          } else {
            reject(new Error(`Google Sheets API Error (${res.statusCode}): ${body}`));
          }
        });
      });

      req.on('error', err => reject(err));
      req.write(postData);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Main Sync Function: Dispatches booking to Google Sheets
 */
async function syncBookingToGoogleSheet(bookingData) {
  const config = getGoogleConfig();
  const { rowValues, objectData } = formatBookingRow(bookingData);

  // Check 1: Google Apps Script Web App configured?
  if (config.googleAppsScriptUrl && config.googleAppsScriptUrl.trim().startsWith('https://')) {
    try {
      console.log('[GoogleSheets] 📤 Relaying booking to Google Apps Script Web App...');
      const res = await sendViaAppsScript(config.googleAppsScriptUrl.trim(), objectData);
      console.log('[GoogleSheets] ✅ Booking successfully saved to Google Sheet via Apps Script!');
      return { success: true, method: 'apps-script', detail: res };
    } catch (err) {
      console.error('[GoogleSheets] ⚠️ Error relaying to Google Apps Script:', err.message);
    }
  }

  // Check 2: Service Account Credentials file present?
  const credsPath = config.credentialsFile || DEFAULT_CREDENTIALS_FILE;
  if (fs.existsSync(credsPath) && config.sheetId && config.sheetId.trim()) {
    try {
      console.log('[GoogleSheets] 🔑 Authenticating with Google Cloud Service Account...');
      const serviceAccount = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
      const token = await getServiceAccountAccessToken(serviceAccount);
      
      console.log('[GoogleSheets] 📊 Appending row to Google Sheet ID:', config.sheetId);
      const res = await appendRowViaServiceAccount(token, config.sheetId.trim(), rowValues, config.sheetTabName || 'Sheet1');
      console.log('[GoogleSheets] ✅ Booking successfully appended to Google Sheet via REST API!');
      return { success: true, method: 'service-account', detail: res };
    } catch (err) {
      console.error('[GoogleSheets] ⚠️ Error appending to Google Sheet via Service Account:', err.message);
    }
  }

  // Neither configured yet
  console.log('[GoogleSheets] ℹ️ Google Sheets sync skipped (No credentials configured yet in google-sheets-config.json).');
  return { 
    success: false, 
    skipped: true, 
    message: 'Google Sheets sync not configured yet. Place service account in ./credentials/ or set googleAppsScriptUrl in google-sheets-config.json.' 
  };
}

module.exports = {
  syncBookingToGoogleSheet,
  formatBookingRow,
  getGoogleConfig,
  DEFAULT_CREDENTIALS_FILE,
  CONFIG_PATH
};
