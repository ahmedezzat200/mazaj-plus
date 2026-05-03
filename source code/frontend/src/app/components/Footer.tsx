import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border py-12">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold">M+</span>
              </div>
              <span className="text-xl font-semibold text-foreground">Mazaj+</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Chat-driven, rule-based nutrition decision-support platform
            </p>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Features</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground">All Features</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Nutrition Plans</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Hydration</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Image Analysis</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Pricing</h4>
            <ul className="space-y-2">
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Free Plan</a></li>
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pro Plan</a></li>
              <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Ultra Plan</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">About</h4>
            <ul className="space-y-2">
              <li><Link to="/info" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">How It Works</a></li>
              <li><Link to="/info" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/info" className="text-sm text-muted-foreground hover:text-foreground">Help & Support</Link></li>
              <li><Link to="/info" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
              <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Login</Link></li>
              <li><Link to="/register" className="text-sm text-muted-foreground hover:text-foreground">Register</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Mazaj+. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground text-center md:text-right max-w-xl">
              Advisory Notice: Mazaj+ provides nutrition guidance for informational purposes only. This platform does not diagnose conditions or replace healthcare professional advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}