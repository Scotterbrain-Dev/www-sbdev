import { Brain } from "lucide-react";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Free Assessment", href: "#assessment" },
  { label: "Testimonials", href: "#testimonials" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-sb-dark border-t border-sb-white/5 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-sb-mid border border-sb-neon/30 flex items-center justify-center">
                <Brain className="w-5 h-5 text-sb-neon" strokeWidth={1.5} />
              </div>
              <span className="font-display font-extrabold text-xl text-sb-white tracking-tight">
                Scotterbrain
              </span>
            </div>
            <p className="text-sb-muted text-sm leading-relaxed max-w-xs">
              Master the tools to descatter and be promoted to an agent of the Scotterbrain Alliance.
            </p>
          </div>

          {/* Nav column */}
          <div>
            <p className="font-display font-semibold text-sb-white text-xs tracking-[0.25em] uppercase mb-5">
              Navigate
            </p>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sb-muted text-sm hover:text-sb-neon transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA column */}
          <div>
            <p className="font-display font-semibold text-sb-white text-xs tracking-[0.25em] uppercase mb-5">
              Get Started
            </p>
            <p className="text-sb-muted text-sm mb-6 leading-relaxed">
              Ready to descatter your business and join the Alliance?
            </p>
            <a
              href="#assessment"
              className="inline-block px-6 py-3 bg-sb-orange text-white font-bold font-display text-sm rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-sb-orange/20 transition-all duration-200"
            >
              Free Assessment →
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-sb-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sb-muted text-sm">
            © 2025 Scotterbrain Alliance. All rights reserved.
          </p>
          <p className="text-sb-muted/50 text-xs italic">
            Descatter <em className="not-italic">(v.)</em> — to bring order to scattered chaos. We&apos;re making it happen.
          </p>
        </div>
      </div>
    </footer>
  );
}
