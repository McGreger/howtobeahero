const { HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Dialog for selecting an actor to give an item to
 * @extends {foundry.applications.api.ApplicationV2}
 */
export class ActorSelectorDialog extends HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  constructor(item, options = {}) {
    super(options);
    this.item = item;
    this.actors = [];
    this.filteredActors = [];
    this.selectedActorId = null;
    this.searchTerm = "";
    this.#resolve = null;
    this.#reject = null;
  }

  #resolve;
  #reject;

  static DEFAULT_OPTIONS = {
    classes: ["how-to-be-a-hero", "actor-selector"],
    tag: "dialog",
    window: {
      title: "HTBAH.GiveItemDialogTitle",
      minimizable: false,
      resizable: false,
      controls: []
    },
    position: {
      width: 350,
      height: "auto"
    },
    actions: {
      submit: this.prototype._onSubmit,
      cancel: this.prototype._onCancel
    }
  };

  static PARTS = {
    form: {
      template: "systems/how-to-be-a-hero/templates/dialogs/actor-selector.hbs"
    }
  };

  async _prepareContext(options) {
    // Get all valid actors, excluding the current item's owner
    const currentActor = this.item.actor;
    this.actors = game.actors.filter(actor => {
      // Include characters (all characters are valid targets)
      if (actor.type === "character" && actor.id !== currentActor?.id) {
        return true;
      }
      // Include NPCs that have canReceiveItems set to true
      if (actor.type === "npc" && actor.system.canReceiveItems && actor.id !== currentActor?.id) {
        return true;
      }
      return false;
    }).map(actor => ({
      id: actor.id,
      name: actor.name,
      img: actor.img,
      isOwner: actor.isOwner,
      type: actor.type,
      isNPC: actor.type === "npc"
    }));

    // Apply search filter if any
    this.filteredActors = this.searchTerm ? 
      this.actors.filter(actor => 
        actor.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      ) : [...this.actors];

    return {
      item: {
        name: this.item.name,
        img: this.item.img
      },
      actors: this.filteredActors,
      hasActors: this.filteredActors.length > 0,
      searchTerm: this.searchTerm || ""
    };
  }

  async _onRender(context, options) {
    super._onRender(context, options);
    
    // Focus the search input and preserve cursor position
    const searchInput = this.element.querySelector('.search-input');
    if (searchInput) {
      // Set cursor to end of text after render
      const textLength = searchInput.value.length;
      searchInput.focus();
      searchInput.setSelectionRange(textLength, textLength);
      
      // Add real-time input event listener
      searchInput.addEventListener('input', (event) => {
        this.searchTerm = event.target.value;
        this.render(false);
      });
    }

    // Don't pre-select any actor - let user explicitly choose
  }

  async _onSearch(event, target) {
    this.searchTerm = target.value;
    await this.render(false);
  }

  async _onSubmit(event, target) {
    event.preventDefault();
    
    // Get the selected actor from the form
    const selectedRadio = this.element.querySelector('input[name="selected"]:checked');
    if (!selectedRadio) {
      return;
    }
    
    const selectedActorId = selectedRadio.value;
    const targetActor = game.actors.get(selectedActorId);
    if (!targetActor) {
      ui.notifications.error(game.i18n.localize("HTBAH.GiveItemActorNotFound"));
      return;
    }

    try {
      // Create a copy of the item data for the target actor
      const itemData = this.item.toObject();
      delete itemData._id; // Remove the ID so a new one is generated

      // Add the item to the target actor
      const [newItem] = await targetActor.createEmbeddedDocuments("Item", [itemData]);
      console.log("Give item - created new item:", newItem);

      // Remove the item from the source actor
      await this.item.delete();
      console.log("Give item - deleted source item");

      ui.notifications.info(game.i18n.format("HTBAH.GiveItemSuccess", {
        item: this.item.name,
        actor: targetActor.name
      }));
      
      if (this.#resolve) this.#resolve({ success: true, targetActor, newItem });
      this.close();
      return true;

    } catch (error) {
      console.error("Give item - error during transfer:", error);
      ui.notifications.error(game.i18n.format("HTBAH.GiveItemError", { error: error.message }));
      if (this.#reject) this.#reject(error);
      return false;
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
   * Show the actor selector dialog and return a promise
   * @param {Item} item - The item to give
   * @returns {Promise<Object|null>} The result or null if cancelled
   */
  static async show(item) {
    return new Promise((resolve, reject) => {
      const dialog = new this(item);
      dialog.#resolve = resolve;
      dialog.#reject = reject;
      dialog.render(true);
    });
  }
}