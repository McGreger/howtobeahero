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

  // Force dark mode for the system
  game.settings.register("how-to-be-a-hero", "forceDarkMode", {
    name: "HTBAH.Settings.ForceDarkMode.Name",
    hint: "HTBAH.Settings.ForceDarkMode.Hint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: (value) => {
      if (value) {
        // Immediately enforce dark mode when enabled
        enforceDarkMode();
      }
    }
  });
}

/**
 * Enforce dark mode by setting appropriate CSS classes/attributes
 */
export function enforceDarkMode() {
  // Remove light mode indicators
  document.documentElement.removeAttribute('data-color-scheme');
  document.body.removeAttribute('data-color-scheme');
  document.documentElement.classList.remove('light');
  document.body.classList.remove('light');
  
  // Set dark mode indicators
  document.documentElement.setAttribute('data-color-scheme', 'dark');
  document.documentElement.classList.add('dark');
  
  console.log("HowToBeAHero | Dark mode enforced");
}

