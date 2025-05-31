import HowToBeAHeroItemBase from "./item-base.mjs";

export default class HowToBeAHeroAbility extends HowToBeAHeroItemBase {
  /**
   * System data definition for abilities.
   *
   * @property {object} description                           Description of the ability
   * @property {object} type                                  Type of the ability
   * @property {object} value                                 Type of the ability
   * @property {object} calculatedValue                       Type of the ability
   * @property {object} roll                                  
   * @property {object} roll.diceNum                          Type of the ability
   * @property {object} roll.diceSize                         Type of the ability
   * @property {object} roll.diceBonus                        Type of the ability
   * @property {object} formula                               Type of the ability
   */
  
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.type = new fields.StringField({label: "HTBAH.Type"});
    schema.skillSet = new fields.StringField({ initial: 'action' });
    schema.value = new fields.NumberField({...requiredInteger, initial: 0, min: 0});
  
    // Break down roll formula into three independent fields
    schema.roll = new fields.SchemaField({
      diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      diceSize: new fields.StringField({ initial: "d100" }),
      diceBonus: new fields.NumberField({ initial: 0 })
    })

    schema.rollType = new fields.StringField({
      required: true,
      initial: "check",
      label: "HOW_TO_BE_A_HERO.RollType"
    });
    
    schema.formula = new fields.StringField({ initial: "d100", label: "HOW_TO_BE_A_HERO.Item.Formula"});
  
    return schema
  }
}