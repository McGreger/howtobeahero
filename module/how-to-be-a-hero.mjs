// Import document classes.
import { HowToBeAHeroActor } from './documents/actor.mjs';
import { HowToBeAHeroItem } from './documents/item.mjs';
import { HowToBeAHeroActiveEffect } from './documents/active-effect.mjs';
// Import sheet classes.
import { HowToBeAHeroActorSheet } from './sheets/actor-sheet.mjs';
import { HowToBeAHeroItemSheet } from './sheets/item-sheet.mjs';
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
import { D100Roll } from './dice/d100-roll.mjs';
// Import Html custom element classes
import * as element from './components/_module.mjs';

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
    rollActionMacro: async (itemUuid) => {
      const item = await fromUuid(itemUuid);
      if (!item || item.type !== 'action') {
        return ui.notifications.warn(game.i18n.format("HTBAH.MacroItemMissing", {item: itemUuid}));
      }
      return item.roll();
    },
    rollSocialMacro: async (itemUuid) => {
      const item = await fromUuid(itemUuid);
      if (!item || item.type !== 'social') {
        return ui.notifications.warn(game.i18n.format("HTBAH.MacroItemMissing", {item: itemUuid}));
      }
      return item.roll();
    },
    rollKnowledgeMacro: async (itemUuid) => {
      const item = await fromUuid(itemUuid);
      if (!item || item.type !== 'knowledge') {
        return ui.notifications.warn(game.i18n.format("HTBAH.MacroItemMissing", {item: itemUuid}));
      }
      return item.roll();
    }
  };
  //Add managers  
  game.howtobeahero.managers = {
    effects: new effectsManager(),
    conditions: new conditionManager()
  }
  // Set the condition manager for the effects manager
  game.howtobeahero.managers.effects.setConditionManager(game.howtobeahero.managers.conditions);

  // Add custom constants for configuration.
  CONFIG.HTBAH = HOW_TO_BE_A_HERO;

  // Set default token configuration for different actor types
  CONFIG.Actor.defaultTypes = ["character", "npc"];
  CONFIG.Actor.prototypeToken = {
    actorLink: false,  // Default for new actors
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
    formula: '1d100 + @talents.act.mod',
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
    knowledge: models.HowToBeAHeroKnowledge,
    action: models.HowToBeAHeroAction,
    social: models.HowToBeAHeroSocial,
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
  
  // Register Roll Extensions
  CONFIG.Dice.rolls.push(D100Roll);

  // Initialize tooltips
  game.howtobeahero.tooltips = new Tooltips();
  game.howtobeahero.tooltips.observe();

  // Activate tooltip listeners
  Tooltips.activateListeners();

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('how-to-be-a-hero', HowToBeAHeroActorSheet, {
    makeDefault: true,
    label: 'HOW_TO_BE_A_HERO.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('how-to-be-a-hero', HowToBeAHeroItemSheet, {
    makeDefault: true,
    label: 'HOW_TO_BE_A_HERO.SheetLabels.Item',
  });

  // Preload Handlebars helpers & partials
  preloadHandlebarsTemplates();
  registerHandlebarsHelpers();
});

// Handlebars helpers
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('HTBAH-dataset', function(dataset) {
  return Object.entries(dataset || {}).map(([k, v]) => `data-${k}="${v}"`).join(" ");
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {

  Hooks.on('hotbarDrop', (bar, data, slot) => {
    if (data.type === 'Item') {
      createItemMacro(data, slot);
      return false;
    }
  }, { priority: -1 }); // Lower priority to run first
  
  // Register item update hook
  Hooks.on("updateItem", (item, changes, options, userId) => {
    if (item instanceof CONFIG.Item.dataModels.armor && "system.equipped" in changes) {
      if (item.parent instanceof CONFIG.Actor.dataModels.character) {
        item.parent.prepareData();
      }
    }
  });
  
  game.howtobeahero.managers.conditions.registerAllConditions();
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */
/**
 * Create a Macro from an Item drop.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise<boolean>}
 */
async function createItemMacro(data, slot) {
  if (data.type !== 'Item') return true;
  event.preventDefault(); // Prevent default handling
  
  const item = await fromUuid(data.uuid);
  if (!item) return false;

  let command;
  switch (item.type) {
    case 'action':
      command = `game.howtobeahero.rollActionMacro("${data.uuid}");`;
      break;
    case 'social':
      command = `game.howtobeahero.rollSocialMacro("${data.uuid}");`;
      break;
    case 'knowledge':
      command = `game.howtobeahero.rollKnowledgeMacro("${data.uuid}");`;
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
}

/**
 * Execute a macro from an Item.
 * @param {string} itemUuid
 */
async function rollItemMacro(itemUuid) {
  const item = await fromUuid(itemUuid);
  if (!item) {
    return ui.notifications.warn(game.i18n.localize("HTBAH.MacroItemNotFound"));
  }

  if (!item.parent) {
    const actor = _getMacroSpeaker();
    if (!actor) return ui.notifications.warn(game.i18n.localize("HTBAH.MacroNoActor"));
    
    // Create temporary item
    /*
    let tempItem;
    try {
      tempItem = await actor.createEmbeddedDocuments("Item", [{
        ...item.toObject(),
        _id: null
      }]);
      
      if (tempItem.length > 0) {
        await tempItem[0].roll();
      }
    } catch (error) {
      console.error("Error rolling macro item:", error);
    } finally {
      // Always clean up the temporary item
      if (tempItem?.[0]?.id) {
        await actor.deleteEmbeddedDocuments("Item", [tempItem[0].id]);
      }
    }
    */
    return;
  }

  return item.roll();
}

/**
 * Execute a macro for an action item.
 * @param {string} itemUuid
 */
async function rollActionMacro(itemUuid) {
  const item = await fromUuid(itemUuid);  // Changed from fromUuidSync
  if (!item || item.type !== 'action') {
    return ui.notifications.warn(game.i18n.format("HTBAH.MacroItemMissing", {item: itemUuid}));
  }
  return item.roll();
}

/**
 * Execute a macro for a social item.
 * @param {string} itemUuid
 */
async function rollSocialMacro(itemUuid) {
  const item = await fromUuid(itemUuid);  // Changed from fromUuidSync
  if (!item || item.type !== 'social') {
    return ui.notifications.warn(game.i18n.format("HTBAH.MacroItemMissing", {item: itemUuid}));
  }
  return item.roll();
}

/**
 * Execute a macro for a knowledge item.
 * @param {string} itemUuid
 */
async function rollKnowledgeMacro(itemUuid) {
  const item = await fromUuid(itemUuid);  // Changed from fromUuidSync
  if (!item || item.type !== 'knowledge') {
    return ui.notifications.warn(game.i18n.format("HTBAH.MacroItemMissing", {item: itemUuid}));
  }
  return item.roll();
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