import Hero from "@/components/sections/Hero";
import Mission from "@/components/sections/Mission";
import Services from "@/components/sections/Services";
import HowItWorks from "@/components/sections/HowItWorks";
import Assessment from "@/components/sections/Assessment";
import Testimonials from "@/components/sections/Testimonials";
import SiteFooter from "@/components/sections/SiteFooter";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <Mission />
      <Services />
      <HowItWorks />
      <Assessment />
      <Testimonials />
      <SiteFooter />
    </main>
  );
}
