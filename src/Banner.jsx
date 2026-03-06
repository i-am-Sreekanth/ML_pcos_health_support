import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Banner() {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <section
      className="relative min-h-screen w-full flex items-center"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="DOC.jpg"
          alt="Doctor consulting patient"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-16 w-full">
        <div className="max-w-2xl">

          {/* Tagline */}
          <p className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em] mb-6">
            Digital Health Screening Platform
          </p>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
            Clinical PCOS <br />
            <span className="text-pink-600">
              Risk Assessment
            </span>
          </h1>

          {/* Description */}
          <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-xl">
            A structured, data-driven screening tool designed to help
            identify potential PCOS indicators before clinical consultation.
            Complete your assessment in under 3 minutes.
          </p>

          {/* CTA */}
          <div className="mt-12">
            <button
              onClick={() => navigate("/predict")}
              className="
                relative
                px-12 py-5
                text-lg
                font-semibold
                uppercase
                tracking-wide
                text-white
                rounded-2xl
                bg-gradient-to-r from-pink-600 to-pink-500
                shadow-[0_10px_30px_rgba(236,72,153,0.35)]
                transition-all
                duration-300
                hover:scale-105
                hover:shadow-[0_15px_40px_rgba(236,72,153,0.45)]
                active:scale-95
              "
            >
              Begin Assessment
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
