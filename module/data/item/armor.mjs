import HowToBeAHeroItemBase from "./item-base.mjs";

export default class HowToBeAHeroArmor extends HowToBeAHeroItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({...requiredInteger, initial: 1, min: 1, label: "HOW_TO_BE_A_HERO.Item.Quantity"});
     
    schema.type = new fields.StringField({label: "HTBAH.Type"});

    schema.armor = new fields.NumberField({...requiredInteger, initial: 0, min: 0, label: "HOW_TO_BE_A_HERO.Item.Armor"});

    schema.armorType = new fields.StringField({ blank: true, label: "HOW_TO_BE_A_HERO.Item.ArmorType"});
    
    schema.material = new fields.StringField({ blank: true, label: "HOW_TO_BE_A_HERO.Item.Material"});
    
    schema.equipped = new fields.BooleanField({required: true, label: "HOW_TO_BE_A_HERO.Equipped"});

    return schema;
  }

  async richTooltip() {
    const baseTooltip = await super.richTooltip();
    const armorContent = await renderTemplate("systems/how-to-be-a-hero/templates/item/parts/armor-tooltip.hbs", {
      armor: this.armor,
      quantity: this.quantity
    });

    return {
      content: baseTooltip.content + armorContent,
      classes: [...baseTooltip.classes]
    };
  }
  
  /* -------------------------------------------- */

  /** @inheritDoc */
  async getFavoriteData() {
    return foundry.utils.mergeObject(await super.getFavoriteData(), {
      subtitle: this.armorType
    });
  }
  
}