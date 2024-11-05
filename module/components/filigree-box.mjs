import AdoptedStyleSheetMixin from "./adopted-stylesheet-mixin.mjs";

/**
 * Custom element that adds a filigree border that can be colored.
 */
export default class FiligreeBoxElement extends AdoptedStyleSheetMixin(HTMLElement) {
  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    this._adoptStyleSheet(this._getStyleSheet());
    const backdrop = document.createElement("div");
    backdrop.classList.add("backdrop");
    this.#shadowRoot.appendChild(backdrop);

    // Example of setting a default type
    this.filigreeType = this.getAttribute('filigree-type') || 'default';

    this.#buildFiligree();

    const slot = document.createElement("slot");
    this.#shadowRoot.appendChild(slot);
  }

  /** @inheritDoc */
  static CSS = `
    :host {
      position: relative;
      isolation: isolate;
      min-height: 56px;
      filter: var(--filigree-drop-shadow, drop-shadow(0 0 12px var(--htbah-shadow-15)));
    }
    .backdrop {
      --chamfer: 12px;
      position: absolute;
      inset: 0;
      background: var(--filigree-background-color, var(--htbah-color-card));
      z-index: -2;
      clip-path: polygon(
        var(--chamfer) 0,
        calc(100% - var(--chamfer)) 0,
        100% var(--chamfer),
        100% calc(100% - var(--chamfer)),
        calc(100% - var(--chamfer)) 100%,
        var(--chamfer) 100%,
        0 calc(100% - var(--chamfer)),
        0 var(--chamfer)
      );
    }
    .filigree {
      position: absolute;
      fill: var(--filigree-border-color, var(--htbah-color-gold));
      z-index: -1;

      &.top, &.bottom { height: 30px; }
      &.top { top: 0; }
      &.bottom { bottom: 0; scale: 1 -1; }

      &.left, &.right { width: 25px; }
      &.left { left: 0; }
      &.right { right: 0; scale: -1 1; }

      &.bottom.right { scale: -1 -1; }
    }
    .filigree.block {
      inline-size: calc(100% - 50px);
      inset-inline: 25px;
    }
    .filigree.inline {
      block-size: calc(100% - 60px);
      inset-block: 30px;
    }

  `;

  /**
   * Path definitions for the various box corners and edges.
   * @type {object}
   */
  static svgPaths = Object.freeze({
    default: {
      corner: "M 3 21.7 C 5.383 14.227 9.646 7.066 18.1 3.2 L 12.2 3.2 L 3 12.8 Z M 6.9 15.7 C 5.088 19.235 3.776 23.004 3 26.9 L 2.999 30 L 0 30 L 0 11.5 L 11 0 L 25 0 L 25 3.1 L 22.4 3.1 C 16.737 4.586 11.822 8.112 8.6 13 L 8.6 30 L 6.9 30 Z",
      block: "M 0 0 L 10 0 L 10 3.1 L 0 3.1 L 0 0 Z",
      inline: "M 0 10 L 0 0 L 2.99 0 L 2.989 10 L 0 10 Z M 6.9 10 L 6.9 0 L 8.6 0 L 8.6 10 L 6.9 10 Z"
    },
    typeTalents: {
      corner: "M 3 24 C 6 14 24 2 10 3 L 10 3 C 5 3 3 6 3 11 Z Z M 7 19 C 6 20 3.776 23.004 3 26.9 L 2.999 30 L 0 30 L 0 15 C 0 7 4 0 6 0 L 14 0 C 17 0 17.3333 0 19 0 L 25 0 L 25 3.1 L 17 3 C 28 7 10 15 9 16 L 9 30 L 6.9 30 Z",
      block: "M 0 0 L 15 0 L 15 3 L 0 3 L 0 0 Z",
      inline: "M 0 15 L 0 0 L 3 0 L 3 15 L 0 15 Z M 7 15 L 7 0 L 9 0 L 9 15 L 7 15 Z"
    },
    typeTalentsHeader: {
      corner: "M 3 24 C 9 18 2 6 10 3 L 10 3 C 5 3 3 6 3 11 Z Z M 7 19 C 6 20 3.776 23.004 3 26.9 L 2.999 30 L 0 30 L 0 15 C 0 7 4 0 6 0 L 14 0 C 14 2 17.3333 0 19 0 L 25 0 L 25 3.1 L 22.4 3.1 C 6 5 10 15 9 18 L 8.6 30 L 6.9 30 Z",
      block: "M 0 0 L 15 0 L 15 3 L 0 3 L 0 0 Z",
      inline: "M 0 15 L 0 0 L 3 0 L 3 15 L 0 15 Z M 7 15 L 7 0 L 9 0 L 9 15 L 7 15 Z"
    }
  });

  /**
   * Shadow root that contains the box shapes.
   * @type {ShadowRoot}
   */
  #shadowRoot;

  /* -------------------------------------------- */

  /** @inheritDoc */
  _adoptStyleSheet(sheet) {
    this.#shadowRoot.adoptedStyleSheets = [sheet];
  }

  /* -------------------------------------------- */

  /**
   * Build an SVG element.
   * @param {string} path          SVG path to use.
   * @param {...string} positions  Additional position CSS classes to add.
   */
  #buildSVG(type,path, ...positions) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("filigree", path, ...positions);
    svg.innerHTML = `<path d="${FiligreeBoxElement.svgPaths[type][path]}" />`;
    svg.setAttribute("viewBox", `0 0 ${path === "block" ? 10 : 25} ${path === "inline" ? 10 : 30}`);
    svg.setAttribute("preserveAspectRatio", "none");
    this.#shadowRoot.appendChild(svg);
  }

   /**
   * Build filigree elements based on the configured type.
   */
  #buildFiligree() {
    const filigreeElements = [
      { path: "corner", positions: ["top", "left"] },
      { path: "corner", positions: ["top", "right"] },
      { path: "corner", positions: ["bottom", "left"] },
      { path: "corner", positions: ["bottom", "right"] },
      { path: "block", positions: ["top"] },
      { path: "block", positions: ["bottom"] },
      { path: "inline", positions: ["left"] },
      { path: "inline", positions: ["right"] }
    ];

    filigreeElements.forEach(element => {
      this.#buildSVG(this.filigreeType, element.path, ...element.positions);
    });
  }
}
