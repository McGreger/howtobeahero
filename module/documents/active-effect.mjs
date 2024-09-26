import HowToBeAHeroActiveEffectData from '../data/effect/active-effect.mjs';

export class HowToBeAHeroActiveEffect extends foundry.documents.BaseActiveEffect {

  /** @override */
  static async create(data, context={}) {
    // If this is a condition, ensure it has the correct properties
    if (data.flags?.htbah?.isCondition) {
      data.transfer = false;
      data.disabled = false;
    }
    return super.create(data, context);
  }

  /** @override */
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    if (this.isCondition && this.parent?.effects) {
      const existing = this.parent.effects.find(e => e.flags?.htbah?.conditionId === this.flags?.htbah?.conditionId);
      if (existing) {
        ui.notifications.warn(`${this.name} condition is already applied to ${this.parent.name}.`);
        return false;
      }
    }
  }

  get isCondition() {
    return this.flags?.htbah?.isCondition ?? false;
  }

  get conditionId() {
    return this.flags?.htbah?.conditionId;
  }
}