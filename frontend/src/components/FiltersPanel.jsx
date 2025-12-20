import React from "react";

export default function FiltersPanel({
  selectedColor,
  setSelectedColor,
  selectedType,
  setSelectedType,
  sort,
  setSort
}) {
  return (
    <div className="p-6 bg-white border border-rose-200 rounded-2xl shadow-sm space-y-6">

      {/* Цвет плода */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[0.2em]">
          Цвет плода
        </h4>

        <div className="flex flex-wrap gap-2">
          {["all", "красный", "желтый", "черный", "биколор", "зеленый"].map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-4 py-2 rounded-full text-xs border transition-all ${
                selectedColor === color
                  ? "bg-rose-500 border-rose-500 text-white font-bold"
                  : "bg-white border-rose-100 text-gray-600 hover:border-rose-300"
              }`}
            >
              {color === "all" ? "Все цвета" : color}
            </button>
          ))}
        </div>
      </div>

      {/* Тип томата */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[0.2em]">
          Тип томата
        </h4>

        <div className="flex flex-wrap gap-2">
          {["all", "биф", "обычный", "слива", "черри", "паста"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-xs border transition-all ${
                selectedType === type
                  ? "bg-rose-500 border-rose-500 text-white font-bold"
                  : "bg-white border-rose-100 text-gray-600 hover:border-rose-300"
              }`}
            >
              {type === "all" ? "Все типы" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Сортировка */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-[0.2em]">
          Сортировка
        </h4>

        <select
          className="px-4 py-2 border border-rose-200 rounded-lg text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="popularity">По популярности</option>
          <option value="price-asc">Цена ↑</option>
          <option value="price-desc">Цена ↓</option>
          <option value="name-asc">Название А→Я</option>
          <option value="name-desc">Название Я→А</option>
        </select>
      </div>

      {/* Сброс */}
      <div className="pt-2">
        <button
          onClick={() => {
            setSelectedColor("all");
            setSelectedType("all");
            setSort("popularity");
          }}
          className="text-rose-500 hover:text-rose-700 text-xs font-bold uppercase tracking-[0.2em]"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
  );
}
