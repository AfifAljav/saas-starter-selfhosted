/**
 * Paddle BillingAdapter stub.
 *
 * To enable Paddle:
 *   1. Set BILLING_PROVIDER=paddle in .env
 *   2. Add PADDLE_API_KEY and PADDLE_WEBHOOK_SECRET
 *   3. Implement each method using the Paddle Node.js SDK:
 *      https://developer.paddle.com/api-reference/overview
 *
 * The interface contract is defined in adapter.ts — this stub satisfies the
 * TypeScript type so the rest of the app compiles even when Paddle is not
 * yet configured.
 */

import type {
  BillingAdapter,
  BillingEventData,
  CheckoutParams,
  PortalSessionParams,
  SubscriptionInfo,
} from "./adapter";

export const paddleAdapter: BillingAdapter = {
  async createCheckoutSession(_params: CheckoutParams): Promise<string> {
    // TODO: Implement using @paddle/paddle-node-sdk
    // const paddle = new Paddle(env.PADDLE_API_KEY);
    // const tx = await paddle.transactions.create({ ... });
    // return tx.checkout?.url ?? "";
    throw new Error(
      "Paddle adapter not yet implemented. See packages/billing/src/paddle.ts",
    );
  },

  async createPortalSession(_params: PortalSessionParams): Promise<string> {
    // TODO: Return the Paddle customer portal URL
    throw new Error(
      "Paddle adapter not yet implemented. See packages/billing/src/paddle.ts",
    );
  },

  async handleWebhook(_payload: string, _signature: string): Promise<BillingEventData> {
    // TODO: Verify Paddle webhook signature and parse event
    throw new Error(
      "Paddle adapter not yet implemented. See packages/billing/src/paddle.ts",
    );
  },

  async getSubscription(_customerId: string): Promise<SubscriptionInfo | null> {
    // TODO: Fetch subscription from Paddle API
    throw new Error(
      "Paddle adapter not yet implemented. See packages/billing/src/paddle.ts",
    );
  },
};
