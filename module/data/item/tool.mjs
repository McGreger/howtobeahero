import HowToBeAHeroPhysical from "./physical.mjs";

export default class HowToBeAHeroTool extends HowToBeAHeroPhysical {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    
    schema.type = new fields.StringField({label: "HTBAH.Type"});
    schema.uses = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      min: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 })
    });

    return schema;
  }

  async richTooltip() {
    const baseTooltip = await super.richTooltip();
    const itemContent = await renderTemplate("systems/how-to-be-a-hero/templates/item/parts/tool-tooltip.hbs", {
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