import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100">
      {/* --- INLINE STYLES FOR FONT --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        .about-page { font-family: 'Outfit', sans-serif; }
        .hero-gradient { background: radial-gradient(circle at 10% 20%, rgba(243, 248, 255, 1) 0%, rgba(255, 255, 255, 1) 90%); }
      `}</style>

      <div className="about-page">
        {/* --- MINIMAL HERO SECTION --- */}
        <section className="hero-gradient py-24 px-6 border-b border-slate-100">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <span className="text-indigo-600 font-semibold tracking-widest uppercase text-sm">Empowering Women</span>
              <h1 className="text-6xl font-bold mt-4 mb-8 leading-[1.1] text-slate-900">
                Clarity for your <br />
                <span className="text-indigo-600">PCOS journey.</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed font-light max-w-lg">
                FemHealth bridges the gap between clinical complexity and personal care using 
                precision diagnostics and empathetic AI.
              </p>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
              
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800" 
                alt="Modern Healthcare" 
                className="rounded-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] w-full grayscale-[20%] hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </section>

        {/* --- CLEAN INSIGHTS SECTION --- */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-12 gap-16">
            <div className="md:col-span-5">
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Understanding <br/>The Condition</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                PCOS is a hormonal symphony that has fallen out of sync. It affects 1 in 10 women, 
                yet remains one of the most under-diagnosed conditions in modern medicine.
              </p>
              <div className="border-l-2 border-indigo-600 pl-6 py-2">
                <p className="text-slate-400 italic text-sm">"Knowledge is the first step to management."</p>
              </div>
            </div>
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-12">
              {[
                { label: "Irregular Cycles", icon: "01" },
                { label: "Hormonal Shifts", icon: "02" },
                { label: "Metabolic Health", icon: "03" },
                { label: "Ovarian Patterns", icon: "04" },
              ].map((item, i) => (
                <div key={i} className="group cursor-default">
                  <div className="text-indigo-200 text-4xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">{item.icon}</div>
                  <h4 className="text-xl font-semibold mb-2">{item.label}</h4>
                  <div className="w-8 h-[2px] bg-slate-200 group-hover:w-full transition-all duration-500"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- THE TECHNOLOGY (THE ECOSYSTEM) --- */}
        <section className="bg-slate-50 py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-center text-4xl font-bold mb-4">The FemHealth Ecosystem</h2>
              <p className="text-center text-slate-500 font-light">Advanced science, delivered simply.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {/* Card 1: Risk Analyzer */}
              <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-8">
                  <span className="text-indigo-600 font-bold">ML</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">Risk Analyzer</h3>
                <p className="text-slate-500 font-light mb-6 leading-relaxed">
                  Precision Machine Learning that processes clinical markers to predict risk factors with nuanced accuracy.
                </p>
                <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400">Logistic Regression</span>
              </div>

              {/* Card 2: Ultrasound AI */}
              <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100 scale-105 ring-1 ring-indigo-100">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-8">
                  <span className="text-white font-bold">AI</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">Ultrasound AI</h3>
                <p className="text-slate-500 font-light mb-6 leading-relaxed">
                  State-of-the-art Neural Networks identifying follicular patterns with medical-grade computer vision.
                </p>
                <span className="text-[10px] tracking-widest uppercase font-bold text-indigo-600">CNN Recognition</span>
              </div>

              {/* Card 3: Watson Assistant */}
              <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-shadow border border-slate-100">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-8">
                  <span className="text-white font-bold">W</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">Watson Guide</h3>
                <p className="text-slate-500 font-light mb-6 leading-relaxed">
                  Your constant companion for emotional wellness and personalized health navigation, day or night.
                </p>
                <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400">IBM Powered</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- SIMPLE FOOTER --- */}
        <footer className="py-20 px-6 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-light text-slate-400 mb-8 italic">
              "A healthy woman is a powerful woman."
            </h2>
            <div className="w-12 h-1 bg-indigo-600 mx-auto mb-8 rounded-full"></div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">
              © 2026 Neural Nurture | Dedicated to Women's Health
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default About;