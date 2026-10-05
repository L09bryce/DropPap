import React from 'react';

const Functionalities = () => {
  const features = [
    {
      id: 1,
      title: 'Find',
      description: 'Find it fast, every time. Get to the right file, fact, or message when you need it, so you spend less time searching and more time working.',
      // Clean, abstract workspace search vibe
      media: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 2,
      title: 'Arrange',
      description: 'Everything in order, everyone aligned. Keep every version current and easy to manage. With synced team folders, your content stays organized and accessible.',
      // Abstract organization / server alignment vibe
      media: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 3,
      title: 'Share',
      description: 'Send it safely, share it fast. Share work instantly and securely with real-time syncing and large file transfers, so teams stay connected and collaboration stays seamless.',
      // Collaboration / Data moving vibe
      media: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 4,
      title: 'Security',
      description: 'Keep your data protected at rest and in transit. Granular access controls and built-in GCP compliance ensure your team\'s work remains strictly private.',
      // Abstract lock / cyber security vibe
      media: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80'
    },
  ];

  return (
    <section id="features" className="bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1E1919] mb-6 tracking-tight">
            Everything you need to collaborate.
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features built for teams of all sizes, powered by Google Cloud.
          </p>
        </div>

        {/* The 2x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-[#F7F9FA] rounded-3xl pt-12 px-8 sm:px-12 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border border-gray-100"
            >
              {/* Top Text Content */}
              <div className="mb-12">
                <h3 className="text-3xl font-bold text-[#1E1919] mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Image - Anchored to the bottom with mt-auto */}
              <div className="mt-auto w-full rounded-t-2xl overflow-hidden shadow-2xl border border-gray-200 border-b-0 translate-y-4 group-hover:translate-y-2 transition-transform duration-500 ease-out">
                <img
                  src={feature.media}
                  alt={`${feature.title} functionality preview`}
                  className="w-full h-64 object-cover object-top"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Functionalities;