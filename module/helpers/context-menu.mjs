import { setTheme } from "./settings.mjs";

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
  _setPosition([html], [target]) {
    console.log("ContextMenuHTBAH _setPosition called");
    document.body.appendChild(html);
    const { clientWidth, clientHeight } = document.documentElement;
    const { width, height } = html.getBoundingClientRect();

    // TODO: Improve core ContextMenu class to provide this event rather than using the global event.
    const { clientX, clientY } = window.event;
    const left = Math.min(clientX, clientWidth - width);
    this._expandUp = clientY + height > clientHeight;
    html.classList.add("how-to-be-a-hero");
    html.classList.toggle("expand-up", this._expandUp);
    html.classList.toggle("expand-down", !this._expandUp);
    html.style.visibility = "";
    html.style.left = `${left}px`;
    if ( this._expandUp ) html.style.bottom = `${clientHeight - clientY}px`;
    else html.style.top = `${clientY}px`;
    target.classList.add("context");
    const theme = target.closest("[data-theme]")?.dataset.theme ?? "";
    setTheme(html, theme);
  }
}
