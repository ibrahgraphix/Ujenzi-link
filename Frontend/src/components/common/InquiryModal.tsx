import React, { useState } from 'react';
import { Send, Phone, MessageSquare, CheckCircle2, Building, ShieldCheck, MapPin } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, Textarea } from './Input';
import { Listing, Provider } from '../../types';
import { createInquiry } from '../../services/inquiriesService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: Listing | null;
  provider?: Provider | null;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  listing,
  provider,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState(
    listing
      ? `Habari, I am interested in "${listing.title}". Please send me your price quotation and delivery timeframe.`
      : 'Habari, I would like to inquire about your construction materials and services.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const targetProviderName = listing?.providerName || provider?.name || 'Supplier';
  const targetProviderPhone = provider?.phone || listing?.providerPhone || '+255 767 856 452';
  const targetProviderWhatsapp = (provider?.whatsapp || provider?.phone || listing?.providerPhone || '255767856452').replace(/[^0-9]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      error('Please fill in your name, phone number, and message.');
      return;
    }

    if (!listing?.id && !provider?.id) {
      error('Please select a listing or provider to send an inquiry.');
      return;
    }

    setIsSubmitting(true);
    try {
      const inquiryData = {
        listingId: listing?.id,
        listingTitle: listing?.title,
        listingImage: listing?.images?.[0],
        providerId: listing?.providerId || provider?.id,
        providerName: targetProviderName,
        buyerId: user?.id || `buyer-guest-${Date.now()}`,
        buyerName: name,
        buyerPhone: phone,
        buyerEmail: email || 'guest@ujenzilink.co.tz',
        message,
        quantity: quantity || undefined,
      };
      console.log('Submitting inquiry with data:', inquiryData);
      console.log('Listing object:', listing);
      console.log('Provider object:', provider);
      console.log('User object:', user);

      await createInquiry(inquiryData);

      setIsSubmitted(true);
      success('Inquiry sent! The supplier will contact you directly via phone or WhatsApp.', 'Request Dispatched');
    } catch (err: any) {
      console.error('Inquiry submission error:', err);
      error(`Could not submit inquiry: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const rawNum = targetProviderWhatsapp.replace(/[^0-9]/g, '');
    const textMsg = encodeURIComponent(
      `Habari ${targetProviderName},\nI found your listing on *Ujenzi Link* (Plan Moja Company Ltd):\n\n*Item:* ${
        listing?.title || 'Construction Services'
      }\n*My Name:* ${name || 'Customer'}\n*Phone:* ${phone || ''}\n*Message:* ${message}`
    );
    window.open(`https://wa.me/${rawNum}?text=${textMsg}`, '_blank');
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={isSubmitted ? 'Inquiry Sent Successfully' : `Contact ${targetProviderName}`}
      subtitle={
        isSubmitted
          ? 'Your details have been delivered to the supplier.'
          : 'Ujenzi Link connects you directly with verified suppliers. No commission, no hidden fees.'
      }
      maxWidth="lg"
    >
      {isSubmitted ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Direct Connection Initiated!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {targetProviderName} has received your inquiry. For immediate response, you can also reach them directly via WhatsApp.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="blue"
              onClick={handleWhatsAppDirect}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              Open Direct WhatsApp Chat
            </Button>
            <Button variant="outline" onClick={handleResetAndClose}>
              Close Window
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {listing && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <img
                src={listing.images?.[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=120&q=80'}
                alt={listing.title}
                className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#1B3A6B] truncate">{listing.title}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-900">
                    {new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(listing.price)}
                  </span>
                  <span>/ {listing.unit}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Your Full Name *"
              placeholder="e.g. Baraka Mwambapa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Phone Number (Call / WhatsApp) *"
              placeholder="e.g. +255 712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="e.g. baraka@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Estimated Quantity / Scope"
              placeholder="e.g. 200 bags, 5 tons, or 1 House project"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <Textarea
            label="Inquiry / Message Details *"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Specify your site delivery location, preferred schedule, or technical requirements..."
          />

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
              fullWidth
            >
              Send Request to Supplier
            </Button>
            <Button
              type="button"
              variant="blue"
              onClick={handleWhatsAppDirect}
              leftIcon={<MessageSquare className="w-4 h-4" />}
              fullWidth
            >
              WhatsApp Direct
            </Button>
          </div>

          <div className="text-center pt-1">
            <p className="text-[11px] text-slate-400">
              Ujenzi Link does not charge commission on transactions. Deal safely with verified partners.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
