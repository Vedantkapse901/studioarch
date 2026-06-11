import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Instagram, Linkedin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="bg-[#F5F5F0] min-h-screen">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-8 hover:opacity-60 transition-opacity">
            <ArrowLeft size={20} />
            <span className="text-sm uppercase tracking-widest">Back</span>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-light mb-6"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-stone-400 text-lg max-w-2xl"
          >
            Let's discuss how we can bring your architectural vision to life. We're excited to hear about your project.
          </motion.p>
        </div>
      </div>

      {/* Contact Content */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div>
              <h3 className="text-2xl font-light mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm uppercase tracking-widest text-stone-600 block mb-2">Email</label>
                  <a href="mailto:inquiry@1studioarch.com" className="text-lg text-[#1A1A1A] hover:opacity-60 transition-opacity">
                    inquiry@1studioarch.com
                  </a>
                </div>
                <div>
                  <label className="text-sm uppercase tracking-widest text-stone-600 block mb-2">Locations</label>
                  <div className="space-y-2 text-lg text-[#1A1A1A]">
                    <p>London, UK</p>
                    <p>New York, USA</p>
                    <p>Singapore, SG</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-light mb-6">Follow Us</h3>
              <div className="flex gap-6">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.2 }}
                  className="text-stone-700 hover:text-[#1A1A1A] transition-colors"
                >
                  <Instagram size={24} />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.2 }}
                  className="text-stone-700 hover:text-[#1A1A1A] transition-colors"
                >
                  <Linkedin size={24} />
                </motion.a>
              </div>
            </div>

            {/* Map */}
            <div className="h-96 bg-stone-300 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890!2d-0.1276!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMwJzI2LjYiTiAwwrAwN0myMzUuNiJX!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-2xl font-light mb-8">Send us a Message</h3>
            <form className="space-y-6">
              <div>
                <label className="text-sm uppercase tracking-widest text-stone-600 block mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-transparent border-b border-stone-400 py-3 outline-none focus:border-[#1A1A1A] transition-colors text-lg"
                />
              </div>

              <div>
                <label className="text-sm uppercase tracking-widest text-stone-600 block mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-transparent border-b border-stone-400 py-3 outline-none focus:border-[#1A1A1A] transition-colors text-lg"
                />
              </div>

              <div>
                <label className="text-sm uppercase tracking-widest text-stone-600 block mb-2">Project Type</label>
                <select className="w-full bg-transparent border-b border-stone-400 py-3 outline-none focus:border-[#1A1A1A] transition-colors text-lg">
                  <option>Select project type</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Hospitality</option>
                  <option>Cultural</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm uppercase tracking-widest text-stone-600 block mb-2">Message</label>
                <textarea
                  placeholder="Tell us about your project..."
                  rows={6}
                  className="w-full bg-transparent border-b border-stone-400 py-3 outline-none focus:border-[#1A1A1A] transition-colors text-lg resize-none"
                ></textarea>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(26,26,26,0.2)"
                }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 border-2 border-[#1A1A1A] text-[#1A1A1A] px-12 py-4 text-xs uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 w-full md:w-auto"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
