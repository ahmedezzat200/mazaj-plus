import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

type ContactState = 'idle' | 'loading' | 'success';

export function ContactSection() {
  const [state, setState] = useState<ContactState>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setState('loading');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setState('success');
    toast.success('Message sent successfully');

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setState('idle');
    }, 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (state === 'success') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="mb-3">Contact Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Send us a message and we will respond as soon as possible
          </p>
        </div>

        <Card className="p-8 text-center border-2 border-primary/20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2">Your message has been sent successfully</h3>
          <p className="text-muted-foreground mb-4">
            Thank you for contacting us. We will review your message and get back to you soon.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-3">Contact Us</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Send us a message and we will respond as soon as possible
        </p>
      </div>

      <Card className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="What is this about?"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className={errors.subject ? 'border-destructive' : ''}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us more about your question or concern..."
              rows={6}
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className={errors.message ? 'border-destructive' : ''}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters. Please provide as much detail as possible.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={state === 'loading'}
          >
            {state === 'loading' ? (
              <>
                <Send className="h-4 w-4 mr-2 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </Card>

      <div className="bg-muted/30 rounded-lg p-4 border border-border max-w-2xl mx-auto">
        <p className="text-sm text-muted-foreground text-center">
          We typically respond within 24-48 hours during business days. For urgent account issues,
          please include your account email in the message.
        </p>
      </div>
    </div>
  );
}
