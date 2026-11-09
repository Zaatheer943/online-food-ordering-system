import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-brand-orange text-white flex items-center justify-center font-extrabold">F</span>
            <span className="text-lg font-extrabold text-white">FoodDash</span>
          </div>
          <p className="text-sm text-gray-400">Delicious meals delivered fast. Order online and enjoy restaurant-quality food at home.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/menu" className="hover:text-brand-orange">Menu</Link></li>
            <li><Link to="/cart" className="hover:text-brand-orange">Cart</Link></li>
            <li><Link to="/login" className="hover:text-brand-orange">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <p className="text-sm text-gray-400">Colombo, Sri Lanka</p>
          <p className="text-sm text-gray-400">+94 77 123 4567</p>
          <p className="text-sm text-gray-400">hello@fooddash.lk</p>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} FoodDash — CA05 Online Food Ordering System
      </div>
    </footer>
  );
}
