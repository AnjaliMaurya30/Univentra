import { Outlet } from 'react-router-dom';

import { Logo } from '@/components/common/logo';

export const PublicLayout = () => (
  <div className="min-h-screen">
    <header className="container flex items-center justify-between py-6">
      <Logo />
    </header>
    <main className="pb-14">
      <Outlet />
    </main>
  </div>
);
