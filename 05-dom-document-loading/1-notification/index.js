export default class NotificationMessage {

  static targetElement;

  constructor(message = '', {duration = 0, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }


  render() {
    const templateWrapper = document.createElement('div');
    templateWrapper.innerHTML = this.getTemplate();
    this.element = templateWrapper.firstElementChild;
  }

  show(targetElement) {
    if (!targetElement && !NotificationMessage.targetElement) {
      NotificationMessage.targetElement = document.body;
    }
    if (targetElement) {
      NotificationMessage.targetElement = targetElement;
    }
    if (NotificationMessage.targetElement && NotificationMessage.targetElement.querySelector('.notification')) {
      NotificationMessage.targetElement.querySelector('.notification').remove();
    }

    NotificationMessage.targetElement.append(this.element);

    setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    NotificationMessage.targetElement = null;
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
            <div class="notification-header">${this.type}</div>
            <div class="notification-body">
                ${this.message}
            </div>
        </div>
      </div>
    `;
  }
}
