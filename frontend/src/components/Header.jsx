import React from "react";

export default function ProductCard({ product }) {
  return (
    <div className="border rounded-lg p-4 shadow bg-white hover:shadow-lg transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />
      <h2 className="text-lg font-semibold mt-2 text-pink-700">{product.name}</h2>
      <p className="text-sm text-gray-600">{product.description}</p>
      <p className="text-md font-bold mt-2 text-gray-800">{product.price} ₽</p>
    </div>
  );
}
