export class HowToBeAHeroDragDropHandler {
    constructor(sheet) {
      this.sheet = sheet;
      this.actor = sheet.actor;
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
      
      let data;
      try {
        data = JSON.parse(event.dataTransfer.getData("text/plain"));
      } catch(e) {
        console.error("Failed to parse drag data:", e);
        return;
      }
  
      // Determine action type based on where it was dropped
      const actionConfig = this._getDragActionType(event.target);
      data.htbah = {
        ...actionConfig,
        id: data.uuid?.split('.').pop()
      };
  
      // Route to appropriate handler based on data type and drop zone
      switch(data.type) {
        case "Item":
          if (actionConfig.action === "favorite") {
            return this.sheet._onDropFavorite(event, { type: "item", id: data.htbah.id });
          } else if (actionConfig.action === "headerSlot") {
            return this.sheet._onHeaderDrop(event, actionConfig.type);
          }
          return this.sheet._onDrop(event, data);
        case "ActiveEffect":
          return this.sheet._onDropActiveEffect(event, data);
        default:
          return this.sheet._onDrop(event, data);
      }
    }
  }