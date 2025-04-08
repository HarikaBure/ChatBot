import { Bot } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-black  text-white py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 flex items-center justify-center">
                <Bot className="text-white h-5 w-5" />
              </div>
              <span className="text-white text-xl font-bold">AURA</span>
            </div>
            <p className="text-white mb-6 max-w-md">
              AURA uses advanced emotional intelligence to understand your mood and recommend the perfect movies for your emotional state.
            </p>
            <div className="flex gap-4">
              {/* Social Links */}
              {[
                {
                  label: "Facebook",
                  icon: (
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  ),
                },
                {
                  label: "Twitter",
                  icon: (
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  ),
                },
                {
                  label: "Instagram",
                  icon: (
                    <>
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </>
                  ),
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-teal-500/80 transition-colors"
                  aria-label={social.label}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-extrabold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Features", href: "#features" },
                { label: "Testimonials", href: "#testimonials" },
                { label: "Pricing", href: "#get-started" },
                { label: "FAQ", href: "#faq" },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-white hover:text-teal-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Legal</h3>
            <ul className="space-y-3">
              {[
                "Terms of Service",
                "Privacy Policy",
                "Cookie Policy",
                "Data Processing",
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-white hover:text-teal-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white text-sm">
            &copy; {new Date().getFullYear()} AURA AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-white hover:text-teal-400 text-sm transition-colors">
              Sign In
            </a>
            <span className="text-white">|</span>
            <a href="/register" className="text-white hover:text-teal-400 text-sm transition-colors">
              Create Account
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
