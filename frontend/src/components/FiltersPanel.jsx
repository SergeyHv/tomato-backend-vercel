import React from "react";

export default function FiltersPanel({
  selectedColor,
  setSelectedColor,
  selectedType,
  setSelectedType,
  sort,
  setSort,
  colorOptions = [],
  typeOptions = []
}) {
  const colors = Array.isArray(colorOptions) ? colorOptions : [];
  const types  = Array.isArray(typeOptions) ? typeOptions : [];

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 space-y-10">

      {/* Цвет плода */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-[0.2em]">
          Цвет плода
        </h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`px-4 py-2 rounded-full text-xs transition-all border ${
                selectedColor === c
                  ? "bg-rose-500 border-rose-500 text-white font-bold shadow-sm"
                  : "bg-white border-rose-100 text-gray-600 hover:border-rose-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Тип томата */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-[0.2em]">
          Тип томата
        </h4>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-4 py-2 rounded-full text-xs transition-all border ${
                selectedType === t
                  ? "bg-rose-500 border-rose-500 text-white font-bold shadow-sm"
                  : "bg-white border-rose-100 text-gray-600 hover:border-rose-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Сортировка */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-[0.2em]">
          Сортировка
        </h4>
        <select
          className="px-4 py-2 border border-rose-200 rounded-lg text-sm bg-white shadow-sm"
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
          className="flex items-center gap-1 text-rose-400 hover:text-rose-600 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
        >
          <span>Сбросить фильтры</span>
        </button>
      </div>
    </div>
  );
}
