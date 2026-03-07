import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — BULLFIT',
}

export default function TermsPage() {
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
        TERMS OF SERVICE
      </h1>
      <p className="text-xs text-text-muted mb-8">Last updated: March 2026</p>

      <div className="flex flex-col gap-6 text-sm text-text-primary leading-relaxed">

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">1. Acceptance of Terms</h2>
          <p className="text-text-secondary">
            By accessing or using BULLFIT ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users, including clients and coaches.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">2. Description of Service</h2>
          <p className="text-text-secondary">
            BULLFIT is a fitness coaching platform that allows coaches to create and assign training programs, track client progress, and provide nutritional guidance. The Service is intended for informational and fitness tracking purposes only and does not constitute medical advice.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">3. User Accounts</h2>
          <p className="text-text-secondary">
            You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate information when creating your account. You may not share your account with others. Notify us immediately if you suspect unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">4. Subscriptions and Payments</h2>
          <p className="text-text-secondary">
            Access to certain features requires a paid subscription. Subscription fees are billed in advance on a recurring basis. You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period. We reserve the right to change pricing with reasonable notice.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">5. Health Disclaimer</h2>
          <p className="text-text-secondary">
            The training programs, nutritional information, and content provided through BULLFIT are for general fitness purposes only. Always consult a qualified healthcare professional before starting any exercise or nutrition program, especially if you have a pre-existing health condition. BULLFIT is not liable for any injury or health issue arising from use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">6. User Content</h2>
          <p className="text-text-secondary">
            You retain ownership of any content you submit (such as workout logs, notes, and profile data). By submitting content, you grant BULLFIT a non-exclusive license to store and display that content solely for the purpose of providing the Service to you.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">7. Prohibited Use</h2>
          <p className="text-text-secondary">
            You agree not to misuse the Service. Prohibited activities include attempting to access others' accounts, submitting false or misleading information, reverse-engineering the platform, or using the Service for any unlawful purpose.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">8. Termination</h2>
          <p className="text-text-secondary">
            We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting support. Upon termination, your access to the Service will cease and your data may be removed after a reasonable retention period.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">9. Limitation of Liability</h2>
          <p className="text-text-secondary">
            To the fullest extent permitted by law, BULLFIT and its operators shall not be liable for any indirect, incidental, or consequential damages arising from use of the Service. Our total liability for any claim shall not exceed the amount you paid for the Service in the twelve months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">10. Changes to Terms</h2>
          <p className="text-text-secondary">
            We may update these Terms from time to time. Continued use of the Service after changes are posted constitutes your acceptance of the updated Terms. We will notify users of material changes via the app or email.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">11. Governing Law</h2>
          <p className="text-text-secondary">
            These Terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration or in the courts of competent jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-base font-black tracking-wide text-text-primary mb-2">12. Contact</h2>
          <p className="text-text-secondary">
            For questions about these Terms, please contact us through the app or at the email address provided in your account settings.
          </p>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <p className="text-xs text-text-muted">
          Also see our{' '}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
