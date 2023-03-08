export default class ColumnChart {
  constructor({
    data = [],
    label = 'orders',
    value = 0,
    link = '',
    formatHeading = f => f
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.chartHeight = 50;
    this.formatHeading = formatHeading;
    this.render();
  }

  render() {
    const tempWrapper = document.createElement('div');
    tempWrapper.innerHTML = this.getTemplate();
    this.element = tempWrapper.firstElementChild;
  }

  getTemplate() {

    let columnChartClass = 'column-chart';
    if (this.data.length === 0) {
      columnChartClass += ' column-chart_loading';
    }

    const ordersLink = this.label === 'orders'
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : '';

    return `
      <div class="${columnChartClass}" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${ordersLink}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
        <div data-element="body" class="column-chart__chart">
            ${this.getColumnsList()}
        </div>
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

  update(data) {
    this.data = data;
    this.element.querySelector('.column-chart__chart').innerHTML = this.getColumnsList();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    const charts = document.querySelectorAll('.column-chart');
    charts.forEach(el => el.remove());
  }

}
