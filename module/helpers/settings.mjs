/**
 * Register all of the system's settings.
 */
export function registerSystemSettings() {
  // Internal System Migration Version
  game.settings.register("how-to-be-a-hero", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  // Debug Mode
  game.settings.register("how-to-be-a-hero", "debugMode", {
    name: "HTBAH.Settings.Debug.Name",
    hint: "HTBAH.Settings.Debug.Hint",
    scope: "world",
    config: true,
    default: false,
    type: Boolean
  });

  // Auto-collapse item cards in chat
  game.settings.register("how-to-be-a-hero", "autoCollapseItemCards", {
    name: "HTBAH.Settings.CollapseCards.Name",
    hint: "HTBAH.Settings.CollapseCards.Hint",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    onChange: s => {
      ui.chat.render();
    }
  });

  // Initiative formula
  game.settings.register("how-to-be-a-hero", "initiativeFormula", {
    name: "HTBAH.Settings.Initiative.Name",
    hint: "HTBAH.Settings.Initiative.Hint",
    scope: "world",
    config: true,
    default: "1d10 + @skillSets.action.mod",
    type: String
  });

  // Module art configuration (for token artwork)
  game.settings.register("how-to-be-a-hero", "moduleArtConfiguration", {
    name: "Module Art Configuration",
    scope: "world",
    config: false,
    type: Object,
    default: {
      "how-to-be-a-hero": {
        portraits: true,
        tokens: true
      }
    }
  });
}

