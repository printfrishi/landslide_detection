import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Map as MapIcon } from 'lucide-react';
import { ROUTES } from '../../../constants/routes';

const SLIDES = [
  {
    src: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Field observer overlooking forested mountain ridges',
    caption: 'Slope and terrain watch across monitored ridges',
  },
  {
    src: 'https://images.pexels.com/photos/1463530/pexels-photo-1463530.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Heavy monsoon rainfall on dense green foliage',
    caption: 'Monsoon rainfall is the primary landslide trigger — gauges report hourly',
  },
  {
    src: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Layered mountain ridgelines fading into evening haze',
    caption: 'Elevation bands help define landslide susceptibility zones',
  },
  {
    src: 'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?auto=compress&cs=tinysrgb&w=1600',
    alt: 'Busy highway corridor at dusk',
    caption: 'Corridor advisories keep travel safe during elevated risk',
  },
];

const SLIDE_INTERVAL_MS = 6000;

/**
 * NDMA-style rotating photo banner: full-width field photography, dark
 * caption strip carrying the system name and per-slide context, arrows and
 * dots, and the live-system chip. All photos are representative stock images.
 */
export default function HeroBanner() {
  const [activeSlide, setActiveSlide] = useState(0);

  const go = (delta) =>
    setActiveSlide((current) => (current + delta + SLIDES.length) % SLIDES.length);

  return (
    <section aria-labelledby="banner-caption-title" className="relative h-[420px] overflow-hidden bg-secondary-900 sm:h-[500px]">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.src}
          aria-hidden={index !== activeSlide}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === activeSlide ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            className="h-full w-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* readability gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent"
        aria-hidden="true"
      />

      {/* live-system chip */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur sm:left-8">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        SYSTEM OPERATIONAL · Demo data
      </div>

      {/* prev / next */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* caption strip */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-black/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="min-w-0">
            <h1
              id="banner-caption-title"
              className="text-lg font-bold tracking-tight text-white sm:text-2xl"
            >
              Himalayan Landslide Monitoring &amp; Early Warning System
            </h1>
            <p className="mt-1 text-sm text-white/85" role="status">
              {SLIDES[activeSlide].caption}
              <span className="ml-2 rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
                Representative image
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link
              to={ROUTES.DASHBOARD}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2.5 text-sm font-bold text-[#0a2f5a] shadow transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              View Live Monitoring
            </Link>
            <a
              href="#risk-map"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MapIcon className="h-4 w-4" aria-hidden="true" />
              Explore Risk Map
            </a>
          </div>
        </div>
      </div>

      {/* dots */}
      <div className="absolute bottom-24 right-4 z-10 flex gap-2 sm:bottom-28 sm:right-8 lg:bottom-24">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActiveSlide(index)}
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === activeSlide}
            className={`h-2.5 w-2.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              index === activeSlide ? 'border-amber-400 bg-amber-400' : 'border-white/70 bg-white/30'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
