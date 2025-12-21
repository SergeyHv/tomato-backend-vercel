import React, { useState, useMemo } from "react";
import Header from "./Header";
import FiltersShell from "./FiltersShell";
import ProductGrid from "./ProductGrid";

export default function App({ products = [] }) {
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sort, setSort] = useState("popularity");
  const [search, setSearch] = useState("");

  // Всегда работаем только с массивом
  const safeProducts = Array.isArray(products) ? products : [];

  // Динамические значения из таблицы
  const colorOptions = useMemo(
    () => ["all", ...new Set(safeProducts.map(p => p?.color).filter(Boolean))],
    [safeProducts]
  );
  const typeOptions = useMemo(
    () => ["all", ...new Set(safeProducts.map(p => p?.type).filter(Boolean))],
    [safeProducts]
  );

  // Фильтрация и сортировка
  const filtered = useMemo(() => {
    let result = safeProducts;

    if (selectedColor !== "all") {
      result = result.filter(p => p?.color === selectedColor);
    }
    if (selectedType !== "all") {
      result = result.filter(p => p?.type === selectedType);
    }
    if (search) {
      result = result.filter(p =>
        (p?.name || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === "price-asc") result = [...result].sort((a, b) => (a?.price || 0) - (b?.price || 0));
    if (sort === "price-desc") result = [...result].sort((a, b) => (b?.price || 0) - (a?.price || 0));
    if (sort === "name-asc") result = [...result].sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    if (sort === "name-desc") result = [...result].sort((a, b) => (b?.name || "").localeCompare(a?.name || ""));

    return result;
  }, [safeProducts, selectedColor, selectedType, sort, search]);

  return (
    <div className="pt-[90px]">
      <Header onSearch={setSearch} cartCount={0} />

      <FiltersShell
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        sort={sort}
        setSort={setSort}
        colorOptions={colorOptions}
        typeOptions={typeOptions}
      />

      <ProductGrid products={filtered} />
    </div>
  );
}
