const DAY_NAMES = [
  'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'
];

const MONTH_NAMES = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
];
export default class RangePicker {

  isFirstPick = true;
  element;
  subElements = {};
  from = new Date();
  to = new Date();
  datesRange = {
    left: [],
    right: []
  };
  dateButtons = {};

  constructor({from, to}) {
    this.from = from;
    this.to = to;
    this.datesRange = this.getDatesRange(from);

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    const element = wrapper.firstElementChild;
    this.element = element;

    this.subElements = this.getSubElements(element);
    this.initEventListeners();
  }

  formatDate(dateToFormat = new Date()) {
    const month = this.addZero(dateToFormat.getMonth() + 1);
    const date = this.addZero(dateToFormat.getDate());
    // const year = this.addZero(dateToFormat.getFullYear() % 100);
    const year = dateToFormat.getFullYear();
    return `${date}.${month}.${year}`;
  }

  addZero(date) {
    if (date < 10) {
      return '0' + date;
    }
    return '' + date;
  }

  getTemplate() {
    return `
        <div class="rangepicker">
            <div class="rangepicker__input" data-element="input">
              <span data-element="from">${this.formatDate(this.from)}</span> -
              <span data-element="to">${this.formatDate(this.to)}</span>
            </div>
            <div class="rangepicker__selector" data-element="selector"></div>
        </div>
    `;
  }

  getSelectorContent() {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.getCalendars()}
    `;
  }

  getDatesRange(from) {
    const fromDate = new Date(from);
    const datesRange = [fromDate];
    let month = from.getMonth();
    let currentMonth = month;
    let i = 1;
    while (currentMonth === month) {
      const date = new Date(fromDate);
      date.setDate(date.getDate() - i);
      currentMonth = date.getMonth();
      if (currentMonth === month) {
        datesRange.push(date);
      }
      i++;
    }
    currentMonth = month;
    let monthCount = 1;
    i = 1;
    while (monthCount < 3) {
      const date = new Date(fromDate);
      date.setDate(date.getDate() + i);
      currentMonth = date.getMonth();
      if (currentMonth !== month) {
        monthCount++;
        month = currentMonth;
      }
      if (monthCount < 3) {
        datesRange.push(date);
      }
      i++;
    }
    datesRange.sort((a, b) => a - b);
    const lastRangeDate = datesRange.at(-1);
    const rightMonthIndex = lastRangeDate.getMonth();
    const leftIndex = datesRange.findIndex(date => date.getMonth() === rightMonthIndex);
    const left = datesRange.slice(0, leftIndex);
    const right = datesRange.slice(leftIndex);
    return {left, right};
  }

  getCalendars() {
    const leftMonthIndex = this.datesRange.left.at(0).getMonth();
    const rightMonthIndex = this.datesRange.right.at(0).getMonth();
    const leftMonth = MONTH_NAMES[leftMonthIndex];
    const rightMonth = MONTH_NAMES[rightMonthIndex];

    const daysOfWeek = `
      <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
      </div>
    `;
    const getButton = date => {
      const firstLeftDate = this.datesRange.left.at(0);
      const firstRightDate = this.datesRange.right.at(0);
      const dateNumber = date.getDate();
      const dateValue = date.toISOString();
      if (date === firstLeftDate || date === firstRightDate) {
        return `
           <button type="button" class="rangepicker__cell"
            data-value="${dateValue}" style="--start-from: ${date.getDay()}">${dateNumber}</button>
        `;
      }
      return `
        <button type="button" class="rangepicker__cell" data-value="${dateValue}">${dateNumber}</button>
      `;
    };

    const leftCalendar = this.datesRange.left.map(date => {
      return getButton(date);
    }).join('');
    const rightCalendar = this.datesRange.right.map(date => {
      return getButton(date);
    }).join('');

    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${leftMonth}">${leftMonth}</time>
        </div>
            ${daysOfWeek}
        <div class="rangepicker__date-grid">
            ${leftCalendar}
        </div>
      </div>
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${rightMonth}">${rightMonth}</time>
        </div>
            ${daysOfWeek}
        <div class="rangepicker__date-grid">
            ${rightCalendar}
        </div>
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

  getDateButtons(element) {
    const result = {};
    const dateButtons = element.querySelectorAll("[data-value]");
    for (const button
      of dateButtons) {
      const name = button.dataset.value;
      result[name] = button;
    }
    return result;
  }

  colorDaysButtons(dateFrom, dateTo) {
    const from = Date.parse(dateFrom ? dateFrom : this.from);
    const to = Date.parse(dateTo ? dateTo : this.to);
    for (const entry of Object.entries(this.dateButtons)) {
      const [dateValue, button] = entry;

      button.classList.remove('rangepicker__selected-from', 'rangepicker__selected-between', 'rangepicker__selected-to');

      const date = Date.parse(dateValue);
      if (date === from) {
        button.classList.add('rangepicker__selected-from');
      }
      if (date > from && date < to) {
        button.classList.add('rangepicker__selected-between');
      }
      if (date === to) {
        button.classList.add('rangepicker__selected-to');
      }
    }
  }

  moveCalendar(direction) {
    const date = new Date(this.datesRange.left.at(0));
    switch (direction) {
    case 'left' :
      date.setMonth(date.getMonth() - 1);
      this.datesRange = this.getDatesRange(date);
      break;
    case 'right' :
      console.log('1');
      date.setMonth(date.getMonth() + 1);
      this.datesRange = this.getDatesRange(date);
      break;
    default :
      console.error('Wrong direction:', direction);
    }
    this.renderPicker();
    this.dateButtons = this.getDateButtons(this.element);
    this.colorDaysButtons(this.tempFrom, this.tempFrom);
  }

  pickDate = (dateValue) => {
    const date = new Date(dateValue);
    this.tempFrom = this.tempFrom ? this.tempFrom : this.from;
    if (this.isFirstPick) {
      this.tempFrom = date;
      this.colorDaysButtons(date, date);
      this.isFirstPick = false;
    } else {
      this.to = date > this.tempFrom ? date : this.tempFrom;
      this.from = this.tempFrom < date ? this.tempFrom : date;
      this.subElements.from.innerHTML = this.formatDate(this.from);
      this.subElements.to.innerHTML = this.formatDate(this.to);
      this.colorDaysButtons();
      this.tempFrom = null;
      this.element.classList.remove('rangepicker_open');
      this.element.dispatchEvent(new CustomEvent('date-select', {
        detail: {
          from: this.from.toISOString(),
          to: this.to.toISOString()
        }
      }));
    }
  };

  renderPicker() {
    const {selector} = this.subElements;

    selector.innerHTML = this.getSelectorContent();

    const controlLeft
      = selector.querySelector('.rangepicker__selector-control-left');
    const controlRight
      = selector.querySelector('.rangepicker__selector-control-right');

    controlLeft.addEventListener('click', () => this.moveCalendar('left'));
    controlRight.addEventListener('click', () => this.moveCalendar('right'));
  }

  initEventListeners() {
    const {selector, input} = this.subElements;

    input.addEventListener('click', () => {
      this.element.classList.toggle('rangepicker_open');
      this.renderPicker();
      this.dateButtons = this.getDateButtons(this.element);
      this.colorDaysButtons();
      this.isFirstPick = true;
      this.tempFrom = null;
    });

    selector.addEventListener('click', (event) => {
      console.log('selector');
      if (event.target.classList.contains('rangepicker__cell')) {
        this.pickDate(event.target.dataset.value);
      }
    });

    document.addEventListener('click', this.onDocumentClick, true);

  }

  onDocumentClick = (event) => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.element.classList.remove('rangepicker_open');
    }
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
    document.removeEventListener('click', this.onDocumentClick, true);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.dateButtons = {};
    this.datesRange = {};
  }
}
