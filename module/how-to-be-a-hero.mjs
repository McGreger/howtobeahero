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
    //rollItemMacro,
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
  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
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
  //CONFIG.ActiveEffect.documentClass = HowToBeAHeroActiveEffect;
  //CONFIG.ActiveEffect.dataModels = { 
  //  activeeffect: models.HowToBeAHeroActiveEffectData
  //};
  console.log("Actor data models:", CONFIG.Actor.dataModels);
  console.log("Item data models:", CONFIG.Item.dataModels);
  //console.log("ActiveEffect data models:", CONFIG.ActiveEffect.dataModels);
  //Dice class and functions added to CONFIG
  //CONFIG.Dice.DamageRoll = DamageRoll;
  CONFIG.Dice.D100Roll = D100Roll;
  
  // Register Roll Extensions
  CONFIG.Dice.rolls.push(D100Roll);

  // Initialize tooltips
  game.howtobeahero.tooltips = new Tooltips();
  game.howtobeahero.tooltips.observe();

  // Activate tooltip listeners
  Tooltips.activateListeners();
  
  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  //CONFIG.ActiveEffect.legacyTransferral = false;

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

// If you need to add Handlebars helpers, here is a useful example:

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
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
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
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.howtobeahero.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'how-to-be-a-hero.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

