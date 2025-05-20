export class HowToBeAHeroDragDropHandler {
    constructor(sheet) {
      this.sheet = sheet;
      this.actor = sheet.actor;
    }

    /**
     * Get or create the Item associated with provided drop data.
     * If the dropped data references an Item not already owned by the actor,
     * a new embedded Item will be created from the drop data.
     * @param {object} data              The data object extracted from the drag event.
     * @returns {Promise<Item|null>}     The resolved Item document or null on failure.
     * @private
     */
    async _resolveDroppedItem(data) {
      if (data.type !== "Item") return null;

      // Resolve the dropped item from the provided data
      let item = await Item.implementation.fromDropData(data);
      if (!item) return null;

      // If the item does not belong to this actor, create it as an embedded document
      if (item.parent?.id !== this.actor.id) {
        const [created] = await this.actor.createEmbeddedDocuments("Item", [item.toObject()]);
        item = created;
      }

      return item;
    }
  
    /**
     * Determines the drag action type based on the drop target
     * @param {HTMLElement} dropTarget - The drop target element
     * @returns {Object} The action configuration
     * @private
     */
    _getDragActionType(dropTarget) {
      if (dropTarget.closest(".favorites")) {
        return { action: "favorite", type: "item" };
      }
      
      const headerSlot = dropTarget.closest('.header-stat-column');
      if (headerSlot) {
        const slotType = headerSlot.dataset.slot;
        return { action: "headerSlot", type: slotType };
      }

      const skillSet = dropTarget.closest('.talent-category');
      if (skillSet) {
        const skillType = skillSet.dataset.skillType;
        return { action: "skillSet", type: skillType };
      }
  
      return { action: "default", type: "item" };
    }
  
    /**
     * Handle dragover event
     * @param {DragEvent} event - The drag event
     */
    onDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  
    /**
     * Handle dragstart event
     * @param {DragEvent} event - The drag event
     */
    onDragStart(event) {
      console.log("Drag started with data:", {
        itemId: event.currentTarget.dataset.itemId,
        item: this.actor.items.get(event.currentTarget.dataset.itemId)
      });
      requestAnimationFrame(() => game.tooltip.deactivate());
      game.tooltip.deactivate();
  
      const li = event.currentTarget;
      const item = this.actor.items.get(li.dataset.itemId);
      
      if (item) {
        const dragData = {
          type: "Item",
          uuid: item.uuid,
          data: item.toObject()
        };
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
      }
    }
    
    /**
     * Handle drop event
     * @param {DragEvent} event - The drag event
     */
    async onDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      
      let data;
      try {
        data = JSON.parse(event.dataTransfer.getData("text/plain"));
      } catch(e) {
        return false;
      }
    
      const actionConfig = this._getDragActionType(event.target);

      switch(actionConfig.action) {
        case "favorite":
          // Handle favorite drops
          const favItem = await this._resolveDroppedItem(data);
          if (!favItem) return false;

          return this.sheet._onDropFavorite(event, {
            type: "item",
            id: favItem.id
          });

        case "headerSlot":
          // Handle header slot drops
          const droppedItem = await this._resolveDroppedItem(data);
          if (!droppedItem) return false;

          // Validate item type based on slot
          if (actionConfig.type === "skill" && !["knowledge", "social", "action"].includes(droppedItem.type)) {
            ui.notifications.warn(game.i18n.localize("HTBAH.WarningOnlySkillsAllowed"));
            return false;
          }
          
          if (actionConfig.type === "weapon" && droppedItem.type !== "weapon") {
            ui.notifications.warn(game.i18n.localize("HTBAH.WarningOnlyWeaponsAllowed"));
            return false;
          }
    
          // Update the header slot
          return this.sheet._setHeaderItem(actionConfig.type, droppedItem.id);

        case "skillSet":
          // Handle drops onto skill set lists
          const skillItem = await this._resolveDroppedItem(data);
          if (!skillItem) return false;

          if (!["knowledge", "social", "action"].includes(skillItem.type)) {
            ui.notifications.warn(game.i18n.localize("HTBAH.WarningOnlySkillsAllowed"));
            return false;
          }

          if (skillItem.type !== actionConfig.type) {
            ui.notifications.warn(game.i18n.localize("HTBAH.WarningOnlySkillsAllowed"));
            return false;
          }

          return true;

        default:
          return false;
      }
    }
  }