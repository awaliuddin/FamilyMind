import "dotenv/config";

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupWebSocket, broadcast } from "./ws";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

function getInvalidationKeys(path: string): string[] {
  if (path.startsWith('/api/grocery-items') || path.startsWith('/api/grocery-lists')) {
    return ['/api/grocery-lists'];
  }
  if (path.startsWith('/api/calendar-events')) return ['/api/calendar-events'];
  if (path.startsWith('/api/family-ideas')) return ['/api/family-ideas'];
  if (path.startsWith('/api/vision-items')) return ['/api/vision-items'];
  if (path.startsWith('/api/wishlist-items')) return ['/api/wishlist-items'];
  if (path.startsWith('/api/family-members')) return ['/api/family-members'];
  if (path.startsWith('/api/family/')) return ['/api/family', '/api/auth/user'];
  if (path === '/api/chat') return ['/api/chat-messages'];
  return [];
}

(async () => {
  // Realtime broadcast: after successful mutations, notify all WS clients
  app.use((req, res, next) => {
    if (req.method === 'GET' || !req.path.startsWith('/api/')) return next();

    const originalJson = res.json;
    res.json = function (body: any) {
      const result = originalJson.apply(this, [body] as any);
      if (res.statusCode < 400) {
        const keys = getInvalidationKeys(req.path);
        for (const key of keys) {
          broadcast(key);
        }
      }
      return result;
    };
    next();
  });

  const server = await registerRoutes(app);
  setupWebSocket(server);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
