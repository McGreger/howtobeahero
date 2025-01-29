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
    /**
 * Handle drop event
 * @param {DragEvent} event - The drag event
 */
async onDrop(event) {
  console.log("Drop event triggered");
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

  // For favorites, ensure we're using the original item ID from this actor
  if (actionConfig.action === "favorite") {
    // Only allow drops if the item is from this actor
    if (!data.uuid?.includes(this.actor.uuid)) {
      ui.notifications.warn(game.i18n.localize("HTBAH.WarningOnlyCurrentActorItems"));
      return false;
    }

    // Extract the original item ID from the UUID
    const originalItemId = data.uuid.split('.').pop();
    console.log(this.actor.items)
    // Verify the item exists in the actor's inventory
    const item = this.actor.items.get(originalItemId);
    if (!item) {
      console.error("Item not found in actor inventory");
      return false;
    }

    return this.sheet._onDropFavorite(event, { 
      type: "item", 
      id: originalItemId // Use the original ID
    });
  }

  // Handle other drop types
  if (actionConfig.action === "headerSlot") {
    return this.sheet._onHeaderDrop(event, actionConfig.type);
  }
  
  return this.sheet._onDrop(event, data);
}
  }