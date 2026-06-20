import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={isHome ? "flex-1" : "flex-1 container mx-auto px-4 pt-28 pb-12"}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
