import AdoptedStyleSheetMixin from "./adopted-stylesheet-mixin.mjs";

/**
 * Custom element for displaying SVG icons that are cached and can be styled.
 */
export default class IconElement extends AdoptedStyleSheetMixin(HTMLElement) {
  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#internals.role = "img";
    this.#shadowRoot = this.attachShadow({ mode: "closed" });
  }

  /** @inheritDoc */
  static CSS = `
    :host {
      display: inline-block;
      width: var(--icon-width, var(--icon-size, 1em));
      height: var(--icon-height, var(--icon-size, 1em));
      vertical-align: middle;
    }
    svg {
      fill: var(--icon-fill, currentColor);
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
    }
    svg * {
      fill: inherit;
    }
  `;

  /**
   * Cached SVG files by SRC.
   * @type {Map<string, SVGElement|Promise<SVGElement>>}
   */
  static #svgCache = new Map();

  /**
   * The custom element's form and accessibility internals.
   * @type {ElementInternals}
   */
  #internals;

  /**
   * Shadow root that contains the icon.
   * @type {ShadowRoot}
   */
  #shadowRoot;

  /* -------------------------------------------- */

  /**
   * Path to the SVG source file.
   * @type {string}
   */
  get src() {
    return this.getAttribute("src");
  }

  set src(src) {
    this.setAttribute("src", src);
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _adoptStyleSheet(sheet) {
    this.#shadowRoot.adoptedStyleSheets = [sheet];
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  connectedCallback() {
    console.log(`HowToBeAHero | IconElement connecting with src: ${this.src}`);
    this._adoptStyleSheet(this._getStyleSheet());
    const insertElement = element => {
      console.log(`HowToBeAHero | IconElement inserting element:`, element);
      if ( !element ) {
        console.warn(`HowToBeAHero | IconElement: No element to insert for src: ${this.src}`);
        return;
      }
      const clone = element.cloneNode(true);
      // Ensure SVG has proper styling attributes
      if (clone.tagName === 'svg') {
        clone.setAttribute('fill', 'currentColor');
        // Set viewBox if it doesn't exist to ensure proper scaling
        if (!clone.hasAttribute('viewBox')) {
          const width = clone.getAttribute('width') || '24';
          const height = clone.getAttribute('height') || '24';
          clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
        // Remove width/height attributes to let CSS handle sizing
        clone.removeAttribute('width');
        clone.removeAttribute('height');
      }
      this.#shadowRoot.replaceChildren(clone);
      this.classList.add('initialized');
      console.log(`HowToBeAHero | IconElement successfully inserted SVG for src: ${this.src}`);
    };

    // Insert element immediately if already available, otherwise wait for fetch
    const element = this.constructor.fetch(this.src);
    if ( element instanceof Promise ) {
      console.log(`HowToBeAHero | IconElement fetching async for src: ${this.src}`);
      element.then(insertElement).catch(err => {
        console.error(`HowToBeAHero | IconElement fetch failed for src: ${this.src}`, err);
      });
    } else {
      console.log(`HowToBeAHero | IconElement using cached element for src: ${this.src}`);
      insertElement(element);
    }
  }

  /* -------------------------------------------- */

  /**
   * Fetch an SVG element from a source.
   * @param {string} src                        Path of the SVG file to retrieve.
   * @returns {SVGElement|Promise<SVGElement>}  Promise if the element is not cached, otherwise the element directly.
   */
  static fetch(src) {
    if ( !this.#svgCache.has(src) ) {
      console.log(`HowToBeAHero | IconElement fetching SVG from: ${src}`);
      this.#svgCache.set(src, fetch(src)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          console.log(`HowToBeAHero | IconElement received SVG text for: ${src}`, text.substring(0, 200) + '...');
          const temp = document.createElement("div");
          temp.innerHTML = text;
          const svg = temp.querySelector("svg");
          if (!svg) {
            throw new Error(`No SVG element found in fetched content for: ${src}`);
          }
          console.log(`HowToBeAHero | IconElement parsed SVG element for: ${src}`, svg);
          this.#svgCache.set(src, svg);
          return svg;
        })
        .catch(error => {
          console.error(`HowToBeAHero | IconElement fetch error for ${src}:`, error);
          // Remove failed promise from cache so it can be retried
          this.#svgCache.delete(src);
          throw error;
        }));
    }
    return this.#svgCache.get(src);
  }
}
