import React from "react";

export default function FiltersPanel({
  selectedColor,
  setSelectedColor,
  selectedType,
  setSelectedType,
  sort,
  setSort
}) {
  const colors = [
    { value: "all", label: "Все цвета" },
    { value: "красный", label: "Красный" },
    { value: "желтый", label: "Желтый" },
    { value: "черный", label: "Черный/Коричневый" },
    { value: "биколор", label: "Биколор" },
    { value: "зеленый", label: "Зеленоплодный" }
  ];

  const types = [
    { value: "all", label: "Все типы" },
    { value: "биф", label: "Биф-томат" },
    { value: "обычный", label: "Обычная форма" },
    { value: "слива", label: "Слива" },
    { value: "черри", label: "Черри" },
    { value: "паста", label: "Паста (Roma)" }
  ];

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
              key={c.value}
              onClick={() => setSelectedColor(c.value)}
              className={`px-4 py-2 rounded-full text-xs transition-all border ${
                selectedColor === c.value
                  ? "bg-rose-500 border-rose-500 text-white font-bold shadow-sm"
                  : "bg-white border-rose-100 text-gray-600 hover:border-rose-300"
              }`}
            >
              {c.label}
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
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-4 py-2 rounded-full text-xs transition-all border ${
                selectedType === t.value
                  ? "bg-rose-500 border-rose-500 text-white font-bold shadow-sm"
                  : "bg-white border-rose-100 text-gray-600 hover:border-rose-300"
              }`}
            >
              {t.label}
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
