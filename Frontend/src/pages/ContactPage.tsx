import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Clock,
  Send,
  Building2,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input, Textarea } from '../components/common/Input';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Supplier Verification');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      error('Please complete all required fields.');
      return;
    }
    
    // Send inquiry via email
    const mailtoLink = `mailto:planmoja2026@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `Habari Ujenzi Link,\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n\n*Message:*\n${message}`
    )}`;
    window.location.href = mailtoLink;
    
    setIsSubmitted(true);
    success('Your message has been sent to Ujenzi Link via email. We will respond promptly.');
  };

  const FAQS = [
    {
      q: 'Does Ujenzi Link process payments or hold escrow?',
      a: 'No. Ujenzi Link is a pure directory and direct connection marketplace. You contact suppliers directly via Phone or WhatsApp and agree on payment upon delivery/inspection.',
    },
    {
      q: 'How do suppliers get the "Verified" badge?',
      a: 'Ujenzi Link audits provider credentials including physical yard/shopfront visits, business registration certificates (BRELA), and regulatory licenses (CRB / TBS compliance).',
    },
    {
      q: 'Is it free to list building materials and artisan profiles?',
      a: 'Yes! Standard listings and supplier profiles are free. Ujenzi Link also offers premium banner sponsorship for high-volume manufacturers seeking homepage placement.',
    },
    {
      q: 'How do I report an inaccurate listing or unresponsive contractor?',
      a: 'Use the contact form on this page or email planmoja2026@gmail.com with details so our moderation team can review and audit the listing.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2E86D8] block">
          Get in Touch with Ujenzi Link
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Contact Ujenzi Link Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Have questions about listing your supplies, corporate procurement, or need assistance? We are here to help.
        </p>
      </div>

      {/* Main Grid: Form + Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          {isSubmitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you for contacting Ujenzi Link. One of our marketplace specialists will reach out via email within 24 hours.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage('');
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Send Us a Direct Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Your Name *"
                  placeholder="e.g. Eng. Juma Mwinyi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="juma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject / Topic
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium"
                >
                  <option value="Supplier Verification">Supplier Verification & Onboarding</option>
                  <option value="Corporate Material Sourcing">Corporate / Bulk Material Sourcing</option>
                  <option value="Advertising Banner Inquiries">Advertising & Banner Sponsorships</option>
                  <option value="General Support">General Support & Feedback</option>
                </select>
              </div>

              <Textarea
                label="Your Message *"
                rows={4}
                placeholder="How can we assist you with construction procurement or marketplace listings?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Inquiry
              </Button>
            </form>
          )}
        </div>

        {/* Right Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#12284C] text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E86D8] flex items-center justify-center text-white">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-base font-heading">Ujenzi Link</h3>
                <p className="text-xs text-blue-200">"We connect, we care!"</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 pt-2 border-t border-blue-900/60">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#2E86D8] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Tanzania Headquarters</div>
                  <div className="text-slate-400 mt-0.5">
                    Mwenge, Kinondoni, Dar es Salaam, P.O. Box 33165
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#2E86D8] shrink-0" />
                <div>
                  <div className="font-bold text-white">Email Address</div>
                  <a href="mailto:planmoja2026@gmail.com" className="text-slate-300 hover:text-white">
                    planmoja2026@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Operating Hours (EAT)</div>
                  <div className="text-slate-400">Daily: 7:00 AM – 6:00 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#2E86D8]" />
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((faq, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
