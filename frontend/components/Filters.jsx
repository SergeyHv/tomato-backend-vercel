import React from "react";

export default function Filters({ onSearch, onCategory }) {
  return (
    <div className="w-full bg-gray-100 p-4 flex gap-4 items-center shadow-sm">
      <input
        type="text"
        placeholder="Поиск..."
        className="flex-1 px-4 py-2 border rounded-lg"
        onChange={(e) => onSearch(e.target.value)}
      />

      <select
        className="px-4 py-2 border rounded-lg"
        onChange={(e) => onCategory(e.target.value)}
      >
        <option value="">Все категории</option>
        <option value="tomatoes">Томаты</option>
        <option value="peppers">Перцы</option>
        <option value="cucumbers">Огурцы</option>
      </select>
    </div>
  );
}

