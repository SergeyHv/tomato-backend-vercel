import { GoogleSpreadsheet } from 'google-spreadsheet';

export default async function handler(req, res) {
  try {
    // Подключаемся к таблице по ID
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);

    // Авторизация через сервисный аккаунт
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    // Загружаем таблицу
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // первая вкладка
    const rows = await sheet.getRows();

    // Преобразуем строки в массив объектов
    const products = rows.map(row => ({
      name: row.Name,
      price: row.Price,
      category: row.Category,
    }));

    // Отправляем JSON
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
