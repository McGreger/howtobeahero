// Import Actor data
import HowToBeAHeroCharacter from "./actor/character.mjs";
import HowToBeAHeroNPC from "./actor/npc.mjs";

// Import Item data
import HowToBeAHeroItem from "./item/item.mjs";
import HowToBeAHeroConsumable from "./item/consumable.mjs";
import HowToBeAHeroWeapon from "./item/weapon.mjs";
import HowToBeAHeroArmor from "./item/armor.mjs";
import HowToBeAHeroTool from "./item/tool.mjs";

// Import Skill data
import HowToBeAHeroKnowledge from "./item/knowledge.mjs"
import HowToBeAHeroAction from "./item/action.mjs"
import HowToBeAHeroSocial from "./item/social.mjs"

// Import Effect data
import HowToBeAHeroActiveEffectData from "./effect/active-effect.mjs";


export {
    // Export character types
    HowToBeAHeroCharacter,
    HowToBeAHeroNPC,
    // Export item types
    HowToBeAHeroItem,
    HowToBeAHeroConsumable,
    HowToBeAHeroWeapon,
    HowToBeAHeroArmor,
    HowToBeAHeroTool,
    HowToBeAHeroKnowledge,
    HowToBeAHeroAction,
    HowToBeAHeroSocial,
    // Export effect types
    HowToBeAHeroActiveEffectData
  };

// Export base actor
export {default as HowToBeAHeroActorBase} from "./actor/actor-base.mjs";

// Export base item
export {default as HowToBeAHeroItemBase} from "./item/item-base.mjs";

export const config = {
    character: HowToBeAHeroCharacter,
    npc: HowToBeAHeroNPC,
    item: HowToBeAHeroItem,
    consumable: HowToBeAHeroConsumable,
    weapon: HowToBeAHeroWeapon,
    armor: HowToBeAHeroArmor,
    tool: HowToBeAHeroTool,
    action: HowToBeAHeroAction,
    knowledge: HowToBeAHeroKnowledge,
    social: HowToBeAHeroSocial,
    effect: HowToBeAHeroActiveEffectData,
  };