import React from "react";

export default function Filters({ onSearch, onCategory, onSort }) {
  return (
    <div className="w-full bg-gray-100 p-4 flex gap-4 items-center shadow-sm">

      {/* Поиск */}
      <input
        type="text"
        placeholder="Поиск..."
        className="flex-1 px-4 py-2 border rounded-lg"
        onChange={(e) => onSearch(e.target.value)}
      />

      {/* Категории */}
      <select
        className="px-4 py-2 border rounded-lg"
        onChange={(e) => onCategory(e.target.value)}
      >
        <option value="">Все категории</option>
        <option value="tomatoes">Томаты</option>
        <option value="peppers">Перцы</option>
        <option value="cucumbers">Огурцы</option>
      </select>

      {/* Сортировка */}
      <select
        className="px-4 py-2 border rounded-lg"
        onChange={(e) => onSort(e.target.value)}
      >
        <option value="">Без сортировки</option>
        <option value="price-asc">Цена ↑</option>
        <option value="price-desc">Цена ↓</option>
        <option value="name-asc">Название А→Я</option>
        <option value="name-desc">Название Я→А</option>
      </select>

    </div>
  );
}
