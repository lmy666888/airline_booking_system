const isDev = process.env.NODE_ENV === "development";

export const log = {
  debug: (...args: unknown[]) => {
    if (isDev) console.debug("[dfa]", ...args);
  },
  unexpected: (message: string, err?: unknown) => {
    console.error(`[dfa] ${message}`, err ?? "");
  },
};
