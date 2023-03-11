export default class NotificationMessage {

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

  show(providedTargetElement) {
    this.cleanPreviousAndAssign();
    this.appendElementToTarget(providedTargetElement);
    this.assignTimerToDestroy();
  }

  cleanPreviousAndAssign() {
    if (NotificationMessage.previous) {
      NotificationMessage.previous.destroy();
      clearTimeout(NotificationMessage.timerId);
    }
    NotificationMessage.previous = this;
  }

  appendElementToTarget(targetElement = document.body) {
    targetElement.append(this.element);
  }

  assignTimerToDestroy() {
    NotificationMessage.timerId = setTimeout(() => {
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
    this.element = null;
    NotificationMessage.previous = null;
  }
}
