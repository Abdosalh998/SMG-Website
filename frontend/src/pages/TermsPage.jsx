import LegalPageView from '../components/ui/LegalPageView';
import { FileText } from 'lucide-react';

const TermsPage = () => {
  return <LegalPageView slug="terms" icon={<FileText className="w-6 h-6 text-primary" />} pagePath="/terms" />;
};

export default TermsPage;
