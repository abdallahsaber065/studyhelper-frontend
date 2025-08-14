import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t bg-background py-6",
        className
      )}
    >
      <div className="container px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Company info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">StudyAssistant</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered study tools to help you learn more effectively.
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Product</h4>
            <div className="space-y-2 text-sm">
              <Link
                to="/features"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/integrations"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Integrations
              </Link>
            </div>
          </div>

          {/* Support links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Support</h4>
            <div className="space-y-2 text-sm">
              <Link
                to="/help"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Help Center
              </Link>
              <Link
                to="/contact"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/status"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                System Status
              </Link>
            </div>
          </div>

          {/* Legal links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Legal</h4>
            <div className="space-y-2 text-sm">
              <Link
                to="/privacy"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/cookies"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 flex flex-col items-center justify-between border-t pt-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} StudyAssistant. All rights reserved.
          </p>
          <div className="mt-4 flex items-center gap-4 md:mt-0">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
