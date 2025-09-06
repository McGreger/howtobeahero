import HowToBeAHeroItemBase from "./item-base.mjs";

export default class HowToBeAHeroPhysical extends HowToBeAHeroItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    
    schema.quantity = new fields.NumberField({ 
      required: true, 
      nullable: false, 
      integer: true, 
      initial: 1, 
      min: 0 
    });

    // Add rollType to base schema so all items have access to it
    schema.rollType = new fields.StringField({
      required: true,
      initial: "check", // Default to check for most items
      choices: ["check", "damage"],
      label: "HOW_TO_BE_A_HERO.RollType"
    });

    schema.formula = new fields.StringField({ 
      required: false, 
      blank: true, 
      label: "HOW_TO_BE_A_HERO.Item.Formula" 
    });

    // Add rollable flag
    schema.rollable = new fields.BooleanField({
      required: true,
      initial: false,
      label: "HOW_TO_BE_A_HERO.Item.Rollable"
    });

    // Add roll object with dice configuration
    schema.roll = new fields.SchemaField({
      diceNum: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 1,
        min: 1,
        label: "HOW_TO_BE_A_HERO.Item.DiceNumber"
      }),
      diceSize: new fields.StringField({
        required: true,
        initial: "d10",
        choices: ["d4", "d6", "d8", "d10", "d12", "d20", "d100"],
        label: "HOW_TO_BE_A_HERO.Item.DiceSize"
      }),
      diceBonus: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0,
        label: "HOW_TO_BE_A_HERO.Item.DiceBonus"
      })
    });

    return schema;
  }
}