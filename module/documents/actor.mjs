import { d100Roll, d10Roll } from "../dice/dice.mjs";


export class HowToBeAHeroActor extends Actor {
  /**
 * Getter for skill set total values
 */
  get skillSetTotalValues() {
    const result = {};
    for (const [key, skillSet] of Object.entries(this.system.attributes.skillSets)) {
      result[key] = (skillSet.value || 0) + 
                    (skillSet.bonus || 0);
    }
    return result;
  }

  /**
   * Prepare base data before other preparations
   */
  prepareData() {
    super.prepareData();
    const systemData = this.system;
    const flags = this.flags.howtobeahero || {};

    this._prepareCharacterData();
    this._prepareNpcData();

    this._prepareSharedValues();
  }

  _prepareCharacterData() {
    if (this.type !== 'character') return;
    // Character-specific preparations...
  }

  _prepareNpcData() {
    if (this.type !== 'npc') return;
    // NPC-specific preparations...
  }

  /**
   * Calculate and update shared values for all skillSets
   * @private
   */
  _prepareSharedValues() {
    if (!this.system?.attributes?.skillSets) return;
    
    const totalValues = this.skillSetTotalValues;
    // Update the system data with the new values
    for (const [key, skillSet] of Object.entries(this.system.attributes.skillSets)) {
      this.system.attributes.skillSets[key].totalValue = totalValues[key];
    }
  }

  getRollData() {
    const data = super.getRollData();
    return this.type === 'character' ? this._getCharacterRollData(data) : this._getNpcRollData(data);
  }

  _getCharacterRollData(data) {
    return this.prepareGeneralRollData(data);
  }

  _getNpcRollData(data) {
    return this.prepareGeneralRollData(data);
  }

  prepareGeneralRollData(data) {
    if (data.attributes.skillSets) {
      for (let [k, v] of Object.entries(data.attributes.skillSets)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    return data;
  }

  async rollDamage(damageData, options={}) {
    const label = damageData.label || "";
    const data = this.getRollData();
    const critical = damageData.critical || false;
    const bonusValue = damageData.bonus || 0;
    const target = damageData.target || null;
    const flavor = game.i18n.localize("HTBAH.DamageRollPrompt");

    const rollData = {
      formula: "1d10",
      data: {
        actor: data,
        item: null
      },
      title: `${flavor}: ${label}`,
      flavor,
      critical,
      bonusValue,
      target,
      messageData: {
        speaker: options.speaker || ChatMessage.getSpeaker({actor: this}),
        "flags.howtobeahero.roll": {type: "damage", data: damageData}
      }
    };

    const roll = await d10Roll(rollData);
    Hooks.callAll("howToBeAHeroDamageRolled", this, damageData, roll);
    return roll;
  }

  async rollSkillSet(skillSetId, options={}) {
    const label = game.i18n.localize(CONFIG.HTBAH.skillSets[skillSetId]?.label) ?? "";
    const data = this.getRollData();
    const targetValue = this.skillSetTotalValues[skillSetId];
    const baseValue = this.system.attributes.skillSets[skillSetId]?.value ?? 0;
    const bonusValue = this.system.attributes.skillSets[skillSetId]?.bonus ?? 0;
    const flavor = game.i18n.localize("HTBAH.SkillSetCheckPromptTitle");

    const rollData = {
      formula: "1d100",
      data: {
        actor: data,
        item: null
      },
      title: `${flavor}: ${label}`,
      flavor,
      targetValue,
      baseValue,
      bonusValue,
      messageData: {
        speaker: options.speaker || ChatMessage.getSpeaker({actor: this}),
        flags: {
          howtobeahero: {
            roll: { type: skillSetId, skillSetId }
          }
        }
      }
    };

    const roll = await d100Roll(rollData);
    Hooks.callAll("howToBeAHeroSkillSetRolled", this, skillSetId, roll);
    return roll;
  }

  _onItemUpdate(item, change, options, userId) {
    const skillSetKey = item.type;
    if (!["knowledge", "action", "social"].includes(skillSetKey)) return;

    const currentValue = this.system.attributes.skillSets[skillSetKey].value || 0;
    const oldValue = options.htbah?.oldValue || 0;
    
    let newValue = change.system?.value !== undefined
      ? (change.system.value >= 80 ? change.system.value * 0.1 + 10 : change.system.value * 0.1)
      : oldValue;

    let newSkillSetValue = currentValue === 0 ? newValue : currentValue - oldValue + newValue;

    this.update({
      [`system.attributes.skillSets.${skillSetKey}.value`]: newSkillSetValue
    });
  }
}

// Add these hooks at the end of the file
Hooks.on("preUpdateItem", (item, change, options, userId) => {
  if (item.parent instanceof HowToBeAHeroActor) {
    // Store the old value on the options object
    options.htbah = options.htbah || {};
    options.htbah.oldValue = item.system.value >= 80 
      ? item.system.value * 0.1 + 10  // 18 for a value of 80
      : item.system.value * 0.1;
  }
});

Hooks.on("updateItem", (item, change, options, userId) => {
  if (item.parent instanceof HowToBeAHeroActor) {
    item.parent._onItemUpdate(item, change, options, userId);
  }
});

Hooks.on("createItem", (item, options, userId) => {
  if (item.parent instanceof HowToBeAHeroActor) {
    const change = { system: { value: item.system.value } };
    item.parent._onItemUpdate(item, change, { htbah: { oldValue: 0 } }, userId);
  }
});

Hooks.on("deleteItem", (item, options, userId) => {
  if (item.parent instanceof HowToBeAHeroActor) {
    const change = { system: { value: 0 } };
    const oldValue = item.system.value >= 80 
      ? item.system.value * 0.1 + 10  // 18 for a value of 80
      : item.system.value * 0.1;
    item.parent._onItemUpdate(item, change, { htbah: { oldValue } }, userId);
  }
});