{open && (
  <div className="fixed top-[90px] left-0 h-[calc(100vh-90px)] w-[280px] bg-white border-r border-rose-100 shadow-lg z-40 overflow-y-auto">
    
    {/* Кнопка закрытия фиксирована внутри панели */}
    <div className="absolute top-0 left-0 w-full bg-white border-b border-rose-100 p-4 flex justify-end">
      <button
        onClick={() => setOpen(false)}
        className="text-rose-500 hover:text-rose-700 text-sm font-bold uppercase tracking-[0.2em]"
      >
        ✕ Закрыть
      </button>
    </div>

    {/* Контент фильтров с отступом сверху, чтобы не перекрывать кнопкой */}
    <div className="p-6 mt-14">
      <FiltersPanel
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        sort={sort}
        setSort={setSort}
      />
    </div>
  </div>
)}
