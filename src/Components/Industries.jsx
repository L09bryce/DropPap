import React from "react";

const Industries = () => {
  const industries = [
    {
      id: 1,
      name: "Construction",
      description:
        "With DropPap, you can store, access, preview, edit and transfer CAD, BIM, PDF and visual content files from anywhere.",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop", // black construction worker
    },
    {
      id: 2,
      name: "Media & Entertainment",
      description:
        "Create a flexible media workspace that connects your teams, content, and tools together.",
      image:
        "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800&h=600&fit=crop", // people with camera
    },
    {
      id: 3,
      name: "Technology",
      description:
        "From product ideation to development, DropPap for teams streamlines workflows so you can focus on building great products.",
      image:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop", // laptop work
    },
    {
      id: 4,
      name: "Education",
      description:
        "Power student learning, faculty research, and staff operations on DropPap's secure cloud collaboration platform.",
      image:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop", // university walking
    },
    {
      id: 5,
      name: "Healthcare",
      description:
        "Securely manage patient data, medical records, and collaborate confidently across teams.",
      image:
        "https://images.unsplash.com/photo-1580281657527-47f249e8f4df?w=800&h=600&fit=crop", // hospital team/boardroom
    },
    {
      id: 6,
      name: "Finance",
      description:
        "Streamline financial workflows and compliance while keeping sensitive data secure.",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop", // finance office
    },
  ];

  return (
    <section id="industries" className="py-20 px-6 md:px-16 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Built for every industry
          </h2>
          <p className="text-xl text-gray-600">
            DropPap powers collaboration across organizations of all types
          </p>
        </div>

        {/* INDUSTRY LIST */}
        <div className="space-y-12">
          {industries.map((industry, index) => (
            <div
              key={industry.id}
              className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
            >
              {/* IMAGE */}
              <div className="w-full md:w-1/2">
                <img
                  src={industry.image}
                  alt={industry.name}
                  className="w-full h-[280px] object-cover rounded-2xl shadow-sm"
                />
              </div>

              {/* TEXT */}
              <div className="w-full md:w-1/2">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {industry.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {industry.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Industries;