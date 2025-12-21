import React from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [] }) {
  const list = Array.isArray(products) ? products : [];

  if (list.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12 text-center text-gray-400">
        Ничего не найдено. Измените фильтры или поиск.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {list.map((product) => (
          <ProductCard key={product?.id ?? Math.random()} product={product} />
        ))}
      </div>
    </div>
  );
}
