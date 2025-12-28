(function () {

  let allProducts = [];
  let editId = null;
  let imageBase64 = '';
  let imageName = '';

  const $ = id => document.getElementById(id);
  const isMobile = () => window.innerWidth < 768;

  const productListDesktop = $('productList');
  const productListMobile  = $('productListMobile');
  const searchDesktop      = $('searchInputDesktop');
  const searchMobile       = $('searchInputMobile');

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

  const translit = str => {
    const map = {
      а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',
      и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',
      р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',
      ч:'ch',ш:'sh',щ:'sch',ы:'y',э:'e',ю:'yu',я:'ya'
    };
    return str.toLowerCase().split('')
      .map(ch => map[ch] || ch)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  function renderList(list, data) {
    if (!list) return;
    list.innerHTML = data.map(p => `
      <div class="p-3 border rounded-xl bg-white flex gap-3 items-center">
        <div class="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
          ${p.images ? `<img src="${p.images}" class="w-12 h-12 rounded-lg object-cover">` : '🍅'}
        </div>
        <div class="flex-1">
          <div class="font-semibold">${p.title}</div>
          <div class="text-sm text-gray-500">${p.category || ''}</div>
        </div>
      </div>
    `).join('');
  }

  async function loadProducts() {
    const res = await fetch('/api/admin/get-products');
    allProducts = await res.json();
    renderList(productListDesktop, allProducts);
    renderList(productListMobile, allProducts);
  }

  function filterProducts(query) {
    const q = query.toLowerCase();
    const filtered = allProducts.filter(p =>
      (p.title || '').toLowerCase().includes(q)
    );
    renderList(productListDesktop, filtered);
    renderList(productListMobile, filtered);
  }

  if (searchDesktop) {
    searchDesktop.addEventListener('input', e => filterProducts(e.target.value));
  }
  if (searchMobile) {
    searchMobile.addEventListener('input', e => filterProducts(e.target.value));
  }

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

    if (!titleInput.value.trim()) return alert('Введите название');

    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохраняем…';

    try {
      const id = editId || translit(titleInput.value);
      let imageUrl = '';

      if (imageBase64) {
        const up = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: imageName, base64: imageBase64 })
        });
        imageUrl = (await up.json()).url;
      }

      const props =
        `Срок=${propTerm.value || ''};` +
        `Высота=${propHeight.value || ''};` +
        `Вес=${propWeight.value || ''}`;

      await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: titleInput.value,
          category: categoryInput.value,
          price: priceInput?.value || '',
          tags: tagsInput?.value || '',
          description: descInput?.value || '',
          props,
          images: imageUrl
        })
      });

      productForm.reset();
      imagePreview.classList.add('hidden');
      imageBase64 = '';
      imageName = '';

      await loadProducts();
      if (isMobile()) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    } catch (e) {
      alert('Ошибка сохранения');
      console.error(e);
    }

    submitBtn.disabled = false;
    submitBtn.innerText = '💾 Сохранить сорт';
  };

  loadProducts();

})();
