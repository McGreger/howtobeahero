import { AbstractHowToBeAHeroActorDataModel } from '../abstract.mjs';

export default class HowToBeAHeroActorBase extends AbstractHowToBeAHeroActorDataModel {
/**
 * System data definition for actors.
 *
 * @property {object} attributes
 * @property {object} attributes.armor
 * @property {number} attributes.armor.value                  Current hit points.
 * @property {object} attributes.health
 * @property {number} attributes.health.value                 Current hit points.
 * @property {number} attributes.health.max                   Override for maximum HP.
 * @property {number} attributes.health.temp                  Temporary HP applied on top of value.
 * @property {number} attributes.health.tempmax               Temporary change to the maximum HP.
 * @property {number} attributes.inspiration                  Does this character have inspiration?
 * @property {object} attributes.talents                      
 * @property {number} attributes.talents.knowledge            Contains actors total knowledge value
 * @property {number} attributes.talents.action              Contains actors total action value
 * @property {number} attributes.talents.social               Contains actors total social value
 * @property {object} details
 * @property {string} details.background                      Character's background.
 * @property {string} details.alignment                       Character's alignment.
 * @property {string} details.appearance                      Description of character's appearance.
 * @property {number} details.wealth                          Character's wealth.
 * @property {number} details.age                             Character's age.
 */

static defineSchema() {
  const fields = foundry.data.fields;
  const requiredInteger = { required: true, nullable: false, integer: true };
  const schema = {};

  // Attributes
  schema.attributes = new fields.SchemaField({
    armor: new fields.SchemaField({
      value: new fields.NumberField({...requiredInteger, initial: 0, min: 0, label: "HOW_TO_BE_A_HERO.Attributes.Armor"}),
    }),
    health: new fields.SchemaField({
      value: new fields.NumberField({...requiredInteger, initial: 100, min: 0, label: "HOW_TO_BE_A_HERO.Attributes.HitPointsCurrent"}),
      max: new fields.NumberField({...requiredInteger, initial: 100, label: "HOW_TO_BE_A_HERO.Attributes.HitPointsMaximum"}),
      temp: new fields.NumberField({...requiredInteger, initial: 0, min: 0, label: "HOW_TO_BE_A_HERO.Attributes.HitPointsTemp"}),
      tempmax: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Attributes.HitPointsTempMax"})
    }),
    inspiration: new fields.SchemaField({
      status: new fields.BooleanField({required: true, label: "HOW_TO_BE_A_HERO.Attributes.InspirationStatus"}),
      value: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Attributes.Inspiration"})
    }),
    talents: new fields.SchemaField({
      knowledge: new fields.SchemaField({
        value: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Talents.Knowledge.long"}),
        bonus: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Talents.Knowledge.bonus"}),
        totalValue: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Talents.Knowledge.total"}),
      }),
      action: new fields.SchemaField({
        value: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Talents.Action.long"}),
        bonus: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Talents.Action.bonus"}),
        totalValue: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Talents.Action.total"}),
      }),
      social: new fields.SchemaField({
        value: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Talents.Social.long"}),
        bonus: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Talents.Social.bonus"}),
        totalValue: new fields.NumberField({...requiredInteger, initial: 0, label: "HOW_TO_BE_A_HERO.Talents.Social.total"}),
      })
    })
  });

  // Details
  schema.details = new fields.SchemaField({
    background: new fields.StringField({required: true, blank: true, label: "HOW_TO_BE_A_HERO.Details.Background"}),
    alignment: new fields.StringField({label: "HOW_TO_BE_A_HERO.Details.Alignment"}),
    appearance: new fields.StringField({required: true, blank: true, label: "HOW_TO_BE_A_HERO.Details.Appearance"}),
    wealth: new fields.NumberField({label: "HOW_TO_BE_A_HERO.Details.Wealth"}),
    age: new fields.NumberField({label: "HOW_TO_BE_A_HERO.Details.Age"})
  });

  return schema;
}
  // Override the richTooltip method if you need specific behavior for HowToBeAHeroActorBase
  async richTooltip() {
    const content = await renderTemplate("systems/how-to-be-a-hero/templates/actor/parts/actor-tooltip.hbs", {
      name: this.parent.name,
      health: this.attributes.health,
      armor: this.attributes.armor,
      talents: this.attributes.talents
    });

    return {
      content,
      classes: ['htbah-tooltip', 'htbah-actor-tooltip']
    };
  }
}