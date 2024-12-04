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
    schema.formula = new fields.StringField({ 
      required: true, 
      blank: true, 
      label: "HOW_TO_BE_A_HERO.Item.Formula" 
    });

    return schema;
  }
}