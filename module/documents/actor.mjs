import { d100Roll, d10Roll } from "../dice/dice.mjs";


export class HowToBeAHeroActor extends Actor {
  /**
   * Prepare base data before other preparations
   */
  prepareData() {
    super.prepareData();
    const systemData = this.system;
    const flags = this.flags.howtobeahero || {};

    this._prepareCharacterData();
    this._prepareNpcData();

  }

  _prepareCharacterData() {
    if (this.type !== 'character') return;
    // Character-specific preparations...
  }

  _prepareNpcData() {
    if (this.type !== 'npc') return;
    // NPC-specific preparations...
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
    Hooks.callAll("HowToBeAHeroAbilitySetRolled", this, skillSetId, roll);
    return roll;
  }

  _onItemUpdate(item, change, options, userId) {
    
  }
}