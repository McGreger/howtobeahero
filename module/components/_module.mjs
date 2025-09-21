// components/_module.mjs - Updated for AppV2 compatibility with better error handling
// Import custom html logic
import HowToBeAHeroSlideToggle from "./slide-toggle.mjs";
import HowToBeAHeroIcon from "./icon.mjs";
import FiligreeBoxElement from "./filigree-box.mjs";
import EffectsElement from "./effects.mjs";
import InventoryElement from "./inventory.mjs";
import ItemListControlsElement from "./item-list-controls.mjs";

// Enhanced ItemListControlsElement with AppV2 compatibility
class AppV2ItemListControlsElement extends ItemListControlsElement {
  connectedCallback() {
    try {
      // Ensure we have required properties before calling parent
      if (!this.form) {
        // Try to find the form in various ways
        this.form = this.closest('form') || 
                    this.getRootNode()?.querySelector?.('form') || 
                    document.querySelector('.how-to-be-a-hero form');
      }
      
      if (!this.sheet) {
        // Try to find the sheet reference
        const sheetElement = this.closest('.how-to-be-a-hero');
        if (sheetElement && sheetElement._sheet) {
          this.sheet = sheetElement._sheet;
        }
      }
      
      // Only call parent if we have the required context
      if (this.form && super.connectedCallback) {
        super.connectedCallback();
      } else {
        console.warn("HowToBeAHero | ItemListControlsElement: Missing required context, using fallback");
        this._initializeFallback();
      }
    } catch (error) {
      console.warn("HowToBeAHero | ItemListControlsElement connectedCallback error:", error);
      this._initializeFallback();
    }
  }
  
  _initializeFallback() {
    // Provide basic functionality when parent fails
    this.innerHTML = this.innerHTML || '<div class="item-controls"><!-- Basic controls --></div>';
    this.classList.add('fallback-controls');
  }
}

// Enhanced InventoryElement with AppV2 compatibility  
class AppV2InventoryElement extends InventoryElement {
  connectedCallback() {
    try {
      
      // Initialize _filters if it doesn't exist
      if (!this._filters) {
        this._filters = {};
      }
      
      // Ensure required properties
      if (!this.sheet) {
        const sheetElement = this.closest('.how-to-be-a-hero');
        if (sheetElement && sheetElement._sheet) {
          this.sheet = sheetElement._sheet;
        }
        
      }
      
      // Call parent with error handling
      if (super.connectedCallback) {
        super.connectedCallback();
      }
      
      // Initialize filter lists with safety check
      if (this._initializeFilterLists) {
        this._initializeFilterLists();
      }
      
      // Ensure context menu is set up
      setTimeout(() => {
        if (this.setupContextMenu) {
          this.setupContextMenu();
        }
      }, 100);
      
    } catch (error) {
      console.warn("HowToBeAHero | InventoryElement connectedCallback error:", error);
      this._initializeFallback();
    }
  }
  
  _initializeFilterLists() {
    try {
      // Ensure _filters exists before accessing
      if (!this._filters) {
        this._filters = {};
      }
      
      // Call parent method if it exists
      if (super._initializeFilterLists) {
        super._initializeFilterLists();
      }
    } catch (error) {
      console.warn("HowToBeAHero | InventoryElement _initializeFilterLists error:", error);
      // Initialize basic filter structure
      this._filters = {
        type: new Set(),
        equipped: new Set(),
        rarity: new Set()
      };
    }
  }
  
  _initializeFallback() {
    this.innerHTML = this.innerHTML || '<div class="inventory-fallback"><!-- Basic inventory --></div>';
    this.classList.add('fallback-inventory');
    this._filters = {};
  }
}

// Enhanced EffectsElement with AppV2 compatibility
class AppV2EffectsElement extends EffectsElement {
  connectedCallback() {
    try {
      // Ensure sheet context
      if (!this.sheet) {
        const sheetElement = this.closest('.how-to-be-a-hero');
        if (sheetElement && sheetElement._sheet) {
          this.sheet = sheetElement._sheet;
        }
      }
      
      if (super.connectedCallback) {
        super.connectedCallback();
      }
    } catch (error) {
      console.warn("HowToBeAHero | EffectsElement connectedCallback error:", error);
      this._initializeFallback();
    }
  }
  
  _initializeFallback() {
    this.innerHTML = this.innerHTML || '<div class="effects-fallback"><!-- Basic effects --></div>';
    this.classList.add('fallback-effects');
  }
}

// Function to safely define custom elements with enhanced error handling
function safeDefineElement(name, constructor, enhancedConstructor = null) {
  try {
    if (!customElements.get(name)) {
      // Use enhanced version if provided, otherwise use original
      const elementConstructor = enhancedConstructor || constructor;
      customElements.define(name, elementConstructor);
      return { success: true, enhanced: !!enhancedConstructor };
    } else {
      return { success: true, alreadyDefined: true };
    }
  } catch (error) {
    console.warn(`HowToBeAHero | Failed to define custom element ${name}:`, error);
    
    // Try with a basic fallback version
    try {
      if (!customElements.get(name)) {
        const fallbackConstructor = createFallbackElement(name);
        customElements.define(name, fallbackConstructor);
        return { success: true, fallback: true };
      }
    } catch (fallbackError) {
      console.error(`HowToBeAHero | Failed to define fallback for ${name}:`, fallbackError);
    }
    
    return { success: false, error: error.message };
  }
}

// Create fallback elements for when original constructors fail
function createFallbackElement(name) {
  return class extends HTMLElement {
    connectedCallback() {
      this.classList.add(`fallback-${name}`);
      
      // Add basic structure based on element type
      if (name.includes('icon')) {
        this._setupIconFallback();
      } else if (name.includes('toggle')) {
        this._setupToggleFallback();  
      } else if (name.includes('inventory')) {
        this._setupInventoryFallback();
      } else if (name.includes('effects')) {
        this._setupEffectsFallback();
      } else {
        this._setupGenericFallback();
      }
    }
    
    _setupIconFallback() {
      const src = this.getAttribute('src');
      if (src && !this.querySelector('img')) {
        const img = document.createElement('img');
        img.src = src;
        img.style.width = '1em';
        img.style.height = '1em';
        img.style.objectFit = 'contain';
        this.appendChild(img);
      }
    }
    
    _setupToggleFallback() {
      if (!this.querySelector('input')) {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = this.hasAttribute('checked');
        input.addEventListener('change', (e) => {
          this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
        });
        this.appendChild(input);
      }
    }
    
    _setupInventoryFallback() {
      if (!this.innerHTML.trim()) {
        this.innerHTML = '<div class="inventory-placeholder">Inventory</div>';
      }
    }
    
    _setupEffectsFallback() {
      if (!this.innerHTML.trim()) {
        this.innerHTML = '<div class="effects-placeholder">Effects</div>';
      }
    }
    
    _setupGenericFallback() {
      if (!this.innerHTML.trim()) {
        this.innerHTML = `<div class="${name}-placeholder">${name}</div>`;
      }
    }
  };
}

// Function to initialize all custom elements with enhanced versions for AppV2
export function initializeCustomElements() {
 
  const results = {
    'slide-toggle': safeDefineElement("slide-toggle", HowToBeAHeroSlideToggle),
    'htbah-effects': safeDefineElement("htbah-effects", EffectsElement, AppV2EffectsElement),
    'htbah-inventory': safeDefineElement("htbah-inventory", InventoryElement, AppV2InventoryElement),
    'htbah-icon': safeDefineElement("htbah-icon", HowToBeAHeroIcon),
    'filigree-box': safeDefineElement("filigree-box", FiligreeBoxElement),
    'item-list-controls': safeDefineElement("item-list-controls", ItemListControlsElement, AppV2ItemListControlsElement)
  };
  
  // Check if any elements failed completely
  const failed = Object.entries(results).filter(([name, result]) => !result.success);
  if (failed.length > 0) {
    console.warn("HowToBeAHero | Some custom elements failed to initialize:", failed);
    // Set up global fallbacks
    setupGlobalFallbacks();
  }
  
  return results;
}

// Set up global fallbacks for completely failed elements
function setupGlobalFallbacks() {
  
  // Add CSS fallbacks
  if (!document.querySelector('#htbah-fallback-styles')) {
    const style = document.createElement('style');
    style.id = 'htbah-fallback-styles';
    style.textContent = `
      /* Fallback styles for failed custom elements */
      htbah-icon:not(.initialized):not(.fallback-icon) {
        display: inline-block;
        width: 1em;
        height: 1em;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>') center/contain no-repeat;
        vertical-align: middle;
      }
      
      htbah-icon.fallback-icon {
        background: none !important;
      }
      
      slide-toggle:not(.initialized) {
        display: inline-block;
        width: 40px;
        height: 20px;
        background: #ccc;
        border-radius: 10px;
        cursor: pointer;
        position: relative;
      }
      
      slide-toggle:not(.initialized):before {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        transition: left 0.2s;
      }
      
      slide-toggle:not(.initialized)[checked]:before {
        left: 22px;
      }
      
      .fallback-controls,
      .fallback-inventory,
      .fallback-effects {
        border: 1px dashed #666;
        padding: 0.5em;
        margin: 0.25em;
        opacity: 0.7;
        font-size: 0.8em;
        color: #666;
      }
    `;
    document.head.appendChild(style);
  }
}

// Enhanced upgrade function for existing elements in the DOM
export function upgradeExistingElements(containerElement = document) {
  
  const elementNames = [
    'htbah-icon',
    'slide-toggle', 
    'filigree-box',
    'htbah-effects',
    'htbah-inventory',
    'item-list-controls'
  ];
  
  elementNames.forEach(name => {
    const elements = containerElement.querySelectorAll(name);
    elements.forEach(element => {
      try {
        if (element.constructor === HTMLElement || element.constructor === HTMLUnknownElement) {
          customElements.upgrade(element);
        }
        
        // Mark as initialized to prevent fallback styling
        element.classList.add('initialized');
        
        // Provide context for AppV2 elements
        if (name === 'item-list-controls' || name === 'htbah-inventory' || name === 'htbah-effects') {
          const sheetElement = element.closest('.how-to-be-a-hero');
          if (sheetElement && sheetElement._sheet) {
            Object.defineProperty(element, 'sheet', {
              get: () => sheetElement._sheet,
              configurable: true
            });
          }
          
          if (name === 'item-list-controls') {
            const form = element.closest('form') || containerElement.querySelector('form');
            if (form) {
              Object.defineProperty(element, 'form', {
                get: () => form,
                configurable: true
              });
            }
          }
          
          if (name === 'htbah-inventory' && !element._filters) {
            element._filters = {};
          }
        }
        
      } catch (error) {
        console.warn(`HowToBeAHero | Error upgrading ${name}:`, error);
      }
    });
  });
}

// Auto-initialize on import (for backward compatibility)
const initResults = initializeCustomElements();

// Export classes (original and enhanced versions)
export {
  HowToBeAHeroSlideToggle,
  HowToBeAHeroIcon,
  FiligreeBoxElement,
  EffectsElement,
  InventoryElement, 
  ItemListControlsElement,
  // Enhanced versions
  AppV2ItemListControlsElement,
  AppV2InventoryElement,
  AppV2EffectsElement,
  initResults
};

// Export config with enhanced versions
export const config = {
  slidetoggle: HowToBeAHeroSlideToggle,
  icon: HowToBeAHeroIcon,
  filigree: FiligreeBoxElement,
  effects: AppV2EffectsElement,      // Use enhanced version
  inventory: AppV2InventoryElement,   // Use enhanced version  
  itemlistcontrol: AppV2ItemListControlsElement // Use enhanced version
};

// Export initialization status
export const customElementsReady = initResults;

// Export utility functions
export { setupGlobalFallbacks, createFallbackElement };