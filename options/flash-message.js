const SUCCESS_ICON = "../../../icons/check.svg";
const INFO_ICON = "../../../icons/info.svg";

class FlashMessage extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = `
      <img src="../../../icons/check.svg" aria-hidden id="${this.id}--icon" class="mr-2">
      <span id="${this.id}--message" class="text-xs text-gray-800">Shortcut saved!</span>
    `;
  }

  connectedCallback() {
    this.iconEl = this.querySelector(`#${this.id}--icon`)
    this.messageEl = this.querySelector(`#${this.id}--message`)
  }

  hide() {
    this.classList.remove("block")
    this.classList.add("hidden");
    return this
  }

  show() {
    this.classList.remove("hidden")
    this.classList.add("block");
    return this
  }

  setStatus(status) {
    this.classList.remove("bg-gray-200", "bg-green-300")
    switch (status) {
      case "info":
        this.iconEl.src = INFO_ICON
        this.classList.add("bg-gray-200");
        break;
      case "success":
        this.iconEl.src = SUCCESS_ICON
        this.classList.add("bg-green-300")
        break;
    }
    return this;
  }

  setMessage(message) {
    this.messageEl.innerHTML = message
    return this;
  }
}

customElements.define('flash-message', FlashMessage)
