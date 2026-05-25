import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Menu, 
  X, 
  BookOpen, 
  PenTool, 
  Users, 
  Compass, 
  Mail,
  Loader2
} from "lucide-react";
import Hls from "hls.js";

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
    offset: ["start end", "end start"],
  });

  const words = text.split(" ");
  
  return (
    <span className="flex flex-wrap justify-center gap-x-[0.35em] gap-y-[0.15em] leading-relaxed transition-colors select-none text-center">
      {words.map((word, index) => {
        // Distribute the progress range across words
        const totalWords = words.length;
        const rangeSpan = progressRange[1] - progressRange[0];
        
        const wordStart = progressRange[0] + (index / totalWords) * rangeSpan;
        const wordEnd = Math.min(progressRange[1], wordStart + (1.5 / totalWords) * rangeSpan); // slight overlap for smoothness
        
        // Transform the scroll position to opacity
        const opacity = useTransform(scrollYProgress, [wordStart, wordEnd], [0.15, 1]);

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
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mission Section scroll container reference
  const missionContainerRef = useRef<HTMLDivElement>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden font-sans">
      
      {/* 1. NAVBAR - Fully transparent, fixed top-0, z-50, custom padding */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-28 py-4 bg-transparent">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-foreground/60">
            <div className="w-3 h-3 rounded-full border border-foreground/60" />
          </div>
          <span className="font-sans font-bold text-lg tracking-wide">Mindloop</span>
        </div>

        {/* Center-left: Nav Links */}
        <div className="hidden lg:flex items-center gap-4 text-sm font-medium ml-12">
          <a href="#home" className="text-muted-foreground hover:text-foreground transition-colors">Home</a>
          <span className="text-white/20 select-none">•</span>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <span className="text-white/20 select-none">•</span>
          <a href="#philosophy" className="text-muted-foreground hover:text-foreground transition-colors">Philosophy</a>
          <span className="text-white/20 select-none">•</span>
          <a href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">Use Cases</a>
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
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-muted-foreground hover:text-white"
            >
              How It Works
            </a>
            <a 
              href="#philosophy" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-muted-foreground hover:text-white"
            >
              Philosophy
            </a>
            <a 
              href="#use-cases" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-medium text-muted-foreground hover:text-white"
            >
              Use Cases
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
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_120549_0cd82c36-56b3-4dd9-b190-069cfc3a623f.mp4"
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
            <div className="flex -space-x-2">
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
            </div>
            <span className="text-muted-foreground text-sm font-medium tracking-tight">
              7,000+ people already subscribed
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            {...fadeUp(0.2)}
            className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] leading-[0.95] text-white mb-6"
          >
            Get <span className="font-serif italic font-normal text-white">Inspired</span> with Us
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            {...fadeUp(0.3)}
            className="text-lg md:text-xl text-hero-subtitle max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Join our feed for meaningful updates, news around technology and a shared journey toward depth and direction.
          </motion.p>

          {/* Email Subscription Form */}
          <motion.div 
            {...fadeUp(0.4)}
            className="w-full max-w-lg px-4"
          >
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  onSubmit={handleSubscribe}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="liquid-glass p-1.5 rounded-full flex items-center w-full gap-2 border border-white/10"
                >
                  <div className="pl-4 text-white/40 flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    required
                    placeholder="Enter your email address..." 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-white placeholder:text-white/45 outline-none flex-grow text-sm py-2 px-1 focus:ring-0"
                  />
                  <motion.button 
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="bg-white text-black font-semibold text-xs tracking-wider rounded-full px-6 py-3 hover:bg-white/90 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        SUBSCRIBE <ArrowRight size={14} />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 border border-white/20 p-4 rounded-3xl flex items-center gap-3 text-left w-full"
                >
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                    <Check size={20} className="stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">Welcome to the loop.</h4>
                    <p className="text-xs text-muted-foreground">We just sent your first newsletter digest. Stay tuned!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </section>


      {/* 3. "SEARCH HAS CHANGED" SECTION */}
      <section id="philosophy" className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pt-52 md:pt-64 pb-16 md:pb-24">
        
        {/* Heading */}
        <motion.div 
          {...fadeUp(0.1)}
          className="text-center mb-10"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] leading-none text-white mb-6">
            Search has <span className="font-serif italic font-normal">changed.</span> Have you?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mt-4">
            AI engines answer with cold logic. But deep understanding requires narrative, rhythm, and human intent. We curate the thoughts that models fail to dream.
          </p>
        </motion.div>

        {/* 3 Platform Cards */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-20 mt-16">
          
          {/* Card 1: ChatGPT */}
          <motion.div 
            {...fadeUp(0.2)}
            className="liquid-glass group rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-48 h-48 flex items-center justify-center mb-6 relative overflow-hidden rounded-2xl bg-black/40 group-hover:scale-105 transition-transform duration-500">
              <img 
                src="/icon-chatgpt.png" 
                alt="ChatGPT Icon" 
                className="w-full h-full object-cover" 
              />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">ChatGPT</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Generates instant summaries. Excellent for reference, but lacks the personal style, soul, and lived experience that shapes powerful newsletters.
            </p>
          </motion.div>

          {/* Card 2: Perplexity */}
          <motion.div 
            {...fadeUp(0.3)}
            className="liquid-glass group rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-48 h-48 flex items-center justify-center mb-6 relative overflow-hidden rounded-2xl bg-black/40 group-hover:scale-105 transition-transform duration-500">
              <img 
                src="/icon-perplexity.png" 
                alt="Perplexity Icon" 
                className="w-full h-full object-cover" 
              />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Perplexity</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Synthesizes raw web data in real time. Accurate yet dry, converting complex, nuanced essays into quick bullet points without artistic intent.
            </p>
          </motion.div>

          {/* Card 3: Google AI */}
          <motion.div 
            {...fadeUp(0.4)}
            className="liquid-glass group rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-48 h-48 flex items-center justify-center mb-6 relative overflow-hidden rounded-2xl bg-black/40 group-hover:scale-105 transition-transform duration-500">
              <img 
                src="/icon-google.png" 
                alt="Google AI Icon" 
                className="w-full h-full object-cover" 
              />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Google AI</h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Indexes and maps knowledge globally. But summaries leave no room for questions. True insight comes when readers join the debate.
            </p>
          </motion.div>

        </div>

        {/* Bottom Tagline */}
        <motion.div 
          {...fadeUp(0.5)}
          className="text-center"
        >
          <span className="text-muted-foreground/80 hover:text-white text-sm font-mono tracking-wider bg-white/5 border border-white/10 px-5 py-2.5 rounded-full transition-colors">
            If you don't answer the questions, someone else will.
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
              text="We're building a space where curiosity meets clarity — where readers find depth, writers find reach, and every newsletter becomes a conversation worth having."
              highlightWords={["curiosity", "meets", "clarity"]}
              highlightedColor="text-white"
              defaultColor="text-white/40"
              containerRef={missionContainerRef}
              progressRange={[0.1, 0.5]}
            />
          </div>

          {/* Paragraph 2 */}
          <div className="text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed pt-6">
            <ScrollWordReveal 
              text="A platform where content, community, and insight flow together — with less noise, less friction, and more meaning for everyone involved."
              highlightWords={[]}
              highlightedColor="text-white"
              defaultColor="text-white/35"
              containerRef={missionContainerRef}
              progressRange={[0.5, 0.95]}
            />
          </div>

        </div>

      </section>


      {/* 5. SOLUTION SECTION */}
      <section id="use-cases" className="relative w-full border-t border-white/10 bg-black py-32 md:py-44">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Header Label & Heading */}
          <div className="flex flex-col items-center text-center mb-16">
            <motion.span 
              {...fadeUp(0.1)}
              className="text-xs tracking-[4px] uppercase text-muted-foreground font-semibold mb-4"
            >
              SOLUTION
            </motion.span>
            <motion.h2 
              {...fadeUp(0.2)}
              className="text-4xl md:text-6xl font-medium tracking-[-1px] text-white"
            >
              The platform for <span className="font-serif italic font-normal text-white">meaningful</span> content
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

          {/* 4-Column Feature Grid */}
          <div className="grid md:grid-cols-4 gap-8">
            
            {/* Curated Feed */}
            <motion.div 
              {...fadeUp(0.4)}
              className="liquid-glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Compass size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base mb-1">Curated Feed</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A personal sanctuary. Zero algorithmic traps, ad walls, or clickbait. Just the newsletters you trust.
                </p>
              </div>
            </motion.div>

            {/* Writer Tools */}
            <motion.div 
              {...fadeUp(0.5)}
              className="liquid-glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <PenTool size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base mb-1">Writer Tools</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  An elegant editorial workspace focused on words. Rich typography, styling control, and seamless analytics.
                </p>
              </div>
            </motion.div>

            {/* Community */}
            <motion.div 
              {...fadeUp(0.6)}
              className="liquid-glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Users size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base mb-1">Community</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Real conversations, not comment sections. Form lasting intellectual bonds with your readers directly in the app.
                </p>
              </div>
            </motion.div>

            {/* Distribution */}
            <motion.div 
              {...fadeUp(0.7)}
              className="liquid-glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base mb-1">Distribution</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Send to web, email list, or custom RSS feeds automatically. Own your intellectual property forever.
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>


      {/* 6. CTA SECTION */}
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
          
          {/* Concentric Circle Logo Icon */}
          <motion.div 
            {...fadeUp(0.1)}
            className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/60 mb-6"
          >
            <div className="w-5 h-5 rounded-full border border-white/60" />
          </motion.div>

          {/* Heading */}
          <motion.h2 
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
            Reclaim your attention. Subscribe to the modern, clean publishing loop and start reading or sharing ideas today.
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
              Subscribe Now
            </motion.a>
            <motion.button 
              onClick={() => {
                alert("Writer portal launch is scheduled for July 2026. Stay tuned!");
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="liquid-glass text-white border border-white/10 font-semibold text-sm rounded-lg px-8 py-3.5 hover:bg-white/5 transition-all text-center w-full sm:w-auto"
            >
              Start Writing
            </motion.button>
          </motion.div>

        </div>
      </section>


      {/* 7. FOOTER */}
      <footer className="w-full border-t border-white/10 py-12 bg-black px-6 md:px-28">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Rights */}
          <span className="text-muted-foreground text-sm">
            © 2026 Mindloop. All rights reserved.
          </span>

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
