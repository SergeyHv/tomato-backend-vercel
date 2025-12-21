import React from "react";

export default function Header({ onSearch, cartCount }) {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 flex items-center justify-between px-6 py-4">
      <h1 className="text-xl font-bold">Каталог</h1>
      <input
        type="text"
        placeholder="Поиск..."
        className="border rounded px-3 py-1"
        onChange={(e) => onSearch(e.target.value)}
      />
      <div className="ml-4">🛒 {cartCount}</div>
    </header>
  );
}
