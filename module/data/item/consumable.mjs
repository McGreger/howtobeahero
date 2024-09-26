import HowToBeAHeroItemBase from "./item-base.mjs";

export default class HowToBeAHeroConsumable extends HowToBeAHeroItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({...requiredInteger, initial: 1, min: 1, label: "HOW_TO_BE_A_HERO.Item.Quantity"});
    
    schema.formula = new fields.StringField({ blank: true, label: "HOW_TO_BE_A_HERO.Item.Formula"});

    schema.type = new fields.StringField({label: "HTBAH.Type"});

    schema.duration = new fields.StringField({label: "HTBAH.Duration"});
    
    // Break down roll formula into three independent fields
    schema.roll = new fields.SchemaField({
      diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      diceSize: new fields.StringField({ initial: "d100" }),
      diceBonus: new fields.StringField({ initial: "+0" }) // Example "+@str.mod+ceil(@lvl / 2)"
    });

    return schema;
  }

  async richTooltip() {
    const baseTooltip = await super.richTooltip();
    const itemContent = await renderTemplate("systems/how-to-be-a-hero/templates/item/parts/consumable-tooltip.hbs", {
      type: this.type,
      formula: this.formula,
      quantity: this.quantity
    });

    return {
      content: baseTooltip.content + itemContent,
      classes: [...baseTooltip.classes]
    };
  }
  
  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    //const roll = this.roll;

    //this.formula = `${roll.diceNum}${roll.diceSize}${roll.diceBonus}`
  }
  
  /* -------------------------------------------- */

  /** @inheritDoc */
  async getFavoriteData() {
    return foundry.utils.mergeObject(await super.getFavoriteData(), {
      subtitle: this.type
    });
  }
}