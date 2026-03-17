import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1714]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#E2DACB]/60">
        <div className="absolute inset-0 bg-[#FDFBF7]/80 backdrop-blur-xl" />
        <div className="relative max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#1A1714] flex items-center justify-center">
              <span className="text-[#FDFBF7] text-[10px] font-bold tracking-tight">RD</span>
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-[#1A1714]">Reel Delivery</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[13px] text-[#8C8577] hover:text-[#1A1714] transition-colors">Features</a>
            <a href="#how-it-works" className="text-[13px] text-[#8C8577] hover:text-[#1A1714] transition-colors">How it works</a>
            <a href="#pricing" className="text-[13px] text-[#8C8577] hover:text-[#1A1714] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13px] text-[#8C8577] hover:text-[#1A1714] transition-colors hidden sm:block">
              Log in
            </Link>
            <Link
              href="/login"
              className="text-[13px] px-5 py-2 bg-[#1A1714] text-[#FDFBF7] font-medium rounded-full hover:bg-[#2A2720] transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E2DACB] mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]" />
            <span className="text-[12px] text-[#8C8577] font-medium tracking-wide">Now in beta</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.08] mb-7 text-[#1A1714]">
            Delivery intelligence{' '}
            <br className="hidden sm:block" />
            <span className="text-[#8C8577]">for filmmakers</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg text-[#8C8577] max-w-xl mx-auto mb-10 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            Upload your contracts, sales estimates, and delivery schedules.
            We read everything and build your deliverables, finance plan,
            and gap analysis automatically.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-7 py-3 bg-[#1A1714] text-[#FDFBF7] font-medium rounded-full text-sm hover:bg-[#2A2720] transition-all"
            >
              Start free
            </Link>
            <a
              href="#how-it-works"
              className="px-7 py-3 text-[#8C8577] font-medium rounded-full text-sm border border-[#E2DACB] hover:border-[#C8BFA8] hover:text-[#1A1714] transition-all"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative pb-24 md:pb-36">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-2xl overflow-hidden border border-[#E2DACB] bg-white shadow-xl shadow-[#1A1714]/[0.04]">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E2DACB]/60 bg-[#F5F0E8]/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#E2DACB]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#E2DACB]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#E2DACB]" />
              </div>
              <div className="flex-1 ml-4">
                <div className="w-56 h-6 rounded-md bg-[#F5F0E8] mx-auto flex items-center justify-center">
                  <span className="text-[10px] text-[#8C8577]/60 font-mono">reel-delivery.vercel.app</span>
                </div>
              </div>
            </div>
            {/* Dashboard content */}
            <div className="p-5 md:p-7 space-y-4 bg-[#FDFBF7]">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Items', value: '126' },
                  { label: 'Critical Gaps', value: '8' },
                  { label: 'Tax Credits', value: '$750K' },
                  { label: 'Territories', value: '36' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-[#E2DACB] p-4 bg-white">
                    <p className="text-[10px] text-[#8C8577] uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xl font-semibold text-[#1A1714] mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>
              {/* Table */}
              <div className="rounded-xl border border-[#E2DACB] overflow-hidden">
                <div className="grid grid-cols-4 gap-4 px-4 py-2.5 bg-[#F5F0E8]/50 border-b border-[#E2DACB]/60">
                  {['Deliverable', 'Category', 'Status', 'Priority'].map((h) => (
                    <span key={h} className="text-[10px] text-[#8C8577] uppercase tracking-wider font-medium">{h}</span>
                  ))}
                </div>
                {[
                  { name: 'DCP Master', cat: 'Technical', status: 'Pending', pri: 'Critical' },
                  { name: 'M&E Mix', cat: 'Audio', status: 'Complete', pri: 'High' },
                  { name: 'Closed Captions', cat: 'Accessibility', status: 'Pending', pri: 'High' },
                  { name: 'Key Art 27x40', cat: 'Marketing', status: 'In Progress', pri: 'Medium' },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 border-b border-[#E2DACB]/30 last:border-0">
                    <span className="text-sm text-[#1A1714]">{row.name}</span>
                    <span className="text-sm text-[#8C8577]">{row.cat}</span>
                    <span className={`text-xs font-medium ${
                      row.status === 'Complete' ? 'text-[#2D7A4F]' :
                      row.status === 'In Progress' ? 'text-[#B8860B]' : 'text-[#8C8577]'
                    }`}>{row.status}</span>
                    <span className={`text-xs font-medium ${
                      row.pri === 'Critical' ? 'text-[#C0392B]' :
                      row.pri === 'High' ? 'text-[#B8860B]' : 'text-[#8C8577]'
                    }`}>{row.pri}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FDFBF7] to-transparent" />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-[#E2DACB]" />
      </div>

      {/* Features */}
      <section id="features" className="relative py-24 md:py-36">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[12px] text-[#B8860B] uppercase tracking-[0.2em] font-medium mb-4">Platform</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Everything your production needs
            </h2>
            <p className="text-[#8C8577] max-w-lg mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
              From contract parsing to tax credit optimization, we handle
              the operational complexity so you can focus on making films.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-[#E2DACB] rounded-2xl overflow-hidden border border-[#E2DACB]">
            {[
              {
                title: 'AI Document Reader',
                desc: 'Upload contracts, delivery schedules, and sales estimates. Every obligation, deadline, and deliverable — extracted automatically.',
              },
              {
                title: 'Finance Plan Generator',
                desc: 'Sales estimates become a complete capital stack. Territory breakdowns, tax incentives, and revenue projections in seconds.',
              },
              {
                title: 'Gap Detection',
                desc: 'Missing deliverables, unfulfilled obligations, critical items. Identified before they become costly problems.',
              },
              {
                title: 'Tax Credit Browser',
                desc: 'Compare incentive programs across 20+ jurisdictions. Model scenarios for Georgia, New Mexico, UK, Australia, and more.',
              },
              {
                title: 'Deliverables Tracker',
                desc: 'Every technical, marketing, and legal deliverable in one place. Real-time status updates with priority scoring.',
              },
              {
                title: 'Contract Intelligence',
                desc: 'Distribution agreements analyzed for key terms, red flags, commission rates, and delivery obligations.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#FDFBF7] p-8 hover:bg-white transition-colors duration-300"
              >
                <h3 className="text-[15px] font-semibold text-[#1A1714] mb-2">{feature.title}</h3>
                <p className="text-[13px] text-[#8C8577] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-[#E2DACB]" />
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 md:py-36">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[12px] text-[#B8860B] uppercase tracking-[0.2em] font-medium mb-4">Workflow</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
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
                title: 'We do the heavy lifting',
                desc: 'Every document is read, parsed, and cross-referenced. Obligations mapped. Territories calculated. Gaps identified.',
              },
              {
                step: '03',
                title: 'Get your complete package',
                desc: 'Finance plan with capital stack. Gap analysis with priorities. Deliverables tracker with status. Built in seconds.',
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-8 py-10 border-b border-[#E2DACB] last:border-0">
                <div className="shrink-0 w-10">
                  <span className="text-[13px] font-mono text-[#B8860B]">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1A1714] mb-2">{item.title}</h3>
                  <p className="text-[14px] text-[#8C8577] leading-relaxed max-w-lg" style={{ fontFamily: 'Georgia, serif' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="relative py-24 md:py-36">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="rounded-2xl border border-[#E2DACB] bg-white p-12 md:p-16">
            <p className="text-[12px] text-[#B8860B] uppercase tracking-[0.2em] font-medium mb-4">Early access</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Free during beta
            </h2>
            <p className="text-[#8C8577] max-w-md mx-auto mb-8" style={{ fontFamily: 'Georgia, serif' }}>
              Full access to every feature. No credit card required.
              Built for independent filmmakers.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A1714] text-[#FDFBF7] font-medium rounded-full text-sm hover:bg-[#2A2720] transition-all"
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
      <footer className="border-t border-[#E2DACB] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#1A1714]" />
            <span className="text-[13px] text-[#8C8577]">Reel Delivery</span>
          </div>
          <p className="text-[12px] text-[#8C8577]/60" style={{ fontFamily: 'Georgia, serif' }}>Built for independent filmmakers by Polite Society Media</p>
        </div>
      </footer>
    </div>
  );
}
