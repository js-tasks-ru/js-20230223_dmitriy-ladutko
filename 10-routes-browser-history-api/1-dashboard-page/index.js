import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  to = new Date();
  from = new Date();

  constructor() {
    this.from.setMonth(this.from.getMonth() - 1);
  }

  render() {
    const dashboardWrapper = document.createElement('div');
    dashboardWrapper.innerHTML = this.getTemplate();
    const element = dashboardWrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);

    this.addRangePicker();
    this.addCharts();
    this.addSortableTable();

    this.initEventListeners();

    return element;
  }

  getTemplate() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <!-- RangePicker component -->
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <!-- column-chart components -->
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>
    `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  addRangePicker() {
    const { rangePicker } = this.subElements;
    const rangePickerComponent = new RangePicker({
      from: this.from,
      to: this.to
    });
    rangePicker.append(rangePickerComponent.element);
  }

  addCharts() {
    const { ordersChart, salesChart, customersChart } = this.subElements;

    const range = {
      from: this.from,
      to: this.to
    };

    const ordersData = {
      label: 'orders',
      link: '#',
      url: 'api/dashboard/orders',
      range
    };
    const salesData = {
      label: 'sales',
      formatHeading: (data) => `$${data}`,
      url: 'api/dashboard/sales',
      range
    };
    const customersData = {
      label: 'customers',
      url: 'api/dashboard/customers',
      range
    };

    this.ordersChartComponent = new ColumnChart(ordersData);
    this.salesChartComponent = new ColumnChart(salesData);
    this.customersChartComponent = new ColumnChart(customersData);

    ordersChart.append(this.ordersChartComponent.element);
    salesChart.append(this.salesChartComponent.element);
    customersChart.append(this.customersChartComponent.element);
  }

  addSortableTable() {
    const { sortableTable } = this.subElements;

    this.sortableTableComponent = new SortableTable(header, {
      url: `/api/dashboard/bestsellers?from=${this.from}&to${this.to}`,
      isSortLocally: true
    });

    sortableTable.append(this.sortableTableComponent.element);
  }

  initEventListeners() {
    this.element.addEventListener('date-select', ({detail}) => {
      this.updatePage(detail);
    });
  }

  updatePage = async (data) => {
    const { from, to } = data;

    this.from = from;
    this.to = to;

    await this.salesChartComponent.update(from, to);
    await this.customersChartComponent.update(from, to);
    await this.ordersChartComponent.update(from, to);

    const { sortableTable } = this.subElements;

    this.sortableTableComponent.url = new URL(`/api/dashboard/bestsellers?from=${from}&to${to}`, BACKEND_URL);
    this.sortableTableComponent.remove();
    await this.sortableTableComponent.render();
    sortableTable.append(this.sortableTableComponent.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
