import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Truck } from 'lucide-react';
import { foodApi, categoryApi } from '../services/api.js';
import FoodCard from '../components/FoodCard.jsx';

const heroImg = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    foodApi.list({ available: 1 }).then(setFeatured).catch(() => {});
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-brand-charcoal text-white overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-charcoal via-brand-charcoal/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <p className="text-brand-yellow font-semibold tracking-wide uppercase text-sm mb-3">Fresh • Fast • Delicious</p>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-2xl">
            Craving something <span className="text-brand-orange">delicious</span>?
          </h1>
          <p className="mt-4 text-gray-300 text-lg max-w-xl">
            Order from our chef-curated menu and get restaurant-quality food delivered to your doorstep.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/menu" className="btn-primary flex items-center gap-2">Browse Menu <ArrowRight size={18} /></Link>
            <Link to="/register" className="btn-outline !border-white/30 !text-white hover:!bg-white/10">Create Account</Link>
          </div>
          <div className="mt-12 flex gap-8 text-sm text-gray-300">
            <span className="flex items-center gap-2"><Star size={16} className="text-brand-yellow" /> 4.8 rated</span>
            <span className="flex items-center gap-2"><Clock size={16} className="text-brand-yellow" /> 30-45 min delivery</span>
            <span className="flex items-center gap-2"><Truck size={16} className="text-brand-yellow" /> Free pickup available</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((c) => (
            <Link key={c.category_id} to={`/menu?category=${c.category_id}`}
              className="card p-4 flex items-center gap-3 hover:shadow-md hover:border-brand-orange/40 transition">
              <span className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold">
                {c.category_name[0]}
              </span>
              <div>
                <p className="font-semibold text-sm">{c.category_name}</p>
                <p className="text-xs text-gray-400">{c.item_count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured items */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-brand-charcoal">Popular Right Now</h2>
          <Link to="/menu" className="text-brand-orange font-semibold text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.slice(0, 8).map((f) => <FoodCard key={f.food_id} food={f} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-3 gap-8 text-center">
          {[
            ['1', 'Browse & Add', 'Explore our menu, search and filter dishes you love.'],
            ['2', 'Checkout', 'Add delivery details and choose Cash on Delivery or Card payment.'],
            ['3', 'Track Order', 'Follow your order live from Pending to Delivered.']
          ].map(([n, t, d]) => (
            <div key={n}>
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-orange text-white font-extrabold flex items-center justify-center text-xl mb-3">{n}</div>
              <h3 className="font-bold text-brand-charcoal">{t}</h3>
              <p className="text-sm text-gray-500 mt-1">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
