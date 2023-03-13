export default class SortableTable {
  subElements = {};
  directions = {
    asc: 1,
    desc: -1
  };

  sortTypeToFunction = {
    string: (order, field) => (row1, row2) => {
      return this.directions[order] * row1[field].localeCompare(row2[field],
        ["ru", "en"],
        {caseFirst: 'upper'});
    },
    number: (order, field) => (row1, row2) => this.directions[order] * (row1[field] - row2[field])
  };

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

  getSubElements() {
    return this.getDataElements('element');
  }

  getSortingElements() {
    return this.getDataElements('id');
  }

  getDataElements(property) {
    const result = {};
    const elements = this.element.querySelectorAll(`[data-${property}]`);
    elements.forEach((el) => {
      if (el.dataset.sortable && el.dataset.sortable === 'false') {
        return;
      }
      const name = el.dataset[property];
      result[name] = el;
    });
    return result;
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
    if (!this.replaceSortingElement(field, order)) {
      return;
    }
    this.doSortAndDisplay(field, order);
  }

  doSortAndDisplay(field, order) {
    const sortType = this.headerConfig.find(columnConfig => columnConfig.id === field).sortType;
    this.data.sort(this.compareFunction(sortType, order, field));
    this.subElements.body.innerHTML = this.getBodyRows();
  }

  compareFunction(sortType, order, field) {
    if (!Object.keys(this.sortTypeToFunction).includes(sortType)) {
      throw Error(`Unknown sort type: ${sortType}`);
    }
    if (!Object.keys(this.directions).includes(order)) {
      throw Error(`Unknown order value: ${order}`);
    }
    const noFieldProductIds = [];
    this.data.forEach((product) => {
      if (!Object.keys(product).includes(field)) {
        noFieldProductIds.push(product.id);
      }
    });
    if (noFieldProductIds.length > 0) {
      throw Error(`Unknown field value: '${field}' for the following products ids: ${noFieldProductIds}`);
    }
    return this.sortTypeToFunction[sortType](order, field);
  }

  replaceSortingElement(field, order) {
    const sortingElement = this.subElements.sortingElements[field];
    const previousSortingElement =
      this.subElements.header.querySelector('[data-order]');
    if (previousSortingElement === sortingElement && previousSortingElement.dataset.order === order) {
      return false;
    }
    if (previousSortingElement) {
      delete previousSortingElement.dataset.order;
    }
    sortingElement.dataset.order = order;
    sortingElement.appendChild(this.subElements.arrow);
    return true;
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

