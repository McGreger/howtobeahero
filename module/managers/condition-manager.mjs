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
          reference: condition.reference,
          statuses: condition.statuses || [id]
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
      statuses: conditionData.statuses || [conditionId]
    };

    if (conditionData.reference) {
      const page = await fromUuid(conditionData.reference);
      effectData.description = page?.text?.content ?? "";
    }

    return effectData;
  }


  isConditionActive(actor, condition) {
    return actor.effects.some(e => 
      (e.flags?.htbah?.isCondition && e.flags.htbah.conditionId === condition.id) ||
      (e.statuses instanceof Set && e.statuses.has(condition.statuses[0]))
    );
  }
  
  async addCondition(actor, condition) {
    try {
      // Add a console.log to track when this is called
      console.log(`Adding condition ${condition.id} to actor ${actor.id}`);
      
      // 1. First do a thorough check for existing condition
      const existingEffect = actor.effects.find(e => 
        (e.flags?.htbah?.isCondition && e.flags.htbah.conditionId === condition.id) ||
        (e.statuses?.has?.(condition.statuses[0]))
      );
      
      if (existingEffect) {
        console.log(`Condition ${condition.id} already exists on actor ${actor.id}`);
        return existingEffect;
      }
  
      // 2. Get condition data
      const conditionData = this.getConditionData(condition.id);
      if (!conditionData) {
        console.error(`No condition data found for ${condition.id}`);
        return null;
      }
  
      // 3. Create effect data
      const effectData = await this.createStatusEffect(condition.id, conditionData);
      
      // 4. One final check before creation
      const doubleCheck = actor.effects.find(e => 
        (e.flags?.htbah?.isCondition && e.flags.htbah.conditionId === condition.id) ||
        (e.statuses?.has?.(condition.statuses[0]))
      );
      
      if (doubleCheck) {
        console.log(`Condition ${condition.id} was added during the process`);
        return doubleCheck;
      }
  
      // 5. Create the effect with debounce wrapper
      const [createdEffect] = await actor.createEmbeddedDocuments("ActiveEffect", [effectData], {
        renderSheet: false
      });
  
      return createdEffect;
  
    } catch (error) {
      console.error(`Error adding condition ${condition.id}:`, error);
      return null;
    }
  }

  async removeCondition(actor, condition) {
    try {
      // Find ALL matching effects
      const effectsToRemove = actor.effects.filter(e => 
        (e.flags?.htbah?.isCondition && e.flags.htbah.conditionId === condition.id) ||
        (e.statuses instanceof Set && e.statuses.has(condition.statuses[0]))
      );
      
      if (!effectsToRemove.length) {
        console.log(`No effects found for condition ${condition.id} on actor ${actor.id}`);
        return null;
      }

      // Remove all instances
      await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToRemove.map(e => e.id));
      console.log(`Successfully removed ${effectsToRemove.length} instance(s) of condition ${condition.id}`);
      
      if (actor.sheet?.rendered) actor.sheet.render(false);
      
      return effectsToRemove[0];

    } catch (error) {
      console.error(`Error removing condition ${condition.id}:`, error);
      return null;
    }
  }

  async toggleCondition(actor, condition) {
    try {
      // If condition is a string, get the condition data
      if (typeof condition === 'string') {
        const conditionData = this.getConditionData(condition);
        if (!conditionData) {
          console.error(`No condition data found for condition ID: ${condition}`);
          return;
        }
        condition = conditionData;
      }
  
      // Get all existing effects for this condition
      const existingEffects = actor.effects.filter(e => 
        (e.flags?.htbah?.isCondition && e.flags.htbah.conditionId === condition.id) ||
        (e.statuses?.has?.(condition.statuses[0]))
      );
      
      if (existingEffects.length > 1) {
        // Clean up duplicates
        console.warn(`Found ${existingEffects.length} instances of ${condition.id}. Cleaning up...`);
        const [keep, ...remove] = existingEffects;
        await actor.deleteEmbeddedDocuments("ActiveEffect", remove.map(e => e.id));
        return this.toggleCondition(actor, condition.id);
      }
      
      const isActive = this.isConditionActive(actor, condition);
      
      if (isActive) {
        await this.removeCondition(actor, condition);
      } else {
        await this.addCondition(actor, condition);
      }
    } catch (error) {
      console.error(`Error toggling condition ${condition?.id || condition}:`, error);
    }
  }
}