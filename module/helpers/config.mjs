import { preLocalize } from "./utils.mjs";

export const HOW_TO_BE_A_HERO = {};
/**
 * The set of skillSets used within the system.
 * @type {Object}
 */
HOW_TO_BE_A_HERO.skillSets = {
  action: {
    label: 'HOW_TO_BE_A_HERO.SkillSets.Action.label',
    long: 'HOW_TO_BE_A_HERO.SkillSets.Action.long',
    abbreviation: 'HOW_TO_BE_A_HERO.SkillSets.Action.abbr',
    eureka: 'HOW_TO_BE_A_HERO.SkillSets.Action.eureka'
  },
  knowledge: {
    label: 'HOW_TO_BE_A_HERO.SkillSets.Knowledge.label',
    long: 'HOW_TO_BE_A_HERO.SkillSets.Knowledge.long',
    abbreviation: 'HOW_TO_BE_A_HERO.SkillSets.Knowledge.abbr',
    eureka: 'HOW_TO_BE_A_HERO.SkillSets.Knowledge.eureka'
  },
  social: {
    label: 'HOW_TO_BE_A_HERO.SkillSets.Social.label',
    long: 'HOW_TO_BE_A_HERO.SkillSets.Social.long',
    abbreviation: 'HOW_TO_BE_A_HERO.SkillSets.Social.abbr',
    eureka: 'HOW_TO_BE_A_HERO.SkillSets.Social.eureka'
  }
};
preLocalize("skillSets", { keys: ["label", "long", "abbreviation", "eureka"] });

/**
* Conditions that can affect an actor.
* @enum {ConditionConfiguration}
*/
HOW_TO_BE_A_HERO.conditionTypes = {
  bleeding: {
    label: "EFFECT.HTBAH.StatusBleeding",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/bleeding.svg",
    pseudo: true,
    statuses: ["bleeding"]
  },
  blinded: {
    label: "HTBAH.ConBlinded",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/blinded.svg",
    special: "BLIND",
    statuses: ["blind"]
  },
  charmed: {
    label: "HTBAH.ConCharmed",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/charmed.svg",
    statuses: ["charm"]
  },
  cursed: {
    label: "EFFECT.HTBAH.StatusCursed",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/cursed.svg",
    pseudo: true,
    statuses: ["curse"]
  },
  deafened: {
    label: "HTBAH.ConDeafened",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/deafened.svg",
    statuses: ["deaf"]
  },
  diseased: {
    label: "HTBAH.ConDiseased",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/diseased.svg",
    pseudo: true,
    statuses: ["disease"]
  },
  frightened: {
    label: "HTBAH.ConFrightened",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/frightened.svg",
    statuses: ["fear"]
  },
  grappled: {
    label: "HTBAH.ConGrappled",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/grappled.svg",
    statuses: ["grapple"]
  },
  incapacitated: {
    label: "HTBAH.ConIncapacitated",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/incapacitated.svg",
    statuses: ["incapacitated"]
  },
  invisible: {
    label: "HTBAH.ConInvisible",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/invisible.svg",
    statuses: ["invisible"]
  },
  paralyzed: {
    label: "HTBAH.ConParalyzed",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/paralyzed.svg",
    statuses: ["paralysis", "incapacitated"]
  },
  petrified: {
    label: "HTBAH.ConPetrified",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/petrified.svg",
    statuses: ["petrified", "incapacitated"]
  },
  poisoned: {
    label: "HTBAH.ConPoisoned",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/poisoned.svg",
    statuses: ["poison"]
  },
  prone: {
    label: "HTBAH.ConProne",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/prone.svg",
    statuses: ["prone"]
  },
  restrained: {
    label: "HTBAH.ConRestrained",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/restrained.svg",
    statuses: ["restrain"]
  },
  silenced: {
    label: "EFFECT.HTBAH.StatusSilenced",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/silenced.svg",
    pseudo: true,
    statuses: ["silence"]
  },
  stunned: {
    label: "HTBAH.ConStunned",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/stunned.svg",
    statuses: ["stun", "incapacitated"]
  },
  unconscious: {
    label: "HTBAH.ConUnconscious",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/unconscious.svg",
    statuses: ["unconscious", "incapacitated", "prone"]
  },
  asleep: {
    label: "EFFECT.HTBAH.StatusAsleep",
    icon: "icons/svg/sleep.svg",
    statuses: ["sleep"]
  },
  burning: {
    label: "EFFECT.HTBAH.StatusBurning",
    icon: "icons/svg/fire.svg",
    statuses: ["burning"]
  },
  corroding: {
    label: "EFFECT.HTBAH.StatusCorroding",
    icon: "icons/svg/acid.svg",
    statuses: ["corrode"]
  },
  frozen: {
    label: "EFFECT.HTBAH.StatusFrozen",
    icon: "icons/svg/frozen.svg",
    statuses: ["frozen"]
  },
  shocked: {
    label: "EFFECT.HTBAH.StatusShocked",
    icon: "icons/svg/lightning.svg",
    statuses: ["shock"]
  },
  weakened: {
    label: "EFFECT.HTBAH.StatusWeakened",
    icon: "icons/svg/downgrade.svg",
    statuses: ["downgrade"]
  },
  empowered: {
    label: "EFFECT.HTBAH.StatusEmpowered",
    icon: "icons/svg/upgrade.svg",
    statuses: ["upgrade"]
  },
  regenerating: {
    label: "EFFECT.HTBAH.StatusRegenerating",
    icon: "icons/svg/regen.svg",
    statuses: ["regen"]
  },
  degenerating: {
    label: "EFFECT.HTBAH.StatusDegenerating",
    icon: "icons/svg/degen.svg",
    statuses: ["degen"]
  },
  targeted: {
    label: "EFFECT.HTBAH.StatusTargeted",
    icon: "icons/svg/target.svg",
    statuses: ["target"]
  },
  marked: {
    label: "EFFECT.HTBAH.StatusMarked",
    icon: "icons/svg/eye.svg",
    statuses: ["eye"]
  },
  blessed: {
    label: "EFFECT.HTBAH.StatusBlessed",
    icon: "icons/svg/angel.svg",
    statuses: ["bless"]
  },
  holyShield: {
    label: "EFFECT.HTBAH.StatusHolyShield",
    icon: "icons/svg/holy-shield.svg",
    statuses: ["holyShield"]
  },
  magicShield: {
    label: "EFFECT.HTBAH.StatusMagicShield",
    icon: "icons/svg/mage-shield.svg",
    statuses: ["magicShield"]
  },
  iceShield: {
    label: "EFFECT.HTBAH.StatusIceShield",
    icon: "icons/svg/ice-shield.svg",
    statuses: ["coldShield"]
  },
  fireShield: {
    label: "EFFECT.HTBAH.StatusFireShield",
    icon: "icons/svg/fire-shield.svg",
    statuses: ["fireShield"]
  },
  // Additional specialized conditions from your statusEffects
  dodging: {
    label: "EFFECT.HTBAH.StatusDodging",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/dodging.svg",
    statuses: ["dodge"]
  },
  ethereal: {
    label: "EFFECT.HTBAH.StatusEthereal",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/ethereal.svg",
    statuses: ["ethereal"]
  },
  flying: {
    label: "EFFECT.HTBAH.StatusFlying",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/flying.svg",
    special: "FLY",
    statuses: ["fly"]
  },
  hiding: {
    label: "EFFECT.HTBAH.StatusHiding",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/hiding.svg",
    statuses: ["hide"]
  },
  hovering: {
    label: "EFFECT.HTBAH.StatusHovering",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/hovering.svg",
    special: "HOVER",
    statuses: ["hover"]
  },
  stable: {
    label: "EFFECT.HTBAH.StatusStable",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/stable.svg",
    statuses: ["stable"]
  }
};

// Also add these additional status effects if you use them
HOW_TO_BE_A_HERO.statusEffects = {
  // Original Statuses
  burrowing: {
    name: "EFFECT.HTBAH.StatusBurrowing",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/burrowing.svg",
    special: "BURROW",
    statuses: ["burrow"]
  },
  dead: {
    name: "EFFECT.HTBAH.StatusDead",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/dead.svg",
    special: "DEFEATED",
    statuses: ["dead"]
  },
  // Additional Core Foundry Statuses
  asleep: {
    name: "EFFECT.HTBAH.StatusAsleep",
    icon: "icons/svg/sleep.svg",
    statuses: ["sleep"]
  },
  burning: {
    name: "EFFECT.HTBAH.StatusBurning", 
    icon: "icons/svg/fire.svg",
    statuses: ["burning"]
  },
  corroding: {
    name: "EFFECT.HTBAH.StatusCorroding",
    icon: "icons/svg/acid.svg",
    statuses: ["corrode"]
  },
  frozen: {
    name: "EFFECT.HTBAH.StatusFrozen",
    icon: "icons/svg/frozen.svg",
    statuses: ["frozen"]
  },
  shocked: {
    name: "EFFECT.HTBAH.StatusShocked",
    icon: "icons/svg/lightning.svg",
    statuses: ["shock"]
  },
  weakened: {
    name: "EFFECT.HTBAH.StatusWeakened",
    icon: "icons/svg/downgrade.svg",
    statuses: ["downgrade"]
  },
  empowered: {
    name: "EFFECT.HTBAH.StatusEmpowered",
    icon: "icons/svg/upgrade.svg",
    statuses: ["upgrade"]
  },
  regenerating: {
    name: "EFFECT.HTBAH.StatusRegenerating",
    icon: "icons/svg/regen.svg",
    statuses: ["regen"]
  },
  degenerating: {
    name: "EFFECT.HTBAH.StatusDegenerating",
    icon: "icons/svg/degen.svg",
    statuses: ["degen"]
  },
  targeted: {
    name: "EFFECT.HTBAH.StatusTargeted",
    icon: "icons/svg/target.svg",
    statuses: ["target"]
  },
  marked: {
    name: "EFFECT.HTBAH.StatusMarked",
    icon: "icons/svg/eye.svg",
    statuses: ["eye"]
  },
  blessed: {
    name: "EFFECT.HTBAH.StatusBlessed",
    icon: "icons/svg/angel.svg",
    statuses: ["bless"]
  },
  holyShield: {
    name: "EFFECT.HTBAH.StatusHolyShield",
    icon: "icons/svg/holy-shield.svg",
    statuses: ["holyShield"]
  },
  magicShield: {
    name: "EFFECT.HTBAH.StatusMagicShield",
    icon: "icons/svg/mage-shield.svg",
    statuses: ["magicShield"]
  },
  iceShield: {
    name: "EFFECT.HTBAH.StatusIceShield",
    icon: "icons/svg/ice-shield.svg",
    statuses: ["coldShield"]
  },
  fireShield: {
    name: "EFFECT.HTBAH.StatusFireShield",
    icon: "icons/svg/fire-shield.svg",
    statuses: ["fireShield"]
  },
  // Keep your other existing statuses
  dodging: {
    name: "EFFECT.HTBAH.StatusDodging",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/dodging.svg",
    statuses: ["dodge"]
  },
  ethereal: {
    name: "EFFECT.HTBAH.StatusEthereal",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/ethereal.svg",
    statuses: ["ethereal"]
  },
  flying: {
    name: "EFFECT.HTBAH.StatusFlying",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/flying.svg",
    special: "FLY",
    statuses: ["fly"]
  },
  hiding: {
    name: "EFFECT.HTBAH.StatusHiding",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/hiding.svg",
    statuses: ["hide"]
  },
  hovering: {
    name: "EFFECT.HTBAH.StatusHovering",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/hovering.svg",
    special: "HOVER",
    statuses: ["hover"]
  },
  sleeping: {
    name: "EFFECT.HTBAH.StatusSleeping",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/sleeping.svg",
    statuses: ["sleep", "incapacitated", "prone"]
  },
  stable: {
    name: "EFFECT.HTBAH.StatusStable",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/stable.svg",
    statuses: ["stable"]
  }
};
preLocalize("conditionTypes", { key: "label", sort: true });

/* -------------------------------------------- */

/**
 * Various effects of conditions and which conditions apply it. Either keys for the conditions,
 * and with a number appended for a level of exhaustion.
 * @enum {object}
 */
HOW_TO_BE_A_HERO.conditionEffects = {
  noMovement: new Set(["grappled", "paralyzed", "petrified", "restrained", "stunned", "unconscious"]),
  crawl: new Set(["prone"]),
  petrification: new Set(["petrified"]),
};

/* -------------------------------------------- */

/**
 * Configure token ring effects colors 
 */
export const tokenRingColors = {
  damage: 0xFF0000,
  defeated: 0x000000,
  healing: 0x00FF00,
  temp: 0x33AAFF
};

/* -------------------------------------------- */

/**
 * Configure token HP bar colors
 */
export const tokenHPColors = {
  damage: 0xFF0000,
  healing: 0x00FF00,
  temp: 0x66CCFF,
  tempmax: 0x440066,
  negmax: 0x550000
};
/* -------------------------------------------- */

/**
 * Extra status effects not specified in `conditionTypes`. If the ID matches a core-provided effect, then this
 * data will be merged into the core data.
 * @enum {StatusEffectConfig}
 */
HOW_TO_BE_A_HERO.statusEffects = {
  burrowing: {
    name: "EFFECT.HTBAH.StatusBurrowing",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/burrowing.svg",
    special: "BURROW"
  },
  dead: {
    name: "EFFECT.HTBAH.StatusDead",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/dead.svg",
    special: "DEFEATED"
  },
  dodging: {
    name: "EFFECT.HTBAH.StatusDodging",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/dodging.svg"
  },
  ethereal: {
    name: "EFFECT.HTBAH.StatusEthereal",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/ethereal.svg"
  },
  flying: {
    name: "EFFECT.HTBAH.StatusFlying",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/flying.svg",
    special: "FLY"
  },
  hiding: {
    name: "EFFECT.HTBAH.StatusHiding",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/hiding.svg"
  },
  hovering: {
    name: "EFFECT.HTBAH.StatusHovering",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/hovering.svg",
    special: "HOVER"
  },
  marked: {
    name: "EFFECT.HTBAH.StatusMarked",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/marked.svg"
  },
  sleeping: {
    name: "EFFECT.HTBAH.StatusSleeping",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/sleeping.svg",
    statuses: ["incapacitated", "prone", "unconscious"]
  },
  stable: {
    name: "EFFECT.HTBAH.StatusStable",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/stable.svg"
  }
};

/* -------------------------------------------- */

/**
 * Denominations of hit dice which can apply to classes.
 * @type {string[]}
 */
HOW_TO_BE_A_HERO.hitDieTypes = ["d4", "d6", "d8", "d10", "d12"];

/* -------------------------------------------- */

/**
 * Default artwork configuration for each Document type and sub-type.
 * @type {Record<string, Record<string, string>>}
 */
HOW_TO_BE_A_HERO.defaultArtwork = {
  Item: {
    item: "systems/how-to-be-a-hero/ui/icons/svg/items/swap-bag.svg",
    consumable: "systems/how-to-be-a-hero/ui/icons/svg/items/potion-ball.svg",
    weapon: "systems/how-to-be-a-hero/ui/icons/svg/items/sharp-axe.svg",
    armor: "systems/how-to-be-a-hero/ui/icons/svg/items/armor-vest.svg",
    tool: "systems/how-to-be-a-hero/ui/icons/svg/items/3d-hammer.svg",
    ability: "systems/how-to-be-a-hero/ui/icons/svg/items/skills.svg",
  }
};

export const conditionTypes = HOW_TO_BE_A_HERO.conditionTypes;