export default function handler(req, res) {
  res.status(200).json({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    privateKeyStart: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.substring(0, 50)
  });
}

