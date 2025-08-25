/**
 * Static class for creating roll dialogs with bonus input
 */
export class HowToBeAHeroRollDialog {
  
  /**
   * Show a roll dialog and execute the roll with user input
   */
  static async show(options = {}) {
    const item = options.item;
    const baseFormula = options.baseFormula || "1d10";
    const rollType = options.rollType || "check";
    
    // Render the dialog template
    const content = await renderTemplate("systems/how-to-be-a-hero/templates/dialogs/roll-dialog.hbs", {
      itemName: item?.name || "Unknown Item",
      baseFormula: baseFormula,
      bonus: 0,
      finalFormula: baseFormula
    });
    
    // Calculate final formula based on bonus input
    const calculateFinalFormula = (bonus) => {
      if (bonus === 0) return baseFormula;
      const bonusStr = bonus > 0 ? `+${bonus}` : bonus.toString();
      return `${baseFormula}${bonusStr}`;
    };
    
    // Create the dialog
    return new Promise((resolve, reject) => {
      console.log("HowToBeAHero | Creating roll dialog with buttons");
      
      const dialog = new Dialog({
        title: `Roll ${item?.name}`,
        content: content,
        buttons: {
          roll: {
            icon: '<i class="fas fa-dice-d20"></i>',
            label: game.i18n.localize("HTBAH.RollDialog.Roll"),
            callback: async (html) => {
              const bonusInput = html.find('input[name="bonus"]')[0];
              const bonus = parseInt(bonusInput?.value) || 0;
              const finalFormula = calculateFinalFormula(bonus);
              
              console.log(`HowToBeAHero | Rolling with formula: ${finalFormula}`);
              
              try {
                const roll = new Roll(finalFormula);
                await roll.evaluate();
                
                // Create customized chat message based on item type
                const messageContent = await HowToBeAHeroRollDialog._createChatMessage(item, roll, finalFormula, bonus);
                
                const messageData = {
                  user: game.user.id,
                  speaker: ChatMessage.getSpeaker(),
                  content: messageContent,
                  sound: CONFIG.sounds.dice
                };
                
                await ChatMessage.create(messageData);
                resolve(roll);
              } catch (error) {
                console.error("HowToBeAHero | Error rolling item:", error);
                ui.notifications.error("Failed to execute roll.");
                reject(error);
              }
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "roll",
        render: (html) => {
          console.log("HowToBeAHero | Dialog rendered, setting up event listeners");
          // Set up bonus input listener for live formula updates
          const bonusInput = html.find('input[name="bonus"]')[0];
          const resultFormula = html.find('.result-formula')[0];
          
          if (bonusInput && resultFormula) {
            bonusInput.addEventListener('input', (event) => {
              const bonus = parseInt(event.target.value) || 0;
              const finalFormula = calculateFinalFormula(bonus);
              resultFormula.textContent = finalFormula;
            });
          } else {
            console.warn("HowToBeAHero | Could not find bonus input or result formula elements");
          }
        },
        close: () => resolve(null)
      }, {
        classes: ["how-to-be-a-hero", "roll-dialog"],
        width: 400,
        height: "auto"
      });
      
      console.log("HowToBeAHero | Rendering dialog");
      dialog.render(true);
    });
  }

  /**
   * Create customized chat message based on item type
   */
  static async _createChatMessage(item, roll, finalFormula, bonus) {
    const rollTotal = roll.total;
    
    switch (item.type) {
      case "ability":
        return this._createAbilityChatMessage(item, roll, rollTotal, bonus);
      
      case "weapon":
        return await this._createWeaponChatMessage(item, roll, rollTotal, bonus);
      
      default:
        return await this._createGenericChatMessage(item, roll, rollTotal, bonus);
    }
  }

  /**
   * Create ability-specific chat message (like old dice.mjs formatting)
   */
  static _createAbilityChatMessage(item, roll, rollTotal, bonus) {
    // Get ability data
    const targetValue = item.system.value || 50;
    const baseValue = item.system.value || 50;
    const skillSet = item.system.skillSet || "action";
    
    // Calculate thresholds (like in dice.mjs)
    const criticalThreshold = Math.floor(targetValue * 0.1);
    const fumbleThreshold = Math.ceil(100 - (100 - targetValue) * 0.1);
    
    // Determine success/failure
    const isSuccess = rollTotal <= targetValue;
    const isCriticalSuccess = rollTotal <= criticalThreshold;
    const isCriticalFailure = rollTotal >= fumbleThreshold;
    
    // Define header icons and titles based on skill set
    const headerConfig = {
      knowledge: {
        icon: '<i class="fas fa-book-open" style="color: #191970;"></i>',
        title: game.i18n.localize("HTBAH.KnowledgeCheck")
      },
      action: {
        icon: '<i class="fas fa-fist-raised" style="color: #8B0000;"></i>',
        title: game.i18n.localize("HTBAH.ActionCheck")
      },
      social: {
        icon: '<i class="fas fa-comments" style="color: #4B0082;"></i>',
        title: game.i18n.localize("HTBAH.SocialCheck")
      },
      default: {
        icon: '<i class="fas fa-dice-d20"></i>',
        title: game.i18n.localize("HTBAH.Check")
      }
    };

    const header = headerConfig[skillSet] || headerConfig.default;

    // Result message with colors
    let resultMessage = isCriticalSuccess ? '<span style="color: #00ff00;"><strong>Critical Success!</strong></span>'
      : isCriticalFailure ? '<span style="color: #ff0000;"><strong>Critical Failure!</strong></span>'
      : isSuccess ? '<span style="color: #0000ff;"><strong>Success</strong></span>'
      : '<span style="color: #ff8800;"><strong>Failure</strong></span>';

    return `
      <div class="htbah-ability-roll">
        <div class="roll-details">
          <h3 class="roll-header">${item.name} (${header.title}) ${header.icon}</h3>
          <p>Roll: ${rollTotal}</p>
          <p>Target: ${targetValue}</p> 
          <p>(Base: ${baseValue}${bonus ? `, Bonus: ${bonus}` : ''})</p>
          <p>Critical Success: ≤ ${criticalThreshold}</p>
          <p>Critical Failure: ≥ ${fumbleThreshold}</p>
        </div>
        <br>${resultMessage}
      </div>
    `;
  }

  /**
   * Create weapon-specific damage roll chat message
   */
  static async _createWeaponChatMessage(item, roll, rollTotal, bonus) {
    const renderedRoll = await roll.render();
    return `
      <div class="htbah-weapon-roll">
        <div class="damage-roll">
          <h3 class="roll-header">
            <i class="fas fa-sword" style="color: #8B0000;"></i>
            ${item.name} Damage
          </h3>
          <div class="damage-result">
            <h2 style="color: #8B0000; font-weight: bold;">${rollTotal} Damage</h2>
          </div>
          <div class="damage-breakdown">
            <p>Base Roll: ${renderedRoll}</p>
            ${bonus ? `<p>Bonus: +${bonus}</p>` : ''}
            <p><strong>Total Damage: ${rollTotal}</strong></p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create generic chat message for other item types
   */
  static async _createGenericChatMessage(item, roll, rollTotal, bonus) {
    const renderedRoll = await roll.render();
    return `
      <div class="htbah-roll">
        <div class="roll-header">
          <h3>${item.name}</h3>
        </div>
        <div class="roll-result">
          ${renderedRoll}
        </div>
        ${bonus ? `<p>Applied Bonus: +${bonus}</p>` : ''}
      </div>
    `;
  }
}