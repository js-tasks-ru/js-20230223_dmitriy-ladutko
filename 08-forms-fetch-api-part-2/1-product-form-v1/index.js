import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  productId = '';
  categories = [];
  productData = [];
  subElements = {};

  constructor(productId) {
    this.productId = productId;
  }

  getProductUrl(productId) {
    const url = new URL("api/rest/products", BACKEND_URL);
    url.searchParams.set("id", productId);
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
    await this.loadData();
    const templateWrapper = document.createElement('div');
    templateWrapper.innerHTML = this.getTemplate();
    const element = templateWrapper.firstElementChild;
    this.element = element;

    this.subElements = this.getSubElements(element);

    if (this.productData) {
      this.renderProductData(this.subElements.productForm);
    }

    this.initEventListeners();
    return element;
  }

  async loadData() {
    this.categories = await fetchJson(this.getCategoriesUrl());
    if (this.productId) {
      const productArr = await fetchJson(this.getProductUrl(this.productId));
      this.productData = productArr[0];
    }
    return [this.categories, this.productData];
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

  getImageRow(imageData) {
    return `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${imageData.url}">
          <input type="hidden" name="source" value="${imageData.source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${imageData.url}">
            <span>${escapeHtml(imageData.source)}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>
      `;
  }

  getCategoriesPanel() {
    const options = this.categories.map(category => {
      return category.subcategories.map(subcategory => {
        const option = escapeHtml(`${category.title} > ${subcategory.title}`);
        return `
          <option value="${subcategory.id}">${option}</option>
        `;
      }).join('');
    }).join('');
    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select id="subcategory" class="form-control" name="subcategory">
            ${options}
        </select>
      </div>
    `;
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
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
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

    form.querySelector('input[name="title"]').value = title;
    form.querySelector('textarea[name="description"]').value = description;
    form.querySelector('input[name="price"]').value = price;
    form.querySelector('input[name="discount"]').value = discount;
    form.querySelector('input[name="quantity"]').value = quantity;
  }

  setSelectedOptions(form) {
    const subcategoriesSelect =
      form.querySelector('select[name="subcategory"]');
    const statusSelect =
      form.querySelector('select[name="status"]');
    this.setSelectedByValue(subcategoriesSelect, this.productData.subcategory);
    this.setSelectedByValue(statusSelect, `${this.productData.status}`);
  }

  setSelectedByValue(selectElement, value) {
    const optionsArray = [...selectElement.options];
    selectElement.selectedIndex = optionsArray.findIndex(option => option.value === value);
  }

  setImages() {
    this.subElements.imageListContainer.innerHTML = this.getImagesList(this.productData.images);
  }

  initEventListeners() {
    this.uploadImageButton
      = this.subElements.productForm.querySelector('button[name="uploadImage"]');
    this.uploadImageButton.addEventListener('click', (event) => {
      this.uploadImage(event);
    });
  }

  uploadImage = (event) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    this.uploadImageButton.classList.add("is-loading");
    input.addEventListener('change', async () => {
      const imageData = await this.uploadToImgur(input);
      this.renderImage(imageData);
      this.save({imageData});
      this.uploadImageButton.classList.remove("is-loading");
    });
    input.click();
  };

  uploadToImgur = async (input) => {
    const formData = new FormData();
    const image = input.files[0];
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

  renderImage(data) {
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

  save(data = {}) {
    this.element.dispatchEvent(new CustomEvent('product-updated', {detail: data}));
  }
}
