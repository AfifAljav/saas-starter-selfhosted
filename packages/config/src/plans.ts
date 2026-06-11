// ---------------------------------------------------------------------------
// Plan tier definitions
// Customize plan names, features, and pricing IDs here.
// ---------------------------------------------------------------------------

export type PlanId = "free" | "pro" | "enterprise";

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number | null;   // null = custom pricing
  annualPrice: number | null;    // null = custom pricing
  features: PlanFeature[];
  limits: {
    members: number | null;      // null = unlimited
    projects: number | null;
    storageGb: number | null;
  };
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Everything you need to get started.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { label: "Up to 3 team members", included: true },
      { label: "1 project", included: true },
      { label: "Community support", included: true },
      { label: "Priority support", included: false },
      { label: "Advanced analytics", included: false },
      { label: "Custom domain", included: false },
    ],
    limits: {
      members: 3,
      projects: 1,
      storageGb: 1,
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need more power.",
    monthlyPrice: 29,
    annualPrice: 290,
    features: [
      { label: "Up to 20 team members", included: true },
      { label: "Unlimited projects", included: true },
      { label: "Priority support", included: true },
      { label: "Advanced analytics", included: true },
      { label: "Custom domain", included: true },
      { label: "Dedicated infrastructure", included: false },
    ],
    limits: {
      members: 20,
      projects: null,
      storageGb: 50,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations.",
    monthlyPrice: null,
    annualPrice: null,
    features: [
      { label: "Unlimited team members", included: true },
      { label: "Unlimited projects", included: true },
      { label: "Dedicated support", included: true },
      { label: "Advanced analytics", included: true },
      { label: "Custom domain", included: true },
      { label: "Dedicated infrastructure", included: true },
    ],
    limits: {
      members: null,
      projects: null,
      storageGb: null,
    },
  },
];

export const getPlanById = (id: PlanId): Plan => {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
};
