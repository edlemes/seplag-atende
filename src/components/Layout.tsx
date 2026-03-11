import { ReactNode } from 'react';
import AccessibilityBar from './AccessibilityBar';
import WhatsAppButton from './WhatsAppButton';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AccessibilityBar />
      {children}
      <WhatsAppButton />
    </>
  );
};

export default Layout;
