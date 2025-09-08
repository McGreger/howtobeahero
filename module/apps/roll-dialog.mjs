const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * AppV2-based roll dialog for How To Be A Hero system
 * @extends {foundry.applications.api.ApplicationV2}
 */
export class HowToBeAHeroRollDialog extends HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  
  static DEFAULT_OPTIONS = {
    classes: ["how-to-be-a-hero", "roll-dialog"],
    tag: "dialog",
    position: {
      width: 400,
      height: "auto"
    },
    window: {
      title: "HTBAH.RollDialog.Title",
      resizable: false,
      minimizable: false,
      controls: []
    },
    actions: {
      roll: HowToBeAHeroRollDialog.prototype._onRoll,
      cancel: HowToBeAHeroRollDialog.prototype._onCancel,
      updateBonus: HowToBeAHeroRollDialog.prototype._onUpdateBonus,
      submit: HowToBeAHeroRollDialog.prototype._onSubmit
    }
  };

  static PARTS = {
    form: {
      template: "systems/how-to-be-a-hero/templates/dialogs/roll-dialog.hbs"
    }
  };

  constructor(options = {}) {
    super(options);
    this.item = options.item;
    this.baseFormula = options.baseFormula || "1d10";
    this.rollType = options.rollType || "check";
    this.isParry = options.isParry || false;
    this.bonus = 0;
    this.#resolve = null;
    this.#reject = null;
  }

  #resolve;
  #reject;

  get title() {
    return game.i18n.format("HTBAH.RollDialog.RollItem", { 
      item: this.item?.name || game.i18n.localize("HTBAH.Unknown") 
    });
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    
    context.itemName = this.item?.name || game.i18n.localize("HTBAH.Unknown");
    context.baseFormula = this.baseFormula;
    context.bonus = this.bonus;
    context.finalFormula = this._calculateFinalFormula(this.bonus);
    
    return context;
  }

  /** @override */
  async _onRender(context, options) {
    super._onRender(context, options);
    
    // Focus the bonus input for better UX
    const bonusInput = this.element.querySelector('input[name="bonus"]');
    if (bonusInput) {
      bonusInput.focus();
      bonusInput.select();
      
      // Add immediate input event listener for real-time formula updates
      bonusInput.addEventListener('input', (event) => {
        this._handleBonusInput(event);
      });
      
      // Also listen for keyup for better responsiveness
      bonusInput.addEventListener('keyup', (event) => {
        this._handleBonusInput(event);
      });
    }
  }

  /**
   * Calculate the final formula based on bonus input
   * @param {number} bonus - The bonus to apply
   * @returns {string} The final roll formula
   */
  _calculateFinalFormula(bonus) {
    if (bonus === 0) return this.baseFormula;
    const bonusStr = bonus > 0 ? `+${bonus}` : bonus.toString();
    return `${this.baseFormula}${bonusStr}`;
  }

  /**
   * Handle bonus input changes immediately for real-time updates
   * @param {Event} event - The input event
   */
  _handleBonusInput(event) {
    const newBonus = parseInt(event.target.value) || 0;
    if (newBonus !== this.bonus) {
      this.bonus = newBonus;
      
      // Update the final formula display immediately
      const resultFormula = this.element.querySelector('.result-formula');
      if (resultFormula) {
        resultFormula.textContent = this._calculateFinalFormula(this.bonus);
      }
    }
  }

  /**
   * Handle updating the bonus value (called by AppV2 action system)
   * @param {PointerEvent} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  async _onUpdateBonus(event, target) {
    // This is handled by the real-time input listener, but kept for compatibility
    this._handleBonusInput(event);
  }

  /**
   * Handle form submission (Enter key or submit button)
   * @param {SubmitEvent} event - The form submit event
   * @param {HTMLElement} target - The target element
   */
  async _onSubmit(event, target) {
    event.preventDefault();
    // Only trigger roll for actual form submissions (Enter key), not mouse events
    if (event.type === 'submit') {
      return this._onRoll(event, target);
    }
  }

  /**
   * Handle roll button click
   * @param {PointerEvent} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  async _onRoll(event, target) {
    event.preventDefault();
    
    // Ensure we have the latest bonus value from the input
    const bonusInput = this.element.querySelector('input[name="bonus"]');
    if (bonusInput) {
      this.bonus = parseInt(bonusInput.value) || 0;
    }
    
    const finalFormula = this._calculateFinalFormula(this.bonus);
    console.log(`HowToBeAHero | Rolling with formula: ${finalFormula}`);
    
    try {
      const roll = new Roll(finalFormula);
      await roll.evaluate();
      
      // Create customized chat message based on item type
      const messageContent = await HowToBeAHeroRollDialog._createChatMessage(this.item, roll, finalFormula, this.bonus, this.isParry);
      
      const messageData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker(),
        content: messageContent,
        sound: CONFIG.sounds.dice
      };
      
      await ChatMessage.create(messageData);
      
      if (this.#resolve) this.#resolve(roll);
      this.close();
    } catch (error) {
      console.error("HowToBeAHero | Error rolling item:", error);
      ui.notifications.error(game.i18n.localize("HTBAH.RollDialog.ErrorRolling"));
      if (this.#reject) this.#reject(error);
    }
  }

  /**
   * Handle cancel button click
   * @param {PointerEvent} event - The triggering event
   * @param {HTMLElement} target - The target element
   */
  async _onCancel(event, target) {
    event.preventDefault();
    if (this.#resolve) this.#resolve(null);
    this.close();
  }

  /** @override */
  async close(options = {}) {
    if (this.#resolve) this.#resolve(null);
    return super.close(options);
  }

  /**
   * Show the roll dialog and return a promise
   * @param {Object} options - Configuration options
   * @returns {Promise<Roll|null>} The roll result or null if cancelled
   */
  static async show(options = {}) {
    return new Promise((resolve, reject) => {
      const dialog = new this(options);
      dialog.#resolve = resolve;
      dialog.#reject = reject;
      dialog.render(true);
    });
  }

  /**
   * Create customized chat message based on item type
   */
  static async _createChatMessage(item, roll, finalFormula, bonus, isParry = false) {
    const rollTotal = roll.total;
    
    // Handle parry rolls specifically
    if (isParry && item.type === "ability") {
      return this._createParryChatMessage(item, roll, rollTotal, bonus);
    }
    
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

  /**
   * Create parry-specific chat message
   */
  static _createParryChatMessage(item, roll, rollTotal, bonus) {
    // Get ability data (same as ability chat message)
    const targetValue = item.system.value || 50;
    const baseValue = item.system.value || 50;
    
    // Calculate thresholds
    const criticalThreshold = Math.floor(targetValue * 0.1);
    const fumbleThreshold = Math.ceil(100 - (100 - targetValue) * 0.1);
    
    // Determine success/failure
    const isSuccess = rollTotal <= targetValue;
    const isCriticalSuccess = rollTotal <= criticalThreshold;
    const isCriticalFailure = rollTotal >= fumbleThreshold;
    
    // Parry-specific styling
    const parryIcon = '<i class="fas fa-shield-alt" style="color: #4169E1;"></i>';
    const parryTitle = game.i18n.localize("HTBAH.ParryAttempt");
    
    // Determine result styling and text
    let resultClass, resultText, resultIcon;
    if (isCriticalSuccess) {
      resultClass = 'critical-success';
      resultText = game.i18n.localize("HTBAH.ParryExceptional");
      resultIcon = '<i class="fas fa-star" style="color: gold;"></i>';
    } else if (isSuccess) {
      resultClass = 'success';
      resultText = game.i18n.localize("HTBAH.ParrySuccessful");
      resultIcon = '<i class="fas fa-check-circle" style="color: green;"></i>';
    } else if (isCriticalFailure) {
      resultClass = 'critical-failure';
      resultText = game.i18n.localize("HTBAH.ParryDisastrous");
      resultIcon = '<i class="fas fa-exclamation-triangle" style="color: red;"></i>';
    } else {
      resultClass = 'failure';
      resultText = game.i18n.localize("HTBAH.ParryFailed");
      resultIcon = '<i class="fas fa-times-circle" style="color: red;"></i>';
    }

    return `
      <div class="htbah-parry-roll">
        <div class="parry-header">
          <h3 class="roll-title">
            ${parryIcon}
            ${parryTitle}: ${item.name}
          </h3>
        </div>
        
        <div class="parry-details">
          <div class="target-info">
            <strong>${game.i18n.localize("HTBAH.Target")}:</strong> ${targetValue}
            ${bonus !== 0 ? `<span class="bonus-info">(${game.i18n.localize("HTBAH.Bonus")}: ${bonus > 0 ? '+' : ''}${bonus})</span>` : ''}
          </div>
        </div>
        
        <div class="parry-result ${resultClass}">
          <div class="result-header">
            ${resultIcon}
            <strong>${resultText}</strong>
          </div>
          <div class="roll-details">
            <div class="roll-value">
              <strong>${game.i18n.localize("HTBAH.Rolled")}:</strong> ${rollTotal}
            </div>
            <div class="formula-breakdown">
              <em>${item.system.formula || '1d100'}${bonus !== 0 ? (bonus > 0 ? '+' : '') + bonus : ''}</em>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}