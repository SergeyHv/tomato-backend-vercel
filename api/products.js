import { GoogleSpreadsheet } from 'google-spreadsheet';

export default async function handler(req, res) {
  // ✅ CORS — разрешаем запросы с фронтенда
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Preflight (браузер отправляет OPTIONS перед GET)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const products = rows.map(row => ({
      id: row.id,
      title: row.title,
      price: row.price,
      images: row.images,
      category: row.category,
      tags: row.tags,
      description: row.description,
      stock: row.stock,
      props: row.props,
    }));

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
