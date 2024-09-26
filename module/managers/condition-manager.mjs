import { conditionTypes } from '../helpers/config.mjs';

export class conditionManager {
  constructor() {
    this.conditions = new Map();
  }

  registerAllConditions() {
      for (const [id, condition] of Object.entries(conditionTypes)) {
          if (!condition.pseudo) {
          this.registerCondition(id, {
              id: id,  // Add this line
              name: condition.label,
              icon: condition.icon,
              // Add any other properties you need
          });
          }
      }
  }

  registerCondition(id, data) {
    this.conditions.set(id, data);
  }

  getConditionData(id) {
    return this.conditions.get(id);
  }

  getAllConditions() {
    return Array.from(this.conditions.values());
  }

  isConditionActive(actor, conditionId) {
    return actor.effects.some(e => e.flags?.htbah?.conditionId === conditionId);
  }

  async toggleCondition(actor, conditionId) {
    const existing = actor.effects.find(e => e.flags?.htbah?.conditionId === conditionId);
    if (existing) {
      return existing.delete();
    } else {
      const conditionData = this.getConditionData(conditionId);
      if (conditionData) {
        return actor.createEmbeddedDocuments('ActiveEffect', [{
          name: conditionData.name,
          icon: conditionData.icon,
          flags: { htbah: { isCondition: true, conditionId } }
        }]);
      }
    }
  }
}