import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Emotion Detection",
    description:
      "AURA analyzes your language patterns to understand your emotional state with remarkable accuracy.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
        <line x1="9" x2="9.01" y1="9" y2="9"></line>
        <line x1="15" x2="15.01" y1="9" y2="9"></line>
      </svg>
    ),
  },
  {
    title: "Movie Matching",
    description:
      "Our AI matches your emotional state with our extensive database of films categorized by mood.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        <path d="m16 6 4 14"></path>
        <path d="M12 6v14"></path>
        <path d="M8 8v12"></path>
        <path d="M4 4v16"></path>
      </svg>
    ),
  },
  {
    title: "Personalized Learning",
    description:
      "The more you use AURA, the better it understands your preferences and emotional patterns.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        <path d="M12 2v8"></path>
        <path d="m16 6-4 4-4-4"></path>
        <rect width="20" height="8" x="2" y="14" rx="2"></rect>
      </svg>
    ),
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 ">
      <div className="container mx-auto px-4 md:px-8 text-white">
        <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-white drop-shadow-sm mb-4">How AURA Works</h2>
                <p className="text-white/90 max-w-2xl mx-auto drop-shadow-sm">
                    Our advanced AI uses emotional intelligence to understand your mood and preferences, delivering personalized movie recommendations.
                </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 transition-all duration-300 hover:border-teal-500/30 hover:shadow-teal-500/20 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-white/70 mb-4">{feature.description}</p>
              <a href="#" className="text-teal-400 flex items-center gap-1 group">
                Learn more
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection