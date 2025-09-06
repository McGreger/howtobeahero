// how-to-be-a-hero.mjs - Updated initialization for AppV2 with enhanced error handling

// Import document classes.
import { HowToBeAHeroActor } from './documents/actor.mjs';
import { HowToBeAHeroItem } from './documents/item.mjs';
import { HowToBeAHeroActiveEffect } from './documents/active-effect.mjs';
// Import sheet classes.
import { HowToBeAHeroActorSheet } from './sheets/actor-sheet.mjs'
import { HowToBeAHeroItemSheet } from './sheets/item-sheet.mjs';
// Import application classes.
import { HowToBeAHeroRollDialog } from './apps/roll-dialog.mjs';
// Import manager classes
import { conditionManager } from './managers/condition-manager.mjs';
import { effectsManager } from './managers/effects-manager.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { registerHandlebarsHelpers } from './helpers/utils.mjs';
import { Tooltips } from './helpers/tooltips.mjs';
import { HOW_TO_BE_A_HERO } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';
// Import Dice class
import { D100Roll } from './dice/rolls.mjs';
import { D10Roll } from './dice/rolls.mjs';
// Import Html custom element classes with enhanced AppV2 support
import * as element from './components/_module.mjs';
import { initializeCustomElements, upgradeExistingElements } from './components/_module.mjs';

var _module$c = /*#__PURE__*/Object.freeze({
  __proto__: null,
  SlideToggleElement: element.config.slidetoggle,
  IconElement: element.config.icon,
  FiligreeBoxElement: element.config.filigree,
  EffectsElement: element.config.effects,
  InventoryElement: element.config.inventory,
  ItemListControlsElement: element.config.itemlistcontrol
});

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  console.log("HowToBeAHero | Initializing How To Be A Hero System with AppV2 support");

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.howtobeahero = {
    HowToBeAHeroActor,
    HowToBeAHeroItem,
    HowToBeAHeroActiveEffect,
    rollItemMacro: async (itemUuid) => {
      const item = await fromUuid(itemUuid);
      if (!item) {
        return ui.notifications.warn(game.i18n.localize("HTBAH.MacroItemNotFound"));
      }
      return item.roll();
    },
    rollAbilityMacro: async (itemUuid) => {
      const item = await fromUuid(itemUuid);
      if (!item || item.type !== 'ability') {
        return ui.notifications.warn(game.i18n.format("HTBAH.MacroItemMissing", {item: itemUuid}));
      }
      return item.roll();
    },
  };

  //Add managers  
  game.howtobeahero.managers = {
    effects: new effectsManager(),
    conditions: new conditionManager()
  }
  // Set the condition manager for the effects manager
  game.howtobeahero.managers.effects.setConditionManager(game.howtobeahero.managers.conditions);

  // Initialize custom elements early with enhanced error handling
  console.log("HowToBeAHero | Pre-initializing custom elements...");
  try {
    const customElementResults = initializeCustomElements();
    game.howtobeahero.customElements = {
      status: customElementResults,
      upgrade: upgradeExistingElements
    };
    
    // Report initialization status
    const successful = Object.values(customElementResults).filter(r => r.success).length;
    const total = Object.keys(customElementResults).length;
    console.log(`HowToBeAHero | Custom elements initialized: ${successful}/${total} successful`);
    
    if (successful < total) {
      console.warn("HowToBeAHero | Some custom elements failed - fallbacks will be used");
    }
  } catch (error) {
    console.error("HowToBeAHero | Critical error initializing custom elements:", error);
    game.howtobeahero.customElements = { status: {}, upgrade: () => {} };
  }
  
  // Add custom constants for configuration.
  CONFIG.HTBAH = HOW_TO_BE_A_HERO;

  // Set default token configuration for different actor types
  CONFIG.Actor.defaultTypes = ["character", "npc"];
  
  // Set default token configuration for all actor types
  CONFIG.Actor.prototypeToken = {
    actorLink: true,  // Changed from false to true to ensure all tokens are linked by default
    displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
    bar1: { attribute: "health" },
    bar2: { attribute: "" }
  };

  // Set type-specific prototype token settings
  CONFIG.Actor.typeDefaults = {
    character: {
      prototypeToken: {
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
        displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
        displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      }
    },
    npc: {
      prototypeToken: {
        actorLink: true,
        disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
        displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
        displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      }
    }
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d10 + @attributes.skillSets.action.value',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = HowToBeAHeroActor;
  CONFIG.Actor.dataModels = {
    character: models.HowToBeAHeroCharacter,
    npc: models.HowToBeAHeroNPC
  }
  CONFIG.Item.documentClass = HowToBeAHeroItem;
  CONFIG.Item.dataModels = {
    item: models.HowToBeAHeroItem,
    consumable: models.HowToBeAHeroConsumable,
    weapon: models.HowToBeAHeroWeapon,
    armor: models.HowToBeAHeroArmor,
    tool: models.HowToBeAHeroTool,
    ability: models.HowToBeAHeroAbility
  }
  
  // Verify that all data models are defined
  for (let [key, model] of Object.entries(CONFIG.Actor.dataModels)) {
    if (!model) console.error(`Actor data model for "${key}" is not defined.`);
  }
  for (let [key, model] of Object.entries(CONFIG.Item.dataModels)) {
    if (!model) console.error(`Item data model for "${key}" is not defined.`);
  }

  console.log("Actor data models:", CONFIG.Actor.dataModels);
  console.log("Item data models:", CONFIG.Item.dataModels);

  CONFIG.Dice.D100Roll = D100Roll;
  CONFIG.Dice.D10Roll = D10Roll;
  
  // Register Roll Extensions
  CONFIG.Dice.rolls.push(D100Roll);
  CONFIG.Dice.rolls.push(D10Roll);

  // Initialize tooltips
  game.howtobeahero.tooltips = new Tooltips();
  game.howtobeahero.tooltips.observe();

  // Activate tooltip listeners
  Tooltips.activateListeners();

  // Register sheet application classes
  foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet('how-to-be-a-hero', HowToBeAHeroActorSheet, {
    makeDefault: true,
    label: 'HOW_TO_BE_A_HERO.SheetLabels.Actor',
  });
  foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet('how-to-be-a-hero', HowToBeAHeroItemSheet, {
    makeDefault: true,
    label: 'HOW_TO_BE_A_HERO.SheetLabels.Item',
  });

  // Preload Handlebars helpers & partials
  preloadHandlebarsTemplates();
  registerHandlebarsHelpers();
  
  console.log("HowToBeAHero | System initialization completed");
});

// Enhanced Handlebars helpers for AppV2
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('HTBAH-dataset', function(dataset) {
  return Object.entries(dataset || {}).map(([k, v]) => `data-${k}="${v}"`).join(" ");
});

// Enhanced helpers for AppV2 compatibility
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('filterJoin', function(array, separator) {
  if (!Array.isArray(array)) return '';
  return array.filter(Boolean).join(separator || ' ');
});

Handlebars.registerHelper('localize', function(key) {
  // Handle different key formats
  let localizationKey;
  
  if (typeof key === 'string') {
    localizationKey = key;
  } else if (key && typeof key === 'object' && key.string) {
    // Handle Foundry v13 localization objects
    localizationKey = key.string;
  } else {
    console.warn('HowToBeAHero | Invalid localization key:', key);
    return key || '';
  }
  
  if (!localizationKey) {
    return '';
  }
  
  return game.i18n.localize(localizationKey);
});

Handlebars.registerHelper('numberFormat', function(number, options = {}) {
  return new Intl.NumberFormat(game.i18n.lang, options.hash || {}).format(number);
});

Handlebars.registerHelper('gt', function (a, b) {
  return a > b;
});

Handlebars.registerHelper('lt', function (a, b) {
  return a < b;
});

Handlebars.registerHelper('and', function (a, b) {
  return a && b;
});

Handlebars.registerHelper('or', function (a, b) {
  return a || b;
});

Handlebars.registerHelper('not', function (a) {
  return !a;
});

// Helper for safe property access
Handlebars.registerHelper('safe', function(obj, path) {
  if (!obj || !path) return '';
  return path.split('.').reduce((o, p) => o && o[p], obj) || '';
});

// Helper for conditional classes
Handlebars.registerHelper('addClass', function(condition, className) {
  return condition ? className : '';
});

// Helper for debug output in development
Handlebars.registerHelper('debug', function(obj) {
  if (game.settings.get('core', 'noCanvas')) {
    console.log('Handlebars Debug:', obj);
  }
  return '';
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  console.log("HowToBeAHero | System ready - setting up final configurations");

  // Enhanced hotbar handling
  Hooks.on('hotbarDrop', (bar, data, slot) => {
    if (data.type === 'Item') {
      createItemMacro(data, slot);
      return false;
    }
  }, { priority: -1 }); // Lower priority to run first

  Hooks.on("preCreateToken", (document, data, options, userId) => {
    // Force actorLink to true for all new tokens
    document.updateSource({actorLink: true});
  });

  // Enhanced item update hook with error handling
  Hooks.on("updateItem", (item, changes, options, userId) => {
    try {
      if (item instanceof CONFIG.Item.dataModels.armor && "system.equipped" in changes) {
        if (item.parent instanceof CONFIG.Actor.dataModels.character) {
          item.parent.prepareData();
        }
      }
    } catch (error) {
      console.warn("HowToBeAHero | Error in updateItem hook:", error);
    }
  });
  
  // Register conditions
  game.howtobeahero.managers.conditions.registerAllConditions();

  // Set up enhanced sheet context for custom elements
  Hooks.on('renderHowToBeAHeroActorSheet', (sheet, html) => {
    try {
      // Store sheet reference on the element for custom elements to access
      if (html instanceof HTMLElement) {
        html._sheet = sheet;
        
        // Upgrade any custom elements in the rendered content
        if (game.howtobeahero.customElements?.upgrade) {
          setTimeout(() => {
            game.howtobeahero.customElements.upgrade(html);
          }, 0);
        }
      }
    } catch (error) {
      console.warn("HowToBeAHero | Error setting up sheet context:", error);
    }
  });

  // Enhanced error handling for sheet renders
  Hooks.on('renderActorSheet', (sheet, html, data) => {
    if (sheet instanceof HowToBeAHeroActorSheet) {
      try {
        // Ensure custom elements have proper context
        if (html instanceof HTMLElement) {
          html._sheet = sheet;
        }
      } catch (error) {
        console.warn("HowToBeAHero | Error in renderActorSheet hook:", error);
      }
    }
  });

  console.log("HowToBeAHero | System fully ready and configured");
});

/* -------------------------------------------- */
/*  Hotbar Macros - Enhanced for AppV2         */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise<boolean>}
 */
async function createItemMacro(data, slot) {
  if (data.type !== 'Item') return true;
  
  try {
    event.preventDefault(); // Prevent default handling
    
    const item = await fromUuid(data.uuid);
    if (!item) return false;

    let command;
    switch (item.type) {
      case 'ability':
        command = `game.howtobeahero.rollAbilityMacro("${data.uuid}");`;
        break;
      default:
        command = `game.howtobeahero.rollItemMacro("${data.uuid}");`;
    }

    let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
      macro = await Macro.create({
        name: item.name,
        type: 'script',
        img: item.img,
        command: command,
        flags: { 
          'how-to-be-a-hero': {
            itemMacro: true,
            itemType: item.type,
            itemId: data.uuid
          }
        }
      });
    }
    
    if (macro) {
      await game.user.assignHotbarMacro(macro, slot);
    }
    
    return false;
  } catch (error) {
    console.error("HowToBeAHero | Error creating item macro:", error);
    ui.notifications.error("Failed to create macro. Check console for details.");
    return false;
  }
}

/**
 * Execute a macro from an Item.
 * @param {string} itemUuid
 */
async function rollItemMacro(itemUuid) {
  try {
    const item = await fromUuid(itemUuid);
    if (!item) {
      return ui.notifications.warn(game.i18n.localize("HTBAH.MacroItemNotFound"));
    }

    if (!item.parent) {
      const actor = _getMacroSpeaker();
      if (!actor) return ui.notifications.warn(game.i18n.localize("HTBAH.MacroNoActor"));
      return;
    }

    return item.roll();
  } catch (error) {
    console.error("HowToBeAHero | Error executing item macro:", error);
    ui.notifications.error("Failed to execute macro. Check console for details.");
  }
}

/**
 * Execute a macro for an ability item.
 * @param {string} itemUuid
 */
async function rollAbilityMacro(itemUuid) {
  try {
    const item = await fromUuid(itemUuid);
    if (!item || item.type !== 'ability') {
      return ui.notifications.warn(game.i18n.format("HTBAH.MacroItemMissing", {item: itemUuid}));
    }
    return item.roll();
  } catch (error) {
    console.error("HowToBeAHero | Error executing ability macro:", error);
    ui.notifications.error("Failed to execute ability macro. Check console for details.");
  }
}

/**
 * Get the actor for macro execution context
 * @returns {Actor|null}
 * @private
 */
function _getMacroSpeaker() {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  return actor;
}