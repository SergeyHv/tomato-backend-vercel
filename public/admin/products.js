import { getProducts, saveProduct, deleteProduct, uploadImage } from './api.js';

export async function loadAll(state, ui) {
  getProducts()
    .then(list => {
      state.allProducts = list;
      ui.render(list);
    })
    .catch(() => {});
}

export function bindListActions(container, handlers) {
  container.addEventListener('click', e => {
    const editId = e.target.getAttribute('data-edit');
    const delId  = e.target.getAttribute('data-del');
    if (editId) handlers.onEdit(editId);
    if (delId) handlers.onDelete(delId);
  });
}

export async function handleSave(state, formData) {
  let imageUrl = '';

  if (state.imageBase64) {
    const up = await uploadImage(state.imageName, state.imageBase64);
    imageUrl = up.url;
  } else if (state.editId) {
    const old = state.allProducts.find(p => p.id === state.editId);
    imageUrl = old?.images || '';
  }

  await saveProduct({
    ...formData,
    id: state.editId || formData.id,
    images: imageUrl
  });

  return true;
}
