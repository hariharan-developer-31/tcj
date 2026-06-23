import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Menu, 
  X, 
  Compass, 
  Mail,
  Star,
  Heart,
  Sparkles,
  Shield,
  CircleDollarSign,
  Zap,
  MessageCircle,
  ShoppingBag,
  HelpCircle
} from "lucide-react";
import Hls from "hls.js";
import heroVideo from "./assets/heropage.mp4";
import tcjLogo from "./assets/tcj logo.png";

// Custom standard social icons as clean SVGs to prevent version export discrepancies
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const TwitterIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

// Reusable animation helper with staggered delays and const typing for ease
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

// Robust HLS Video component with native safari fallback
interface HLSVideoProps {
  src: string;
  className?: string;
}

const HLSVideo: React.FC<HLSVideoProps> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 10,
        enableWorker: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => {
          console.warn("HLS play failed:", err);
        });
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari / iOS fallback
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((err) => {
          console.warn("Native HLS play failed:", err);
        });
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      loop
      playsInline
      autoPlay
    />
  );
};

// Word-by-word scroll driven reveal component
interface ScrollWordRevealProps {
  text: string;
  highlightWords?: string[];
  highlightedColor?: string;
  defaultColor?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  progressRange: [number, number]; // [startScroll, endScroll]
}

const ScrollWordReveal: React.FC<ScrollWordRevealProps> = ({
  text,
  highlightWords = [],
  highlightedColor = "text-foreground",
  defaultColor = "text-hero-subtitle",
  containerRef,
  progressRange,
}) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "start 0.2"],
  });

  const words = text.split(" ");
  
  return (
    <span className="flex flex-wrap justify-center gap-x-[0.35em] gap-y-[0.15em] leading-relaxed transition-colors select-none text-center">
      {words.map((word, index) => {
        // Distribute the progress range across words
        const totalWords = words.length;
        const rangeSpan = progressRange[1] - progressRange[0];
        
        const wordStart = progressRange[0] + (index / totalWords) * rangeSpan;
        const wordEnd = Math.min(progressRange[1], wordStart + (1 / totalWords) * rangeSpan);
        
        // Transform the scroll position to opacity
        const opacity = useTransform(scrollYProgress, [wordStart, wordEnd], [0.1, 1]);

        // Strip punctuation for matching
        const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()—?]/g, "");
        const isHighlighted = highlightWords.map(w => w.toLowerCase()).includes(cleanWord);

        return (
          <motion.span
            key={index}
            style={{ opacity }}
            className={`inline-block ${
              isHighlighted 
                ? `${highlightedColor} font-semibold font-sans tracking-[-0.5px]` 
                : defaultColor
            }`}
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
};

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mission Section scroll container reference
  const missionContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden font-sans">
      
      {/* 1. NAVBAR - Fully transparent, fixed top-0, z-50, custom padding */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-28 py-4 bg-transparent">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <img src={tcjLogo} alt="The Celestial Joint Logo" className="h-12 md:h-16 w-auto object-contain" />
          <span className="font-sans font-bold text-xl tracking-wide whitespace-nowrap">The Celestial Joint</span>
        </div>

        {/* Center-left: Nav Links */}
        <div className="hidden lg:flex items-center gap-4 text-sm font-medium ml-12">
          <a href="#home" className="text-muted-foreground hover:text-foreground transition-colors">Home</a>
          <span className="text-white/20 select-none">•</span>
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          <span className="text-white/20 select-none">•</span>
          <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Tarot</a>
          <span className="text-white/20 select-none">•</span>
          <a href="#shop" className="text-muted-foreground hover:text-foreground transition-colors">Shop</a>
          <span className="text-white/20 select-none">•</span>
          <a href="#booking" className="text-muted-foreground hover:text-foreground transition-colors">Book a Call</a>
        </div>

        {/* Right: Social icons (liquid-glass circular buttons) */}
        <div className="hidden md:flex items-center gap-3">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <InstagramIcon size={16} />
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <LinkedinIcon size={16} />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <TwitterIcon size={16} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-white/80 hover:text-white p-1"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/95 pt-24 px-8 flex flex-col gap-6 lg:hidden"
          >
            <a 
              href="#home" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-muted-foreground hover:text-white"
            >
              Home
            </a>
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-muted-foreground hover:text-white"
            >
              About
            </a>
            <a 
              href="#services" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-muted-foreground hover:text-white"
            >
              Tarot
            </a>
            <a 
              href="#shop" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-muted-foreground hover:text-white"
            >
              Shop
            </a>
            <a 
              href="#booking" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-muted-foreground hover:text-white"
            >
              Book a Call
            </a>

            <div className="h-px bg-white/10 my-4" />

            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <InstagramIcon size={20} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <LinkedinIcon size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="liquid-glass w-12 h-12 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <TwitterIcon size={20} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 2. HERO SECTION */}
      <section id="home" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black py-20">
        {/* Autoplay looping muted MP4 video background */}
        <div className="absolute inset-0 z-0">
          <video
            src={heroVideo}
            className="w-full h-full object-cover opacity-45"
            muted
            loop
            playsInline
            autoPlay
          />
          {/* Bottom gradient fade to black */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-28 md:pt-32 flex flex-col items-center">
          
          {/* Avatar Row */}
          <motion.div 
            {...fadeUp(0.1)}
            className="flex items-center gap-3 mb-8"
          >
            {/* <div className="flex -space-x-2">
              <img 
                src="/avatar-1.png" 
                alt="Reader Avatar 1" 
                className="w-8 h-8 rounded-full border-2 border-background object-cover" 
              />
              <img 
                src="/avatar-2.png" 
                alt="Reader Avatar 2" 
                className="w-8 h-8 rounded-full border-2 border-background object-cover" 
              />
              <img 
                src="/avatar-3.png" 
                alt="Reader Avatar 3" 
                className="w-8 h-8 rounded-full border-2 border-background object-cover" 
              />
            </div> */}
            {/* <span className="text-muted-foreground text-sm font-medium tracking-tight">
              7,000+ people already subscribed
            </span> */}
          </motion.div>

          {/* Heading */}
          <motion.h1 
            {...fadeUp(0.2)}
            className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-[-2px] leading-[0.95] text-white mb-6 whitespace-nowrap"
          >
            Elevate Your <span className="font-serif italic font-normal text-white">Spirit</span> with Us
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            {...fadeUp(0.3)}
            className="text-lg md:text-xl text-hero-subtitle max-w-2xl mx-auto leading-relaxed mb-10"
          >
            A luxury sanctuary for the modern mystic. Discover healing through tarot, sacred crystals, and soulful guidance tailored for your divine journey.
          </motion.p>

          {/* Short brand statement */}
          <motion.div 
            {...fadeUp(0.35)}
            className="mb-12 text-xs tracking-[4px] uppercase text-muted-foreground font-semibold"
          >
            Where celestial wisdom meets modern healing
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            {...fadeUp(0.5)}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <motion.a 
              href="#services"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-black font-semibold text-sm rounded-lg px-8 py-3.5 hover:bg-white/95 transition-all text-center w-full sm:w-auto"
            >
              Book a Reading
            </motion.a>
            <motion.a 
              href="#shop"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="liquid-glass text-white border border-white/10 font-semibold text-sm rounded-lg px-8 py-3.5 hover:bg-white/5 transition-all text-center w-full sm:w-auto"
            >
              Shop Crystals
            </motion.a>
          </motion.div>

        </div>
      </section>


      {/* 3. ABOUT TCJ SECTION */}
      <section id="about" className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pt-52 md:pt-64 pb-16 md:pb-24">
        
        {/* Heading */}
        <motion.div 
          {...fadeUp(0.1)}
          className="text-center mb-10"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] leading-none text-white mb-6">
            Our story is written in the <span className="font-serif italic font-normal">stars.</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mt-4">
            TCJ — The Celestial Joint is a luxury sanctuary designed for the modern woman. We blend ancient wisdom with a premium aesthetic to help you navigate life's currents with grace.
          </p>
        </motion.div>

        {/* 3 Story Cards */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-20 mt-16">
          
          {/* Card 1: Brand Story */}
          <motion.div 
            {...fadeUp(0.2)}
            className="liquid-glass group rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 flex items-center justify-center mb-6 relative overflow-hidden rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500">
              <Star className="text-white w-8 h-8" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Brand Story</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              The Celestial Joint was born from a vision of bringing high-vibrational healing to the modern woman. We believe in the power of celestial alignment and soulful intention.
            </p>
          </motion.div>

          {/* Card 2: Mission */}
          <motion.div 
            {...fadeUp(0.3)}
            className="liquid-glass group rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 flex items-center justify-center mb-6 relative overflow-hidden rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="text-white w-8 h-8" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Our Mission</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              To empower women to reclaim their inner magic and manifest a life of abundance, love, and spiritual clarity through sacred tools and guidance.
            </p>
          </motion.div>

          {/* Card 3: Emotional Connection */}
          <motion.div 
            {...fadeUp(0.4)}
            className="liquid-glass group rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 flex items-center justify-center mb-6 relative overflow-hidden rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500">
              <Heart className="text-white w-8 h-8" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Divine Connection</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              You are a celestial being. We are here to hold space for your expansion, providing the tools and guidance to illuminate your unique path.
            </p>
          </motion.div>

        </div>

        {/* Bottom Tagline */}
        <motion.div 
          {...fadeUp(0.5)}
          className="text-center"
        >
          <span className="text-muted-foreground/80 hover:text-white text-sm font-mono tracking-wider bg-white/5 border border-white/10 px-5 py-2.5 rounded-full transition-colors">
            Healing is a luxury you deserve.
          </span>
        </motion.div>

      </section>


      {/* 4. MISSION SECTION */}
      <section id="how-it-works" ref={missionContainerRef} className="relative w-full max-w-6xl mx-auto px-6 pt-16 pb-32 md:pb-44 flex flex-col items-center">
        
        {/* Centered Large Looping Video */}
        <div className="relative w-full max-w-[500px] md:max-w-[650px] aspect-square rounded-full overflow-hidden border border-white/10 bg-black mb-16 flex items-center justify-center shadow-2xl">
          {/* Subtle liquid glow outline */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-white/10 opacity-60 z-10 pointer-events-none" />
          <video 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4"
            className="w-[90%] h-[90%] object-cover rounded-full opacity-70 filter contrast-125"
            muted
            loop
            playsInline
            autoPlay
          />
        </div>

        {/* Scroll Driven Reveal Paragraphs */}
        <div className="w-full max-w-4xl space-y-12">
          
          {/* Paragraph 1 */}
          <div className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-[-1px] leading-relaxed">
            <ScrollWordReveal 
              text="We're creating a sacred space where intuition meets intention — where you find your light, reclaim your power, and every reading becomes a portal to your highest self."
              highlightWords={["intuition", "meets", "intention"]}
              highlightedColor="text-white"
              defaultColor="text-white/40"
              containerRef={missionContainerRef}
              progressRange={[0, 0.45]}
            />
          </div>

          {/* Paragraph 2 */}
          <div className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed pt-6">
            <ScrollWordReveal 
              text="A sanctuary where healing, crystals, and celestial wisdom flow together — with more clarity, more peace, and deeper meaning for your divine journey."
              highlightWords={["healing", "crystals", "celestial", "wisdom"]}
              highlightedColor="text-white"
              defaultColor="text-white/35"
              containerRef={missionContainerRef}
              progressRange={[0.5, 1]}
            />
          </div>

        </div>

      </section>


      {/* 5. TAROT READING SERVICES */}
      <section id="services" className="relative w-full border-t border-white/10 bg-black py-32 md:py-44">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Header Label & Heading */}
          <div className="flex flex-col items-center text-center mb-16">
            <motion.span 
              {...fadeUp(0.1)}
              className="text-xs tracking-[4px] uppercase text-muted-foreground font-semibold mb-4"
            >
              SERVICES
            </motion.span>
            <motion.h2 
              {...fadeUp(0.2)}
              className="text-4xl md:text-6xl font-medium tracking-[-1px] text-white"
            >
              Professional <span className="font-serif italic font-normal text-white">Tarot</span> Guidance
            </motion.h2>
          </div>

          {/* Prominent Video Cover */}
          <motion.div 
            {...fadeUp(0.3)}
            className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black mb-20 shadow-2xl aspect-[3/1]"
          >
            <video 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_125119_8e5ae31c-0021-4396-bc08-f7aebeb877a2.mp4"
              className="w-full h-full object-cover opacity-75"
              muted
              loop
              playsInline
              autoPlay
            />
            {/* Visual Glass Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 pointer-events-none" />
          </motion.div>

          {/* 6-Column Service Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Love Reading */}
            <motion.div 
              {...fadeUp(0.4)}
              className="liquid-glass p-8 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Heart size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Love Reading</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Dive deep into the heart's mysteries. Find clarity in your relationships and open your heart to true connection.
                </p>
                <button className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:gap-3 transition-all">
                  Book Love Reading <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* Career Reading */}
            <motion.div 
              {...fadeUp(0.5)}
              className="liquid-glass p-8 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Compass size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Career Reading</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Align your professional path with your purpose. Step into your power and manifest the success you deserve.
                </p>
                <button className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:gap-3 transition-all">
                  Book Career Reading <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* Energy Reading */}
            <motion.div 
              {...fadeUp(0.6)}
              className="liquid-glass p-8 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Energy Reading</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  A snapshot of your current vibrational state. Clear blocks and realign with your highest self.
                </p>
                <button className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:gap-3 transition-all">
                  Book Energy Reading <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* Future Guidance */}
            <motion.div 
              {...fadeUp(0.7)}
              className="liquid-glass p-8 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Star size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Future Guidance</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Glimpse the possibilities that lie ahead. Navigate the unknown with confidence and spiritual foresight.
                </p>
                <button className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:gap-3 transition-all">
                  Book Future Guidance <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* Yes/No Reading */}
            <motion.div 
              {...fadeUp(0.8)}
              className="liquid-glass p-8 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <HelpCircle size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Yes/No Reading</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Quick answers to your most pressing questions. Immediate peace of mind for decisive action.
                </p>
                <button className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:gap-3 transition-all">
                  Ask Now <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>

            {/* Monthly Reading */}
            <motion.div 
              {...fadeUp(0.9)}
              className="liquid-glass p-8 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Monthly Reading</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Your roadmap for the 30 days ahead. Stay grounded and prepared for the cosmic shifts.
                </p>
                <button className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:gap-3 transition-all">
                  Subscribe Monthly <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>

          </div>

        </div>
      </section>


      {/* 6. BOOK A CALL SECTION */}
      <section id="booking" className="relative w-full border-t border-white/10 bg-black py-32 md:py-44">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col items-center text-center mb-16">
            <motion.span {...fadeUp(0.1)} className="text-xs tracking-[4px] uppercase text-muted-foreground font-semibold mb-4">RESERVATIONS</motion.span>
            <motion.h2 {...fadeUp(0.2)} className="text-4xl md:text-6xl font-medium tracking-[-1px] text-white">Book Your <span className="font-serif italic font-normal text-white">Digital</span> Session</motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div {...fadeUp(0.3)} className="liquid-glass p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center">
              <h3 className="text-2xl font-semibold text-white mb-2">15 Min Session</h3>
              <p className="text-muted-foreground text-sm mb-6">Quick alignment for focused questions.</p>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-white mb-8">₹2,499</div>
                <button className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-colors px-12 whitespace-nowrap">BOOK NOW</button>
              </div>
            </motion.div>
            <motion.div {...fadeUp(0.4)} className="liquid-glass p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center scale-105 z-10 bg-white/[0.02]">
              <div className="bg-white text-black text-[10px] font-bold tracking-widest px-3 py-1 rounded-full mb-4">MOST POPULAR</div>
              <h3 className="text-2xl font-semibold text-white mb-2">30 Min Session</h3>
              <p className="text-muted-foreground text-sm mb-6">Deep dive into specific life areas.</p>
              <div className="mt-auto w-full">
                <div className="text-3xl font-bold text-white mb-8">₹4,999</div>
                <button className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-colors px-12 whitespace-nowrap">BOOK NOW</button>
              </div>
            </motion.div>
            <motion.div {...fadeUp(0.5)} className="liquid-glass p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center">
              <h3 className="text-2xl font-semibold text-white mb-2">60 Min Session</h3>
              <p className="text-muted-foreground text-sm mb-6">Full spiritual overhaul and guidance.</p>
              <div className="mt-auto">
                <div className="text-3xl font-bold text-white mb-8">₹7,999</div>
                <button className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-colors px-12 whitespace-nowrap">BOOK NOW</button>
              </div>
            </motion.div>
          </div>

          <div className="mt-20 text-center">
            <motion.p {...fadeUp(0.6)} className="text-muted-foreground text-sm max-w-2xl mx-auto">
              Available via WhatsApp or Zoom. Why book with us? We offer more than just readings; we offer a transformational experience rooted in empathy, accuracy, and luxury.
            </motion.p>
          </div>
        </div>
      </section>

      {/* 7. CRYSTAL SHOP SECTION */}
      <section id="shop" className="relative w-full border-t border-white/10 bg-black py-32 md:py-44">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col items-center text-center mb-16">
            <motion.span {...fadeUp(0.1)} className="text-xs tracking-[4px] uppercase text-muted-foreground font-semibold mb-4">CURATED MAGIC</motion.span>
            <motion.h2 {...fadeUp(0.2)} className="text-4xl md:text-6xl font-medium tracking-[-1px] text-white">The <span className="font-serif italic font-normal text-white">Sacred</span> Collection</motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8">
            {[
              { title: "Healing Crystals", desc: "Sacred Restoration", benefit: "Restore your natural flow.", icon: <Sparkles size={20} /> },
              { title: "Love & Attraction", desc: "Magnetic Romance", benefit: "Radiate the energy of love.", icon: <Heart size={20} /> },
              { title: "Protection Stones", desc: "Divine Shield", benefit: "Feel safe in your own light.", icon: <Shield size={20} /> },
              { title: "Wealth Crystals", desc: "Abundance Flow", benefit: "Align with frequency of wealth.", icon: <CircleDollarSign size={20} /> },
              { title: "Chakra Healing", desc: "Vibrational Balance", benefit: "Total spiritual equilibrium.", icon: <Zap size={20} /> }
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp(0.3 + i * 0.1)} className="liquid-glass p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center hover:border-white/20 transition-all group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground mb-2">{item.desc}</p>
                <p className="text-[11px] text-white/60 leading-relaxed mb-4">{item.benefit}</p>
                <button className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 hover:gap-2 transition-all">
                  SHOP <ShoppingBag size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. WHY CHOOSE TCJ SECTION */}
      <section className="relative w-full border-t border-white/10 bg-black py-32 md:py-44">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <motion.span {...fadeUp(0.1)} className="text-xs tracking-[4px] uppercase text-muted-foreground font-semibold mb-4 block">TRUSTED BY SOULS</motion.span>
              <motion.h2 {...fadeUp(0.2)} className="text-4xl md:text-6xl font-medium tracking-[-1px] text-white mb-8">Why the <span className="font-serif italic font-normal text-white">modern mystic</span> chooses The Celestial Joint</motion.h2>
              <div className="grid grid-cols-1 gap-6">
                {[
                  { title: "Premium Accuracy", text: "Our readings are celebrated for their profound precision and insight." },
                  { title: "Luxury Experience", text: "Every touchpoint is designed to feel like a spiritual spa for your soul." },
                  { title: "Feminine Energy", text: "A safe, nurturing space created specifically for women's growth." },
                  { title: "Modern Approach", text: "Spirituality that fits seamlessly into your contemporary lifestyle." },
                  { title: "Ethical Sourcing", text: "Every crystal is hand-picked and ethically obtained from the earth." },
                  { title: "Lasting Impact", text: "We provide tools for life-long healing, not just quick answers." }
                ].map((item, i) => (
                  <motion.div key={i} {...fadeUp(0.3 + i * 0.1)} className="flex gap-4">
                    <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative aspect-square flex items-center justify-center p-0"
            >
               <img 
                src={tcjLogo}
                alt="The Celestial Joint Logo"
                className="w-full max-w-[650px] h-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIAL SECTION */}
      <section className="relative w-full border-t border-white/10 bg-black py-32 md:py-44">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-5xl font-medium text-white mb-4">Divine <span className="font-serif italic font-normal">Whispers</span></motion.h2>
            <p className="text-muted-foreground text-sm">Real stories from women within our celestial circle.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sophia L.", text: "TCJ is my secret weapon for clarity. The energy reading changed my entire perspective on my career." },
              { name: "Isabella M.", text: "The crystals I bought are stunning and the energy they bring to my home is palpable. Truly premium." },
              { name: "Elena R.", text: "My 60-minute session felt like years of therapy compressed into a magical hour of healing." },
              { name: "Maya J.", text: "The Love Reading was so accurate it gave me chills. I finally feel ready to move forward." },
              { name: "Chloe W.", text: "A beautiful, feminine sanctuary. TCJ is the only brand I trust with my spiritual growth." },
              { name: "Ava G.", text: "Monthly readings are my non-negotiable ritual now. I feel so much more in sync with the universe." }
            ].map((t, i) => (
              <motion.div key={i} {...fadeUp(0.2 + i * 0.1)} className="liquid-glass p-8 rounded-2xl border border-white/5 italic text-white/80 text-sm leading-relaxed">
                "{t.text}"
                <div className="not-italic font-bold text-white mt-6 text-xs tracking-widest uppercase">— {t.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. DAILY AFFIRMATION SECTION */}
      <section className="relative w-full border-t border-white/10 bg-white/[0.02] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div {...fadeUp(0.1)} className="mb-8 flex justify-center text-white/40">
            <Sparkles size={32} />
          </motion.div>
          <motion.h3 {...fadeUp(0.2)} className="text-2xl md:text-3xl font-serif italic text-white mb-6">
            "Be like the moon; even when you are not whole, you are still beautiful and full of light."
          </motion.h3>
          <motion.div {...fadeUp(0.3)} className="space-y-2">
            <p className="text-xs tracking-[4px] uppercase text-muted-foreground font-semibold">DAILY AFFIRMATION</p>
            <p className="text-lg text-white/60">"I am a magnet for miracles and abundance."</p>
          </motion.div>
        </div>
      </section>

      {/* 11. FAQ SECTION */}
      <section className="relative w-full border-t border-white/10 bg-black py-32 md:py-44">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2 {...fadeUp(0.1)} className="text-4xl font-medium text-white mb-4">Common <span className="font-serif italic font-normal">Inquiries</span></motion.h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How does a Tarot Reading work?", a: "Our readings use the cards as a mirror to your subconscious and the cosmic energies surrounding you." },
              { q: "How do I schedule my booking?", a: "Select your service, choose a time, and you'll receive a confirmation for your digital session via email." },
              { q: "Are your crystals authentic?", a: "Yes, all our sacred crystals are 100% natural, authentic, and energetically cleansed before they are shipped." },
              { q: "What is your refund policy?", a: "Due to the nature of spiritual services, readings are non-refundable, but we ensure total satisfaction with every session." },
              { q: "Are sessions via Zoom or WhatsApp?", a: "We offer both! You can choose the platform that feels most comfortable for you during the checkout process." }
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp(0.2 + i * 0.1)} className="liquid-glass p-6 rounded-xl border border-white/5">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                   <HelpCircle size={16} className="text-white/40" /> {item.q}
                </h4>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. CONTACT SECTION */}
      <section id="contact" className="relative w-full border-t border-white/10 bg-black py-32 md:py-44">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-20">
          <div>
            <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-6xl font-medium text-white mb-6">Let's <span className="font-serif italic font-normal">Connect</span></motion.h2>
            <motion.p {...fadeUp(0.2)} className="text-muted-foreground text-lg mb-10 leading-relaxed">
              We're here to hold space for you. Reach out with any questions about your journey or to learn more about our sacred offerings.
            </motion.p>
            <div className="space-y-6">
              <motion.div {...fadeUp(0.3)} className="flex items-center gap-4 text-white hover:text-white/80 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center"><MessageCircle size={20} /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">WhatsApp Support</p>
                  <p className="text-base">Message our celestial team</p>
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.4)} className="flex items-center gap-4 text-white hover:text-white/80 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center"><InstagramIcon size={20} /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Instagram</p>
                  <p className="text-base">@TheCelestialJoint</p>
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.5)} className="flex items-center gap-4 text-white hover:text-white/80 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center"><Mail size={20} /></div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Email</p>
                  <p className="text-base">hello@thecelestialjoint.com</p>
                </div>
              </motion.div>
            </div>
          </div>
          <motion.div {...fadeUp(0.3)} className="liquid-glass p-8 rounded-3xl border border-white/10 h-fit">
            <h3 className="text-xl font-semibold mb-6">Send a Message</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-colors" />
              <input type="email" placeholder="Your Email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-colors" />
              <textarea placeholder="How can we help your journey?" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-white/30 transition-colors" />
              <button className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-colors">SEND MESSAGE</button>
            </div>
          </motion.div>
        </div>
      </section>


      {/* 13. CTA SECTION */}
      <section className="relative w-full border-t border-white/10 py-32 md:py-44 overflow-hidden flex items-center justify-center">
        {/* Background HLS Video */}
        <div className="absolute inset-0 z-0">
          <HLSVideo 
            src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8"
            className="absolute inset-0 w-full h-full object-cover opacity-35 filter contrast-125 saturate-0"
          />
          {/* Overlay to dim video and ensure typography is highly readable */}
          <div className="absolute inset-0 bg-black/75 z-[1]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">

          {/* Heading */}          <motion.h2 
            {...fadeUp(0.2)}
            className="text-4xl md:text-6xl font-medium tracking-tight text-white mb-6"
          >
            Start Your <span className="font-serif italic font-normal text-white">Journey</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p 
            {...fadeUp(0.3)}
            className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Reclaim your magic. Join the celestial circle and begin your journey toward depth, direction, and divine alignment today.
          </motion.p>

          {/* Buttons */}
          <motion.div 
            {...fadeUp(0.4)}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <motion.a 
              href="#home"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-black font-semibold text-sm rounded-lg px-8 py-3.5 hover:bg-white/95 transition-all text-center w-full sm:w-auto"
            >
              Join the Circle
            </motion.a>
            <motion.button 
              onClick={() => {
                alert("The Shop is launching soon. Stay tuned!");
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="liquid-glass text-white border border-white/10 font-semibold text-sm rounded-lg px-8 py-3.5 hover:bg-white/5 transition-all text-center w-full sm:w-auto"
            >
              Shop Crystals
            </motion.button>
          </motion.div>

        </div>
      </section>


      {/* 14. FOOTER */}
      <footer className="w-full border-t border-white/10 py-12 bg-black px-6 md:px-28">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Rights */}
          <div className="flex flex-col gap-1">
            <span className="text-white font-bold text-lg">The Celestial Joint</span>
            <span className="text-muted-foreground text-xs">
              © 2026 The Celestial Joint. Divine rights reserved.
            </span>
          </div>

          <div className="text-center md:text-right">
            <p className="text-white text-sm font-semibold mb-1">Join The Celestial Circle</p>
            <p className="text-muted-foreground text-xs">Receive weekly horoscopes and exclusive shop drops.</p>
          </div>

          {/* Right: Policy Links */}
          <div className="flex items-center gap-6">
            <a href="#privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Privacy</a>
            <a href="#terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Terms</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

/**
 * TCJ BRAND TAGLINES (FOR REFERENCE)
 * 1. Elevate your everyday.
 * 2. Your soul’s modern sanctuary.
 * 3. Celestial wisdom for the modern woman.
 * 4. Where magic meets luxury.
 * 5. Trust the journey, trust the joint.
 * 6. Illuminate your path.
 * 7. Spiritual healing, refined.
 * 8. The intersection of stars and soul.
 * 9. Manifesting your highest self.
 * 10. Sacred tools for a soulful life.
 * 11. Your divine blueprint, revealed.
 * 12. Luxury energy for a premium life.
 * 13. Ancient wisdom, modern glow.
 * 14. The art of celestial living.
 * 15. Healing is a luxury you deserve.
 * 16. Find your light at TCJ.
 * 17. A sanctuary for your spirit.
 * 18. Guided by the stars, rooted in love.
 * 19. Your portal to the divine.
 * 20. The Celestial Joint: High-vibrational living.
 */
