import { Megaphone } from 'lucide-react';

const UPDATES = [
  'Landslide advisory issued for Rudraprayag district — NH-07 traffic regulated',
  'Weekly district monitoring report published (05 Sep)',
  'Soil saturation rising in Tehri Garhwal — field teams alerted',
  'Monsoon preparedness drill completed across all monitored zones',
  'New groundwater sensor approved for Uttarkashi transect',
];

/** NDMA-style horizontal updates ticker below the primary navigation. */
export default function UpdatesTicker() {
  const items = [...UPDATES, ...UPDATES];

  return (
    <div className="ticker-pause overflow-hidden border-b border-amber-300 bg-amber-50">
      <div className="flex items-stretch">
        <span className="z-10 flex shrink-0 items-center gap-1.5 bg-[#0a2f5a] px-3 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
          Updates
        </span>
        <div className="relative flex flex-1 items-center overflow-hidden py-2">
          <div className="flex w-max animate-ticker-x whitespace-nowrap motion-reduce:animate-none">
            {items.map((text, index) => (
              <span
                key={`${text}-${index}`}
                aria-hidden={index >= UPDATES.length}
                className="inline-flex items-center gap-2 px-8 text-sm text-secondary-800"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
