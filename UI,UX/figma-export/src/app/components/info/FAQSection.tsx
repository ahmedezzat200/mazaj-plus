import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

const faqs = [
  {
    question: 'What is Mazaj+?',
    answer:
      'Mazaj+ is a web-based, chat-driven nutrition decision-support platform. It provides personalized food recommendations and nutrition guidance based on your profile, goals, and preferences. The platform uses a rule-based approach to deliver structured, reliable support for everyday wellness decisions.',
  },
  {
    question: 'How does the chat guidance work?',
    answer:
      'Our chat interface allows you to ask questions about food choices, meal planning, and nutrition in natural language. The system processes your input against your personal profile and provides tailored recommendations. You can describe your current mood, dietary preferences, or specific questions, and receive relevant guidance.',
  },
  {
    question: 'What is the difference between Free, Pro, and Ultra?',
    answer:
      'Free provides essential features including chat guidance, personalized plans, and healthy alternatives. Pro adds food image upload, InBody integration, and detailed nutrition analysis. Ultra includes all Pro features plus daily intake logging, weekly reports, progress tracking, and unlimited history.',
  },
  {
    question: 'Does Mazaj+ replace a doctor or nutritionist?',
    answer:
      'No. Mazaj+ provides advisory nutrition guidance and information only. It does not diagnose medical conditions, prescribe treatment, or replace the advice of qualified healthcare professionals such as doctors, registered dietitians, or nutritionists. Always consult with healthcare professionals for medical advice.',
  },
  {
    question: 'How is my profile information used?',
    answer:
      'Your profile information—including goals, dietary preferences, allergies, and health considerations—is used to personalize your nutrition guidance. This data helps the platform provide relevant recommendations tailored to your unique needs. Your information is kept private and used solely to improve your experience.',
  },
  {
    question: 'What are Upload Features?',
    answer:
      'Upload Features (available on Pro and Ultra) allow you to upload food images for automatic nutrition analysis and InBody scan results for body composition tracking. The platform analyzes your uploads and integrates this data into your personalized guidance.',
  },
  {
    question: 'Can I track my nutrition over time?',
    answer:
      'Yes, with an Ultra subscription. Ultra users have access to daily intake logging, weekly nutrition reports, and progress tracking. You can log meals, monitor calories and hydration, and review trends over time to support your wellness goals.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. We take data security seriously and implement industry-standard measures to protect your personal and health information. Your data is encrypted in transit and at rest, and we never share your information with third parties without your consent.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes. You can cancel or change your subscription at any time from your account settings. If you downgrade, you will retain access to your current tier features until the end of your billing period.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Simply create a free account, complete the onboarding flow to set up your profile, and start using the chat guidance. You can explore features on the Free plan and upgrade to Pro or Ultra anytime to unlock additional capabilities.',
  },
];

export function FAQSection() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-3">Frequently Asked Questions</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Common questions about Mazaj+ features, subscriptions, and how the platform works
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="bg-card border border-border rounded-lg px-6"
          >
            <AccordionTrigger className="hover:no-underline">
              <span className="text-left font-medium">{faq.question}</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
