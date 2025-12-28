import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const {
    password,
    id,
    title,
    price,
    images,
    category,
    tags,
    description,
    stock,
    props
  } = req.body;

  // 🔐 ОДИНАКОВАЯ АВТОРИЗАЦИЯ КАК В delete-product
  if (password !== 'khvalla74') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      auth
    );

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const existingRow = rows.find(r => r.get('id') === id);

    const baseData = {
      id,
      title,
      price: price || '',
      category: category || '',
      tags: tags || '',
      description: description || '',
      stock: stock || 'TRUE',
      props: props || ''
    };

    if (existingRow) {
      Object.assign(existingRow, baseData);
      if (images && images.trim()) {
        existingRow.images = images;
      }
      await existingRow.save();
      return res.status(200).json({ success: true, mode: 'updated' });
    }

    await sheet.addRow({
      ...baseData,
      images: images || ''
    });

    return res.status(200).json({ success: true, mode: 'added' });

  } catch (err) {
    console.error('ADD PRODUCT ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}
