import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
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

    const products = rows.map(row => ({
      id: row.get('id') || '',
      title: row.get('title') || '',
      price: row.get('price') || '',
      images: row.get('images') || '',
      category: row.get('category') || '',
      tags: row.get('tags') || '',
      description: row.get('description') || '',
      props: row.get('props') || ''
    }));

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
