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
    
      if (actionConfig.action === "favorite") {
        // Only allow drops from this actor's inventory
        const itemId = data.uuid.split('.').pop();
        const item = this.actor.items.get(itemId);
        if (!item) return false;
    
        return this.sheet._onDropFavorite(event, {
          type: "item",
          id: itemId
        });
      }
    }
  }