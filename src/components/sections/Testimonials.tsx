"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Before Scotterbrain, our operations were a mess. Now everything runs on autopilot and I finally have my life back.",
    name: "Jane D.",
    role: "Operations Manager",
    company: "Acme Corp",
    initial: "J",
  },
  {
    quote:
      "Sed do eiusmod tempor incididunt ut labore et dolore. The voice AI agent they built handles 80% of our after-hours calls without a single complaint. Absolute game changer.",
    name: "Marcus T.",
    role: "Founder",
    company: "Startup XYZ",
    initial: "M",
  },
  {
    quote:
      "Ut enim ad minim veniam quis nostrud exercitation. Their tech consulting saved us from a massive overengineering mistake. We saved months of dev time and thousands of dollars.",
    name: "Sarah K.",
    role: "CTO",
    company: "Tech Co",
    initial: "S",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-28 px-6 bg-sb-mid">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-display font-semibold tracking-[0.35em] uppercase text-sb-neon mb-4">
            Results
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-sb-white">
            Operatives speak.
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="bg-sb-dark rounded-2xl p-8 border-l-4 border-sb-neon relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
            >
              {/* Large decorative quote mark */}
              <div
                className="absolute top-3 right-5 font-display font-extrabold leading-none select-none pointer-events-none"
                style={{ fontSize: "80px", color: "rgba(0,229,255,0.06)" }}
              >
                "
              </div>

              <p className="text-sb-muted text-sm leading-relaxed mb-8 relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sb-mid border border-sb-neon/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-sb-neon font-display font-bold text-sm">
                    {t.initial}
                  </span>
                </div>
                <div>
                  <p className="text-sb-white font-semibold text-sm">{t.name}</p>
                  <p className="text-sb-muted text-xs">
                    {t.role} &middot; {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
