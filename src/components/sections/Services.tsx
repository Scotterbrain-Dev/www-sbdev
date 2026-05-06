"use client";

import { motion } from "framer-motion";
import { Phone, Workflow, Code2 } from "lucide-react";

const services = [
  {
    icon: Phone,
    title: "Voice AI Agents",
    description:
      "AI that never sleeps. Lead gen, after-hours answering, speed-to-lead, and secretary agents that handle calls so you don't have to.",
    highlights: ["Lead generation", "24/7 answering", "Speed-to-lead", "Secretary agents"],
  },
  {
    icon: Workflow,
    title: "Business Automation",
    description:
      "Custom n8n workflows, process optimization, and automation that eliminates the busywork and keeps your operations tight.",
    highlights: ["n8n workflows", "Custom automations", "Process optimization", "Integration setup"],
  },
  {
    icon: Code2,
    title: "Tech Consulting",
    description:
      "Open-source tool recommendations, stack audits, and AI implementation roadmaps built specifically for your business reality.",
    highlights: ["Open-source tools", "Stack audits", "AI implementation", "Tech roadmaps"],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Services() {
  return (
    <section id="services" className="py-28 px-6 bg-sb-dark">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-display font-semibold tracking-[0.35em] uppercase text-sb-neon mb-4">
            What We Do
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-sb-white">
            Tools that actually work.
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={cardVariants}
                className="group relative bg-sb-mid border border-sb-white/5 rounded-2xl p-8 hover:border-sb-neon/30 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Neon top accent line on hover */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-sb-neon/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

                {/* Icon container */}
                <div className="mb-6 w-12 h-12 rounded-xl bg-sb-dark border border-sb-neon/20 flex items-center justify-center group-hover:border-sb-neon/50 group-hover:shadow-lg group-hover:shadow-sb-neon/10 transition-all duration-300">
                  <Icon className="w-5 h-5 text-sb-neon" strokeWidth={1.5} />
                </div>

                <h3 className="text-xl font-display font-bold text-sb-white mb-3">
                  {service.title}
                </h3>
                <p className="text-sb-muted text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Highlight pills */}
                <ul className="space-y-2">
                  {service.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-xs text-sb-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-sb-neon flex-shrink-0 opacity-80" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
