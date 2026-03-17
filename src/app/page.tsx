'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroRef.current.style.setProperty('--mouse-x', `${x}%`);
      heroRef.current.style.setProperty('--mouse-y', `${y}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#07070A] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04]">
        <div className="absolute inset-0 bg-[#07070A]/60 backdrop-blur-2xl" />
        <div className="relative max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5" />
              </svg>
            </div>
            <span className="font-semibold text-[15px] tracking-tight">Reel Delivery</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Features</a>
            <a href="#how-it-works" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">How it works</a>
            <a href="#pricing" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-[13px] text-white/50 hover:text-white/80 transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="text-[13px] px-4 py-1.5 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative pt-40 pb-24 md:pt-56 md:pb-40"
        style={{ '--mouse-x': '50%', '--mouse-y': '50%' } as React.CSSProperties}
      >
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px] transition-all duration-[2000ms]"
            style={{
              background: 'radial-gradient(circle, #3b82f6, transparent)',
              left: 'var(--mouse-x, 50%)',
              top: 'var(--mouse-y, 50%)',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px] bg-violet-600" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[80px] bg-blue-400" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] text-white/40 font-medium tracking-wide">Now in beta</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
              Delivery intelligence
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white/80 via-white/60 to-white/20">
              for filmmakers
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg text-white/30 max-w-xl mx-auto mb-10 leading-relaxed">
            Upload your contracts, sales estimates, and delivery schedules. Reel Delivery reads everything and builds your deliverables, finance plan, and gap analysis automatically.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="group relative px-6 py-3 bg-white text-black font-medium rounded-full text-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all"
            >
              <span className="relative z-10">Launch Dashboard</span>
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3 bg-white/[0.04] text-white/60 font-medium rounded-full text-sm border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/80 transition-all"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative pb-28 md:pb-44">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] shadow-2xl shadow-black/40">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
              </div>
              <div className="flex-1 ml-4">
                <div className="w-64 h-6 rounded-md bg-white/[0.04] mx-auto flex items-center justify-center">
                  <span className="text-[10px] text-white/20 font-mono">reel-delivery.vercel.app/dashboard</span>
                </div>
              </div>
            </div>
            {/* Dashboard mockup */}
            <div className="p-6 md:p-8 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Items', value: '126', color: 'from-blue-500/20 to-blue-500/5' },
                  { label: 'Critical Gaps', value: '8', color: 'from-red-500/20 to-red-500/5' },
                  { label: 'Tax Credits', value: '$750K', color: 'from-emerald-500/20 to-emerald-500/5' },
                  { label: 'Territories', value: '36', color: 'from-violet-500/20 to-violet-500/5' },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-xl bg-gradient-to-b ${stat.color} border border-white/[0.04] p-4`}>
                    <p className="text-[11px] text-white/30 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
              {/* Table mockup */}
              <div className="rounded-xl border border-white/[0.04] overflow-hidden">
                <div className="grid grid-cols-4 gap-4 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
                  {['Deliverable', 'Category', 'Status', 'Priority'].map((h) => (
                    <span key={h} className="text-[11px] text-white/20 uppercase tracking-wider font-medium">{h}</span>
                  ))}
                </div>
                {[
                  { name: 'DCP Master', cat: 'Technical', status: 'Pending', pri: 'Critical' },
                  { name: 'M&E Mix', cat: 'Audio', status: 'Complete', pri: 'High' },
                  { name: 'Closed Captions', cat: 'Accessibility', status: 'Pending', pri: 'High' },
                  { name: 'Key Art 27x40', cat: 'Marketing', status: 'In Progress', pri: 'Medium' },
                  { name: 'Trailer - 2min', cat: 'Marketing', status: 'Complete', pri: 'High' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-white/[0.02] last:border-0">
                    <span className="text-sm text-white/70">{row.name}</span>
                    <span className="text-sm text-white/30">{row.cat}</span>
                    <span className={`text-xs font-medium ${
                      row.status === 'Complete' ? 'text-emerald-400' :
                      row.status === 'In Progress' ? 'text-amber-400' : 'text-white/30'
                    }`}>{row.status}</span>
                    <span className={`text-xs font-medium ${
                      row.pri === 'Critical' ? 'text-red-400' :
                      row.pri === 'High' ? 'text-orange-400' : 'text-white/20'
                    }`}>{row.pri}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#07070A] to-transparent" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-28 md:py-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[12px] text-blue-400/60 uppercase tracking-[0.2em] font-medium mb-3">Platform</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything your production needs
            </h2>
            <p className="text-white/30 max-w-lg mx-auto">
              From contract parsing to tax credit optimization, Reel Delivery handles the operational complexity so you can focus on making films.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'AI Document Reader',
                desc: 'Upload contracts, delivery schedules, and sales estimates. Our AI extracts every obligation, deadline, and deliverable automatically.',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                ),
                gradient: 'from-blue-500/10 to-transparent',
              },
              {
                title: 'Finance Plan Generator',
                desc: 'Transform sales estimates into a complete capital stack with territory breakdowns, tax incentives, and revenue projections.',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                ),
                gradient: 'from-emerald-500/10 to-transparent',
              },
              {
                title: 'Gap Detection',
                desc: 'Instantly identify missing deliverables, unfulfilled contract obligations, and critical items before they become costly problems.',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ),
                gradient: 'from-amber-500/10 to-transparent',
              },
              {
                title: 'Tax Credit Browser',
                desc: 'Compare incentive programs across jurisdictions. Model scenarios for Georgia, New Mexico, UK, Australia, Canada, and more.',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                ),
                gradient: 'from-violet-500/10 to-transparent',
              },
              {
                title: 'Deliverables Tracker',
                desc: 'Track every technical, marketing, and legal deliverable in one place. Real-time status updates with priority scoring.',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                gradient: 'from-cyan-500/10 to-transparent',
              },
              {
                title: 'Contract Intelligence',
                desc: 'AI reads your distribution agreements and extracts key terms, red flags, commission rates, and delivery obligations.',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
                gradient: 'from-pink-500/10 to-transparent',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-white/[0.04] bg-white/[0.01] p-6 hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/50 mb-4 group-hover:text-white/80 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-[15px] font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-[13px] text-white/30 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-28 md:py-40">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[12px] text-violet-400/60 uppercase tracking-[0.2em] font-medium mb-3">Workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Three steps to delivery clarity
            </h2>
          </div>

          <div className="space-y-0">
            {[
              {
                step: '01',
                title: 'Upload everything',
                desc: 'Drop your delivery schedule, contracts, sales estimates, and distribution agreements. PDF, DOCX, or plain text.',
              },
              {
                step: '02',
                title: 'AI does the heavy lifting',
                desc: 'Our system reads every document, extracts obligations and deliverables, maps territories, calculates tax credits, and identifies gaps.',
              },
              {
                step: '03',
                title: 'Get your complete package',
                desc: 'Finance plan with capital stack. Gap analysis with priorities. Deliverables tracker with status. Everything production needs, built in seconds.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-8 py-10 border-b border-white/[0.04] last:border-0">
                <div className="shrink-0">
                  <span className="text-[13px] font-mono text-white/10">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-[14px] text-white/30 leading-relaxed max-w-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section id="pricing" className="relative py-28 md:py-40">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-12 md:p-16">
            <p className="text-[12px] text-emerald-400/60 uppercase tracking-[0.2em] font-medium mb-3">Early access</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Free during beta
            </h2>
            <p className="text-white/30 max-w-md mx-auto mb-8">
              Reel Delivery is free while we&apos;re in beta. Get full access to every feature, no credit card required.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-medium rounded-full text-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all"
            >
              Start for free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-violet-600" />
            <span className="text-[13px] text-white/20">Reel Delivery</span>
          </div>
          <p className="text-[12px] text-white/15">Built for independent filmmakers by Polite Society Media</p>
        </div>
      </footer>
    </div>
  );
}
