import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { GlintButton } from "@/components/ui/glint-button";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Link to="/">
          <GlintButton variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </GlintButton>
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-foreground/80">
            <strong>Last updated:</strong> January 19, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
            <p>
              Welcome to Glint ("we," "our," or "us"). We are committed to protecting your privacy and ensuring 
              a safe online experience. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address and display name when you create an account.</li>
              <li><strong>Usage Data:</strong> Information about how you use our service, including topics you explore and flashcards you create.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
              <li><strong>Cookies:</strong> We use cookies and similar technologies to enhance your experience.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your requests and generate explanations</li>
              <li>Save your concepts and flashcards for future reference</li>
              <li>Track usage limits and manage subscriptions</li>
              <li>Send you updates and promotional communications (with your consent)</li>
              <li>Ensure the security and integrity of our platform</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. We implement appropriate 
              technical and organizational measures to protect your personal information against unauthorized 
              access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Third-Party Services</h2>
            <p>
              We may use third-party services for authentication (such as Google Sign-In), payment processing, 
              and analytics. These services have their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Rectify inaccurate personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Children's Privacy</h2>
            <p>
              Our service is intended for users who are at least 13 years of age. We do not knowingly collect 
              personal information from children under 13. If we become aware that we have collected personal 
              data from a child under 13, we will take steps to delete that information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
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

export default PrivacyPage;
