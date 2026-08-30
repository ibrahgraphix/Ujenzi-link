import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
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
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Supplier Verification');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      error('Please complete all required fields.');
      return;
    }
    setIsSubmitted(true);
    success('Your message has been sent to Plan Moja Company Ltd. We will respond promptly.');
  };

  const FAQS = [
    {
      q: 'Does Ujenzi Link process payments or hold escrow?',
      a: 'No. Ujenzi Link is a pure directory and direct connection marketplace by Plan Moja Company Ltd. You contact suppliers directly via Phone or WhatsApp and agree on payment upon delivery/inspection.',
    },
    {
      q: 'How do suppliers get the "Verified" badge?',
      a: 'Plan Moja audits provider credentials including physical yard/shopfront visits, business registration certificates (BRELA), and regulatory licenses (CRB / TBS compliance).',
    },
    {
      q: 'Is it free to list building materials and artisan profiles?',
      a: 'Yes! Standard listings and supplier profiles are free. Plan Moja also offers premium banner sponsorship for high-volume manufacturers seeking homepage placement.',
    },
    {
      q: 'How do I report an inaccurate listing or unresponsive contractor?',
      a: 'Use the contact form on this page or email safety@planmoja.com with details so our moderation team can review and audit the listing.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2E86D8] block">
          Get in Touch with Plan Moja
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
                Thank you for contacting Plan Moja Company Ltd. One of our marketplace specialists will reach out via email or WhatsApp within 24 hours.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Phone / WhatsApp Number"
                  placeholder="+255 7XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
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
                <h3 className="font-extrabold text-base font-heading">Plan Moja Company Ltd</h3>
                <p className="text-xs text-blue-200">"Build Quality For Less"</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 pt-2 border-t border-blue-900/60">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#2E86D8] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Dar es Salaam Office</div>
                  <div className="text-slate-400 mt-0.5">
                    Plot 42, Old Bagamoyo Road, TPDC Area, Mikocheni B, Dar es Salaam, Tanzania
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Telephone Support</div>
                  <a href="tel:+255755890123" className="text-slate-300 hover:text-white">
                    +255 755 890 123 / +255 784 123 456
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Direct WhatsApp Desk</div>
                  <a
                    href="https://wa.me/255755890123"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-300 hover:underline"
                  >
                    +255 755 890 123 (Click to chat)
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#2E86D8] shrink-0" />
                <div>
                  <div className="font-bold text-white">Email Addresses</div>
                  <div className="text-slate-400">info@planmoja.com • support@planmoja.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">Operating Hours (EAT)</div>
                  <div className="text-slate-400">Mon – Fri: 08:00 – 17:30 | Sat: 08:30 – 13:00</div>
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
