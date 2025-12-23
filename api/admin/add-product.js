import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, product } = req.body;

  // Проверка пароля из переменных окружения
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Неверный пароль' });
  }

  try {
    // Используем ПРОВЕРЕННЫЕ имена переменных
    const pKey = process.env.GOOGLE_PRIVATE_KEY;
    const pEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const pSheetId = process.env.GOOGLE_SHEET_ID;

    if (!pKey) throw new Error("GOOGLE_PRIVATE_KEY не найден в Vercel");

    const serviceAccountAuth = new JWT({
      email: pEmail,
      key: pKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(pSheetId, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    
    // Загружаем заголовки, чтобы метод addRow понимал, куда писать
    await sheet.loadHeaderRow();

    // Добавляем строку. Библиотека сама сопоставит ключи объекта с именами колонок.
    await sheet.addRow({
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      description: product.description,
      tags: product.tags,
      images: product.images,
      stock: product.stock || "TRUE"
    });

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error("Server Error:", error.message);
    return res.status(500).json({ error: "Ошибка таблицы: " + error.message });
  }
}
