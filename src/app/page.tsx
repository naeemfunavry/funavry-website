import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
// The previous grid-of-cards capabilities section. Kept for reference while the
// OS view is being reviewed — swap the two lines in <main> to go back.
// import Capabilities from "@/components/sections/Capabilities";
import CapabilitiesOS from "@/components/sections/CapabilitiesOS";
// The previous framed-deck case studies section. Kept for reference while the
// tablet showcase is reviewed — swap the two lines in <main> to go back.
// import Work from "@/components/sections/Work";
import WorkShowcase from "@/components/sections/WorkShowcase";
import Proof from "@/components/sections/Proof";
import Industries from "@/components/sections/Industries";
import TechStack from "@/components/sections/TechStack";
import Testimonials from "@/components/sections/Testimonials";
// Written and ready, but not in the running order below. Commented rather than
// left as a live import: an import Next can see is an import Next bundles, so
// a switched-off section still ships to every visitor.
// import Insights from "@/components/sections/Insights";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import Cursor from "@/components/ui/Cursor";

export default function Home() {
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        {/* <Capabilities /> */}
        <CapabilitiesOS />
        {/* <Work /> */}
        <WorkShowcase />
        <Proof />
        <Industries />
        <TechStack />
        <Testimonials />
        {/* <Insights /> */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
