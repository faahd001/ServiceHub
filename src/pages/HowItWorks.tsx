import { Search, UserCheck, CalendarCheck, MessageSquare, Briefcase, Settings, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function HowItWorks() {
  const customerSteps = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Find a Service",
      description: "Browse through our extensive list of verified service providers or search for specific experts in your area."
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Review Profiles",
      description: "Check provider ratings, reviews, and experience to find the perfect match for your needs."
    },
    {
      icon: <CalendarCheck className="w-6 h-6" />,
      title: "Book Instantly",
      description: "Select a date and time that works for you and book the service with just a few clicks."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Communicate",
      description: "Use our built-in chat or WhatsApp to discuss job details directly with your chosen provider."
    }
  ];

  const providerSteps = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Create Your Profile",
      description: "Register as a provider, list your skills, experience, and set up your professional profile."
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Manage Requests",
      description: "Receive real-time job requests and manage them through your dedicated provider dashboard."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Complete Jobs",
      description: "Accept jobs, update their status, and mark them as completed once the work is done."
    },
    {
      icon: <ArrowRight className="w-6 h-6" />,
      title: "Grow Your Business",
      description: "Build your reputation through customer reviews and grow your service business on ServiceHub."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-24">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-gray-900"
        >
          How ServiceHub Works
        </motion.h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Connecting skilled professionals with customers who need their expertise. 
          Simple, transparent, and efficient.
        </p>
      </div>

      {/* Customer Flow */}
      <section className="space-y-12">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">For Customers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {customerSteps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Provider Flow */}
      <section className="space-y-12">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">For Providers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {providerSteps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-blue-600 rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-blue-200"
      >
        <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
        <p className="text-blue-100 max-w-xl mx-auto mb-10 text-lg">
          Join thousands of users who trust ServiceHub for their daily service needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-10 h-14 rounded-2xl text-lg font-bold shadow-xl">
              Join Now
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="outline" className="border-white text-white hover:bg-blue-700 px-10 h-14 rounded-2xl text-lg font-bold">
              Explore Services
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
