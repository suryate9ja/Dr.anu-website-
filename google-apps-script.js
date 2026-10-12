/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: DR. ANUSRI ADUSUMILLI CLINIC BOOKINGS
 * =========================================================================
 * 
 * INSTRUCTIONS:
 * 1. Open Google Sheets (create a new sheet or use an existing one).
 * 2. In Google Sheets menu, click: Extensions > Apps Script
 * 3. Delete any default code in Code.gs, paste this entire file, and click Save.
 * 4. Click: Deploy > New deployment
 * 5. Select type: "Web app"
 * 6. Set Description: "Clinic Booking Webhook"
 * 7. Set "Execute as": "Me (your email)"
 * 8. Set "Who has access": "Anyone"
 * 9. Click "Deploy", authorize permissions when prompted.
 * 10. Copy the "Web app URL" (starts with https://script.google.com/macros/s/...)
 * 11. Paste that URL into:
 *     google-sheets-config.json -> "googleAppsScriptUrl": "YOUR_COPIED_URL"
 * 
 * THAT'S IT! The backend will now automatically forward bookings to this sheet.
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Wait up to 10 seconds for concurrent writes

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if headers exist; if empty, create standard headers automatically
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Booking ID",
        "Timestamp (IST)",
        "Patient Full Name",
        "Mobile Number",
        "Consultation Mode",
        "Service Name",
        "Appointment Date",
        "Time Slot",
        "Fee",
        "First Consultation?",
        "Status",
        "Consultation Info / Location"
      ];
      sheet.appendRow(headers);
      
      // Style headers nicely
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#122130");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // Parse incoming JSON payload from Node.js backend
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    // Construct row
    var row = [
      data.bookingId || "ANUSRI-" + Utilities.getUuid().slice(0, 4),
      data.timestamp || Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss"),
      data.patientName || "Anonymous",
      data.patientPhone || "",
      data.mode || "In-Clinic (Offline)",
      data.serviceName || "In-Clinic Consultation",
      data.appointmentDate || "",
      data.slot || "",
      data.fee || "₹600",
      data.firstVisit || "Yes",
      data.status || "Confirmed (OTP Verified)",
      data.consultationInfo || (data.mode && data.mode.indexOf("Online") !== -1 ? "Online Consultation" : "EDGE Clinic, The Medical Centre, HITEC City")
    ];

    sheet.appendRow(row);

    // Format new row styling
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange(lastRow, 1, 1, row.length);
    range.setFontFamily("Arial");
    range.setFontSize(10);
    range.setVerticalAlignment("middle");

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      row: lastRow,
      bookingId: data.bookingId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Dr. Anusri Clinic Booking Webhook is online and active!").setMimeType(ContentService.MimeType.TEXT);
}
