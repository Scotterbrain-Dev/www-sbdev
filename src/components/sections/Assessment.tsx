"use client";

import { motion } from "framer-motion";

export default function Assessment() {
  return (
    <section id="assessment" className="py-28 px-6 bg-sb-dark">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="relative bg-sb-mid border border-sb-orange/20 rounded-3xl p-10 md:p-16 text-center overflow-hidden">
          {/* Warm radial glow */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(255,107,43,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Orange corner accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sb-orange/40 to-transparent" />

          <div className="relative z-10">
            <p className="text-xs font-display font-semibold tracking-[0.35em] uppercase text-sb-orange mb-6">
              Free Assessment
            </p>
            <h2 className="text-2xl md:text-4xl font-display font-bold text-sb-white mb-6 leading-tight">
              Feeling overwhelmed by your tech stack?
            </h2>
            <p className="text-sb-muted text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Tell us your pain points and we'll find open-source solutions —{" "}
              <span className="text-sb-white font-semibold">free.</span>
            </p>
            <button className="px-10 py-4 bg-sb-orange text-white font-bold font-display rounded-xl text-lg hover:scale-105 hover:shadow-xl hover:shadow-sb-orange/25 transition-all duration-200 active:scale-100">
              Get My Free Assessment
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
