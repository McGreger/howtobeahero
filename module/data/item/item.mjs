import HowToBeAHeroPhysical from "./physical.mjs";

export default class HowToBeAHeroItem extends HowToBeAHeroPhysical {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    
    schema.type = new fields.StringField({label: "HTBAH.Type"});

    return schema;
  }

  async richTooltip() {
    const baseTooltip = await super.richTooltip();
    const itemContent = await foundry.applications.handlebars.renderTemplate("systems/how-to-be-a-hero/templates/item/parts/item-tooltip.hbs", {
      type: this.type,
      formula: this.formula,
      quantity: this.quantity
    });
    return {
      content: baseTooltip.content + itemContent,
      classes: [...baseTooltip.classes]
    };
  }

  async getFavoriteData() {
    return foundry.utils.mergeObject(await super.getFavoriteData(), {
      subtitle: this.type
    });
  }
}