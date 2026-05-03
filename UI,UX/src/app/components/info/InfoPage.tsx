import { useState } from 'react';
import { InfoNavigation } from './InfoNavigation';
import { InfoAdvisoryBanner } from './InfoAdvisoryBanner';
import { AboutSection } from './AboutSection';
import { FAQSection } from './FAQSection';
import { SupportSection } from './SupportSection';
import { ContactSection } from './ContactSection';
import { InfoFooter } from './InfoFooter';

export type InfoSection = 'about' | 'faq' | 'support' | 'contact';

interface InfoPageProps {
  initialSection?: InfoSection;
}

export function InfoPage({ initialSection = 'about' }: InfoPageProps) {
  const [activeSection, setActiveSection] = useState<InfoSection>(initialSection);

  const scrollToSection = (section: InfoSection) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <InfoNavigation activeSection={activeSection} onNavigate={scrollToSection} />

      {/* Hero Section */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-12 text-center">
          <h1 className="mb-3">Welcome to Mazaj+</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            A web-based, chat-driven nutrition decision-support platform designed to provide
            personalized, profile-aware guidance for everyday wellness
          </p>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <InfoAdvisoryBanner />
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* About Section */}
        <section id="about">
          <AboutSection />
        </section>

        {/* FAQ Section */}
        <section id="faq">
          <FAQSection />
        </section>

        {/* Support Section */}
        <section id="support">
          <SupportSection />
        </section>

        {/* Contact Section */}
        <section id="contact">
          <ContactSection />
        </section>
      </div>

      {/* Footer */}
      <InfoFooter onNavigate={scrollToSection} />
    </div>
  );
}
