import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import FiltersShell from "./components/FiltersShell";
import ProductGrid from "./components/ProductGrid";
import { loadProducts } from "./utils/adapter";

export default function App() {
  // ✅ Данные каталога
  const [products, setProducts] = useState([]);

  // ✅ Состояния фильтров
  const [search, setSearch] = useState("");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // ✅ Сортировка
  const [sort, setSort] = useState("popularity");

  // ✅ Корзина (пока пустая, но архитектура заложена)
  const [cart, setCart] = useState([]);

  // ✅ Загрузка данных из backend
  useEffect(() => {
    loadProducts().then(setProducts);
  }, []);

  // ✅ Фильтрация по поиску
  let filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Фильтрация по цвету
  if (selectedColor !== "all") {
    filtered = filtered.filter((p) => p.color === selectedColor);
  }

  // ✅ Фильтрация по типу
  if (selectedType !== "all") {
    filtered = filtered.filter((p) => p.type === selectedType);
  }

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
    <div className="pt-[90px]">
      {/* ✅ Фиксированный хедер */}
      <Header
        onSearch={setSearch}
        cartCount={cart.length}
      />

      {/* ✅ Кнопка “Фильтры” + раскрывающийся премиальный блок */}
      <FiltersShell
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        sort={sort}
        setSort={setSort}
      />

      {/* ✅ Каталог */}
      <ProductGrid products={filtered} />
    </div>
  );
}
