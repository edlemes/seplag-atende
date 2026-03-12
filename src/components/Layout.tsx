import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import AccessibilityBar from './AccessibilityBar';
import WhatsAppButton from './WhatsAppButton';

const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const showWhatsApp = location.pathname === '/';

  return (
    <>
      <AccessibilityBar />
      {children}
      {showWhatsApp && <WhatsAppButton />}
    </>
  );
};

export default Layout;
