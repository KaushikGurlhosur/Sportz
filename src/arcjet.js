import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";

if (!arcjetKey) throw new Error("ARCJET_KEY environment variable is missing.");

export const httpArcjet = arcjetKey
  ? new arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"], // Allow known bots like search engines and preview generators
        }),
        slidingWindow({
          mode: arcjetMode,
          interval: "10s",
          max: 50, // Allow up to 50 requests per 10 seconds from the same IP
        }),
      ],
    })
  : null;

export const wsArcjet = arcjetKey
  ? new arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"], // Allow known bots like search engines and preview generators
        }),
        slidingWindow({
          mode: arcjetMode,
          interval: "2s",
          max: 5, // Allow up to 50 requests per 10 seconds from the same IP
        }),
      ],
    })
  : null;

export function securityMiddleware() {
  return async (req, res, next) => {
    if (!httpArcjet) return next(); // If Arcjet is not configured, skip security checks

    try {
      const decision = await httpArcjet.protect(req);

      if (decision.isDenied) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: "Too many requests." });
        }

        return res.status(403).json({ error: "Forbidden." });
      }
    } catch (error) {
      console.error("Arcjet middleware error: ", error);
      return res.status(503).json({ error: "Service Unavailable" });
    }
    next();
  };
}
