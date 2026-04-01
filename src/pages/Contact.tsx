import { useState, FormEvent, ChangeEvent } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const whatsappNumber = "+255612 929 297"; // Platform support number

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          Get in Touch
        </motion.h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Have questions about ServiceHub? We're here to help you connect with the right experts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">WhatsApp Support</p>
                <a 
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  {whatsappNumber}
                </a>
                <p className="text-sm text-gray-500 mt-1">Fastest way to get help</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Call Us</p>
                <p className="text-gray-600">+255 612 969 297</p>
                <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am-6pm</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Email Support</p>
                <p className="text-gray-600">faahdmsuka@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg shadow-blue-100">
            <h3 className="text-xl font-bold mb-4">Business Hours</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-blue-100">
                <span>Monday - Friday</span>
                <span>9:00 - 18:00</span>
              </div>
              <div className="flex justify-between text-blue-100">
                <span>Saturday</span>
                <span>10:00 - 16:00</span>
              </div>
              <div className="flex justify-between text-blue-100">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="Your Name" 
                        name="name"
                        placeholder="John Doe" 
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        required 
                      />
                      <Input 
                        label="Email Address" 
                        name="email"
                        type="email" 
                        placeholder="john@example.com" 
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required 
                      />
                    </div>
                    <Input 
                      label="Subject" 
                      name="subject"
                      placeholder="How can we help?" 
                      value={formData.subject}
                      onChange={handleChange}
                      error={errors.subject}
                      required 
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Message</label>
                      <textarea 
                        name="message"
                        className={cn(
                          "w-full min-h-[150px] p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none",
                          errors.message && "border-red-500 focus:ring-red-500"
                        )}
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                      {errors.message && (
                        <p className="text-xs text-red-500">{errors.message}</p>
                      )}
                    </div>
                    <Button 
                      type="submit"
                      isLoading={loading}
                      className="w-full md:w-auto px-12 h-14 rounded-2xl text-lg font-bold gap-2 shadow-xl shadow-blue-100"
                    >
                      Send Message <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-grow flex flex-col items-center justify-center text-center space-y-6 py-12"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">Message Sent!</h2>
                    <p className="text-gray-600 text-lg">
                      Thank you for reaching out. We've received your message and will get back to you shortly.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSubmitted(false)}
                    className="rounded-xl px-8"
                  >
                    Send another message
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
