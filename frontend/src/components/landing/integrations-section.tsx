"use client";

import { useEffect, useState, useRef } from "react";
import {
  Code2,
  Zap,
  Server,
  Database,
  Radio,
  FileCode2,
  Container,
  Workflow,
  Palette,
  Sparkles,
  ShieldCheck,
  Globe,
} from "lucide-react";

const integrations = [
  { name: "React 19", category: "Frontend UI", icon: Code2 },
  { name: "Vite", category: "Build Tool", icon: Zap },
  { name: "Node.js", category: "Backend Framework", icon: Server },
  { name: "MongoDB (Mongoose)", category: "Database", icon: Database },
  { name: "Socket.io", category: "Real-time Sync", icon: Radio },
  { name: "Monaco Editor", category: "Code Editor", icon: FileCode2 },
  { name: "Docker (Dockerode)", category: "Sandboxed Execution", icon: Container },
  { name: "Redis + BullMQ", category: "Job Queue", icon: Workflow },
  { name: "Tailwind CSS", category: "Styling", icon: Palette },
  { name: "AI API", category: "AI Review & Hints", icon: Sparkles },
  { name: "JWT + bcrypt", category: "Auth & Security", icon: ShieldCheck },
  { name: "Cheerio + Axios", category: "Web Scraping & HTTP", icon: Globe },
];

export function IntegrationsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="integrations" ref={sectionRef} className="relative py-16 lg:py-24 overflow-hidden">
      {/* Header */}
      <div className="relative z-10 text-center mb-6">
        <span
          className={`inline-flex items-center gap-4 text-sm font-mono text-muted-foreground mb-8 transition-all duration-700 justify-center ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="w-12 h-px bg-foreground/20" />
          Tech Stack & Integrations
          <span className="w-12 h-px bg-foreground/20" />
        </span>

        <h2
          className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Built on modern
          <br />
          <span className="text-muted-foreground">tech stack.</span>
        </h2>

        <p
          className={`mt-8 text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto transition-all duration-1000 delay-100 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          CodeFlow integrates directly with industry-standard frameworks, databases, sandboxed container runtimes, and real-time sync engines.
        </p>
      </div>

      {/* Full-width hands connection graphic — true edge-to-edge full bleed */}
      <div
        className={`relative left-1/2 -translate-x-1/2 w-screen transition-all duration-1000 delay-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/connection-KeJwWPQvn6l0a7C48tCARYtNEdC92H.png"
          alt="Glowing hands connection"
          aria-hidden="true"
          className="w-full h-auto object-cover block"
        />
      </div>

      {/* Integration grid — sits over bottom fade of hands image */}
      <div className="relative z-10 -mt-8 lg:-mt-14 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {integrations.map((integration, index) => {
            const IconComponent = integration.icon;
            return (
              <div
                key={integration.name}
                className={`group relative overflow-hidden p-6 lg:p-8 border transition-all duration-500 cursor-default bg-background/85 backdrop-blur-md ${
                  hoveredIndex === index
                    ? "border-foreground bg-foreground/[0.04] scale-[1.02]"
                    : "border-foreground/10 hover:border-foreground/30"
                } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  transitionDelay: `${index * 30 + 300}ms`,
                }}
                onMouseEnter={(e) => {
                  setHoveredIndex(index);
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setMousePos(null);
                }}
              >
                {/* Cursor-following halo */}
                {hoveredIndex === index && mousePos && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{
                      background: `radial-gradient(200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.1) 0%, transparent 70%)`,
                    }}
                  />
                )}
                {/* Category tag */}
                <span
                  className={`absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 transition-colors ${
                    hoveredIndex === index
                      ? "bg-foreground text-background"
                      : "bg-foreground/10 text-muted-foreground"
                  }`}
                >
                  {integration.category}
                </span>

                {/* Logo / Icon */}
                <div
                  className={`w-10 h-10 mb-6 flex items-center justify-center transition-colors ${
                    hoveredIndex === index ? "text-[#eca8d6]" : "text-foreground/60"
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                <span className="font-medium block">{integration.name}</span>

                {/* Animated underline */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-foreground/20 overflow-hidden">
                  <div
                    className={`h-full bg-foreground transition-all duration-500 ${
                      hoveredIndex === index ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom stats row */}
        <div
          className={`flex flex-wrap items-center justify-between gap-8 pt-8 border-t border-foreground/10 transition-all duration-1000 delay-500 pb-12 lg:pb-16 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-wrap gap-12">
            {[
              { value: "React 19 & Node", label: "Full-stack framework" },
              { value: "AI Review", label: "Automated AI hints" },
              { value: "Docker", label: "Isolated sandboxes" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-3">
                <span className="text-3xl font-display">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
