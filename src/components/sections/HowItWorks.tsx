"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "You reach out",
    subtitle: "(scattered)",
    description:
      "Tell us where the chaos lives — your pain points, your tools, your bottlenecks. No judgment.",
  },
  {
    number: "02",
    title: "We assess",
    subtitle: "your pain points",
    description:
      "We map your current state and identify exactly where automation and AI can unlock real leverage.",
  },
  {
    number: "03",
    title: "We build",
    subtitle: "and implement",
    description:
      "The right tools, custom-fit to your business. No bloated solutions. No unnecessary complexity.",
  },
  {
    number: "04",
    title: "You graduate",
    subtitle: "to operative status",
    description:
      "Promoted to Scotterbrain operative. Your business runs like the polished machine it was always meant to be.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6 bg-sb-mid overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-display font-semibold tracking-[0.35em] uppercase text-sb-neon mb-4">
            The Process
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-sb-white">
            From scattered to operative.
          </h2>
        </motion.div>

        {/* Steps grid */}
        <div className="relative">
          {/* Horizontal connecting line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gradient-to-r from-sb-neon/0 via-sb-neon/20 to-sb-neon/0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative flex flex-col md:items-center md:text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              >
                {/* Number badge */}
                <div className="relative mb-6 md:mx-auto">
                  <div className="w-20 h-20 rounded-2xl bg-sb-dark border border-sb-neon/25 flex items-center justify-center relative z-10 shadow-lg shadow-sb-neon/5">
                    <span className="font-display font-extrabold text-2xl text-sb-neon leading-none">
                      {step.number}
                    </span>
                  </div>
                  {/* Glow beneath number */}
                  <div className="absolute inset-0 rounded-2xl bg-sb-neon/5 blur-lg" />
                </div>

                <h3 className="font-display font-bold text-xl text-sb-white mb-1">
                  {step.title}
                </h3>
                <p className="text-sb-orange text-sm font-medium mb-3 italic">
                  {step.subtitle}
                </p>
                <p className="text-sb-muted text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
