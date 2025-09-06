import HowToBeAHeroPhysical from "./physical.mjs";

export default class HowToBeAHeroArmor extends HowToBeAHeroPhysical {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    
    schema.armorType = new fields.StringField({ blank: true, label: "HOW_TO_BE_A_HERO.Item.ArmorType"});
    schema.armor = new fields.NumberField({...requiredInteger, initial: 0, min: 0, label: "HOW_TO_BE_A_HERO.Item.Armor"});
    schema.material = new fields.StringField({ blank: true, label: "HOW_TO_BE_A_HERO.Item.Material"});
    schema.equipped = new fields.BooleanField({required: true, label: "HOW_TO_BE_A_HERO.Equipped"});

    return schema;
  }

  async richTooltip() {
    const baseTooltip = await super.richTooltip();
    const armorContent = await foundry.applications.handlebars.renderTemplate("systems/how-to-be-a-hero/templates/item/parts/armor-tooltip.hbs", {
      armor: this.armor,
      quantity: this.quantity
    });
    return {
      content: baseTooltip.content + armorContent,
      classes: [...baseTooltip.classes]
    };
  }

  async getFavoriteData() {
    return foundry.utils.mergeObject(await super.getFavoriteData(), {
      subtitle: this.armorType
    });
  }
}