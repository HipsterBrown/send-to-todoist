const template = document.createElement('template');
template.innerHTML = `
  <div class="flex items-center justify-between mb-2">
    <label class="text-gray-700 text-sm font-normal"></label>
    <input type="text"
      class="shadow appearance-none border rounded py-2 px-3 text-grey-700 leading-tight mb-1 max-w-min text-sm" />
  </div>
`
class ShortcutField extends HTMLElement {
  constructor() {
    super();

    const content = template.content.cloneNode(true)
    const label = content.querySelector('label')
    const input = content.querySelector('input')

    this.name = this.getAttribute('name')
    this.description = this.getAttribute('description')
    this.shortcut = this.getAttribute('shortcut')

    label.htmlFor = this.name
    label.id = `${this.name}-label`
    label.textContent = this.description || this.#formatCommandName(this.name)

    input.name = this.name
    input.id = this.name
    input.setAttribute("aria-labelledby", label.id)
    input.value = this.shortcut
    input.readonly = true

    this.appendChild(content)
  }

  #formatCommandName(name) {
    return name
      .split("_")
      .filter(Boolean)
      .map((word, index) => index ? word : word.slice(0, 1).toUpperCase() + word.slice(1))
      .join(" ");
  }
}

customElements.define('shortcut-field', ShortcutField)
