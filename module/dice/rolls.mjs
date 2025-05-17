export class D100Roll extends Roll {
  constructor(formula, data, options) {
    super(formula, data, options);
    if (!this.options.configured) this.configureModifiers();
  }

  static fromRoll(roll) {
    const newRoll = new this(roll.formula, roll.data, roll.options);
    return Object.assign(newRoll, roll);
  }

  get validD100Roll() {
    return (this.terms[0] instanceof foundry.dice.terms.Die) && (this.terms[0].faces === 100);
  }

  get isCritical() {
    if (!this.validD100Roll || !this._evaluated) return undefined;
    if (!Number.isNumeric(this.options.critical)) return false;
    return this.dice[0].total <= this.options.critical;
  }

  get isFumble() {
    if (!this.validD100Roll || !this._evaluated) return undefined;
    if (!Number.isNumeric(this.options.fumble)) return false;
    return this.dice[0].total >= this.options.fumble;
  }

  configureModifiers() {
    if (!this.validD100Roll) return;

    const d100 = this.terms[0];
    d100.modifiers = [];

    if (this.options.critical) d100.options.critical = this.options.critical;
    if (this.options.fumble) d100.options.fumble = this.options.fumble;
    if (this.options.targetValue) d100.options.target = this.options.targetValue;

    this._formula = this.constructor.getFormula(this.terms);
    this.options.configured = true;
  }

  async toMessage(messageData={}, options={}) {
    if (!this._evaluated) await this.evaluate();
    messageData.flavor = messageData.flavor || this.options.flavor;
    return super.toMessage(messageData, options);
  }
}

export class D10Roll extends Roll {
  constructor(formula, data, options) {
    super(formula, data, options);
    // Initialize the required properties
    this.critical = options?.critical || false;
    this.bonusValue = options?.bonusValue || 0;
    this.target = options?.target || null;
    
    if (!this.options.configured) this.configureModifiers();
  }

  static fromRoll(roll) {
    const newRoll = new this(roll.formula, roll.data, roll.options);
    return Object.assign(newRoll, roll);
  }

  get validD10Roll() {
    return (this.terms[0] instanceof foundry.dice.terms.Die) && (this.terms[0].faces === 10);
  }

  get total() {
    if (!this._evaluated) return null;
    let baseTotal = super.total;
    
    // Apply critical damage if applicable
    if (this.critical) {
      baseTotal *= 2;
    }
    
    // Add bonus value
    baseTotal += this.bonusValue;
        
    return baseTotal;
  }

  configureModifiers() {
    if (!this.validD10Roll) return;

    const d10 = this.terms[0];
    d10.modifiers = [];

    // Configure any dice-specific modifiers here
    if (this.critical) d10.options.critical = true;
    if (this.target) d10.options.target = this.target;

    this._formula = this.constructor.getFormula(this.terms);
    this.options.configured = true;
  }

  async toMessage(messageData={}, options={}) {
    if (!this._evaluated) await this.evaluate();
    
    // Create detailed message data
    const rollDetails = {
      roll: this.total,
      base: super.total,
      bonusValue: this.bonusValue,
      critical: this.critical,
      target: this.target ? this.target.name : null
    };

    // Add roll details to message data
    messageData.flavor = messageData.flavor || this.options.flavor;
    messageData.content = (messageData.content || "") + this._createChatContent(rollDetails);
    
    return super.toMessage(messageData, options);
  }

  _createChatContent(details) {
    return `
      <div class="d10-roll-details">
        <div class="roll-result">
          <h3>Total: ${details.roll}</h3>
          ${details.critical ? '<span class="critical">Critical!</span>' : ''}
        </div>
        <div class="roll-breakdown">
          <p>Base Roll: ${details.base}</p>
          ${details.bonusValue ? `<p>Bonus: +${details.bonusValue}</p>` : ''}
          ${details.target ? `<p>Target: ${details.target}</p>` : ''}
        </div>
      </div>
    `;
  }
}