
    /* -------------------------------------------- */
    /*  Formatters                                  */
    /* -------------------------------------------- */

    /**
     * Format a Challenge Rating using the proper fractional symbols.
     * @param {number} value  CR value for format.
     * @returns {string}
     */
    export function formatCR(value) {
        return { 0.125: "⅛", 0.25: "¼", 0.5: "½" }[value] ?? formatNumber(value);
    }
  
  /* -------------------------------------------- */
  
  /**
   * A helper for using Intl.NumberFormat within handlebars.
   * @param {number} value    The value to format.
   * @param {object} options  Options forwarded to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat}
   * @returns {string}
   */
  export function formatNumber(value, options) {
    const formatter = new Intl.NumberFormat(game.i18n.lang, options);
    return formatter.format(value);
  }
  
  /* -------------------------------------------- */
  
  /**
   * A helper function to format textarea text to HTML with linebreaks.
   * @param {string} value  The text to format.
   * @returns {Handlebars.SafeString}
   */
  export function formatText(value) {
    return new Handlebars.SafeString(value?.replaceAll("\n", "<br>") ?? "");
  }
  
  /* -------------------------------------------- */
  /*  Formulas                                    */
  /* -------------------------------------------- */
  
  /**
   * Return whether a string is a valid reroll, explosion, min, or max dice modifier.
   * @param {string} mod      The modifier to test.
   * @returns {boolean}
   */
  export function isValidDieModifier(mod) {
    const regex = {
      reroll: /rr?([0-9]+)?([<>=]+)?([0-9]+)?/i,
      explode: /xo?([0-9]+)?([<>=]+)?([0-9]+)?/i,
      minimum: /(?:min)([0-9]+)/i,
      maximum: /(?:max)([0-9]+)/i,
      dropKeep: /[dk]([hl])?([0-9]+)?/i,
      count: /(?:c[sf])([<>=]+)?([0-9]+)?/i
    };
    return Object.values(regex).some(rgx => rgx.test(mod));
  }
  
  /* -------------------------------------------- */
  
  /**
   * Handle a delta input for a number value from a form.
   * @param {HTMLInputElement} input  Input that contains the modified value.
   * @param {Document} target         Target document to be updated.
   * @returns {number|void}
   */
  export function parseInputDelta(input, target) {
    let value = input.value;
    if ( ["+", "-"].includes(value[0]) ) {
      const delta = parseFloat(value);
      value = Number(foundry.utils.getProperty(target, input.dataset.name ?? input.name)) + delta;
    }
    else if ( value[0] === "=" ) value = Number(value.slice(1));
    if ( Number.isNaN(value) ) return;
    input.value = value;
    return value;
  }
  
  /* -------------------------------------------- */
  
  /**
   * Convert a bonus value to a simple integer for displaying on the sheet.
   * @param {number|string|null} bonus  Bonus formula.
   * @param {object} [data={}]          Data to use for replacing @ strings.
   * @returns {number}                  Simplified bonus as an integer.
   * @protected
   */
  export function simplifyBonus(bonus, data={}) {
    if ( !bonus ) return 0;
    if ( Number.isNumeric(bonus) ) return Number(bonus);
    try {
      const roll = new Roll(bonus, data);
      return roll.isDeterministic ? Roll.safeEval(roll.formula) : 0;
    } catch(error) {
      console.error(error);
      return 0;
    }
  }
  
  /* -------------------------------------------- */
  /*  IDs                                         */
  /* -------------------------------------------- */
  
  /**
   * Create an ID from the input truncating or padding the value to make it reach 16 characters.
   * @param {string} id
   * @returns {string}
   */
  export function staticID(id) {
    if ( id.length >= 16 ) return id.substring(0, 16);
    return id.padEnd(16, "0");
  }
  
  /* -------------------------------------------- */
  /*  Object Helpers                              */
  /* -------------------------------------------- */
  
  /**
   * Transform an object, returning only the keys which match the provided filter.
   * @param {object} obj         Object to transform.
   * @param {Function} [filter]  Filtering function. If none is provided, it will just check for truthiness.
   * @returns {string[]}         Array of filtered keys.
   */
  export function filteredKeys(obj, filter) {
    filter ??= e => e;
    return Object.entries(obj).filter(e => filter(e[1])).map(e => e[0]);
  }
  
  /* -------------------------------------------- */
  
  /**
   * Sort the provided object by its values or by an inner sortKey.
   * @param {object} obj                 The object to sort.
   * @param {string|Function} [sortKey]  An inner key upon which to sort or sorting function.
   * @returns {object}                   A copy of the original object that has been sorted.
   */
  export function sortObjectEntries(obj, sortKey) {
    let sorted = Object.entries(obj);
    const sort = (lhs, rhs) => foundry.utils.getType(lhs) === "string" ? lhs.localeCompare(rhs, game.i18n.lang) : lhs - rhs;
    if ( foundry.utils.getType(sortKey) === "function" ) sorted = sorted.sort((lhs, rhs) => sortKey(lhs[1], rhs[1]));
    else if ( sortKey ) sorted = sorted.sort((lhs, rhs) => sort(lhs[1][sortKey], rhs[1][sortKey]));
    else sorted = sorted.sort((lhs, rhs) => sort(lhs[1], rhs[1]));
    return Object.fromEntries(sorted);
  }
  
  /* -------------------------------------------- */
  
  /**
   * Retrieve the indexed data for a Document using its UUID. Will never return a result for embedded documents.
   * @param {string} uuid  The UUID of the Document index to retrieve.
   * @returns {object}     Document's index if one could be found.
   */
  export function indexFromUuid(uuid) {
    const parts = uuid.split(".");
    let index;
  
    // Compendium Documents
    if ( parts[0] === "Compendium" ) {
      const [, scope, packName, id] = parts;
      const pack = game.packs.get(`${scope}.${packName}`);
      index = pack?.index.get(id);
    }
  
    // World Documents
    else if ( parts.length < 3 ) {
      const [docName, id] = parts;
      const collection = CONFIG[docName].collection.instance;
      index = collection.get(id);
    }
  
    return index || null;
  }
  
  /* -------------------------------------------- */
  
  /**
   * Creates an HTML document link for the provided UUID.
   * @param {string} uuid  UUID for which to produce the link.
   * @returns {string}     Link to the item or empty string if item wasn't found.
   */
  export function linkForUuid(uuid) {
    if ( game.release.generation < 12 ) {
      return TextEditor._createContentLink(["", "UUID", uuid]).outerHTML;
    }
  
    // TODO: When v11 support is dropped we can make this method async and return to using TextEditor._createContentLink.
    if ( uuid.startsWith("Compendium.") ) {
      let [, scope, pack, documentName, id] = uuid.split(".");
      if ( !CONST.PRIMARY_DOCUMENT_TYPES.includes(documentName) ) id = documentName;
      const data = {
        classes: ["content-link"],
        attrs: { draggable: "true" }
      };
      TextEditor._createLegacyContentLink("Compendium", [scope, pack, id].join("."), "", data);
      data.dataset.link = "";
      return TextEditor.createAnchor(data).outerHTML;
    }
    return fromUuidSync(uuid).toAnchor().outerHTML;
  }
  
  
  // If you need to add Handlebars helpers, here is a useful example:
  
  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
  });
  
/* -------------------------------------------- */
/*  Targeting                                   */
/* -------------------------------------------- */

/**
 * Get currently selected tokens in the scene or user's character's tokens.
 * @returns {Token[]}
 */
export function getSceneTargets() {
    let targets = canvas.tokens.controlled.filter(t => t.actor);
    if ( !targets.length && game.user.character ) targets = game.user.character.getActiveTokens();
    return targets;
  }
  
  /* -------------------------------------------- */
  /*  Validators                                  */
  /* -------------------------------------------- */
  
  /**
   * Ensure the provided string contains only the characters allowed in identifiers.
   * @param {string} identifier
   * @returns {boolean}
   */
  function isValidIdentifier(identifier) {
    return /^([a-z0-9_-]+)$/i.test(identifier);
  }
  
  export const validators = {
    isValidIdentifier: isValidIdentifier
  };
  
  /* -------------------------------------------- */
  
  /**
   * A helper that converts the provided object into a series of `data-` entries.
   * @param {object} object   Object to convert into dataset entries.
   * @param {object} options  Handlebars options.
   * @returns {string}
   */
  function dataset(object, options) {
    const entries = [];
    for ( let [key, value] of Object.entries(object ?? {}) ) {
      key = key.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (a, b) => (b ? "-" : "") + a.toLowerCase());
      entries.push(`data-${key}="${value}"`);
    }
    return new Handlebars.SafeString(entries.join(" "));
  }
  
  /* -------------------------------------------- */
  
  /**
   * A helper to create a set of <option> elements in a <select> block grouped together
   * in <optgroup> based on the provided categories.
   *
   * @param {SelectChoices} choices          Choices to format.
   * @param {object} [options]
   * @param {boolean} [options.localize]     Should the label be localized?
   * @param {string} [options.blank]         Name for the empty option, if one should be added.
   * @param {string} [options.labelAttr]     Attribute pointing to label string.
   * @param {string} [options.chosenAttr]    Attribute pointing to chosen boolean.
   * @param {string} [options.childrenAttr]  Attribute pointing to array of children.
   * @returns {Handlebars.SafeString}        Formatted option list.
   */
  function groupedSelectOptions(choices, options) {
    const localize = options.hash.localize ?? false;
    const blank = options.hash.blank ?? null;
    const labelAttr = options.hash.labelAttr ?? "label";
    const chosenAttr = options.hash.chosenAttr ?? "chosen";
    const childrenAttr = options.hash.childrenAttr ?? "children";
  
    // Create an option
    const option = (name, label, chosen) => {
      if ( localize ) label = game.i18n.localize(label);
      html += `<option value="${name}" ${chosen ? "selected" : ""}>${label}</option>`;
    };
  
    // Create a group
    const group = category => {
      let label = category[labelAttr];
      if ( localize ) game.i18n.localize(label);
      html += `<optgroup label="${label}">`;
      children(category[childrenAttr]);
      html += "</optgroup>";
    };
  
    // Add children
    const children = children => {
      for ( let [name, child] of Object.entries(children) ) {
        if ( child[childrenAttr] ) group(child);
        else option(name, child[labelAttr], child[chosenAttr] ?? false);
      }
    };
  
    // Create the options
    let html = "";
    if ( blank !== null ) option("", blank);
    children(choices);
    return new Handlebars.SafeString(html);
  }
  
  /* -------------------------------------------- */
  
  /**
   * A helper that fetch the appropriate item context from root and adds it to the first block parameter.
   * @param {object} context  Current evaluation context.
   * @param {object} options  Handlebars options.
   * @returns {string}
   */
  function itemContext(context, options) {
    if ( arguments.length !== 2 ) throw new Error("#htbah-itemContext requires exactly one argument");
    if ( foundry.utils.getType(context) === "function" ) context = context.call(this);
  
    const ctx = options.data.root.itemContext?.[context.id];
    if ( !ctx ) {
      const inverse = options.inverse(this);
      if ( inverse ) return options.inverse(this);
    }
  
    return options.fn(context, { data: options.data, blockParams: [ctx] });
  }
  
  /* -------------------------------------------- */
  
  /**
   * Conceal a section and display a notice if unidentified.
   * @param {boolean} conceal  Should the section be concealed?
   * @param {object} options   Handlebars options.
   * @returns {string}
   */
  function concealSection(conceal, options) {
    let content = options.fn(this);
    if ( !conceal ) return content;
  
    content = `<div inert>
      ${content}
    </div>
    <div class="unidentified-notice">
        <div>
            <strong>${game.i18n.localize("HTBAH.Unidentified.Title")}</strong>
            <p>${game.i18n.localize("HTBAH.Unidentified.Notice")}</p>
        </div>
    </div>`;
    return content;
  }
  
  /* -------------------------------------------- */
  
  /**
   * Register custom Handlebars helpers used by 5e.
   */
  export function registerHandlebarsHelpers() {
    Handlebars.registerHelper({
      getProperty: foundry.utils.getProperty,
      "htbah-concealSection": concealSection,
      "htbah-dataset": dataset,
      "htbah-groupedSelectOptions": groupedSelectOptions,
      "htbah-linkForUuid": linkForUuid,
      "htbah-itemContext": itemContext,
      "htbah-numberFormat": (context, options) => formatNumber(context, options.hash),
      "htbah-textFormat": formatText
    });
  }
  
/* -------------------------------------------- */
/*  Config Pre-Localization                     */
/* -------------------------------------------- */

/**
 * Storage for pre-localization configuration.
 * @type {object}
 * @private
 */
const _preLocalizationRegistrations = {};

/**
 * Mark the provided config key to be pre-localized during the init stage.
 * @param {string} configKeyPath          Key path within `CONFIG.HOW_TO_BE_A_HERO` to localize.
 * @param {object} [options={}]
 * @param {string} [options.key]          If each entry in the config enum is an object,
 *                                        localize and sort using this property.
 * @param {string[]} [options.keys=[]]    Array of localization keys. First key listed will be used for sorting
 *                                        if multiple are provided.
 * @param {boolean} [options.sort=false]  Sort this config enum, using the key if set.
 */
export function preLocalize(configKeyPath, { key, keys=[], sort=false }={}) {
  if ( key ) keys.unshift(key);
  _preLocalizationRegistrations[configKeyPath] = { keys, sort };
}

/* -------------------------------------------- */

/**
 * Execute previously defined pre-localization tasks on the provided config object.
 * @param {object} config  The `CONFIG.HOW_TO_BE_A_HERO` object to localize and sort. *Will be mutated.*
 */
export function performPreLocalization(config) {
  for ( const [keyPath, settings] of Object.entries(_preLocalizationRegistrations) ) {
    const target = foundry.utils.getProperty(config, keyPath);
    if ( !target ) continue;
    _localizeObject(target, settings.keys);
    if ( settings.sort ) foundry.utils.setProperty(config, keyPath, sortObjectEntries(target, settings.keys[0]));
  }

  // Localize & sort status effects
  CONFIG.statusEffects.forEach(s => s.name = game.i18n.localize(s.name));
  CONFIG.statusEffects.sort((lhs, rhs) =>
    lhs.id === "dead" ? -1 : rhs.id === "dead" ? 1 : lhs.name.localeCompare(rhs.name, game.i18n.lang)
  );
}

/* -------------------------------------------- */

/**
 * Localize the values of a configuration object by translating them in-place.
 * @param {object} obj       The configuration object to localize.
 * @param {string[]} [keys]  List of inner keys that should be localized if this is an object.
 * @private
 */
function _localizeObject(obj, keys) {
  for ( const [k, v] of Object.entries(obj) ) {
    const type = typeof v;
    if ( type === "string" ) {
      obj[k] = game.i18n.localize(v);
      continue;
    }

    if ( type !== "object" ) {
      console.error(new Error(
        `Pre-localized configuration values must be a string or object, ${type} found for "${k}" instead.`
      ));
      continue;
    }
    if ( !keys?.length ) {
      console.error(new Error(
        "Localization keys must be provided for pre-localizing when target is an object."
      ));
      continue;
    }

    for ( const key of keys ) {
      const value = foundry.utils.getProperty(v, key);
      if ( !value ) continue;
      foundry.utils.setProperty(v, key, game.i18n.localize(value));
    }
  }
}

// Add this to utils.mjs or a similar utility file
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/* -------------------------------------------- */
/*  Localization                                */
/* -------------------------------------------- */

/**
 * A cache of already-fetched labels for faster lookup.
 * @type {Map<string, string>}
 */
const _attributeLabelCache = new Map();

/**
 * Convert an attribute path to a human-readable label.
 * @param {string} attr              The attribute path.
 * @param {object} [options]
 * @param {HowToBeAHeroActor} [options.actor]  An optional reference actor.
 * @returns {string|void}
export function getHumanReadableAttributeLabel(attr, { actor }={}) {
  // Check any actor-specific names first.
  if ( attr.startsWith("resources.") && actor ) {
    const resource = foundry.utils.getProperty(actor, `system.${attr}`);
    if ( resource.label ) return resource.label;
  }

  // Generic XP handling for How To Be A Hero
  if ( attr === "details.xp.value" ) {
    return game.i18n.localize("HTBAH.ExperiencePoints");
  }

  if ( attr.startsWith(".") && actor ) {
    const item = fromUuidSync(attr, { relative: actor });
    return item?.name ?? attr;
  }

  // Check if the attribute is already in cache.
  let label = _attributeLabelCache.get(attr);
  if ( label ) return label;

  // Generic attribute handling for How To Be A Hero
  // Most attributes will be handled by generic fallback below

  if ( label ) {
    label = game.i18n.localize(label);
    _attributeLabelCache.set(attr, label);
  }

  return label;
}

 */