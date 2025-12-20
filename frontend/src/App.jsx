import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Filters from "./components/Filters";
import { adaptProduct } from "./utils/adapter";

export default function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        console.log("Raw data from backend:", data);
        setProducts(data.map(adaptProduct));
      });
  }, []);

  return (
    <div>
      <Header />
      <Filters onSearch={(value) => console.log("search:", value)} />

      <div style={{ padding: 20 }}>
        <h1>Томатный Рай — новый фронтенд</h1>
        <p>Тестовая загрузка данных из backend:</p>

        <pre>{JSON.stringify(products, null, 2)}</pre>
      </div>
    </div>
  );
}
