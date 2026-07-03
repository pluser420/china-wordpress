import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageTitle, buildAlternates } from '@/lib/metadata';

interface RdManufacturingPageProps {
  params: { locale: string };
}

// ---------------------------------------------------------------------------
// Static content (Requirements 11.2)
// ---------------------------------------------------------------------------

const EQUIPMENT = [
  {
    brand: 'Walter',
    model: 'Helitronic Power',
    description:
      'Five-axis CNC tool and cutter grinding machine by Walter Maschinenbau. Delivers sub-micron accuracy ' +
      'for complex tool geometries including helical flutes, drill points, and step drills. Integrated Helitronic ' +
      'Tool Studio software enables single-setup production of the most complex cutting tool profiles.',
    icon: '🎯',
    origin: 'Germany',
  },
  {
    brand: 'Rollomatic',
    model: 'GrindSmart 628XS',
    description:
      'Six-axis CNC grinding platform by Rollomatic SA, Switzerland. Renowned for its thermal stability and ' +
      'vibration-free construction, enabling consistent dimensional tolerances on micro-tools down to 0.1 mm ' +
      'diameter. Used for our PCD and PCBN blank shaping operations.',
    icon: '⚙️',
    origin: 'Switzerland',
  },
] as const;

const MATERIALS = [
  {
    name: 'PCD — Polycrystalline Diamond',
    shortName: 'PCD',
    description:
      'The hardest cutting tool material available for non-ferrous materials. Our PCD tools excel in ' +
      'machining aluminum alloys, copper, graphite, and CFRP composites, delivering exceptional surface ' +
      'finishes and tool life measured in millions of parts.',
    applications: ['Aluminum alloys', 'Copper & brass', 'Carbon fiber (CFRP)', 'Graphite'],
    icon: '💎',
  },
  {
    name: 'PCBN — Polycrystalline Cubic Boron Nitride',
    shortName: 'PCBN',
    description:
      'Second only to diamond in hardness, PCBN is ideal for hard-turning and hard-milling of ferrous ' +
      'materials. Used in hardened steel (62+ HRC), cast iron, and sintered metals applications where ' +
      'carbide tools fail prematurely.',
    applications: ['Hardened steel (>50 HRC)', 'Cast iron', 'Sintered metals', 'Hard turning'],
    icon: '🔷',
  },
  {
    name: 'Cermet',
    shortName: 'Cermet',
    description:
      'A composite of ceramic and metallic materials combining the heat resistance of ceramics with the ' +
      'toughness of metals. Cermet grades are ideal for high-speed finishing passes on steel and stainless ' +
      'steel, producing excellent surface finishes at elevated cutting speeds.',
    applications: ['Steel finishing', 'Stainless steel', 'High-speed turning', 'Semi-finishing'],
    icon: '🔶',
  },
  {
    name: 'Tungsten Carbide',
    shortName: 'Carbide',
    description:
      'The backbone of our product range. We work with ultrafine-grain carbide grades (0.3–0.8 µm) for ' +
      'micro-tools and medium-grain grades for general-purpose milling and drilling. All carbide substrates ' +
      'are sourced from certified suppliers and incoming-inspected for grade consistency.',
    applications: ['General machining', 'Milling', 'Drilling', 'Threading'],
    icon: '⬛',
  },
] as const;

const CUSTOM_CAPABILITIES = [
  {
    title: 'Custom Geometry Design',
    description:
      'Our application engineers work with your CAM data to design custom tool geometries — helix angles, ' +
      'rake faces, relief angles, and tip designs — optimized for your specific workpiece material and ' +
      'machine setup.',
    icon: '📐',
  },
  {
    title: 'Special Coatings',
    description:
      'Beyond standard TiAlN and TiN PVD coatings, we offer AlCrN, DLC (diamond-like carbon), and ' +
      'uncoated polished options. Coating selection is guided by our tribology team based on workpiece ' +
      'material, cutting speed, and lubrication strategy.',
    icon: '✨',
  },
  {
    title: 'Tight-Tolerance Grinding',
    description:
      'Diameter tolerances to ±0.002 mm (h6), runout < 3 µm (TIR), and surface roughness Ra < 0.1 µm ' +
      'on critical cutting surfaces. All dimensions are verified on Zoller presetter systems before shipping.',
    icon: '📏',
  },
  {
    title: 'Low-MOQ Prototyping',
    description:
      'Sample runs starting from 1 piece for prototype validation. Standard engineering samples delivered ' +
      'within 7–14 business days. We provide full dimensional reports and cutting test data with each sample.',
    icon: '🧪',
  },
  {
    title: 'OEM / Private Label',
    description:
      'Full OEM and private-label manufacturing services available. We can apply your brand markings, ' +
      'custom packaging, and comply with product labeling requirements for European and North American markets.',
    icon: '🏷️',
  },
  {
    title: 'Technical Consultation',
    description:
      'Free pre-sales technical consultation to select the right grade, geometry, and coating for your ' +
      'application. We review your drawings, cutting conditions, and quality requirements before quoting.',
    icon: '💬',
  },
] as const;

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: RdManufacturingPageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  const alternates = buildAlternates(locale, 'about/rd-manufacturing');

  return {
    title: buildPageTitle(t('aboutRdManufacturing')),
    description:
      'JIAYI Tools R&D and manufacturing capabilities: Walter and Rollomatic five-axis CNC grinding, ' +
      'PCD, PCBN, cermet, and carbide expertise. Custom tooling from prototype to high-volume production.',
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function RdManufacturingPage({ params }: RdManufacturingPageProps) {
  const { locale } = params;
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="min-h-screen bg-white">
      {/* Page Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-4">About JIAYI</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">R&amp;D &amp; Manufacturing Capacity</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            World-class grinding equipment, advanced substrate expertise, and a team of experienced
            cutting tool engineers — delivering precision from blank to finished tool.
          </p>
        </div>
      </section>

      {/* CNC Grinding Equipment */}
      <section aria-label="CNC grinding equipment" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Five-Axis CNC Grinding Equipment</h2>
          <p className="text-gray-500 mb-12 max-w-3xl">
            Our shop floor is equipped with industry-leading five-axis CNC tool and cutter grinders
            from Walter and Rollomatic — the benchmark for precision carbide tool manufacturing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {EQUIPMENT.map((machine) => (
              <div
                key={machine.brand}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {machine.origin}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">{machine.brand}</h3>
                    <p className="text-gray-500 text-sm font-mono">{machine.model}</p>
                  </div>
                  <div className="text-4xl">{machine.icon}</div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{machine.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Material Expertise */}
      <section aria-label="material expertise" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Material Expertise</h2>
          <p className="text-gray-500 mb-12 max-w-3xl">
            We work across all major cutting tool substrate families, selecting the optimal grade
            for each application from our approved supplier network.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {MATERIALS.map((mat) => (
              <div
                key={mat.shortName}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{mat.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{mat.name}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{mat.description}</p>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Key Applications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mat.applications.map((app) => (
                      <span
                        key={app}
                        className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2 py-0.5"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Tooling Capabilities */}
      <section aria-label="custom tooling capabilities" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Custom Tooling Capabilities</h2>
          <p className="text-gray-500 mb-12 max-w-3xl">
            Standard tools are a starting point. Our engineering team specializes in developing
            custom solutions that reduce setup times, improve tool life, and optimize your
            machining process.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CUSTOM_CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="bg-gray-50 border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{cap.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{cap.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        aria-label="custom tooling CTA"
        className="py-20 px-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white text-center"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Need a Custom Tooling Solution?</h2>
          <p className="text-blue-100 text-lg mb-10">
            Send us your drawings or application requirements. Our engineers will respond with a
            technical proposal and quotation within 24 hours.
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-semibold px-10 py-4 rounded-xl text-lg shadow-lg transition-colors duration-200"
          >
            {tCommon('learnMore')} — Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}
