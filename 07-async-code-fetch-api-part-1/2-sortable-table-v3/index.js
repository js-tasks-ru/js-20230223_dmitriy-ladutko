import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};

  onSortClick = async event => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = order => {
      const orders = {
        asc: 'desc',
        desc: 'asc',
      };

      return orders[order];
    };

    if (column) {
      const {id, order} = column.dataset;
      const newOrder = toggleOrder(order); // undefined
      const sortedData = await this.sortData(id, newOrder);
      const arrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = newOrder;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  };

  constructor(header, {
    url = '',
    data = [],
    sorted = {
      id: header.find(item => item.sortable).id,
      order: 'asc'
    }
  } = {}) {
    this.header = header;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocaly = !url;
    this.url = BACKEND_URL + '/' + url;

    this.render();
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.header.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({id, title, sortable}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : '';
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => `
      <div class="sortable-table__row">
        ${this.getTableRow(item)}
      </div>`
    ).join('');
  }

  getTableRow(item) {
    const cells = this.header.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join('');
  }

  getTable(data) {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
      </div>`;
  }

  render() {
    const {id, order} = this.sorted;
    const wrapper = document.createElement('div');
    const sortedData = this.sortData(id, order);

    wrapper.innerHTML = this.getTable(this.data);

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initEventListeners();
    this.init();
  }

  async init() {
    if (!this.isSortLocaly) {
      const sortedData = await this.sortData(this.sorted);
      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
  }

  async sortData(id, order) {
    return this.isSortLocaly ? this.sortOnClient(id, order) : await this.sortOnServer(id, order);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement
      of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();

    this.element = {};
    this.subElements = {};
  }

  sortOnClient(id, order) {
    const arr = [...this.data];
    const column = this.header.find(item => item.id === id);
    const {sortType, customSorting} = column;
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], 'ru');
      case 'custom':
        return direction * customSorting(a, b);
      default:
        throw new Error(`Неизвестный тип сортировки ${sortType}`);
      }
    });
  }

  async sortOnServer(id, order) {
    const {start, end} = this.getStartEnd();
    const urlToFetch = `${this.url}?_embed=subcategory.category&_sort=${id}&_order=${order}&_start=${start}&_end=${end}`;
    return await this.fetchSortedData(urlToFetch);
  }

  async fetchSortedData(url) {
    return await fetchJson(url);
  }

  getStartEnd() {
    return {start: 0, end: 30};
  }
}
