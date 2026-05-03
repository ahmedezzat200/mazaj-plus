import { Hero } from './Hero';
import { TrustStrip } from './TrustStrip';
import { Features } from './Features';
import { HowItWorks } from './HowItWorks';
import { Pricing } from './Pricing';
import { SecondaryCTA } from './SecondaryCTA';
import { Footer } from './Footer';
import { Navigation } from './Navigation';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <Pricing />
      <SecondaryCTA />
      <Footer />
    </div>
  );
}
