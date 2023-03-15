class Tooltip {
  static instance;
  element;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    } else {
      return Tooltip.instance;
    }
  }

  initialize() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="tooltip">This is tooltip</div>
    `;
    this.element = wrapper.firstElementChild;
    this.tooltipTextMap = this.getTooltipTextMap();
    document.body.addEventListener('pointerover', this.onPointOver);
    document.body.addEventListener('pointerout', this.onPointerOut);
  }

  render() {
    document.body.append(this.element);
  }

  getTooltipTextMap() {
    const allElements = document.body.querySelectorAll('[data-tooltip]');
    const tooltipTextMap = new Map();
    allElements.forEach(el => {
      const text = el.dataset.tooltip;
      tooltipTextMap.set(el, text);
    });
    return tooltipTextMap;
  }

  onPointOver = (event) => {
    const target = event.target;
    const text = this.tooltipTextMap.get(target);
    if (!text) {
      return;
    }
    this.element.innerHTML = text;
    this.render();
    target.addEventListener('mousemove', this.onMouseMove);
  };

  onPointerOut = (event) => {
    const target = event.target;
    if (!this.tooltipTextMap.has(target)) {
      return;
    }
    target.removeEventListener('mousemove', this.onMouseMove);
    this.remove();
  };

  onMouseMove = (event) => {
    const positionX = event.clientX;
    const positionY = event.clientY;
    this.element.style.top = (positionY + 7) + 'px';
    this.element.style.left = (positionX + 7) + 'px';
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.tooltipTextMap = null;
  }
}

export default Tooltip;
