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
    return (this.terms[0] instanceof Die) && (this.terms[0].faces === 100);
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
    if (!this._evaluated) await this.evaluate({async: true});

    messageData.flavor = messageData.flavor || this.options.flavor;

    return super.toMessage(messageData, options);
  }
}