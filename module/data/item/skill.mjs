import HowToBeAHeroItemBase from "./item-base.mjs";

export default class HowToBeAHeroSkill extends HowToBeAHeroItemBase {
  /**
   * System data definition for skills.
   *
   * @property {object} description                           Description of the skill
   * @property {object} type                                  Type of the skill
   * @property {object} value                                 Type of the skill
   * @property {object} calculatedValue                       Type of the skill
   * @property {object} roll                                  
   * @property {object} roll.diceNum                          Type of the skill
   * @property {object} roll.diceSize                         Type of the skill
   * @property {object} roll.diceBonus                        Type of the skill
   * @property {object} formula                               Type of the skill
   */
  
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.type = new fields.StringField({label: "HTBAH.Type"});
    schema.value = new fields.NumberField({...requiredInteger, initial: 0, min: 0});
    schema.calculatedValue = new fields.NumberField({...requiredInteger, initial: 0, min: 0});
    schema.totalValue = new fields.NumberField({...requiredInteger, initial: 0, min: 0});
  
    // Break down roll formula into three independent fields
    schema.roll = new fields.SchemaField({
      diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      diceSize: new fields.StringField({ initial: "d100" }),
      diceBonus: new fields.NumberField({ initial: 0 }) // Example "+@str.mod+ceil(@lvl / 2)"
    })
    schema.formula = new fields.StringField({ blank: true, label: "HOW_TO_BE_A_HERO.Item.Formula"});
  
    return schema
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    // Calculate base value first
    const baseValue = this.value;
    
    // Calculate calculated value with proper validation
    let calculatedValue = baseValue;
    if (this.parent?.parent?.system?.baseattributes?.talents) {
      const talentValue = this.parent.parent.system.baseattributes.talents[this.parent.type]?.value ?? 0;
      calculatedValue = baseValue >= 80 ? baseValue : Math.min(80, talentValue + baseValue);
    }
    this.calculatedValue = calculatedValue;

    // Calculate total value with proper validation
    const bonus = this.roll?.diceBonus ?? 0;
    const inspiration = this.parent?.parent?.system?.baseattributes?.inspiration?.value ?? 0;
    this.system.totalValue = calculatedValue + bonus + inspiration;

    // Build roll formula with validation
    if (this.roll) {
      const roll = this.roll;
      const bonusStr = roll.diceBonus > 0 ? `+${roll.diceBonus}` : roll.diceBonus === 0 ? '' : roll.diceBonus;
      this.formula = `${roll.diceNum}${roll.diceSize}${bonusStr}`;
    }
  }
}