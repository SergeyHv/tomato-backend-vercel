import React, { useState } from "react";
import FiltersPanel from "./FiltersPanel";

export default function FiltersShell({
  selectedColor,
  setSelectedColor,
  selectedType,
  setSelectedType,
  sort,
  setSort
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 mt-6 mb-6">
      
      {/* Кнопка */}
      <button
        onClick={() => setOpen(!open)}
        className="px-5 py-2.5 bg-white border border-rose-200 rounded-full shadow-sm text-rose-700 hover:border-rose-400 transition-all"
      >
        {open ? "Скрыть фильтры" : "Фильтры"}
      </button>

      {/* Раскрывающийся блок */}
      {open && (
        <div className="mt-4">
          <FiltersPanel
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            sort={sort}
            setSort={setSort}
          />
        </div>
      )}
    </div>
  );
}
