import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { password, id, title, category, price, description, tags, images, props } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Wrong password' });
  }

  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Поиск существующей строки по ID
    const existingRow = rows.find(r => r.get('id') === id);

    const rowData = {
      id, title, category,
      price: price || "1.5",
      images: images || "",
      tags: tags || "",
      description: description || "",
      stock: "TRUE",
      props: props || ""
    };

    if (existingRow) {
      Object.assign(existingRow, rowData);
      await existingRow.save();
    } else {
      await sheet.addRow(rowData);
    }

    return res.status(200).json({ success: true, mode: existingRow ? 'updated' : 'added' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
