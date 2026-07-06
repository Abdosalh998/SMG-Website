import LegalPageView from '../components/ui/LegalPageView';
import { ShieldCheck } from 'lucide-react';

const PrivacyPage = () => {
  return <LegalPageView slug="privacy" icon={<ShieldCheck className="w-6 h-6 text-primary" />} pagePath="/privacy" />;
};

export default PrivacyPage;
