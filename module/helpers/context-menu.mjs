/**
 * A specialized subclass of ContextMenu that places the menu in a fixed position.
 * @extends {foundry.applications.ux.ContextMenu.implementation}
 */
export default class ContextMenuHTBAH extends foundry.applications.ux.ContextMenu.implementation {
  constructor(...args) {
    console.log("ContextMenuHTBAH constructor called with args:", args);
    super(...args);
  }

  /** @override */
  render(target, event) {
    // Store the event for later use in positioning
    this.event = event;
    return super.render(target, event);
  }

  /** @override */
  _setPosition(html, target) {
    console.log("ContextMenuHTBAH _setPosition called");
    document.body.appendChild(html);
    const { clientWidth, clientHeight } = document.documentElement;
    const { width, height } = html.getBoundingClientRect();

    // Get mouse coordinates from the stored event or fallback to target position
    let clientX = 0, clientY = 0;
    if (this.event && typeof this.event.clientX === 'number') {
      clientX = this.event.clientX;
      clientY = this.event.clientY;
    } else if (window.event && typeof window.event.clientX === 'number') {
      clientX = window.event.clientX;
      clientY = window.event.clientY;
    } else {
      // Fallback to target element position
      const rect = target.getBoundingClientRect();
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    const left = Math.min(clientX, clientWidth - width);
    const expandUp = clientY + height > clientHeight;
    html.classList.add("how-to-be-a-hero");
    html.classList.toggle("expand-up", expandUp);
    html.classList.toggle("expand-down", !expandUp);
    html.style.visibility = "";
    html.style.left = `${left}px`;
    if ( expandUp ) html.style.bottom = `${clientHeight - clientY}px`;
    else html.style.top = `${clientY}px`;
    target.classList.add("context");
  }
}
