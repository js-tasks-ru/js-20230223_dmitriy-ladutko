import SortableList from "../2-sortable-list/index.js";
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  productId = '';
  categories = [];
  productData = [];
  subElements = {};
  defaultProductData = {
    id: '',
    description: '',
    title: '',
    price: 100,
    discount: 0,
    status: 0,
    quantity: 0,
    images: []
  };

  constructor(productId) {
    this.productId = productId;
  }

  getProductUrl(productId) {
    const url = new URL("api/rest/products", BACKEND_URL);
    if (productId) {
      url.searchParams.set("id", productId);
    }
    return url;
  }

  getCategoriesUrl() {
    const url = new URL("api/rest/categories", BACKEND_URL);
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");
    return url;
  }

  getImgurUrl() {
    return new URL('/3/image', 'https://api.imgur.com');
  }

  async render() {
    const [categories, productData] = await this.loadData();
    this.categories = categories;
    this.productData = productData[0];
    const templateWrapper = document.createElement('div');
    templateWrapper.innerHTML = this.getTemplate();
    const element = templateWrapper.firstElementChild;
    this.element = element;

    this.subElements = this.getSubElements(element);
    this.setOptions();

    if (this.productId) {
      this.renderProductData(this.subElements.productForm);
    }

    this.initEventListeners();
    return element;
  }

  async loadData() {
    const categoriesUrl = this.getCategoriesUrl();
    const productUrl = this.getProductUrl(this.productId);
    const categories = fetchJson(categoriesUrl);
    const productData = this.productId
      ? fetchJson(productUrl)
      : Promise.resolve([this.defaultProductData]);
    return await Promise.all([categories, productData]);
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
            ${this.getTitlePanel()}
            ${this.getDescriptionPanel()}
            ${this.getImagesPanel()}
            ${this.getCategoriesPanel()}
            ${this.getPricePanel()}
            ${this.getQuantityPanel()}
            ${this.getStatusPanel()}
            ${this.getSubmitButton()}
        </form>
      </div>
    `;
  }

  getTitlePanel() {
    return `
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input id="title" required="" type="text" name="title" class="form-control"
            placeholder="Название товара">
        </fieldset>
      </div>
    `;
  }

  getDescriptionPanel() {
    return `
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea id="description" required="" class="form-control" name="description"
            data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
    `;
  }

  getImagesPanel() {
    return `
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"></div>
        <button id="uploadImage" type="button" name="uploadImage" class="button-primary-outline">
            <span>Загрузить</span>
        </button>
      </div>
    `;
  }

  getImagesList(imagesData) {
    if (!imagesData) {
      return;
    }
    const images = imagesData.map(imageData => {
      return this.getImageRow(imageData);
    }).join('');

    return `
      <ul class="sortable-list">
        ${images}
      </ul>
    `;
  }

  getImageRow({url, source}) {
    return `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${url}">
          <input type="hidden" name="source" value="${source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
            <span>${escapeHtml(source)}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>
      `;
  }

  getCategoriesPanel() {
    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select id="subcategory" class="form-control" name="subcategory">
        </select>
      </div>
    `;
  }

  setOptions() {
    this.setSubcategoryOptions();
    this.setStatusOptions();
  }

  setSubcategoryOptions() {
    const subcategorySelect
      = this.subElements.productForm.querySelector('#subcategory');

    this.categories.forEach(category => {
      category.subcategories.map(subcategory => {
        const optionText = `${category.title} > ${subcategory.title}`;
        const optionValue = subcategory.id;
        const option = new Option(optionText, optionValue);
        if (optionValue === this.productData.subcategory) {
          option.selected = true;
        }
        subcategorySelect.append(option);
      });
    });
  }

  setStatusOptions() {
    const options = [
      new Option('Активен', '1'),
      new Option('Неактивен', '0'),
    ];
    const statusSelect
      = this.subElements.productForm.querySelector('#status');

    options.forEach(option => {
      if (option.value === this.productData.status.toString()) {
        option.selected = true;
      }
    });

  }

  getPricePanel() {
    return `
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
    `;
  }

  getQuantityPanel() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
    `;
  }

  getStatusPanel() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select id="status" class="form-control" name="status">
        </select>
      </div>
    `;
  }

  getSubmitButton() {
    const buttonValue = this.productId ? 'Сохранить товар' : 'Добавить товар';
    return `
      <div class="form-buttons">
        <button id="save" type="submit" name="save" class="button-primary-outline">
          ${escapeHtml(buttonValue)}
        </button>
      </div>
    `;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");
    for (const subElement
      of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  renderProductData(form) {
    this.setInputs(form);
    this.setSelectedOptions(form);
    this.setImages();
  }

  setInputs(form) {
    const {
      title,
      description,
      price,
      discount,
      quantity
    } = this.productData;

    form.querySelector('#title').value = title;
    form.querySelector('#description').value = description;
    form.querySelector('#price').value = price;
    form.querySelector('#discount').value = discount;
    form.querySelector('#quantity').value = quantity;
  }

  setSelectedOptions(form) {
    // const subcategoriesSelect =
    //   form.querySelector('#subcategory');
    const statusSelect =
      form.querySelector('#status');
    // this.setSelectedByValue(subcategoriesSelect, this.productData.subcategory);
    this.setSelectedByValue(statusSelect, `${this.productData.status}`);
  }

  setSelectedByValue(selectElement, value) {
    const optionsArray = [...selectElement.options];
    selectElement.selectedIndex = optionsArray.findIndex(option => option.value === value);
  }

  setImages() {
    const {imageListContainer} = this.subElements;
    const {images} = this.productData;
    const items = images.map(({url, source}) => this.getImageItem(url, source));

    const sortableTable = new SortableList({items});

    imageListContainer.append(sortableTable.element);

  }

  getImageItem(url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  initEventListeners() {
    this.uploadImageButton = this.subElements.productForm.querySelector('#uploadImage');
    this.saveButton = this.subElements.productForm.querySelector('#save');
    this.uploadImageButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.uploadImage();
    });
    this.saveButton.addEventListener('click', async (event) => {
      event.preventDefault();
      await this.save();
    });
  }

  uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    this.uploadImageButton.classList.add("is-loading");
    input.addEventListener('change', async () => {
      const imageData = await this.uploadToImgur(input);
      this.appendImageToList(imageData);
      // await this.save({imageData});
      this.uploadImageButton.classList.remove("is-loading");
    });
    input.click();
  };

  uploadToImgur = async (input) => {
    const formData = new FormData();
    const [image] = input.files;
    formData.append('image', image);
    const response = await fetchJson(this.getImgurUrl(), {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData,
      referrer: ''
    });
    return {
      url: response.data.link,
      source: image.name
    };
  };

  appendImageToList(data) {
    const imageWrapper = document.createElement('div');
    imageWrapper.innerHTML = this.getImageRow(data);
    const imagesUl
      = this.subElements.imageListContainer.querySelector('ul');
    imagesUl.appendChild(imageWrapper.firstElementChild);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.productId = '';
  }

  async save() {
    const formData = this.getFormData();
    const url = this.getProductUrl();
    const response = await fetchJson(url, {
      method: this.productId ? 'PUT' : 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    const {id, subcategory} = response;
    this.element.dispatchEvent(new CustomEvent(this.productId ? 'product-updated' : 'product-saved', {
      detail: {
        id,
        subcategory
      }
    }));
    return response;
  }

  getFormData() {
    const result = {};
    const {imageListContainer, productForm} = this.subElements;
    const numericFields = ['price', 'discount', 'quantity', 'status'];
    const excludedFields = ['url', 'source'];
    const formData = new FormData(productForm);
    const entries = formData.entries();
    for (let entry of entries) {
      const [field, value = ''] = entry;
      if (!excludedFields.includes(field)) {
        result[field] = numericFields.includes(field) ? Number.parseInt(value) : value;
      }
    }

    result.id = this.productId;
    result.images = [];

    const imagesElements = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    for (const image
      of imagesElements) {
      result.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return result;
  }

}
