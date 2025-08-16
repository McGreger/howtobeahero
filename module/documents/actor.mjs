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
    this._prepareSkillSets();
    this._prepareArmorClass();
  }

  /**
   * Prepare skill set calculations for easy access
   * @private
   */
  _prepareSkillSets() {
    // Initialize skillSetTotalValues and skillSetMods if they don't exist
    this.skillSetTotalValues = {};
    this.skillSetMods = {};
    this.skillSetData = {};

    // Get all abilities from the actor
    const abilities = this.items.filter(item => item.type === 'ability');

    // Process each skill set defined in config
    for (const [key, def] of Object.entries(CONFIG.HTBAH.skillSets)) {
      // Filter abilities that belong to this skill set
      const skillSetAbilities = abilities.filter(ab =>
        String(ab.system?.skillSet ?? "").trim().toLowerCase() === key.toLowerCase()
      );

      // Calculate total value from all abilities in this skill set
      const totalValue = skillSetAbilities.reduce((sum, ab) => sum + (ab.system.value ?? 0), 0);
      
      // Calculate modifier (total value / 10, rounded)
      const mod = Math.round(totalValue / 10);
      
      // Get eureka data
      const eurekaValue = this.system.attributes.skillSets?.[key]?.eureka ?? 0;
      const eurekaMax = Math.round(totalValue / 100);

      // Store the calculated values
      this.skillSetTotalValues[key] = totalValue;
      this.skillSetMods[key] = mod;
      
      // Store complete skill set data for easy access
      this.skillSetData[key] = {
        key,
        label: game.i18n.localize(def.label),
        abilities: skillSetAbilities,
        totalValue,
        mod,
        eureka: {
          value: eurekaValue,
          max: eurekaMax
        }
      };

      // Update ability totals (base value + modifier)
      skillSetAbilities.forEach(ab => {
        ab.system.total = (ab.system.value ?? 0) + mod;
      });
    }
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
   * Prepare armor class calculation from equipped armor items only
   * @private
   */
  _prepareArmorClass() {
    console.log(`HowToBeAHero | Calculating armor for actor: ${this.name}`);
    
    // Get all equipped armor items
    const equippedArmor = this.items.filter(item => 
      item.type === 'armor' && item.system.equipped === true
    );
    
    console.log(`HowToBeAHero | Found ${equippedArmor.length} equipped armor items:`, 
      equippedArmor.map(armor => `${armor.name} (${armor.system.armor || 0})`)
    );
    
    // Calculate total armor value from equipped items only
    const totalArmorClass = equippedArmor.reduce((total, armor) => {
      const armorValue = armor.system.armor || 0;
      console.log(`HowToBeAHero | Adding armor: ${armor.name} = ${armorValue}`);
      return total + armorValue;
    }, 0);
    
    console.log(`HowToBeAHero | Total armor class calculated: ${totalArmorClass}`);
    
    // Store the calculated values for easy access
    this.armorData = {
      equipped: totalArmorClass,
      total: totalArmorClass,
      equippedItems: equippedArmor.map(armor => ({
        id: armor.id,
        name: armor.name,
        armorValue: armor.system.armor || 0
      }))
    };
    
    console.log(`HowToBeAHero | Stored armor data:`, this.armorData);
  }

  getRollData() {
    const data = super.getRollData();

    data.skillSets = this.skillSetData;
    data.skillSetTotalValues = this.skillSetTotalValues;
    data.skillSetMods = this.skillSetMods;
    
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
    
    // Use the formula from damageData if provided, otherwise default to 1d10
    const formula = damageData.formula || "1d10";
    
    console.log(`HowToBeAHero | Rolling damage with formula: ${formula}`);

    const rollData = {
      formula: formula,
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
    if (!this.skillSetTotalValues) {
      this._prepareSkillSets();
    }

    const label = game.i18n.localize(CONFIG.HTBAH.skillSets[skillSetId]?.label) ?? "";
    const data = this.getRollData();
    
    const targetValue = this.skillSetTotalValues[skillSetId] ?? 0;
    const baseValue = this.skillSetTotalValues[skillSetId] ?? 0; 
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
      targetValue: targetValue + bonusValue, 
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
}