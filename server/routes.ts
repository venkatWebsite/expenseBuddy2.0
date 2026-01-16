import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";

function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.status(401).json({ message: "Not authenticated" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)


  // Register Google auth routes using the callback path from env when available.
  // This ensures the server listens on the exact path configured in Google Cloud Console
  // and also accepts the `/api`-prefixed variants so older client links continue to work.
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`;
  let callbackPath = "/api/auth/google/callback";
  try {
    const u = new URL(callbackUrl);
    callbackPath = u.pathname;
  } catch (err) {
    callbackPath = "/api/auth/google/callback";
  }

  // derive auth path by removing trailing '/callback'
  const authPath = callbackPath.replace(/\/callback\/?$/, "");

  const normalize = (p: string) => {
    if (!p.startsWith("/")) p = "/" + p;
    // keep single leading slash, remove trailing slash
    return p.replace(/\/+$/, "");
  };

  const authCandidates = new Set([normalize(authPath), normalize(`/api${authPath}`)]);
  const callbackCandidates = new Set([normalize(callbackPath), normalize(`/api${callbackPath}`)]);

  for (const p of authCandidates) {
    // register auth entry (scope request)
    app.get(p, passport.authenticate("google", { scope: ["profile", "email"] }));
  }

  for (const p of callbackCandidates) {
    app.get(
      p,
      passport.authenticate("google", { failureRedirect: "/welcome" }),
      (req, res) => {
        const frontend = process.env.FRONTEND_ORIGIN || "/";
        try {
          const url = new URL(frontend);
          res.redirect(url.toString());
        } catch (e) {
          res.redirect(frontend);
        }
      },
    );
  }

  app.get("/api/auth/logout", (req, res) => {
    req.logout?.((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ ok: false, error: "Logout failed" });
      }
      // Destroy the session
      req.session?.destroy?.((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ ok: false, error: "Session destroy failed" });
        }
        // Clear session cookie
        res.clearCookie("connect.sid"); // standard Express session cookie name
        // Also clear any OAuth session cookies that might exist
        res.clearCookie("passport-session");
        res.json({ ok: true });
      });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.user) {
      // Ensure displayName is returned as the user's readable name (email or display name)
      const user = req.user as any;
      const displayName = user.displayName || user.username || "User";
      res.json({ user: { ...user, displayName } });
    } else {
      res.status(200).json({ user: null });
    }
  });

  // Endpoint to sync authenticated user to client-side profile storage
  app.post("/api/auth/sync-profile", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = req.user as any;
    const displayName = user.displayName || user.username || "User";
    res.json({
      ok: true,
      profile: {
        name: displayName,
        currency: "₹", // default, can be extended
      },
    });
  });

  // Endpoint to update user profile (username/name) in database
  app.post("/api/auth/update-profile", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = req.user as any;
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Invalid name provided" });
    }

    try {
      const newName = name.trim();
      console.log(`[Profile Update] Starting - User ID: ${user.id}, Current: "${user.username}", New: "${newName}"`);
      
      // Update user in storage with new username
      const updated = await storage.updateUser(user.id, { username: newName });
      
      if (!updated) {
        console.error(`[Profile Update] ERROR: User ${user.id} not found after update attempt`);
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`[Profile Update] SUCCESS: User updated in database`);
      console.log(`[Profile Update] Updated user from DB:`, JSON.stringify(updated));

      // Update the session user object with fresh data
      req.user = updated as any;

      // Force session to be marked as modified and saved
      if (req.session) {
        req.session.touch();
        req.session.save((err) => {
          if (err) {
            console.error("[Profile Update] Session save error:", err);
          } else {
            console.log("[Profile Update] Session saved successfully");
          }
        });
      }

      res.json({
        ok: true,
        message: `Profile updated successfully`,
        profile: {
          name: newName,
          currency: "₹",
        },
        user: updated,
      });
    } catch (err) {
      console.error("[Profile Update] ERROR:", err);
      res.status(500).json({ error: "Failed to update profile", details: String(err) });
    }
  });

  // Verification endpoint: get current user from database (for debugging)
  app.get("/api/auth/verify-user", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = req.user as any;
    try {
      // Fetch fresh user data from database
      const freshUser = await storage.getUser(user.id);
      if (!freshUser) {
        return res.status(404).json({ error: "User not found in database" });
      }

      console.log(`[Verify User] Retrieved user from DB:`, freshUser);
      res.json({
        ok: true,
        sessionUser: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
        },
        databaseUser: freshUser,
      });
    } catch (err) {
      console.error("Verify user error:", err);
      res.status(500).json({ error: "Failed to verify user", details: String(err) });
    }
  });

  return httpServer;
}
