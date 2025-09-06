import HowToBeAHeroPhysical from "./physical.mjs";

export default class HowToBeAHeroWeapon extends HowToBeAHeroPhysical {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    
    schema.weaponType = new fields.StringField({ blank: true, label: "HOW_TO_BE_A_HERO.Item.WeaponType"});
    schema.equipped = new fields.BooleanField({required: true, label: "HOW_TO_BE_A_HERO.Equipped"});
    
    schema.roll = new fields.SchemaField({
      diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      diceSize: new fields.StringField({ initial: "d10" }),
      diceBonus: new fields.NumberField({ initial: 0 })
    });

    // Override rollType default for weapons
    schema.rollType = new fields.StringField({
      required: true,
      initial: "damage", // Weapons default to damage
      choices: ["check", "damage"],
      label: "HOW_TO_BE_A_HERO.RollType"
    });

    // Add formula field with default value
    schema.formula = new fields.StringField({ 
      required: true, 
      initial: "1d10",
      label: "HOW_TO_BE_A_HERO.Item.Formula" 
    });

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    
    // Update formula based on roll data
    this._updateFormula();
  }

  _updateFormula() {
    const roll = this.roll;
    if (!roll) return;

    const bonusStr = roll.diceBonus > 0 ? `+${roll.diceBonus}` : 
                    roll.diceBonus < 0 ? roll.diceBonus.toString() : '';
                    
    this.formula = `${roll.diceNum}${roll.diceSize}${bonusStr}`;
  }

  async richTooltip() {
    const baseTooltip = await super.richTooltip();
    const weaponContent = await foundry.applications.handlebars.renderTemplate("systems/how-to-be-a-hero/templates/item/parts/weapon-tooltip.hbs", {
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