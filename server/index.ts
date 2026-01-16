import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// session + passport setup for authentication (Google OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user: any, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id: string, done) {
  try {
    const user = await storage.getUser(id);
    done(null, user || null);
  } catch (err) {
    done(err as any);
  }
});

// Configure Google strategy only if credentials are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`,
      },
      async function (accessToken, refreshToken, profile, done) {
        try {
          // Extract the preferred display name from profile
          const displayName =
            // @ts-ignore
            profile.displayName || (profile.emails && profile.emails[0] && profile.emails[0].value) || `User ${profile.id}`;

          // Use a unique provider-based identifier for lookups
          const providerId = `google:${profile.id}`;

          // 1) Try to find by providerId (stable lookup)
          let user = await storage.getUserByProviderId(providerId);

          // 2) If not found, try to find by email/displayName (existing local account)
          if (!user) {
            user = await storage.getUserByUsername(displayName);
            if (user) {
              // link this local user to the provider by storing providerId
              try {
                await storage.updateUser(user.id, { providerId });
                console.log(`[GoogleStrategy] Linked existing user ${user.id} to provider ${providerId}`);
                // refresh user from DB
                user = await storage.getUser(user.id) as any;
              } catch (e) {
                console.warn(`[GoogleStrategy] Failed to link user ${user?.id} to provider:`, e);
              }
            }
          }

          // 3) If user found by providerId, ensure username equals current displayName
          if (user && user.providerId === providerId) {
            if (user.username !== displayName) {
              try {
                const updated = await storage.updateUser(user.id, { username: displayName });
                console.log(`[GoogleStrategy] Updated username for ${user.id} to ${displayName}`);
                user = updated as any;
              } catch (e) {
                console.warn(`[GoogleStrategy] Failed to update username for ${user.id}:`, e);
              }
            }
          }

          // 4) If still no user, create a new one with both username and providerId
          if (!user) {
            const created = await storage.createUser({ username: displayName, password: "" } as any);
            // store providerId field directly in DB (not part of the typed schema)
            try {
              await storage.updateUser(created.id, { providerId });
            } catch (e) {
              console.warn(`[GoogleStrategy] Failed to save providerId for new user ${created.id}:`, e);
            }
            user = await storage.getUser(created.id) as any;
          }

          // Return user with providerId and displayName for client and server use
          const userForClient = { ...user, displayName, providerId };
          done(null, userForClient);
        } catch (err) {
          done(err as any);
        }
      },
    ),
  );
} else {
  console.warn("Google OAuth not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const listenOptions: any = {
    port,
    host: "0.0.0.0",
  };

  // `reusePort` is not supported on some platforms (notably Windows).
  // Only enable it when the platform is not win32.
  if (process.platform !== "win32") {
    listenOptions.reusePort = true;
  }

  httpServer.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
