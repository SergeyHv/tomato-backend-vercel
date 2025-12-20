import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Filters from "./components/Filters";
import ProductGrid from "./components/ProductGrid";
import { loadProducts } from "./utils/adapter";

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  // ✅ Загружаем данные из backend через adapter.js
  useEffect(() => {
    loadProducts().then(setProducts);
  }, []);

  // ✅ Маппер категории (backend → frontend)
  function mapCategory(cat) {
    switch (cat) {
      case "tomatoes":
        return "Томат";
      case "peppers":
        return "Перец";
      case "cucumbers":
        return "Огурец";
      default:
        return "";
    }
  }

  // ✅ Фильтрация
  let filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? p.type === mapCategory(category) : true;
    return matchesSearch && matchesCategory;
  });

  // ✅ Сортировка
  if (sort === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  }

  if (sort === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  if (sort === "name-asc") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sort === "name-desc") {
    filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
  }

  return (
    <div>
      <Header />

      <Filters
        onSearch={(value) => setSearch(value)}
        onCategory={(value) => setCategory(value)}
        onSort={(value) => setSort(value)}
      />

      <ProductGrid products={filtered} />
    </div>
  );
}
