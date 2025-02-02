import { HowToBeAHeroItem } from '../documents/item.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class HowToBeAHeroItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['how-to-be-a-hero', 'sheet', 'item'],
      width: 560,
      scrollY: [
        ".tab[data-tab=description] .editor-content",
      ],
      tabs: [
        {
          navSelector: '.tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/how-to-be-a-hero/templates/item';
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /** @override */
  async getData() {
    try {
      const context = await super.getData();
      const item = context.item;

      //context.item.system.calculatedValue = item.calculatedValue;
      //context.item.system.totalValue = item.totalValue;

      this._prepareBaseItemData(context, item);
      this._prepareGameConfig(context);
      this._prepareAdditionalData(context, item);
      // Add dice type options for selects
      context.diceTypes = {
        "d4": "d4",
        "d6": "d6",
        "d8": "d8", 
        "d10": "d10",
        "d12": "d12",
        "d20": "d20",
        "d100": "d100"
      };

      // Add armor type options
      context.armorTypes = {
        "light": "Light",
        "medium": "Medium", 
        "heavy": "Heavy",
        "shield": "Shield"
      };
      // Prepares active effects but is not used for items at the moment!!!
      //context.effects = game.howtobeahero.managers.effects.prepareActiveEffectCategories(this.item.effects);

      return context;
    } catch (error) {
      console.error('Error in getData:', error);
      throw error;
    }
  }

  _prepareBaseItemData(context, item) {
    const source = item.toObject();
    
    context.source = source.system;
    context.system = item.system;
    context.flags = item.flags;
    context.labels = item.labels;
    context.isEmbedded = item.isEmbedded;
    context.rollData = item.getRollData();
    context.user = game.user;
  }

  _prepareGameConfig(context) {
    context.config = CONFIG.HTBAH;
  }

  _prepareAdditionalData(context, item) {
    context.itemType = this._getLocalizedItemType(item);
    context.elements = this.options.elements;
    context.concealDetails = !game.user.isGM;
  }

  _getLocalizedItemType(item) {
    return game.i18n.localize(CONFIG.Item.typeLabels[item.type]);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add bonus handlers for skills
    html.find('[data-action="incrementBonus"]').click(this._onAdjustBonus.bind(this, 1));
    html.find('[data-action="decrementBonus"]').click(this._onAdjustBonus.bind(this, -1));

    // Handle roll field changes for weapons
    if (this.item.type === 'weapon') {
      html.find('input[name="system.roll.diceNum"]').change(this._onUpdateRollFields.bind(this));
      html.find('select[name="system.roll.diceSize"]').change(this._onUpdateRollFields.bind(this));
      html.find('input[name="system.roll.diceBonus"]').change(this._onUpdateRollFields.bind(this));
    }

    // Active Effect management
    html.on('click', '.effect-control', this._onEffectControl.bind(this));
    
    html.find(".description-edit").click(event => {
      this.editingDescriptionTarget = event.currentTarget.dataset.target;
      this.render();
    });

    // Update calculatedvalue display when base value changes
    html.find('input[name="system.value"]').on('change', (event) => {
      const newBaseValue = Number(event.target.value);
      const calculatedValueInput = html.find('input[name="system.calculatedValue"]');
      calculatedValueInput.val(this.item.calculatedValue);
    });
  }
  
  async _onUpdateRollFields(event) {
    event.preventDefault();
    
    // Get current roll values
    const diceNum = this.item.system.roll.diceNum;
    const diceSize = this.item.system.roll.diceSize;
    const diceBonus = this.item.system.roll.diceBonus;
  
    // Format bonus string
    const bonusStr = diceBonus > 0 ? `+${diceBonus}` : 
                    diceBonus < 0 ? diceBonus.toString() : '';
                    
    // Create new formula
    const formula = `${diceNum}${diceSize}${bonusStr}`;
  
    // Update the formula display
    const formulaInput = this.element.find('input[name="system.formula"]');
    if (formulaInput.length) {
      formulaInput.val(formula);
    }
  }

  async _onAdjustBonus(delta, event) {
    event.preventDefault();
    const currentBonus = Number(this.item.system.roll.diceBonus) || 0;
    const newBonus = currentBonus + delta;
    await this.item.update({"system.roll.diceBonus": newBonus});
  }

  /**
   * Handle active effect actions
   * @param {Event} event The originating click event
   * @private
   */
  _onEffectControl(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const effectId = button.closest('li')?.dataset.effectId;
    const effect = this.item.effects.get(effectId);

    switch (button.dataset.action) {
      case "create":
        return this.item.createEmbeddedDocuments("ActiveEffect", [{
          label: "New Effect",
          icon: "icons/svg/aura.svg",
          origin: this.item.uuid,
          disabled: false
        }]);
      case "edit":
        return effect.sheet.render(true);
      case "delete":
        return effect.delete();
      case "toggle":
        return effect.update({disabled: !effect.disabled});
    }
  }

  /** @inheritdoc */
  async _onSubmit(event, {updateData=null, preventClose=false, preventRender=false}={}) {
    return super._onSubmit(event, {updateData, preventClose, preventRender});
  }
}
