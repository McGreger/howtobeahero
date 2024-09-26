// Import custom html logic
import HowToBeAHeroSlideToggle from "./slide-toggle.mjs";
import HowToBeAHeroIcon from "./icon.mjs";
import FiligreeBoxElement from "./filigree-box.mjs";
import EffectsElement from "./effects.mjs";
import InventoryElement from "./inventory.mjs";
import ItemListControlsElement from "./item-list-controls.mjs";

window.customElements.define("slide-toggle", HowToBeAHeroSlideToggle);
window.customElements.define("htbah-effects", EffectsElement);
window.customElements.define("htbah-inventory", InventoryElement);
window.customElements.define("htbah-icon", HowToBeAHeroIcon);
window.customElements.define("filigree-box", FiligreeBoxElement);
window.customElements.define("item-list-controls", ItemListControlsElement);

export {
    // Export custom html logic
    HowToBeAHeroSlideToggle,
    HowToBeAHeroIcon,
    FiligreeBoxElement,
    EffectsElement,
    InventoryElement,
    ItemListControlsElement
  };

export const config = {
    slidetoggle: HowToBeAHeroSlideToggle,
    icon: HowToBeAHeroIcon,
    filigree: FiligreeBoxElement,
    effects: EffectsElement,
    inventory: InventoryElement,
    itemlistcontrol: ItemListControlsElement
  };