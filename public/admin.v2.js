(function () {

  let allProducts = [];
  let editId = null;
  let imageBase64 = '';
  let imageName = '';

  const $ = id => document.getElementById(id);

  const productList   = $('productList');
  const productForm   = $('productForm');
  const titleInput    = $('title');
  const categoryInput = $('category');
  const priceInput    = $('price');
  const tagsInput     = $('tags');
  const descInput     = $('description');
  const propTerm      = $('prop_term');
  const propHeight    = $('prop_height');
  const propWeight    = $('prop_weight');
  const imageUpload   = $('imageUpload');
  const imagePreview  = $('imagePreview');
  const submitBtn     = $('submitBtn');
  const formTitle     = $('formTitle');

  /* ===== НОРМАЛЬНАЯ ТРАНСЛИТЕРАЦИЯ ===== */
  const translit = str => {
    const map = {
      а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',
      и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',
      р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',
      ч:'ch',ш:'sh',щ:'sch',ы:'y',э:'e',ю:'yu',я:'ya'
    };

    return str
      .toLowerCase()
      .split('')
      .map(ch => map[ch] || ch)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  function resetForm() {
    editId = null;
    imageBase64 = '';
    imageName = '';
    productForm.reset();
    if (imagePreview) imagePreview.classList.add('hidden');
    formTitle.innerText = '➕ Новый сорт';
  }

  async function loadProducts() {
    const res = await fetch('/api/admin/get-products');
    allProducts = await res.json();

    productList.innerHTML = allProducts.map(p => `
      <div class="p-2 border rounded-xl flex items-center gap-3 bg-white">
        <div class="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
          ${p.images ? `<img src="${p.images}" class="w-12 h-12 rounded-lg object-cover">` : '🍅'}
        </div>
        <div class="flex-1 truncate">
          <div class="font-semibold text-sm">${p.title}</div>
          <div class="text-xs text-gray-500">${p.category || ''}</div>
        </div>
        <button onclick="editProduct('${p.id}')">✏️</button>
      </div>
    `).join('');
  }

  window.editProduct = id => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    editId = id;
    imageBase64 = '';
    imageName = '';

    formTitle.innerText = '✏️ Редактирование сорта';

    titleInput.value = p.title;
    categoryInput.value = p.category;
    priceInput.value = p.price;
    tagsInput.value = p.tags;
    descInput.value = p.description;

    const map = {};
    (p.props || '').split(';').forEach(x => {
      const [k,v] = x.split('=');
      if (k) map[k] = v;
    });

    propTerm.value = map['Срок'] || '';
    propHeight.value = map['Высота'] || '';
    propWeight.value = map['Вес'] || '';

    if (p.images) {
      imagePreview.src = p.images;
      imagePreview.classList.remove('hidden');
    }
  };

  imageUpload.addEventListener('change', () => {
    const file = imageUpload.files[0];
    if (!file) return;

    imageName = file.name;

    const reader = new FileReader();
    reader.onload = e => {
      imageBase64 = e.target.result;
      imagePreview.src = imageBase64;
      imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  productForm.onsubmit = async e => {
    e.preventDefault();

    if (!titleInput.value.trim()) {
      alert('Введите название сорта');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохраняем…';

    try {
      const id = editId || translit(titleInput.value);

      let imageUrl = '';

      if (imageBase64) {
        const up = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: imageName,
            base64: imageBase64
          })
        });
        imageUrl = (await up.json()).url;
      } else if (editId) {
        imageUrl = allProducts.find(p => p.id === editId)?.images || '';
      }

      const props =
        `Срок=${propTerm.value};` +
        `Высота=${propHeight.value
