import Stripe from 'stripe'

// Use a placeholder key during build so Next.js module evaluation doesn't
// throw. The placeholder is never used for real API calls — actual requests
// only happen at runtime when STRIPE_SECRET_KEY is present.
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder_build_only',
  { apiVersion: '2026-02-25.clover' },
)
