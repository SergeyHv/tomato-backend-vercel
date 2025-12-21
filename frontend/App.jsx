import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import ProductGrid from "./components/ProductGrid.jsx";

export default function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        const safeProducts = Array.isArray(data)
          ? data.map(p => ({
              id: p.id || "",
              name: p.title || "",
              type: p.category || "",
              color: p.props?.color || "",
              price: Number(p.price) || 0,
              image: p.images || "",
              description: p.description || "",
              stock: p.stock || 0,
              tags: p.tags || ""
            }))
          : [];
        setProducts(safeProducts);
      })
      .catch(err => console.error("Ошибка загрузки:", err));
  }, []);

  return (
    <div className="pt-[90px]">
      <Header onSearch={() => {}} cartCount={0} />
      <ProductGrid products={products} />
    </div>
  );
}
