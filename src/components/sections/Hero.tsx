"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

const words = "Does AI automation leave you feeling scattered?".split(" ");

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-sb-dark px-6 py-20 overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: `
            linear-gradient(rgba(0,229,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-sb-dark pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Brain animation placeholder */}
        <motion.div
          className="mb-14 flex justify-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="brain-glow float-anim relative w-52 h-52 rounded-3xl border border-sb-neon/30 bg-sb-mid flex flex-col items-center justify-center gap-3">
            {/* Corner accents */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-sb-neon/60 rounded-tl-md" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-sb-neon/60 rounded-tr-md" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-sb-neon/60 rounded-bl-md" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-sb-neon/60 rounded-br-md" />

            <Brain className="w-20 h-20 text-sb-neon opacity-90" strokeWidth={1} />
            <p className="text-[10px] text-sb-muted tracking-[0.2em] uppercase font-display font-semibold">
              Brain Animation
            </p>
            <p className="text-[9px] text-sb-muted/50 px-6 text-center leading-relaxed">
              Puzzle pieces fly in from scattered positions
            </p>
          </div>
        </motion.div>

        {/* Headline with word stagger */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.1] mb-8 tracking-tight"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {words.map((word, i) => {
            const isHighlighted = word === "scattered?";
            return (
              <motion.span
                key={i}
                variants={wordVariants}
                className={`inline-block mr-[0.28em] ${
                  isHighlighted ? "text-sb-neon neon-text" : "text-sb-white"
                }`}
              >
                {word}
              </motion.span>
            );
          })}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="text-lg md:text-xl text-sb-muted max-w-2xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7, ease: "easeOut" }}
        >
          Join us today and graduate to becoming an agent of the{" "}
          <span className="text-sb-white font-semibold">Scotterbrain Alliance.</span>
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.7, ease: "easeOut" }}
        >
          <button className="px-8 py-4 bg-sb-orange text-white font-bold font-display rounded-xl text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-sb-orange/25 active:scale-100">
            Descatter My Business
          </button>
          <a
            href="#mission"
            className="px-8 py-4 text-sb-white border border-sb-white/20 rounded-xl text-lg font-medium hover:border-sb-neon/60 hover:text-sb-neon transition-all duration-300"
          >
            See What We Do ↓
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <motion.div
          className="w-px h-16 bg-gradient-to-b from-sb-neon to-transparent mx-auto"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ originY: 0 }}
        />
      </motion.div>
    </section>
  );
}
