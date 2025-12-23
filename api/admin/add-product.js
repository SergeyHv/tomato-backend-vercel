import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, product } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Неверный пароль' });
  }

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const productId = String(product.id).trim();
    const existingRow = rows.find(r => String(r.get('id')).trim() === productId);

    // Подготавливаем данные: если поле - объект или массив, превращаем в строку
    const cleanData = {};
    Object.keys(product).forEach(key => {
        cleanData[key] = Array.isArray(product[key]) ? product[key].join(', ') : product[key];
    });

    if (existingRow) {
      sheet.headerValues.forEach(h => {
        if (cleanData[h] !== undefined) existingRow.set(h, cleanData[h]);
      });
      await existingRow.save();
      return res.status(200).json({ message: 'OK' });
    } else {
      await sheet.addRow(cleanData);
      return res.status(200).json({ message: 'OK' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
