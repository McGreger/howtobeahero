import { d100Roll } from "../dice/dice.mjs";

/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class HowToBeAHeroActor extends Actor {
  prepareData() {
    super.prepareData();
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.howtobeahero || {};

    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;
    // Character-specific preparations...
  }

  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;
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
    if (data.baseattributes.talents) {
      for (let [k, v] of Object.entries(data.baseattributes.talents)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    return data;
  }

  async rollTalent(talentId, options={}) {
    const label = CONFIG.HTBAH.talents[talentId]?.label ?? "";
    const data = this.getRollData();
    const targetValue = this.system.baseattributes.talents[talentId]?.value ?? 0;
    const inspired = this.system.baseattributes.inspiration.status;
    const flavor = game.i18n.format("HTBAH.TalentCheckPromptTitle", {talent: label});

    const rollData = {
      formula: "1d100",
      data: {
        actor: data,
        item: null
      },
      title: `${flavor}: ${this.name}`,
      flavor,
      targetValue,
      inspired,
      messageData: {
        speaker: options.speaker || ChatMessage.getSpeaker({actor: this}),
        "flags.howtobeahero.roll": {type: "talent", talentId }
      }
    };

    const roll = await d100Roll(rollData);
    Hooks.callAll("howToBeAHeroTalentRolled", this, talentId, roll);
    return roll;
  }

  _onItemUpdate(item, change, options, userId) {
    const talentKey = item.type;
    if (!["knowledge", "action", "social"].includes(talentKey)) return;

    const currentValue = this.system.baseattributes.talents[talentKey].value || 0;
    const oldValue = options.htbah?.oldValue || 0;
    
    let newValue = change.system?.value !== undefined
      ? (change.system.value >= 80 ? change.system.value * 0.1 + 10 : change.system.value * 0.1)
      : oldValue;

    let newTalentValue = currentValue === 0 ? newValue : currentValue - oldValue + newValue;

    this.update({
      [`system.baseattributes.talents.${talentKey}.value`]: newTalentValue
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
/*

// Add hooks to handle item changes
Hooks.on("createItem", (item, options, userId) => {
  if (item.parent instanceof HowToBeAHeroActor) {
    item.parent.updateAttributesFromItem(item, "add");
  }
});

Hooks.on("updateItem", (item, changes, options, userId) => {
  if (item.parent instanceof HowToBeAHeroActor && changes.system?.value !== undefined) {
    item.parent.updateAttributesFromItem(item, "update");
  }
});

*/