import { useState } from 'react';
import UtilityBar from './sections/UtilityBar';
import GovHeader from './sections/GovHeader';
import PrimaryNav from './sections/PrimaryNav';
import UpdatesTicker from './sections/UpdatesTicker';
import EmergencyStrip from './sections/EmergencyStrip';
import HeroBanner from './sections/HeroBanner';
import QuickServiceTiles from './sections/QuickServiceTiles';
import RegionalStatus from './sections/RegionalStatus';
import LiveMonitoringMap from './sections/LiveMonitoringMap';
import ActiveAlertsPanel from './sections/ActiveAlertsPanel';
import CheckYourArea from './sections/CheckYourArea';
import RiskMapPreview from './sections/RiskMapPreview';
import AtAGlance from './sections/AtAGlance';
import HowItWorks from './sections/HowItWorks';
import DataSources from './sections/DataSources';
import FieldGallery from './sections/FieldGallery';
import DistrictStatus from './sections/DistrictStatus';
import InfrastructureMonitor from './sections/InfrastructureMonitor';
import WhoItsFor from './sections/WhoItsFor';
import ReportLandslide from './sections/ReportLandslide';
import AlertSubscription from './sections/AlertSubscription';
import SafetyInfo from './sections/SafetyInfo';
import NoticesUpdates from './sections/NoticesUpdates';
import ReportsDocuments from './sections/ReportsDocuments';
import EmergencyContacts from './sections/EmergencyContacts';
import Faq from './sections/Faq';
import GovFooter from './sections/GovFooter';

/**
 * HimRakshak government-grade portal homepage.
 * Information hierarchy (highest priority first): status & alerts → live
 * monitoring map → regional risk → active alerts → citizen tools → network
 * overview → pipeline → districts → infrastructure → reporting → safety →
 * notices → documents → emergency contacts.
 * The page is standalone: it carries its own utility bar, institutional
 * header, primary navigation and detailed footer (no PublicLayout).
 */
export default function Landing() {
  const [zoom, setZoom] = useState(1);

  return (
    <div style={{ zoom }} className="min-h-screen bg-white">
      <div
        className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-slate-200 to-[#138808]"
        aria-hidden="true"
      />
      <UtilityBar zoom={zoom} onZoomChange={setZoom} />
      <GovHeader />
      <PrimaryNav />
      <UpdatesTicker />
      <EmergencyStrip />

      <main id="main-content">
        <HeroBanner />
        <QuickServiceTiles />
        <RegionalStatus />
        <LiveMonitoringMap />
        <ActiveAlertsPanel />
        <CheckYourArea />
        <RiskMapPreview />
        <AtAGlance />
        <HowItWorks />
        <DataSources />
        <FieldGallery />
        <DistrictStatus />
        <InfrastructureMonitor />
        <WhoItsFor />
        <AlertSubscription />
        <SafetyInfo />
        <NoticesUpdates />
        <ReportsDocuments />
        <ReportLandslide />
        <EmergencyContacts />
        <Faq />
      </main>

      <GovFooter />
    </div>
  );
}
