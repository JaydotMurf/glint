import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Glint. All rights reserved.</p>
          <nav className="flex items-center gap-4">
            <Link 
              to="/privacy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
