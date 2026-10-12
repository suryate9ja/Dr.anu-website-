# 📊 Google Sheets Auto-Sync Setup Guide

This guide walks you through automatically and securely saving all consultation bookings from **Dr. Anusri Adusumilli's Clinic** into a Google Sheet in real time.

---

## 🔒 Security Guarantee
- **Zero Frontend Exposure**: Your Google credentials, secret keys, or Web App URLs are **never sent to or exposed in the visitor's browser**.
- **Backend Relay**: The browser submits patient data to your secure local Node.js endpoint (`/api/book-appointment`). Your server then authenticates and forwards the structured booking data directly to Google Sheets in the background.

---

## Choose Your Preferred Setup Method

| Feature | Method 1: Google Apps Script (Recommended) | Method 2: Google Service Account |
| :--- | :--- | :--- |
| **Setup Time** | **2 minutes** | 5–10 minutes |
| **Google Cloud Console Required?** | ❌ No | ✅ Yes (Google Cloud Project) |
| **Credentials File to Download?** | ❌ None needed | ✅ Yes (`google-service-account.json`) |
| **Cost** | 100% Free | 100% Free |

---

## Method 1: Google Apps Script Web App (Easiest — 2 Minutes)

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new sheet (e.g. named `Dr. Anusri Clinic - Consultation Bookings`).
2. Keep the sheet open.

### Step 2: Open Apps Script
1. In the Google Sheets top menu, click **Extensions > Apps Script**.
2. Delete any existing code inside `Code.gs`.
3. Open the file [`google-apps-script.js`](./google-apps-script.js) from your project folder, copy all of its contents, and paste it into `Code.gs`.
4. Click the **Save** icon (💾).

### Step 3: Deploy as a Web App
1. At the top right of Apps Script, click **Deploy > New deployment**.
2. Next to "Select type", click the **Gear icon (⚙️)** and select **Web app**.
3. Fill in the fields:
   - **Description**: `Clinic Booking Sync`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Note: This allows your server to POST data to the script)*.
4. Click **Deploy**.
5. If Google asks to authorize permissions:
   - Click **Authorize access**.
   - Choose your Google account.
   - Click **Advanced > Go to Untitled project (unsafe)**.
   - Click **Allow**.
6. Copy the **Web app URL** that appears (it looks like: `https://script.google.com/macros/s/AKfycb.../exec`).

### Step 4: Add URL to your Config
Open [`google-sheets-config.json`](./google-sheets-config.json) in your project folder:
```json
{
  "googleAppsScriptUrl": "https://script.google.com/macros/s/YOUR_COPIED_URL_HERE/exec",
  "sheetId": "",
  "sheetTabName": "Sheet1",
  "credentialsFile": "./credentials/google-service-account.json"
}
```
Paste your URL into `"googleAppsScriptUrl"`. **Save the file.**

🎉 **Done!** Every new appointment booked on your site will automatically appear in your Google Sheet with:
- Booking Reference ID
- Date & Time (IST)
- Patient Full Name
- Verified Mobile Number
- Consultation Mode (In-Clinic / Online Video)
- Appointment Date & Slot
- Consultation Fee
- Patient First Visit Status
- Confirmation & Video/Clinic Link

---

## Method 2: Google Cloud Service Account (Direct Sheets REST API v4)

If you prefer using a Google Cloud Service Account with a private key JSON file:

### Step 1: Create Service Account in Google Cloud
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable the **Google Sheets API**:
   - Search for **Google Sheets API** and click **Enable**.
4. Go to **APIs & Services > Credentials**.
5. Click **Create Credentials > Service Account**:
   - Service account name: `dr-anusri-sheets-sync`
   - Role: `Editor` or `Owner`.
6. Click on the created service account > Go to the **Keys** tab.
7. Click **Add Key > Create new key > JSON**.
8. A `.json` file will download to your computer.

### Step 2: Where to Place the Credentials File
1. Rename the downloaded file to: `google-service-account.json`.
2. Move it into the dedicated `credentials/` folder inside your project directory:
   ```
   dr-anusri-clinic/
   ├── credentials/
   │   └── google-service-account.json   <-- PUT FILE HERE
   ├── google-sheets-config.json
   └── server.js
   ```
   *(Note: The `credentials/` directory is automatically added to `.gitignore` so your private key is never accidentally committed or exposed).*

### Step 3: Share the Google Sheet with your Service Account
1. Open your downloaded `google-service-account.json` and copy the `client_email` value (e.g. `dr-anusri-sheets-sync@your-project.iam.gserviceaccount.com`).
2. Open your Google Sheet in your browser.
3. Click the green **Share** button at the top right.
4. Paste the service account email and grant **Editor** access. Click **Send/Share**.

### Step 4: Configure `sheetId`
1. Copy the Spreadsheet ID from the URL of your Google Sheet:
   `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`
2. Open [`google-sheets-config.json`](./google-sheets-config.json) and set:
   ```json
   {
     "googleAppsScriptUrl": "",
     "sheetId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
     "sheetTabName": "Sheet1",
     "credentialsFile": "./credentials/google-service-account.json"
   }
   ```
3. Save the file.

---

## Verifying the Integration

To check if your Google Sheets integration is connected, visit:
👉 **[http://localhost:3000/api/google-sheets-status](http://localhost:3000/api/google-sheets-status)**

It will show:
```json
{
  "success": true,
  "configured": true,
  "activeMethod": "Google Apps Script Web App"
}
```
