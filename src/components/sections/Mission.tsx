"use client";

import { motion } from "framer-motion";

export default function Mission() {
  return (
    <section id="mission" className="py-28 px-6 bg-sb-mid">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="text-xs font-display font-semibold tracking-[0.35em] uppercase text-sb-neon mb-8">
          Our Mission
        </p>

        <div className="relative inline-block">
          {/* Decorative line above */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-sb-neon/50 to-transparent mx-auto mb-8" />

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-sb-white leading-tight mb-6">
            To turn your business into a{" "}
            <span className="text-sb-orange">polished, efficient machine.</span>
          </h2>

          <p className="text-sb-muted italic text-sm md:text-base mt-4">
            ***and to put <em className="text-sb-white not-italic font-semibold">descatter</em> in the dictionary
          </p>

          {/* Decorative line below */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-sb-neon/50 to-transparent mx-auto mt-8" />
        </div>
      </motion.div>
    </section>
  );
}
