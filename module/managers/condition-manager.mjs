import { conditionTypes } from '../helpers/config.mjs';

export class conditionManager {
  constructor() {
    this.conditions = new Map();
  }

  registerAllConditions() {
    for (const [id, condition] of Object.entries(conditionTypes)) {
      if (!condition.pseudo) {
        this.registerCondition(id, {
          id: id,
          name: game.i18n.localize(condition.label),
          icon: condition.icon,
          reference: condition.reference
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
  /**
   * Create a status effect from a condition
   * @param {string} conditionId The condition identifier
   * @param {object} conditionData The condition data
   * @returns {Promise<object>} The effect data
   */
  async createStatusEffect(conditionId, conditionData) {
    const effectData = {
      name: conditionData.name,
      icon: conditionData.icon,
      flags: { 
        htbah: { 
          isCondition: true,
          conditionId 
        }
      },
      statuses: [conditionId]
    };

    // Add description from reference if available
    if (conditionData.reference) {
      const page = await fromUuid(conditionData.reference);
      effectData.description = page?.text?.content ?? "";
    }

    return effectData;
  }

  
  async addCondition(actor, conditionId) {
    try {
      // 1. First check if we already have this condition
      if (this.isConditionActive(actor, conditionId)) {
        console.log(`Condition ${conditionId} is already active on actor ${actor.id}`);
        return actor.effects.find(e => 
          (e.flags?.htbah?.isCondition && e.flags.htbah.conditionId === conditionId) ||
          (e.statuses instanceof Set && e.statuses.has(conditionId))
        );
      }

      // 2. Get condition data
      const conditionData = this.getConditionData(conditionId);
      if (!conditionData) {
        console.error(`No condition data found for ${conditionId}`);
        return null;
      }

      // 3. Create effect data
      const effectData = {
        name: conditionData.name,
        icon: conditionData.icon,
        flags: { 
          htbah: { 
            isCondition: true,
            conditionId 
          }
        },
        statuses: [conditionId]
      };

      // 4. Add description if available
      if (conditionData.reference) {
        const page = await fromUuid(conditionData.reference);
        effectData.description = page?.text?.content ?? "";
      }

      // 5. Final check before creation
      const finalCheck = this.isConditionActive(actor, conditionId);
      if (finalCheck) {
        console.log(`Condition ${conditionId} was added during the process`);
        return actor.effects.find(e => 
          (e.flags?.htbah?.isCondition && e.flags.htbah.conditionId === conditionId) ||
          (e.statuses instanceof Set && e.statuses.has(conditionId))
        );
      }

      // 6. Create the effect
      const [createdEffect] = await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
      console.log(`Successfully added condition ${conditionId} to actor ${actor.id}`);
      
      // 7. Render sheet if needed
      if (actor.sheet?.rendered) actor.sheet.render(false);
      
      return createdEffect;

    } catch (error) {
      console.error(`Error adding condition ${conditionId} to actor ${actor.id}:`, error);
      return null;
    }
  }

  isConditionActive(actor, conditionId) {
    return actor.effects.some(e => 
      (e.flags?.htbah?.isCondition && e.flags.htbah.conditionId === conditionId) ||
      (e.statuses instanceof Set && e.statuses.has(conditionId))
    );
  }

  async removeCondition(actor, conditionId) {
    try {
      // Find ALL matching effects
      const effectsToRemove = actor.effects.filter(e => 
        (e.flags?.htbah?.isCondition && e.flags.htbah.conditionId === conditionId) ||
        (e.statuses instanceof Set && e.statuses.has(conditionId))
      );
      
      if (!effectsToRemove.length) {
        console.log(`No effects found for condition ${conditionId} on actor ${actor.id}`);
        return null;
      }

      // Remove all instances
      await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToRemove.map(e => e.id));
      console.log(`Successfully removed ${effectsToRemove.length} instance(s) of condition ${conditionId}`);
      
      if (actor.sheet?.rendered) actor.sheet.render(false);
      
      return effectsToRemove[0];

    } catch (error) {
      console.error(`Error removing condition ${conditionId}:`, error);
      return null;
    }
  }

  async toggleCondition(actor, conditionId) {
    try {
      const isActive = this.isConditionActive(actor, conditionId);
      console.log(`Toggling condition ${conditionId} (currently ${isActive ? 'active' : 'inactive'})`);
      
      if (isActive) {
        await this.removeCondition(actor, conditionId);
      } else {
        await this.addCondition(actor, conditionId);
      }
    } catch (error) {
      console.error(`Error toggling condition ${conditionId}:`, error);
    }
  }
}