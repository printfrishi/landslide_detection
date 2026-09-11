import { Link } from 'react-router-dom';
import { Mountain } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ROUTES } from '../../constants/routes';

const PRODUCT_LINKS = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD },
  { label: 'Monitoring', to: ROUTES.MONITORING },
  { label: 'Alerts', to: ROUTES.ALERTS },
];

const COMPANY_LINKS = [
  { label: 'About', href: '#' },
  { label: 'Contact', href: '#' },
];

/** Four-column footer with brand, product/company links, and an emergency note. */
export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700 text-white shadow-sm">
                <Mountain className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight text-secondary-900">HimRakshak</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-secondary-500">
              Landslide early warning for mountain communities — sensors to evacuation guidance in
              one operating picture.
            </p>
            <Badge variant="info" className="mt-3">
              Mock data — no backend connected
            </Badge>
          </div>

          <nav aria-label="Product">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-900">
              Product
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="rounded text-secondary-600 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-900">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="rounded text-secondary-600 transition-colors hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Emergency
              </p>
              <p className="mt-2 text-xs leading-5 text-amber-900">
                In an active emergency, always follow official evacuation instructions from your
                local authorities.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 text-xs text-secondary-400 sm:flex-row">
          <p>© {new Date().getFullYear()} HimRakshak. All rights reserved.</p>
          <p>Built for safer mountains.</p>
        </div>
      </div>
    </footer>
  );
}
