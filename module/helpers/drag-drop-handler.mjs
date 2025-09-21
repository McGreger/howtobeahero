// Global drag state tracking
let currentDragSource = null;

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
        if (slotType && (slotType === "ability" || slotType === "weapon" || slotType === "parry")) {
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

      // Check for inventory item type sections
      const inventorySection = dropTarget.closest('.items-section');
      if (inventorySection) {
        const sectionDataset = inventorySection.dataset;
        // Check if this section has a type specified
        if (sectionDataset.type) {
          return { action: "itemType", type: sectionDataset.type };
        }
      }

      // Check if this is a drop on another character sheet for item exchange
      const sheetElement = dropTarget.closest('.how-to-be-a-hero.sheet.actor.character');
      if (sheetElement) {
        return { action: "itemExchange", type: "item" };
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
      
      // Clear any existing dragover classes from all sheets
      document.querySelectorAll('.dragover').forEach(el => {
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
      } else if (actionConfig.action === "itemType") {
        const inventorySection = dropTarget.closest('.items-section');
        if (inventorySection) {
          inventorySection.classList.add('dragover');
        }
      }
      // Note: No dragover effects for itemExchange - keep it simple
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
        // Store the source actor ID globally for drag tracking
        currentDragSource = {
          actorId: this.actor.id,
          itemId: item.id
        };

        // Add dragging class to all actor sheets to show dropzone indicators
        document.querySelectorAll('.how-to-be-a-hero.sheet.actor').forEach(sheet => {
          sheet.classList.add('dragging-item');
        });

        const dragData = {
          type: "Item",
          uuid: item.uuid,
          data: item.toObject(),
          sourceActorId: this.actor.id  // Add source actor ID to drag data
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
        document.querySelectorAll('.dragover').forEach(el => {
          el.classList.remove('dragover');
        });
      }
    }

    /**
     * Handle dragend event to clean up drag state
     * @param {DragEvent} event - The drag event
     */
    onDragEnd(event) {
      // Reset global drag tracking when drag operation ends
      currentDragSource = null;

      // Remove dragging class from all actor sheets to hide dropzone indicators
      document.querySelectorAll('.how-to-be-a-hero.sheet.actor').forEach(sheet => {
        sheet.classList.remove('dragging-item');
      });

      // Clean up any remaining visual feedback
      document.querySelectorAll('.dragover').forEach(el => {
        el.classList.remove('dragover');
      });
    }

    /**
     * Handle drop event
     * @param {DragEvent} event - The drag event
     */
    async onDrop(event) {
      event.preventDefault();
      event.stopPropagation();

      console.log("onDrop called - currentDragSource:", currentDragSource, "target actor:", this.actor.id);

      // Remove dragging class from all actor sheets to hide dropzone indicators
      document.querySelectorAll('.how-to-be-a-hero.sheet.actor').forEach(sheet => {
        sheet.classList.remove('dragging-item');
      });

      // Clean up dragover classes from all character sheets
      document.querySelectorAll('.dragover').forEach(el => {
        el.classList.remove('dragover');
      });

      // Store drag source before resetting for same-actor check
      const dragSource = currentDragSource;

      // Reset global drag tracking
      currentDragSource = null;
      
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
    
      // First check if this is an item exchange with another character
      const targetActor = this._getTargetActor(event.target);
      if (targetActor && targetActor !== this.actor) {
        return this._handleItemExchange(event, data, targetActor);
      }

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

          if (actionConfig.type === "parry" && droppedItem.type !== "ability") {
            ui.notifications.warn(game.i18n.localize("HTBAH.WarningOnlyAbilitiesAllowed"));
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

        case "itemType":
          // Handle item type changes in inventory
          console.log("ItemType drop - data:", data);
          
          if (data.type !== "Item") {
            console.log("ItemType drop - not an item, rejecting");
            return false;
          }
          
          let itemTypeItem;
          try {
            itemTypeItem = await Item.implementation.fromDropData(data);
          } catch (error) {
            console.error("ItemType drop - error getting item from drop data:", error);
            ui.notifications.error(`Failed to get item: ${error.message}`);
            return false;
          }
          
          if (!itemTypeItem) {
            console.log("ItemType drop - itemTypeItem is null/undefined");
            return false;
          }

          console.log("ItemType drop - itemTypeItem:", itemTypeItem);

          // Check if this item belongs to the current actor
          const actorItemForType = this.actor.items.get(itemTypeItem.id);
          if (!actorItemForType) {
            console.warn(`ItemType drop - Item ${itemTypeItem.id} does not belong to actor ${this.actor.name}`);
            ui.notifications.warn("This item does not belong to this character.");
            return false;
          }

          // Don't allow dropping in the same item type
          if (itemTypeItem.type === actionConfig.type) {
            console.log(`ItemType drop - same item type: ${actionConfig.type}`);
            return false; // No change needed
          }

          // Validate that the target type is a valid item type
          const validItemTypes = ["item", "consumable", "weapon", "armor", "tool"];
          if (!validItemTypes.includes(actionConfig.type)) {
            console.log(`ItemType drop - invalid target type: ${actionConfig.type}`);
            ui.notifications.warn("Invalid item type.");
            return false;
          }

          console.log(`Converting item "${itemTypeItem.name}" from "${itemTypeItem.type}" to "${actionConfig.type}"`);

          // Convert the item type properly by creating a new item and deleting the old one
          return this._convertItemType(actorItemForType, actionConfig.type);
    
        default:
          // Check if this is a same-actor drop using drag data source actor ID
          if (data.type === "Item" && data.sourceActorId === this.actor.id) {
            // Item is being dropped back on its original owner - prevent duplication
            console.log("Preventing same-actor item duplication - sourceActorId:", data.sourceActorId, "matches target:", this.actor.id);
            event.stopImmediatePropagation(); // Stop all other event handlers
            return true; // Return true to indicate the drop was handled (prevent default)
          }
          console.log("Default drop - sourceActorId:", data.sourceActorId, "target:", this.actor.id, "allowing normal behavior");
          return false;
      }
    }

    /**
     * Convert an item from one type to another by creating a new item and deleting the old one
     * @param {Item} sourceItem - The original item to convert
     * @param {string} targetType - The target item type
     * @returns {Promise<Item>} The newly created item
     * @private
     */
    async _convertItemType(sourceItem, targetType) {
      try {
        // Check for potential data loss and show confirmation dialog
        const dataLossWarning = this._getDataLossWarning(sourceItem, targetType);
        const shouldProceed = await this._showConversionConfirmation(sourceItem.name, sourceItem.type, targetType, dataLossWarning);
        
        if (!shouldProceed) {
          console.log("Item conversion cancelled by user");
          return false;
        }

        // Extract core data that's common across all item types
        const coreData = {
          name: sourceItem.name,
          img: sourceItem.img,
          type: targetType,
          sort: sourceItem.sort,
          system: {
            description: sourceItem.system.description || ""
          }
        };

        // Map compatible data based on target type templates
        // Base template: description (already included)
        // Physical template: quantity, rollType, formula
        // Ability template: skillSet, type, value, roll, formula

        const hasPhysicalTemplate = ["item", "consumable", "weapon", "tool"].includes(targetType);
        const sourceHasPhysical = ["item", "consumable", "weapon", "tool"].includes(sourceItem.type);

        if (hasPhysicalTemplate && sourceHasPhysical) {
          // Transfer physical template data
          coreData.system.quantity = sourceItem.system.quantity || 1;
          coreData.system.rollType = sourceItem.system.rollType || "check";
          coreData.system.formula = sourceItem.system.formula || "";
        } else if (hasPhysicalTemplate) {
          // Set default physical template data
          coreData.system.quantity = 1;
          coreData.system.rollType = "check";
          coreData.system.formula = "";
        }

        // Add type-specific data with defaults
        switch (targetType) {
          case "item":
            coreData.system.type = sourceItem.system.type || "";
            break;

          case "consumable":
            coreData.system.type = sourceItem.system.type || "";
            coreData.system.duration = sourceItem.system.duration || "";
            break;

          case "weapon":
            coreData.system.weaponType = sourceItem.system.weaponType || "";
            coreData.system.rollType = "damage"; // Override for weapons
            coreData.system.rollable = true; // Weapons should be rollable
            coreData.system.roll = sourceItem.system.roll || {
              diceNum: 1,
              diceSize: "d10",
              diceBonus: 0
            };
            coreData.system.equipped = sourceItem.system.equipped || false;
            break;

          case "armor":
            // Armor doesn't use physical template, has its own quantity
            coreData.system.quantity = sourceItem.system.quantity || 1;
            coreData.system.armorType = sourceItem.system.armorType || "";
            coreData.system.armor = sourceItem.system.armor || 0;
            coreData.system.material = sourceItem.system.material || "";
            coreData.system.equipped = sourceItem.system.equipped || false;
            break;

          case "tool":
            coreData.system.type = sourceItem.system.type || "";
            coreData.system.uses = sourceItem.system.uses || {
              value: 1,
              min: 0,
              max: 1
            };
            break;
        }

        console.log("Creating new item with data:", coreData);

        // Create the new item
        const [newItem] = await this.actor.createEmbeddedDocuments("Item", [coreData]);
        
        // Delete the old item
        await sourceItem.delete();

        console.log(`Successfully converted item to ${targetType}:`, newItem);
        ui.notifications.info(`Converted "${sourceItem.name}" to ${targetType}`);
        
        return newItem;

      } catch (error) {
        console.error("Error converting item type:", error);
        ui.notifications.error(`Failed to convert item type: ${error.message}`);
        return false;
      }
    }

    /**
     * Analyze potential data loss when converting between item types
     * @param {Item} sourceItem - The source item
     * @param {string} targetType - The target item type
     * @returns {Array<string>} Array of warnings about data that will be lost
     * @private
     */
    _getDataLossWarning(sourceItem, targetType) {
      const warnings = [];
      const sourceType = sourceItem.type;

      // Define what data each type has
      const typeFeatures = {
        item: ['type'],
        consumable: ['type', 'duration'],
        weapon: ['weaponType', 'roll', 'equipped'],
        armor: ['armorType', 'armor', 'material', 'equipped'],
        tool: ['type', 'uses']
      };

      const sourceFeatures = typeFeatures[sourceType] || [];
      const targetFeatures = typeFeatures[targetType] || [];

      // Check for specific data that will be lost
      sourceFeatures.forEach(feature => {
        if (!targetFeatures.includes(feature)) {
          const value = sourceItem.system[feature];
          if (value !== undefined && value !== null && value !== "" && value !== 0) {
            switch (feature) {
              case 'weaponType':
                if (value) warnings.push(`Weapon type: "${value}"`);
                break;
              case 'armorType':
                if (value) warnings.push(`Armor type: "${value}"`);
                break;
              case 'armor':
                if (value) warnings.push(`Armor value: ${value}`);
                break;
              case 'material':
                if (value) warnings.push(`Material: "${value}"`);
                break;
              case 'duration':
                if (value) warnings.push(`Duration: "${value}"`);
                break;
              case 'equipped':
                if (value) warnings.push(`Equipped status`);
                break;
              case 'uses':
                if (value && (value.value || value.max)) warnings.push(`Uses: ${value.value}/${value.max}`);
                break;
              case 'roll':
                if (value && (value.diceNum || value.diceSize || value.diceBonus)) {
                  warnings.push(`Roll data: ${value.diceNum || 1}${value.diceSize || 'd10'}${value.diceBonus ? '+' + value.diceBonus : ''}`);
                }
                break;
              case 'type':
                if (value) warnings.push(`Subtype: "${value}"`);
                break;
            }
          }
        }
      });

      return warnings;
    }

    /**
     * Show confirmation dialog for item type conversion
     * @param {string} itemName - Name of the item being converted
     * @param {string} sourceType - Current item type
     * @param {string} targetType - Target item type
     * @param {Array<string>} dataLossWarnings - Array of data loss warnings
     * @returns {Promise<boolean>} Whether the user confirmed the conversion
     * @private
     */
    async _showConversionConfirmation(itemName, sourceType, targetType, dataLossWarnings) {
      let content = `<div style="color: black;">
        <p>Convert <strong>"${itemName}"</strong> from <strong>${sourceType}</strong> to <strong>${targetType}</strong>?</p>`;
      
      if (dataLossWarnings.length > 0) {
        content += `<div style="margin: 1rem 0;">
          <p><strong>Warning: The following data will be lost:</strong></p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            ${dataLossWarnings.map(warning => `<li>${warning}</li>`).join('')}
          </ul>
        </div>`;
      }

      content += `<p>This action cannot be undone.</p>
      </div>`;

      const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { 
          title: "Confirm Item Type Conversion"
        },
        content: content,
        yes: { 
          icon: "fas fa-check",
          label: "Convert"
        },
        no: { 
          icon: "fas fa-times",
          label: "Cancel"
        },
        defaultButton: "no",
        classes: ["how-to-be-a-hero", "dialog"]
      });

      return confirmed;
    }

    /**
     * Get the target actor from a drop event
     * @param {HTMLElement} dropTarget - The element where the item was dropped
     * @returns {Actor|null} The target actor or null if not dropping on another character
     * @private
     */
    _getTargetActor(dropTarget) {
      // Look for an actor sheet element that contains this drop target
      const sheetElement = dropTarget.closest('.how-to-be-a-hero.sheet.actor.character');
      if (!sheetElement) return null;

      // Get the sheet instance from the element
      const sheetId = sheetElement.id;
      if (!sheetId) return null;

      // Find the application with this ID in the app registry
      for (const app of Object.values(ui.windows)) {
        if (app.element && app.element.id === sheetId && app.document instanceof Actor) {
          return app.document;
        }
      }

      return null;
    }

    /**
     * Handle item exchange between actors
     * @param {DragEvent} event - The drag event
     * @param {Object} data - The drag data containing item information
     * @param {Actor} targetActor - The actor receiving the item
     * @returns {Promise<boolean>} Whether the exchange was successful
     * @private
     */
    async _handleItemExchange(event, data, targetActor) {
      console.log("Item exchange - data:", data, "target actor:", targetActor.name);
      
      if (data.type !== "Item") {
        console.log("Item exchange - not an item, rejecting");
        return false;
      }

      let sourceItem;
      try {
        sourceItem = await Item.implementation.fromDropData(data);
      } catch (error) {
        console.error("Item exchange - error getting item from drop data:", error);
        ui.notifications.error(`Failed to get item: ${error.message}`);
        return false;
      }
      
      if (!sourceItem) {
        console.log("Item exchange - sourceItem is null/undefined");
        return false;
      }

      // Check if this item belongs to the current actor (drag source)
      const actorItem = this.actor.items.get(sourceItem.id);
      if (!actorItem) {
        console.warn(`Item exchange - Item ${sourceItem.id} does not belong to source actor ${this.actor.name}`);
        ui.notifications.warn("This item does not belong to the source character.");
        return false;
      }

      // Validate that the item type is transferable
      const transferableTypes = ["item", "consumable", "weapon", "armor", "tool"];
      if (!transferableTypes.includes(sourceItem.type)) {
        console.log(`Item exchange - item type ${sourceItem.type} is not transferable`);
        ui.notifications.warn("This item type cannot be transferred between characters.");
        return false;
      }

      console.log(`Transferring item "${sourceItem.name}" from "${this.actor.name}" to "${targetActor.name}"`);

      // Create a copy of the item data for the target actor
      const itemData = sourceItem.toObject();
      delete itemData._id; // Remove the ID so a new one is generated

      try {
        // Add the item to the target actor
        const [newItem] = await targetActor.createEmbeddedDocuments("Item", [itemData]);
        console.log("Item exchange - created new item:", newItem);

        // Remove the item from the source actor
        await actorItem.delete();
        console.log("Item exchange - deleted source item");

        ui.notifications.info(`Transferred "${sourceItem.name}" from ${this.actor.name} to ${targetActor.name}`);
        
        return true;

      } catch (error) {
        console.error("Item exchange - error during transfer:", error);
        ui.notifications.error(`Failed to transfer item: ${error.message}`);
        return false;
      }
    }
  }