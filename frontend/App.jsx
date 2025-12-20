import ProductGrid from "./components/ProductGrid";

import Header from "./components/Header";
return (
  <div>
    <Header />

    <div style={{ padding: 20 }}>
      <h1>Томатный Рай — новый фронтенд</h1>
      <p>Тестовая загрузка данных из backend:</p>

      <ProductGrid products={products} />
    </div>
  </div>
);

