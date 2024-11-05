import { AbstractHowToBeAHeroDataModel } from '../abstract.mjs';

export default class HowToBeAHeroActiveEffectData extends AbstractHowToBeAHeroDataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    // Duration
    schema.duration = new fields.SchemaField({
      startTime: new fields.NumberField({initial: 0, integer: true, min: 0}),
      seconds: new fields.NumberField({initial: 0, integer: true, min: 0}),
      rounds: new fields.NumberField({initial: 0, integer: true, min: 0}),
      turns: new fields.NumberField({initial: 0, integer: true, min: 0}),
      startRound: new fields.NumberField({initial: 0, integer: true, min: 0}),
      startTurn: new fields.NumberField({initial: 0, integer: true, min: 0})
    });

    // Other fields
    schema.disabled = new fields.BooleanField({initial: false});
    schema.icon = new fields.StringField({required: true, blank: false});
    schema.label = new fields.StringField({required: true, blank: false});
    schema.transfer = new fields.BooleanField({initial: false});
    
    // Changes
    schema.changes = new fields.ArrayField(new fields.SchemaField({
      key: new fields.StringField(),
      value: new fields.StringField(),
      mode: new fields.NumberField({integer: true, initial: 2})
    }));

    // Remaining fields
    schema.flags = new fields.ObjectField();
    schema.origin = new fields.StringField();
    schema.tint = new fields.ColorField();
    schema._id = new fields.StringField();

    return schema;
  }

  /** @override */
  async richTooltip() {
    const content = await renderTemplate("systems/how-to-be-a-hero/templates/effects/effect-tooltip.hbs", {
      name: this.label,
      isCondition: this.isCondition,
      duration: this.duration,
      disabled: this.disabled
    });

    return {
      content,
      classes: ['htbah-tooltip', 'htbah-effect-tooltip']
    };
  }

  get isCondition() {
    return this.flags?.htbah?.isCondition ?? false;
  }

  get conditionId() {
    return this.flags?.htbah?.conditionId;
  }
}