export function adaptProduct(p) {
  return {
    id: p.id,
    name: p.title,
    description: p.description,
    price: Number(p.price),
    image: p.images,
    type: mapCategoryToType(p.category),
    color: mapTagsToColor(p.tags),
    maturity: mapTagsToMaturity(p.tags),
    isNew: false
  };
}

function mapCategoryToType(category) {
  switch (category) {
    case "tomatoes":
      return "Томат";
    case "peppers":
      return "Перец";
    case "cucumbers":
      return "Огурец";
    default:
      return "Неизвестно";
  }
}

function mapTagsToColor(tags) {
  if (!tags) return "Неизвестно";
  const t = tags.toLowerCase();

  if (t.includes("черн")) return "Черный";
  if (t.includes("желт")) return "Желтый";
  if (t.includes("зелен")) return "Зеленый";
  if (t.includes("оранж")) return "Оранжевый";
  if (t.includes("красн")) return "Красный";

  return "Неизвестно";
}

function mapTagsToMaturity(tags) {
  if (!tags) return "Неизвестно";
  const t = tags.toLowerCase();

  if (t.includes("ранний")) return "Ранний";
  if (t.includes("средн")) return "Среднеспелый";
  if (t.includes("поздн")) return "Поздний";

  return "Неизвестно";
}
