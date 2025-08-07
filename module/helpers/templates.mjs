/* -------------------------------------------- */
/*  AppV2-Optimized Handlebars Template Loading */
/* -------------------------------------------- */

/**
 * Preload Handlebars templates for AppV2 compatibility
 * This handles both the new PARTS system and traditional partials
 * @returns {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  console.log("HowToBeAHero | Loading Handlebars templates for AppV2...");

  // Define all template paths
  const templates = {
    // Main actor sheet templates (for PARTS system)
    main: [
      "systems/how-to-be-a-hero/templates/actor/actor-character-sheet.hbs"
    ],
    
    // Tab partials (can be used if you switch back to multi-part rendering)
    tabs: [
      "systems/how-to-be-a-hero/templates/actor/tabs/character-details.hbs",
      "systems/how-to-be-a-hero/templates/actor/tabs/character-inventory.hbs",
      "systems/how-to-be-a-hero/templates/actor/tabs/character-biography.hbs",
      "systems/how-to-be-a-hero/templates/actor/tabs/character-effects.hbs"
    ],
    
    // Actor parts partials
    parts: [
      "systems/how-to-be-a-hero/templates/actor/parts/actor-items.hbs"
    ],
    
    // Item partials (for ItemSheet - still v1)
    items: [
      "systems/how-to-be-a-hero/templates/item/parts/item-effects.hbs",
      "systems/how-to-be-a-hero/templates/item/parts/item-description.hbs",
      "systems/how-to-be-a-hero/templates/item/parts/item-tooltip.hbs"
    ],

    // Dialog templates (for AppV2 dialogs)
    dialogs: [
      "systems/how-to-be-a-hero/templates/dialogs/create-item.hbs"
    ]
  };

  // Flatten all templates into a single array
  const allTemplates = [
    ...templates.main,
    ...templates.tabs,
    ...templates.parts,
    ...templates.items,
    ...templates.dialogs
  ];

  try {
    // STEP 1: Check if templates exist
    console.log("HowToBeAHero | Checking template availability...");
    const templateChecks = await Promise.allSettled(
      allTemplates.map(async (path) => {
        try {
          const response = await fetch(path);
          return { path, exists: response.ok };
        } catch (error) {
          return { path, exists: false, error: error.message };
        }
      })
    );

    const existingTemplates = templateChecks
      .filter(result => result.status === 'fulfilled' && result.value.exists)
      .map(result => result.value.path);

    const missingTemplates = templateChecks
      .filter(result => result.status === 'fulfilled' && !result.value.exists)
      .map(result => result.value.path);

    if (missingTemplates.length > 0) {
      console.warn("HowToBeAHero | Missing templates:", missingTemplates);
    }

    console.log(`HowToBeAHero | Found ${existingTemplates.length}/${allTemplates.length} templates`);

    // STEP 2: Create paths object for loadTemplates (traditional approach)
    const paths = {};
    
    // Add existing templates with both .html and partial name mappings
    for (const path of existingTemplates) {
      // Standard .html mapping for loadTemplates
      paths[path.replace(".hbs", ".html")] = path;
      
      // Partial name mapping (htbah.template-name)
      const partialName = `htbah.${path.split("/").pop().replace(".hbs", "")}`;
      paths[partialName] = path;
    }

    // STEP 3: Load templates using Foundry's loadTemplates
    console.log("HowToBeAHero | Loading templates via loadTemplates...");
    await loadTemplates(paths);

    // STEP 4: Verify critical templates for AppV2
    const criticalTemplates = [
      "systems/how-to-be-a-hero/templates/actor/actor-character-sheet.hbs"
    ];

    const criticalMissing = criticalTemplates.filter(path => !existingTemplates.includes(path));
    
    if (criticalMissing.length > 0) {
      console.error("HowToBeAHero | CRITICAL: Missing required templates:", criticalMissing);
      ui.notifications.error(`How To Be A Hero: Missing critical templates: ${criticalMissing.join(', ')}`);
      return { success: false, missing: criticalMissing };
    }

    // STEP 5: Verify partials are registered
    console.log("HowToBeAHero | Verifying partial registration...");
    const expectedPartials = [
      'htbah.character-details',
      'htbah.character-inventory', 
      'htbah.character-effects',
      'htbah.character-biography'
    ];

    const registeredPartials = expectedPartials.filter(name => {
      const isRegistered = !!Handlebars.partials[name];
      if (!isRegistered) {
        console.log(`HowToBeAHero | Partial '${name}' not registered (template may not exist)`);
      }
      return isRegistered;
    });

    console.log(`HowToBeAHero | Registered partials: ${registeredPartials.length}/${expectedPartials.length}`);

    // STEP 6: Success summary
    const summary = {
      success: true,
      totalTemplates: allTemplates.length,
      existingTemplates: existingTemplates.length,
      missingTemplates: missingTemplates.length,
      registeredPartials: registeredPartials.length,
      criticalTemplatesMissing: criticalMissing.length
    };

    console.log("HowToBeAHero | Template loading completed successfully");
    console.log("HowToBeAHero | Summary:", summary);

    return summary;

  } catch (error) {
    console.error("HowToBeAHero | Template loading failed:", error);
    ui.notifications.error("How To Be A Hero: Failed to load templates. Check console for details.");
    return { success: false, error: error.message };
  }
};

/**
 * Verify that AppV2 requirements are met
 * @returns {boolean} Whether AppV2 is properly configured
 */
export const verifyAppV2Requirements = function() {
  console.log("HowToBeAHero | Verifying AppV2 requirements...");
  
  const checks = {
    foundryVersion: game.version,
    hasHandlebarsApplicationMixin: !!foundry.applications?.api?.HandlebarsApplicationMixin,
    hasActorSheetV2: !!foundry.applications?.sheets?.ActorSheetV2,
    hasApplicationV2: !!foundry.applications?.api?.ApplicationV2
  };

  console.log("HowToBeAHero | AppV2 Environment Check:", checks);

  const isAppV2Ready = checks.hasHandlebarsApplicationMixin && 
                       checks.hasActorSheetV2 && 
                       checks.hasApplicationV2;

  if (!isAppV2Ready) {
    console.error("HowToBeAHero | AppV2 requirements not met:", {
      missing: Object.entries(checks)
        .filter(([key, value]) => key !== 'foundryVersion' && !value)
        .map(([key]) => key)
    });
  } else {
    console.log("HowToBeAHero | AppV2 requirements satisfied");
  }

  return isAppV2Ready;
};

/**
 * Enhanced template loading with AppV2 PARTS integration
 * This can be used if you want to switch to multi-part rendering later
 * @returns {Promise<Object>} Template configuration for PARTS
 */
export const prepareAppV2Parts = async function() {
  console.log("HowToBeAHero | Preparing AppV2 PARTS configuration...");

  // Define potential parts (you can enable these later)
  const partConfigs = {
    // Single part approach (current)
    single: {
      form: {
        template: "systems/how-to-be-a-hero/templates/actor/actor-character-sheet.hbs",
        scrollable: [".main-content"]
      }
    },

    // Multi-part approach (for future use)
    multipart: {
      header: {
        template: "systems/how-to-be-a-hero/templates/actor/parts/actor-header.hbs"
      },
      tabs: {
        template: "systems/how-to-be-a-hero/templates/actor/parts/actor-tabs.hbs"
      },
      details: {
        template: "systems/how-to-be-a-hero/templates/actor/tabs/character-details.hbs",
        scrollable: [".skillSets-container"]
      },
      inventory: {
        template: "systems/how-to-be-a-hero/templates/actor/tabs/character-inventory.hbs",
        scrollable: [".items-list"]
      },
      effects: {
        template: "systems/how-to-be-a-hero/templates/actor/tabs/character-effects.hbs",
        scrollable: [".effects-list"]
      },
      biography: {
        template: "systems/how-to-be-a-hero/templates/actor/tabs/character-biography.hbs"
      }
    }
  };

  // Check which templates exist
  const templateExists = async (path) => {
    try {
      const response = await fetch(path);
      return response.ok;
    } catch {
      return false;
    }
  };

  // Verify single part exists (required)
  const singlePartExists = await templateExists(partConfigs.single.form.template);
  
  if (!singlePartExists) {
    console.error("HowToBeAHero | Main template missing:", partConfigs.single.form.template);
    return { mode: 'error', config: null };
  }

  // Check multipart templates
  const multipartResults = await Promise.all(
    Object.entries(partConfigs.multipart).map(async ([key, config]) => {
      const exists = await templateExists(config.template);
      return { key, exists, config };
    })
  );

  const availableMultiparts = multipartResults
    .filter(result => result.exists)
    .reduce((acc, result) => {
      acc[result.key] = result.config;
      return acc;
    }, {});

  const multipartReady = Object.keys(availableMultiparts).length > 2; // Need at least a few parts

  console.log(`HowToBeAHero | PARTS status: Single=${singlePartExists}, Multipart=${multipartReady}`);

  return {
    mode: multipartReady ? 'multipart-available' : 'single-only',
    single: partConfigs.single,
    multipart: availableMultiparts,
    recommendation: singlePartExists ? 'single' : 'error'
  };
};

/**
 * Load templates specifically for development/testing
 * @returns {Promise}
 */
export const loadDevelopmentTemplates = async function() {
  if (!game.settings.get('core', 'noCanvas')) return; // Only in dev mode

  console.log("HowToBeAHero | Loading development templates...");
  
  const devTemplates = [
    "systems/how-to-be-a-hero/templates/dev/test-character-sheet.hbs",
    "systems/how-to-be-a-hero/templates/dev/debug-context.hbs"
  ];

  const paths = {};
  for (const path of devTemplates) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        paths[path.replace(".hbs", ".html")] = path;
        console.log("HowToBeAHero | Loaded dev template:", path);
      }
    } catch {
      // Dev templates are optional
    }
  }

  if (Object.keys(paths).length > 0) {
    await loadTemplates(paths);
  }
};