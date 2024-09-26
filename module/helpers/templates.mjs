/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */
/**
 * Define a set of template paths to pre-load. Pre-loaded templates are compiled and cached for fast access when
 * rendering. These paths will also be available as Handlebars partials by using the file name
 * (e.g. "dnd5e.actor-traits").
 * @returns {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  const partials = [
    // Actor Sheet Partials
    "systems/how-to-be-a-hero/templates/actor/tabs/character-details.hbs",
    "systems/how-to-be-a-hero/templates/actor/tabs/character-inventory.hbs",
    "systems/how-to-be-a-hero/templates/actor/tabs/character-biography.hbs",
    "systems/how-to-be-a-hero/templates/actor/tabs/character-effects.hbs",
    "systems/how-to-be-a-hero/templates/actor/parts/actor-items.hbs",

    // Item partials
    "systems/how-to-be-a-hero/templates/item/parts/item-effects.hbs",
    "systems/how-to-be-a-hero/templates/item/parts/item-description.hbs",
    "systems/how-to-be-a-hero/templates/item/parts/item-tooltip.hbs",

    /*
    ################### DND5 #############################################################
    // Shared Partials
    "systems/dnd5e/templates/shared/active-effects.hbs",
    "systems/dnd5e/templates/shared/inventory.hbs",
    "systems/dnd5e/templates/shared/inventory2.hbs",
    "systems/dnd5e/templates/shared/active-effects2.hbs",
    "systems/dnd5e/templates/apps/parts/trait-list.hbs",
    // Actor Sheet Partials
    "systems/dnd5e/templates/actors/parts/actor-traits.hbs",
    "systems/dnd5e/templates/actors/parts/actor-inventory.hbs",
    "systems/dnd5e/templates/actors/parts/actor-features.hbs",
    "systems/dnd5e/templates/actors/parts/actor-spellbook.hbs",
    "systems/dnd5e/templates/actors/parts/actor-warnings.hbs",
    "systems/dnd5e/templates/actors/tabs/character-details.hbs",
    "systems/dnd5e/templates/actors/tabs/character-features.hbs",
    "systems/dnd5e/templates/actors/tabs/character-spells.hbs",
    "systems/dnd5e/templates/actors/tabs/character-biography.hbs",
    "systems/dnd5e/templates/actors/tabs/group-members.hbs",

    // Item Sheet Partials
    "systems/dnd5e/templates/items/parts/item-action.hbs",
    "systems/dnd5e/templates/items/parts/item-activation.hbs",
    "systems/dnd5e/templates/items/parts/item-advancement.hbs",
    "systems/dnd5e/templates/items/parts/item-description.hbs",
    "systems/dnd5e/templates/items/parts/item-mountable.hbs",
    "systems/dnd5e/templates/items/parts/item-spellcasting.hbs",
    "systems/dnd5e/templates/items/parts/item-source.hbs",
    "systems/dnd5e/templates/items/parts/item-summary.hbs",
    "systems/dnd5e/templates/items/parts/item-tooltip.hbs",

    // Journal Partials
    "systems/dnd5e/templates/journal/parts/journal-table.hbs",

    // Advancement Partials
    "systems/dnd5e/templates/advancement/parts/advancement-ability-score-control.hbs",
    "systems/dnd5e/templates/advancement/parts/advancement-controls.hbs",
    "systems/dnd5e/templates/advancement/parts/advancement-spell-config.hbs"
    ################### DND5 #############################################################
    */
  ];

  const paths = {};
  for ( const path of partials ) {
    paths[path.replace(".hbs", ".html")] = path;
    paths[`htbah.${path.split("/").pop().replace(".hbs", "")}`] = path;
  }
  
  return loadTemplates(paths);
}
/*
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/how-to-be-a-hero/templates/actor/parts/actor-features.hbs',
    'systems/how-to-be-a-hero/templates/actor/parts/actor-items.hbs',
    'systems/how-to-be-a-hero/templates/actor/parts/actor-effects.hbs',
    // Item partials
    'systems/how-to-be-a-hero/templates/item/parts/item-effects.hbs',
  ]);
};
*/