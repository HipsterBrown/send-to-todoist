const CHECK_ICON = "../../../icons/check.svg";
const SYNC_ICON = "../../../icons/sync.svg";

class SyncIt extends HTMLElement {
  constructor() {
    super()

    this.btn = this.querySelector('button')
    this.icon = this.btn.querySelector('img')
    this.message = this.btn.querySelector('span')
  }

  enable() {
    this.btn.removeAttribute('disabled')
    this.btn.classList.remove("cursor-not-allowed", "bg-gray-300");
    this.btn.classList.add("bg-white", "hover:bg-gray-50");
  }

  disable() {
    this.btn.setAttribute('disabled', true)
    this.btn.classList.remove("bg-white", "hover:bg-gray-50");
    this.btn.classList.add("cursor-not-allowed", "bg-gray-300");
  }

  setStatus(status) {
    switch (status) {
      case 'syncing':
        this.icon.classList.add("animate-spin");
        this.message.textContent = "Syncing...";
        break;
      case 'complete':
        this.icon.classList.remove("animate-spin");
        this.icon.src = CHECK_ICON;
        this.message.textContent = "Sync complete!";
        break;
      case 'pending':
        this.icon.src = SYNC_ICON
        this.message.textContent = "Sync"
        break;
    }
    return this;
  }
}

customElements.define('sync-it', SyncIt)
