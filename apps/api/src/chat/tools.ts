const getCurrentTimeServerDefImport =
  import("@studybuddy/tool-definitions").then(
    (module) => module.getCurrentTimeServerDef
  );

export const getCurrentTimeTool = getCurrentTimeServerDefImport.then(
  (getCurrentTimeServerDef) =>
    getCurrentTimeServerDef.server(() => {
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
