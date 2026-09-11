import { Camera } from 'lucide-react';
import PortalPanel from './PortalPanel';
import SectionHeading from './SectionHeading';

const PHOTOS = [
  {
    src: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'High mountain peaks rising above a forested lake',
    caption: 'High-relief terrain under watch',
    tag: 'Terrain',
  },
  {
    src: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Turquoise glacial lake below steep forested slopes',
    caption: 'Glacial lake and steep forested slopes',
    tag: 'Terrain',
  },
  {
    src: 'https://images.pexels.com/photos/110874/pexels-photo-110874.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Raindrops streaking down a window pane',
    caption: 'Monsoon rain — the primary landslide trigger',
    tag: 'Monsoon',
  },
  {
    src: 'https://images.pexels.com/photos/1619299/pexels-photo-1619299.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Snow-bound mountain summit under thin cloud',
    caption: 'Snow-bound upper reaches of the monitored belt',
    tag: 'Terrain',
  },
];

/** NDMA-style photo gallery — representative imagery from the field. */
export default function FieldGallery() {
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="gallery-heading"
          eyebrow="Photo Gallery"
          title="From the field"
          description="Representative Himalayan terrain and monsoon conditions of the kind HimRakshak is built to monitor."
          meta="Representative stock photography — not actual monitored sites"
        />

        <div className="mt-10">
          <PortalPanel title="Photo Gallery" icon={Camera} bodyClassName="p-5">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PHOTOS.map((photo) => (
                <figure key={photo.src} className="group overflow-hidden rounded-lg border bg-white">
                  <div className="h-44 overflow-hidden">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                    />
                  </div>
                  <figcaption className="flex items-center justify-between gap-2 px-4 py-3">
                    <span className="text-sm font-medium text-secondary-800">{photo.caption}</span>
                    <span className="shrink-0 rounded bg-secondary-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-600">
                      {photo.tag}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </PortalPanel>
        </div>
      </div>
    </section>
  );
}
