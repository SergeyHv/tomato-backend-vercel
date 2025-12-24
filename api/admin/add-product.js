import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешен. Используйте POST.' });
  }

  const { password, title, category, price, description, tags, images, props } = req.body;

  // Проверка пароля
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Неверный пароль администратора' });
  }

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Добавляем строку. Ключи должны строго совпадать с заголовками в таблице!
    await sheet.addRow({
      id: Date.now().toString(),
      title: title || "",
      price: price || "1.5",
      images: images || "",
      category: category || "",
      tags: tags || "",
      description: description || "",
      stock: "TRUE",
      props: props || "" // 9-я колонка
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Ошибка API:", error);
    return res.status(500).json({ details: error.message });
  }
}
