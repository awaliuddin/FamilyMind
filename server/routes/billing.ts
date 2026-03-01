import type { Express, RequestHandler } from "express";
import type { IStorage } from "../storage";
import { stripe, isStripeConfigured, STRIPE_WEBHOOK_SECRET } from "../stripe";

export const requirePremium: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Import storage dynamically to avoid circular dependency issues with mocks
    const { storage } = await import("../storage");
    const user = await storage.getUser(userId);
    if (!user?.familyId) {
      return res.status(403).json({ message: "Premium subscription required" });
    }

    const subscription = await storage.getSubscription(user.familyId);
    if (
      !subscription ||
      subscription.status !== "active" ||
      new Date(subscription.currentPeriodEnd) <= new Date()
    ) {
      return res.status(403).json({ message: "Premium subscription required" });
    }

    next();
  } catch (error) {
    console.error("Error checking premium status:", error);
    res.status(500).json({ message: "Failed to verify subscription" });
  }
};

export function registerBillingRoutes(app: Express, isAuthenticated: RequestHandler, storage: IStorage) {
  app.post('/api/billing/create-checkout', isAuthenticated, async (req: any, res) => {
    try {
      if (!isStripeConfigured()) {
        return res.status(503).json({ message: "Billing is not configured" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.familyId) {
        return res.status(400).json({ message: "Must be part of a family to subscribe" });
      }

      const { priceId } = req.body;
      if (!priceId) {
        return res.status(400).json({ message: "priceId is required" });
      }

      const session = await stripe!.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${req.protocol}://${req.hostname}/?billing=success`,
        cancel_url: `${req.protocol}://${req.hostname}/?billing=canceled`,
        metadata: { familyId: user.familyId },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post('/api/billing/webhook', async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        return res.status(503).json({ message: "Billing is not configured" });
      }

      const sig = req.headers['stripe-signature'] as string;
      if (!sig || !STRIPE_WEBHOOK_SECRET) {
        return res.status(400).json({ message: "Missing signature or webhook secret" });
      }

      let event;
      try {
        event = stripe!.webhooks.constructEvent(
          req.body,
          sig,
          STRIPE_WEBHOOK_SECRET,
        );
      } catch {
        return res.status(400).json({ message: "Invalid webhook signature" });
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const familyId = session.metadata?.familyId;
          if (familyId && session.subscription) {
            const subscription = await stripe!.subscriptions.retrieve(
              session.subscription as string,
            );
            const item = subscription.items.data[0];
            await storage.upsertSubscription({
              familyId,
              stripeCustomerId: session.customer as string,
              stripePriceId: item.price.id,
              stripeSubscriptionId: subscription.id,
              status: "active",
              currentPeriodEnd: new Date(item.current_period_end * 1000),
            });
          }
          break;
        }
        case 'customer.subscription.updated': {
          const sub = event.data.object as any;
          const familyId = sub.metadata?.familyId;
          if (familyId) {
            const periodEnd = sub.items?.data?.[0]?.current_period_end
              ?? sub.current_period_end;
            const updates: any = {
              status: sub.status === 'active' ? 'active'
                : sub.status === 'past_due' ? 'past_due'
                : 'canceled',
            };
            if (periodEnd) {
              updates.currentPeriodEnd = new Date(periodEnd * 1000);
            }
            await storage.updateSubscription(familyId, updates);
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const sub = event.data.object as any;
          const familyId = sub.metadata?.familyId;
          if (familyId) {
            await storage.updateSubscription(familyId, {
              status: "canceled",
            });
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  app.get('/api/billing/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.familyId) {
        return res.json({ isPremium: false, subscription: null });
      }

      const subscription = await storage.getSubscription(user.familyId);
      if (!subscription) {
        return res.json({ isPremium: false, subscription: null });
      }

      const isPremium =
        subscription.status === "active" &&
        new Date(subscription.currentPeriodEnd) > new Date();

      res.json({
        isPremium,
        subscription: {
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      });
    } catch (error) {
      console.error("Error fetching billing status:", error);
      res.status(500).json({ message: "Failed to fetch billing status" });
    }
  });
}
