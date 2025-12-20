import Header from "./components/Header";
return (
  <div>
    <Header />

    <div style={{ padding: 20 }}>
      <h1>Томатный Рай — новый фронтенд</h1>
      <p>Тестовая загрузка данных из backend:</p>

      <pre>{JSON.stringify(products, null, 2)}</pre>
    </div>
  </div>
);

