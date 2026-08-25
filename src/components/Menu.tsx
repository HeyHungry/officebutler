import { motion } from 'motion/react';

const menuCategories = [
  {
    title: 'Snacks',
    items: [
      { name: 'Snack Mix', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_0743d367c64afbf145e9c0fea03ba65553996e64ffef54a95252060ee7ac758c/responsive320' },
      { name: 'Bitterballen', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/233e7d3e-19d8-4504-adf9-2100d5c71800/responsive640' },
      { name: 'Vlammetjes', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/c3a12a9a-1fd9-4041-11a7-c2ba71d3c100/responsive960' },
      { name: 'Frikandelletjes', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/089a0deb-f72e-46b4-cd48-de98d1f82a00/responsive640' },
      { name: 'Mini Kroketjes', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/53ee579e-f63d-4c57-8f54-dae1e90a1c00/responsive640' },
      { name: 'Chicken Wings', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ee601f8d-efac-4ef4-2cee-c4c59c117200/responsive640' },
      { name: 'Kipnuggets', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/b58dad40-1353-4159-e305-2669d75f6b00/responsive640' },
      { name: 'Karaage Kip', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_5991de8e937102a4dd1ef314fb255423bf85586b62f82c8285e054e14615ce52/responsive640' },
      { name: 'Butterfly Gamba\'s', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/8688dded-96d4-414f-e816-8553f5ec8000/responsive640' },
    ]
  },
  {
    title: 'Vega',
    items: [
      { name: 'Kaasstengels', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_8d2216804329784b49540823b54b47525bfcf318725033896b6fb9646d6cc0d1/responsive640' },
      { name: 'Curry Samosas', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ae28ddae-8a3f-4049-3527-09fa31308f00/responsive640' },
      { name: 'Mini Loempia', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/9eab1d3b-96cc-449a-e6af-7a4ee6e66d00/responsive640' },
      { name: 'Vegan Bitterballen', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_382e6f9d8eabd5d872ed938ed4c12f25c6696f38b8ab2d2791d968c2783fd954/responsive640' },
    ]
  }
];

export function Menu() {
  return (
    <section id="menu" className="font-serif py-24 bg-ob-cream">
      <div className="font-serif max-w-7xl mx-auto px-6 lg:px-8">
        <div className="font-serif text-center mb-20">
          <h2 className="font-serif text-3xl md:text-5xl text-ob-text mb-4">Onze Selectie</h2>
          <p className="font-serif text-ob-text-light max-w-2xl mx-auto font-serif">Hoogwaardige snacks, vers bereid in de Mokum Local Kitchen.</p>
          <div className="font-serif w-16 h-[1px] bg-ob-accent mx-auto mt-6"></div>
        </div>

        <div className="font-serif grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {menuCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: catIndex * 0.15 }}
              className="font-serif flex flex-col"
            >
              <div className="font-serif border-b-2 border-ob-accent pb-4 mb-8">
                <h3 className="font-serif text-2xl lg:text-3xl text-ob-blue uppercase tracking-widest text-center">{category.title}</h3>
              </div>
              <div className="font-serif flex flex-col gap-6">
                {category.items.map((item) => (
                  <div key={item.name} className="font-serif flex items-center gap-4 group cursor-pointer border-b border-black/5 pb-4 last:border-0 last:pb-0">
                    <div className="font-serif w-16 h-16 shrink-0 overflow-hidden bg-white shadow-sm p-1 rounded-sm">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="font-serif w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="font-serif flex-1">
                      <h4 className="font-serif text-lg text-ob-text group-hover:text-ob-accent transition-colors duration-300 font-medium font-serif">
                        {item.name}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

