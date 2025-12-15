export default function Home() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Tomato Admin API</h1>
      <p>Этот сервис предоставляет API для админ-панели каталога томатов.</p>
      <p>Доступные эндпоинты:</p>
      <ul>
        <li><code>GET /api/list</code> - Получить список сортов</li>
        <li><code>POST /api/upload-image</code> - Загрузить изображение</li>
        <li><code>POST /api/add</code> - Добавить сорт (требуется реализация)</li>
        <li><code>POST /api/update</code> - Обновить сорт (требуется реализация)</li>
        <li><code>POST /api/delete</code> - Удалить сорт (требуется реализация)</li>
      </ul>
    </div>
  );
}

