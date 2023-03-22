import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {

  chartHeight = 50;
  subElements = {};

  constructor({
    url = '',
    range = {},
    label = 'orders',
    link = '',
    formatHeading = f => f
  } = {}) {
    this.url = BACKEND_URL + '/' + url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.resetData();
    this.render();
    this.init();
  }

  resetData() {
    this.data = [];
    this.value = 0;
  }

  init() {
    if (Object.keys(this.range).length > 0 && this.range.from && this.range.to) {
      this.update(this.range.from, this.range.to);
    }
  }

  async update(fromDate, toDate) {
    this.resetData();
    this.updateTable();
    const json = await this.fetchData(fromDate, toDate);
    this.updateData(json);
    this.updateTable();
    return json;
  }

  updateTable() {
    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    } else {
      this.element.classList.add("column-chart_loading");
    }
    this.subElements.header.innerHTML = this.getHeader();
    this.subElements.body.innerHTML = this.getColumnsList();
  }

  async fetchData(fromDate, toDate) {
    const from = fromDate.toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];
    return await fetchJson(`${this.url}?from=${from}&to=${to}`);
  }

  updateData(json) {
    Object.values(json).map(it => {
      this.data.push(it);
      this.value = this.value + it;
    });
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getTemplate() {
    const link = this.link
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : '';

    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${link}
      </div>
      <div class="column-chart__container">
        ${this.getHeader()}
        <div data-element="body" class="column-chart__chart">
            ${this.getColumnsList()}
        </div>
        <div></div>
      </div>
    </div>
    `;
  }

  getHeader() {
    return `
      <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
    `;
  }

  getColumnsList() {
    const columnProps = this.getColumnProps();
    return columnProps.map(({percent, value}) => {
      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }).join('');
  }

  getColumnProps() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");
    for (const subElement of elements) {
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
    this.element = null;
    this.subElements = {};
  }
}
