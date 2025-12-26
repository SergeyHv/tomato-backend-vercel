import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' });
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

    const get = (row, key) => String(row.get(key) || '').trim();

    const products = rows.map(row => ({
      id: get(row, 'id'),
      title: get(row, 'title'),
      price: get(row, 'price'),
      images: get(row, 'images'),
      category: get(row, 'category'),
      tags: get(row, 'tags'),
      description: get(row, 'description'),
      props: get(row, 'props')
    }));

    res.status(200).json(products);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
