import HowToBeAHeroSkill from "./skill.mjs";

export default class HowToBeAHeroKnowledge extends HowToBeAHeroSkill {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    
    return schema
  }

  /*
  prepareDerivedData() {
  }
  */
}