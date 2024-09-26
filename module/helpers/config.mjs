import { preLocalize } from "./utils.mjs";

export const HOW_TO_BE_A_HERO = {};
/**
 * The set of talents used within the system.
 * @type {Object}
 */
HOW_TO_BE_A_HERO.talents = {
  knowledge: {
    label: 'HTBAH.TalentKnowledge',
    long: 'HTBAH.TalentKnowledgeLong',
    abbreviation: 'HTBAH.TalentKnowledgeAbbr',
    eureka: 'HTBAH.TalentKnowledgeEureka'
  },
  action: {
    label: 'HTBAH.TalentAction',
    long: 'HTBAH.TalentActionLong',
    abbreviation: 'HTBAH.TalentActionAbbr',
    eureka: 'HTBAH.TalentActionEureka'
  },
  social: {
    label: 'HTBAH.TalentSocial',
    long: 'HTBAH.TalentSocialLong',
    abbreviation: 'HTBAH.TalentSocialAbbr',
    eureka: 'HTBAH.TalentSocialEureka'
  },
};
preLocalize("talents", { keys: ["label", "long", "abbreviation", "eureka"] });

/**
 * Conditions that can affect an actor.
 * @enum {ConditionConfiguration}
 */
HOW_TO_BE_A_HERO.conditionTypes = {
  bleeding: {
    label: "EFFECT.HTBAH.StatusBleeding",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/bleeding.svg",
    pseudo: true
  },
  blinded: {
    label: "HTBAH.ConBlinded",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/blinded.svg",
    special: "BLIND"
  },
  charmed: {
    label: "HTBAH.ConCharmed",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/charmed.svg"
  },
  cursed: {
    label: "EFFECT.HTBAH.StatusCursed",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/cursed.svg",
    pseudo: true
  },
  deafened: {
    label: "HTBAH.ConDeafened",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/deafened.svg",
  },
  diseased: {
    label: "HTBAH.ConDiseased",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/diseased.svg",
    pseudo: true
  },
  exhaustion: {
    label: "HTBAH.ConExhaustion",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/exhaustion.svg",
    levels: 6
  },
  frightened: {
    label: "HTBAH.ConFrightened",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/frightened.svg",
  },
  grappled: {
    label: "HTBAH.ConGrappled",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/grappled.svg",
  },
  incapacitated: {
    label: "HTBAH.ConIncapacitated",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/incapacitated.svg",
  },
  invisible: {
    label: "HTBAH.ConInvisible",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/invisible.svg",
  },
  paralyzed: {
    label: "HTBAH.ConParalyzed",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/paralyzed.svg",
    statuses: ["incapacitated"]
  },
  petrified: {
    label: "HTBAH.ConPetrified",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/petrified.svg",
    statuses: ["incapacitated"]
  },
  poisoned: {
    label: "HTBAH.ConPoisoned",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/poisoned.svg",
  },
  prone: {
    label: "HTBAH.ConProne",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/prone.svg",
  },
  restrained: {
    label: "HTBAH.ConRestrained",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/restrained.svg",
  },
  silenced: {
    label: "EFFECT.HTBAH.StatusSilenced",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/silenced.svg",
    pseudo: true
  },
  stunned: {
    label: "HTBAH.ConStunned",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/stunned.svg",
    statuses: ["incapacitated"]
  },
  surprised: {
    label: "EFFECT.HTBAH.StatusSurprised",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/surprised.svg",
    pseudo: true
  },
  transformed: {
    label: "EFFECT.HTBAH.StatusTransformed",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/transformed.svg",
    pseudo: true
  },
  unconscious: {
    label: "HTBAH.ConUnconscious",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/unconscious.svg",
    statuses: ["incapacitated", "prone"]
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
  noMovement: new Set(["exhaustion-5", "grappled", "paralyzed", "petrified", "restrained", "stunned", "unconscious"]),
  halfMovement: new Set(["exhaustion-2"]),
  crawl: new Set(["prone", "exceedingCarryingCapacity"]),
  petrification: new Set(["petrified"]),
  halfHealth: new Set(["exhaustion-4"])
};

/* -------------------------------------------- */

/**
 * Extra status effects not specified in `conditionTypes`. If the ID matches a core-provided effect, then this
 * data will be merged into the core data.
 * @enum {Omit<StatusEffectConfig5e, "img"> & {icon: string}}
 */
HOW_TO_BE_A_HERO.statusEffects = {
  burrowing: {
    name: "EFFECT.HTBAH.StatusBurrowing",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/burrowing.svg",
    special: "BURROW"
  },
  concentrating: {
    name: "EFFECT.HTBAH.StatusConcentrating",
    icon: "systems/how-to-be-a-hero/ui/icons/svg/statuses/concentrating.svg",
    special: "CONCENTRATING"
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
    item: "systems/how-to-be-a-hero/ui/icons/svg/items/tool.svg",
    consumable: "systems/how-to-be-a-hero/ui/icons/svg/items/consumable.svg",
    weapon: "systems/how-to-be-a-hero/ui/icons/svg/items/weapon.svg",
    armor: "systems/how-to-be-a-hero/ui/icons/svg/items/equipment.svg",
    tool: "systems/how-to-be-a-hero/ui/icons/svg/items/tool.svg",
    knowledge: "systems/how-to-be-a-hero/ui/icons/svg/items/knowledge.svg",
    action: "systems/how-to-be-a-hero/ui/icons/svg/items/action.svg",
    social: "systems/how-to-be-a-hero/ui/icons/svg/items/social.svg",
  }
};

export const conditionTypes = HOW_TO_BE_A_HERO.conditionTypes;