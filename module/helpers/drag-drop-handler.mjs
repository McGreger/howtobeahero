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
        // Only treat as header slot if it has a valid slot type
        if (slotType && (slotType === "ability" || slotType === "weapon")) {
          return { action: "headerSlot", type: slotType };
        }
      }

      const skillSetCategory = dropTarget.closest('.skillSet-category');
      if (skillSetCategory) {
        // Get the skillset type from the template context or data attributes
        const skillSetContainer = skillSetCategory.querySelector('.skillSet-list');
        if (skillSetContainer) {
          // Look for the skillset identifier in the parent container structure
          const containerParent = skillSetCategory.parentElement;
          let skillSetType = null;
          
          if (containerParent.classList.contains('center')) {
            skillSetType = 'action';
          } else if (containerParent.classList.contains('left')) {
            skillSetType = 'knowledge';
          } else if (containerParent.classList.contains('right')) {
            skillSetType = 'social';
          }
          
          return { action: "skillSet", type: skillSetType };
        }
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

      // Add visual feedback for drop zones
      const dropTarget = event.currentTarget;
      const actionConfig = this._getDragActionType(dropTarget);
      
      // Clear any existing dragover classes
      this.sheet.element.querySelectorAll('.dragover').forEach(el => {
        el.classList.remove('dragover');
      });

      // Add dragover class to the appropriate element
      if (actionConfig.action === "skillSet") {
        const skillSetCategory = dropTarget.closest('.skillSet-category');
        if (skillSetCategory) {
          skillSetCategory.classList.add('dragover');
        }
      } else if (actionConfig.action === "headerSlot") {
        const statContent = dropTarget.querySelector('.stat-content');
        if (statContent) {
          statContent.classList.add('dragover');
        }
      } else if (actionConfig.action === "favorite") {
        dropTarget.classList.add('dragover');
      }
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
     * Handle dragleave event to clean up visual feedback
     * @param {DragEvent} event - The drag event
     */
    onDragLeave(event) {
      // Clean up dragover classes when leaving drop zones
      const relatedTarget = event.relatedTarget;
      const currentTarget = event.currentTarget;
      
      // Only remove if we're actually leaving the drop zone (not moving to a child)
      if (!currentTarget.contains(relatedTarget)) {
        this.sheet.element.querySelectorAll('.dragover').forEach(el => {
          el.classList.remove('dragover');
        });
      }
    }

    /**
     * Handle drop event
     * @param {DragEvent} event - The drag event
     */
    async onDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      
      // Clean up dragover classes
      this.sheet.element.querySelectorAll('.dragover').forEach(el => {
        el.classList.remove('dragover');
      });
      
      let data;
      try {
        data = JSON.parse(event.dataTransfer.getData("text/plain"));
        console.log("Drop data parsed:", data);
      } catch(e) {
        console.error("Failed to parse drag data:", e);
        return false;
      }
      
      if (!data) {
        console.log("No drag data received");
        return false;
      }
    
      const actionConfig = this._getDragActionType(event.target);
    
      switch(actionConfig.action) {
        case "favorite":
          // Handle favorite drops
          console.log("Favorite drop - data:", data);
          
          if (!data.uuid) {
            console.log("Favorite drop - no UUID in data");
            return false;
          }
          
          const itemId = data.uuid.split('.').pop();
          console.log("Favorite drop - extracted itemId:", itemId);
          
          const item = this.actor.items.get(itemId);
          if (!item) {
            console.warn(`Favorite drop - Item ${itemId} does not exist in actor's items collection`);
            ui.notifications.warn("This item does not belong to this character.");
            return false;
          }
    
          return this.sheet._onDropFavorite(event, {
            type: "item",
            id: itemId
          });
    
        case "headerSlot":
          // Handle header slot drops
          if (data.type !== "Item") return false;
          const droppedItem = await Item.implementation.fromDropData(data);
          if (!droppedItem) return false;
    
          // Validate item type based on slot
          if (actionConfig.type === "ability" && droppedItem.type !== "ability") {
            ui.notifications.warn(game.i18n.localize("HTBAH.WarningOnlyAbilitiesAllowed"));
            return false;
          }
          
          if (actionConfig.type === "weapon" && droppedItem.type !== "weapon") {
            ui.notifications.warn(game.i18n.localize("HTBAH.WarningOnlyWeaponsAllowed"));
            return false;
          }
    
          // Update the header slot
          return this.sheet._setHeaderItem(actionConfig.type, droppedItem.id);

        case "skillSet":
          // Handle skillset category drops
          console.log("SkillSet drop - data:", data);
          
          if (data.type !== "Item") {
            console.log("SkillSet drop - not an item, rejecting");
            return false;
          }
          
          let skillSetItem;
          try {
            skillSetItem = await Item.implementation.fromDropData(data);
          } catch (error) {
            console.error("SkillSet drop - error getting item from drop data:", error);
            ui.notifications.error(`Failed to get item: ${error.message}`);
            return false;
          }
          
          if (!skillSetItem) {
            console.log("SkillSet drop - skillSetItem is null/undefined");
            return false;
          }

          console.log("SkillSet drop - skillSetItem:", skillSetItem);

          // Check if this item belongs to the current actor
          const actorItem = this.actor.items.get(skillSetItem.id);
          if (!actorItem) {
            console.warn(`SkillSet drop - Item ${skillSetItem.id} does not belong to actor ${this.actor.name}`);
            ui.notifications.warn("This item does not belong to this character.");
            return false;
          }

          // Only allow abilities to be moved between skillsets
          if (skillSetItem.type !== "ability") {
            console.log(`SkillSet drop - wrong item type: ${skillSetItem.type}`);
            ui.notifications.warn(game.i18n.localize("HTBAH.WarningOnlyAbilitiesInSkillSets"));
            return false;
          }

          // Don't allow dropping in the same skillset
          if (skillSetItem.system.skillSet === actionConfig.type) {
            console.log(`SkillSet drop - same skillset: ${actionConfig.type}`);
            return false; // No change needed
          }

          console.log(`Moving ability "${skillSetItem.name}" from "${skillSetItem.system.skillSet}" to "${actionConfig.type}"`);

          // Update the ability's skillset using the actor's item
          return actorItem.update({
            "system.skillSet": actionConfig.type
          });
    
        default:
          return false;
      }
    }
  }