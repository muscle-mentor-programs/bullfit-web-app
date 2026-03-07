import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — BULLFIT',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-5 py-12 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/login"
          className="text-xs font-bold tracking-widest text-text-muted hover:text-primary transition-colors"
        >
          ← BACK TO LOGIN
        </Link>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-text-primary mb-2">
        PRIVACY POLICY
      </h1>
      <p className="text-xs text-text-muted mb-8">Last updated: March 2026</p>

      <div className="flex flex-col gap-6 text-sm text-text-primary leading-relaxed">

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">1. Overview</h2>
          <p className="text-text-secondary">
            BULLFIT ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. By using the Service, you agree to the practices described here.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">2. Information We Collect</h2>
          <p className="text-text-secondary mb-2">We collect information you provide directly:</p>
          <ul className="list-disc list-inside text-text-secondary space-y-1 ml-2">
            <li>Account information: name, email address, and password (stored securely via Supabase Auth)</li>
            <li>Fitness data: workout logs, training sessions, and program history</li>
            <li>Nutrition data: food logs, calorie and macro entries</li>
            <li>Body metrics: weight and any optional measurements you choose to record</li>
            <li>Profile preferences: goals, settings, and theme choices</li>
          </ul>
          <p className="text-text-secondary mt-2">
            We also collect usage data automatically, such as device type, browser, and general usage patterns, to improve the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">3. How We Use Your Information</h2>
          <p className="text-text-secondary mb-2">We use your data to:</p>
          <ul className="list-disc list-inside text-text-secondary space-y-1 ml-2">
            <li>Provide and improve the Service</li>
            <li>Display your training programs, workout history, and nutrition logs</li>
            <li>Allow coaches to view client progress (only for clients enrolled with that coach)</li>
            <li>Process subscription payments via our payment processor (Stripe)</li>
            <li>Send service-related communications such as account confirmations</li>
          </ul>
          <p className="text-text-secondary mt-2">
            We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">4. Data Sharing</h2>
          <p className="text-text-secondary">
            Your data is only shared with service providers necessary to operate the platform (such as Supabase for database hosting and Stripe for payment processing). These providers are contractually bound to protect your data. We may also disclose data when required by law.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">5. Coach Access</h2>
          <p className="text-text-secondary">
            If you are a client, your assigned coach can view your workout logs, program progress, and body metrics. This access is limited to coaches you are enrolled with and is necessary for the core coaching functionality of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">6. Data Security</h2>
          <p className="text-text-secondary">
            We implement industry-standard security measures including encrypted data storage, row-level security policies, and secure authentication. However, no online service can guarantee absolute security. You are responsible for keeping your login credentials confidential.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">7. Data Retention</h2>
          <p className="text-text-secondary">
            We retain your data for as long as your account is active. If you delete your account, your personal data will be removed within a reasonable period, except where retention is required by law or for legitimate business purposes such as resolving disputes.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">8. Your Rights</h2>
          <p className="text-text-secondary mb-2">Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside text-text-secondary space-y-1 ml-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and associated data</li>
            <li>Object to or restrict certain processing of your data</li>
            <li>Data portability (receive your data in a machine-readable format)</li>
          </ul>
          <p className="text-text-secondary mt-2">
            To exercise these rights, contact us through the app or at the email address in your account settings.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">9. Cookies</h2>
          <p className="text-text-secondary">
            We use essential cookies and local storage for authentication and session management. We do not use advertising or tracking cookies. You may disable cookies in your browser settings, but this may affect your ability to use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">10. Children's Privacy</h2>
          <p className="text-text-secondary">
            BULLFIT is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us and we will promptly remove it.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">11. Changes to This Policy</h2>
          <p className="text-text-secondary">
            We may update this Privacy Policy periodically. We will notify you of significant changes via the app or email. Continued use of the Service after changes are posted constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">12. Contact</h2>
          <p className="text-text-secondary">
            If you have questions or concerns about this Privacy Policy, please contact us through the app or at the email address provided in your account settings.
          </p>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <p className="text-xs text-text-muted">
          Also see our{' '}
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>.
        </p>
      </div>
    </div>
  )
}
