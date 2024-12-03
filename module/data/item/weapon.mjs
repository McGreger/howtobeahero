import HowToBeAHeroPhysical from "./physical.mjs";

export default class HowToBeAHeroWeapon extends HowToBeAHeroPhysical {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    
    schema.weaponType = new fields.StringField({ blank: true, label: "HOW_TO_BE_A_HERO.Item.WeaponType"});
    schema.range = new fields.StringField({ blank: true, label: "HOW_TO_BE_A_HERO.Item.Range"});
    schema.equipped = new fields.BooleanField({required: true, label: "HOW_TO_BE_A_HERO.Equipped"});
    
    schema.roll = new fields.SchemaField({
      diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      diceSize: new fields.StringField({ initial: "d10" }),
      diceBonus: new fields.NumberField({ initial: 0 })
    });

    return schema;
  }

  async richTooltip() {
    const baseTooltip = await super.richTooltip();
    const weaponContent = await renderTemplate("systems/how-to-be-a-hero/templates/item/parts/weapon-tooltip.hbs", {
      formula: this.formula,
      quantity: this.quantity
    });
    return {
      content: baseTooltip.content + weaponContent,
      classes: [...baseTooltip.classes]
    };
  }

  async getFavoriteData() {
    return foundry.utils.mergeObject(await super.getFavoriteData(), {
      subtitle: this.weaponType
    });
  }
}