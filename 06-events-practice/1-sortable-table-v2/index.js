export default class SortableTable {
  element;
  subElements = {};
  sorted = {};
  directions = {
    asc: 1,
    desc: -1
  };

  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = true
  } = {}) {
    this.data = data;
    this.headersConfig = headersConfig;
    this.isSortLocally = isSortLocally;

    this.render();

    this.sorted = sorted;
    const {id: field, order} = sorted;
    this.addHeaderRowsEventListeners(this.subElements.sortingElements);
    this.sort(field, order);
  }

  render() {
    const tableWrapper = document.createElement('div');
    tableWrapper.innerHTML = this.getTable();
    const element = tableWrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  getTable() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.getTableHeader()}
          ${this.getTableBody()}
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder"></div>
        </div>
      </div>
    `;
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headersConfig.map(item => this.getHeaderRow(item)).join('')}
      </div>
    `;
  }

  getHeaderRow({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(this.data)}
      </div>
    `;
  }

  getTableRows(data = []) {
    return data.map(item => {
      return `
        <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getTableRow(item)}
        </a>
      `;
    }).join('');
  }

  getTableRow(product) {
    return this.headersConfig.map((columnConfig) => {
      const fieldValue = product[columnConfig.id];
      return columnConfig.template
        ? columnConfig.template(fieldValue)
        : `<div class="sortable-table__cell">${fieldValue}</div>`;
    }).join('');
  }

  getSubElements(element) {
    const result = this.getDataElements(element, 'element');
    result.sortingElements = this.getDataElements(element, 'id');
    return result;
  }

  getDataElements(element = document.body, property = '') {
    const result = {};
    const elements = element.querySelectorAll(`[data-${property}]`);
    elements.forEach((subElement) => {
      if (subElement.dataset.sortable && subElement.dataset.sortable === 'false') {
        return;
      }
      const name = subElement.dataset[property];
      result[name] = subElement;
    });
    return result;
  }

  sort(field, order) {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    const sortedData = this.sortData(field, order);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn
      = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortData(field, order) {
    const dataArr = [...this.data];
    const column = this.headersConfig.find(item => item.id === field);
    const {sortType} = column;
    const direction = this.directions[order];

    return dataArr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      default:
        throw new Error(`Unknown type ${sortType}`);
      }
    });
  }

  addHeaderRowsEventListeners(sortingElements = {}) {
    for (const entry of Object.entries(sortingElements)) {
      const [field, element] = entry;
      element.addEventListener('pointerdown', (event) => this.onHeaderClick(event, field, element));
    }
  }

  onHeaderClick = (event, field, element) => {
    if (event.target.tagName !== 'SPAN') {
      return;
    }
    const order = this.getReversedOrder(element.dataset.order);
    this.sort(field, order);
  };

  getReversedOrder(order) {
    const [asc, desc] = Object.keys(this.directions);
    if (!order) {
      return desc;
    }
    return order === asc ? desc : asc;
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
    this.sorted = {};
  }

  sortOnServer(field, order) {

  }
}
