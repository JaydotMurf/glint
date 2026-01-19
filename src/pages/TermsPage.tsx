import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { GlintButton } from "@/components/ui/glint-button";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Link to="/">
          <GlintButton variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </GlintButton>
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-foreground/80">
            <strong>Last updated:</strong> January 19, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Glint ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p>
              Glint is an AI-powered study tool that helps students understand complex academic topics through 
              simplified explanations and flashcard generation. The Service includes both free and premium tiers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
            <p>To access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Free and Premium Services</h2>
            <p>
              <strong>Free Tier:</strong> Users receive 3 explanations per day with limited features.
            </p>
            <p>
              <strong>Premium Tier:</strong> For $14.99/month, users receive unlimited explanations, 
              PDF export capabilities, and additional features as described on our pricing page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Payment and Billing</h2>
            <p>For premium subscriptions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payments are processed securely through our payment provider</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You may cancel your subscription at any time</li>
              <li>Refunds are handled according to our refund policy</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to circumvent usage limits or security measures</li>
              <li>Share your account credentials with others</li>
              <li>Upload malicious content or attempt to harm the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Intellectual Property</h2>
            <p>
              The Service, including its design, features, and content, is owned by Glint and protected by 
              intellectual property laws. You retain ownership of the content you create using the Service, 
              but grant us a license to store and display it as necessary to provide the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. AI-Generated Content</h2>
            <p>
              Explanations and flashcards are generated using artificial intelligence. While we strive for 
              accuracy, AI-generated content may contain errors. Users should verify important information 
              through additional sources. We are not responsible for decisions made based on AI-generated content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" without warranties of any kind, either express or implied. 
              We do not guarantee that the Service will be uninterrupted, error-free, or meet your specific 
              requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Glint shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violations of these 
              Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Continued use of the Service after changes constitutes 
              acceptance of the new Terms. We will notify users of significant changes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:support@glintapp.com" className="text-primary hover:underline">
                support@glintapp.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
