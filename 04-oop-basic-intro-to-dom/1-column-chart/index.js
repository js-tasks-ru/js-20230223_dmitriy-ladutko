export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  constructor({
    data = [],
    label = 'orders',
    value = 0,
    link = '',
    formatHeading = f => f
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);
    this.render();
  }

  render() {
    const tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = this.getTemplate();
    this.element = tempWrapper.firstElementChild;
    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
    this.subElements = this.getSubElements();
  }

  getTemplate() {
    const ordersLink = this.label === 'orders'
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : '';

    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${ordersLink}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
            ${this.getColumnsList()}
        </div>
        <div></div>
      </div>
    </div>
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

  update(data) {
    if (!data.length) {
      this.element.classList.add('column-chart_loading');
    }
    this.data = data;
    this.subElements.body.innerHTML = this.getColumnsList();
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

}
