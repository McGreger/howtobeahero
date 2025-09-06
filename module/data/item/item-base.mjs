import { AbstractHowToBeAHeroItemDataModel } from '../abstract.mjs';

export default class HowToBeAHeroItemBase extends AbstractHowToBeAHeroItemDataModel {
/**
 * System data definition for items.
 *
 * @property {object} description                           Description of the item
 * @property {object} quantity                              Amount of Items in inventory
 */

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true , label: "HOW_TO_BE_A_HERO.Item.Description"});

    
    return schema;
  }

  /**
   * Provide a rich tooltip for this item
   * @returns {Promise<{content: string, classes: string[]}>}
   */
  async richTooltip() {
    const templatePath = `systems/how-to-be-a-hero/templates/item/parts/item-tooltip.hbs`;
    
    const tooltipData = {
      name: this.parent.name,
      img: this.parent.img,
      description: this.description
    };

    const content = await foundry.applications.handlebars.renderTemplate(templatePath, tooltipData);
    
    return {
      content,
      classes: ['htbah-tooltip', 'htbah-item-tooltip', `item-tooltip`]
    };
  }

  async getFavoriteData() {
    return {
      title: this.parent.name,
      img: this.parent.img,
      subtitle: "", // Override in subclasses if needed
      // Add other common properties here
    };
  }
}