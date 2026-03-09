# Google Sheets Order Capture (Setup)

This project sends order data via `fetch()` to a Google Apps Script Web App URL. The script then writes orders into a Google Sheet.

## 1) Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. Rename the first sheet (tab) to `Orders`.
3. Add headers in row 1, for example:
   - `Timestamp`
   - `Name`
   - `Email`
   - `Items`
   - `Total`

## 2) Create the Apps Script Web App
1. With the sheet open, go to **Extensions > Apps Script**.
2. In the script editor, replace the default code with the script below.

```javascript
// This is a simple Apps Script Web App that accepts JSON orders and writes them into a sheet.
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
    if (!sheet) throw new Error('Sheet "Orders" not found.');

    const timestamp = new Date();
    const items = (data.items || [])
      .map(i => `${i.name} (x${i.quantity}) @ $${i.unitPrice.toFixed(2)}`)
      .join(' | ');

    sheet.appendRow([timestamp, data.customerName, data.customerEmail, items, data.total]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error(err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3) Deploy as a Web App
1. In Apps Script, click **Deploy > New deployment**.
2. Select **Web app**.
3. Under **Execute as**, choose **Me**.
4. Under **Who has access**, choose **Anyone** (or **Anyone with link**).
5. Click **Deploy**.
6. Copy the **Web app URL**.

## 4) Update the site code with your Web App URL
1. Open `scripts/app.js`.
2. Find the `const url = ...` line in `submitOrder()`.
3. Replace the placeholder URL with your Web App URL.

## 5) Verify
1. Run the site via a local web server (recommended) so the browser origin is not `file://`.
   - From a terminal, run one of:
     - `python -m http.server 8000` (Python 3)
     - `npx serve .`
     - `npx http-server .`
   - Then open: `http://localhost:8000`
2. Add an item to the cart in the site.
3. Click **View Cart** and then **Checkout**.
4. In the prompts, enter your name and email.
5. Look at your Google Sheet — a new row should appear.

---

> ⚠️ Note: The app currently uses `prompt()` to collect name/email. For a better user experience, you can implement a checkout form on the cart page and send its values to `submitOrder()` instead.

> ⚠️ If you see "Error sending order" again, open the browser Console (F12) and look for the error message we log. It will tell you whether the issue is CORS, a bad URL, or something else.