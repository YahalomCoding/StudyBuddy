const toolDefinitions = import("@studybuddy/tool-definitions");

/**
 * @important The constant is a promise that resolves to a tool definition.
 * This is because the tool definition may need to be loaded asynchronously.
 */
export const getCurrentTimeTool = toolDefinitions.then((toolDefinitions) =>
  toolDefinitions.getCurrentTimeServerDef.server(() => {
    const now = new Date();
    return {
      iso: now.toISOString(),
      date: now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  })
);
