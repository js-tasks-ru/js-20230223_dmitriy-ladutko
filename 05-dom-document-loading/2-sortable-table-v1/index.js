const directions = {
  asc: 1,
  desc: -1
};

export default class SortableTable {
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  render() {
    const tableWrapper = document.createElement('div');
    tableWrapper.innerHTML = this.getTemplate();
    this.element = tableWrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.subElements.sortingElements = this.getSortingElements();

    this.renderArrow();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach((el) => {
      const name = el.dataset.element;
      result[name] = el;
    });
    return result;
  }

  getSortingElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-id]');
    elements.forEach((el) => {
      if (el.dataset.sortable === 'true') {
        const name = el.dataset.id;
        result[name] = el;
      }
    });
    return result;
  }

  getTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHeaderRow()}
            </div>
            <div data-element="body" class="sortable-table__body">
                ${this.getBodyRows()}
            </div>
            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder"></div>
        </div>
      </div>
    `;
  }

  getHeaderRow() {
    return this.headerConfig.map((columnConfig) => {
      return `
        <div class="sortable-table__cell"
             data-id="${columnConfig.id}"
             data-sortable="${columnConfig.sortable}">
            <span>${columnConfig.title}</span>
        </div>
      `;
    }).join('');
  }

  getBodyRows() {
    return this.data.map((product) => {
      return `
        <a href="/products/${product.id}" class="sortable-table__row">
            ${this.getRequiredColumns(product)}
        </a>
      `;
    }).join('');
  }

  getRequiredColumns(product) {
    return this.headerConfig.map((columnConfig) => {
      const fieldValue = product[columnConfig.id];
      if (columnConfig.template) {
        return columnConfig.template(Array.from(fieldValue));
      }
      return `
        <div class="sortable-table__cell">${fieldValue}</div>
      `;
    }).join('');
  }

  renderArrow() {
    const arrowWrapper = document.createElement('div');
    arrowWrapper.innerHTML = this.getArrowTemplate();
    this.subElements.arrow = arrowWrapper.firstElementChild;
  }

  getArrowTemplate() {
    return `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
  }

  sort(field, order) {
    const sortingElement = this.subElements.sortingElements[field];
    const previousSortingElement =
      this.subElements.header.querySelector('[data-order]');
    if (previousSortingElement === sortingElement && previousSortingElement.dataset.order === order) {
      return;
    }
    if (previousSortingElement) {
      delete previousSortingElement.dataset.order;
    }
    sortingElement.appendChild(this.subElements.arrow);
    sortingElement.dataset.order = order;
    const column = this.headerConfig.find(columnConfig => columnConfig.id === field);
    const compareFn = column.sortType === 'string'
      ? this.stringSortFunction
      : this.numberSortFunction;
    this.data.sort((row1, row2) => directions[order] * compareFn(row1[field], row2[field]));
    this.update();
  }

  stringSortFunction(string1, string2) {
    return string1.localeCompare(string2,
      ["ru", "en"],
      {caseFirst: 'upper'});
  }

  numberSortFunction(number1, number2) {
    return number1 - number2;
  }

  update() {
    this.subElements.body.innerHTML = this.getBodyRows();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}

