
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Globe, Inbox, ShoppingCart, DollarSign, ArrowUpRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { formatDate } from '@/utils/formatDate';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    domains: 0,
    offers: 0,
    orders: 0,
    sales: 0
  });
  const [recentOffers, setRecentOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Parallel fetching for speed
        const [domains, offers, orders, sales, recent] = await Promise.all([
          supabase.from('domains').select('*', { count: 'exact', head: true }),
          supabase.from('leads').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('leads').select('*, domains(name)').order('created_at', { ascending: false }).limit(5)
        ]);

        setStats({
          domains: domains.count || 0,
          offers: offers.count || 0,
          orders: orders.count || 0,
          sales: sales.count || 0
        });

        setRecentOffers(recent.data || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <Link to={link}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{ borderLeftColor: color }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{loading ? '-' : value}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center" style={{ color: color }}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Domains" value={stats.domains} icon={Globe} color="#10b981" link="/admin/domains" />
        <StatCard title="Active Offers" value={stats.offers} icon={Inbox} color="#3b82f6" link="/admin/offers" />
        <StatCard title="Total Orders" value={stats.orders} icon={ShoppingCart} color="#f59e0b" link="/admin/orders" />
        <StatCard title="Completed Sales" value={stats.sales} icon={DollarSign} color="#8b5cf6" link="/admin/sales" />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1 lg:col-span-2 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-400" />
                Recent Offers
              </CardTitle>
              <Link to="/admin/offers" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">
                View All <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Domain</th>
                    <th className="px-6 py-3">Buyer</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="4" className="p-6 text-center text-slate-400">Loading activity...</td></tr>
                  ) : recentOffers.length === 0 ? (
                    <tr><td colSpan="4" className="p-6 text-center text-slate-400">No recent offers found.</td></tr>
                  ) : (
                    recentOffers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{offer.domains?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="font-medium">{offer.buyer_name}</div>
                          <div className="text-xs text-slate-400">{offer.email}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600">${Number(offer.offer_amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-500">{formatDate(offer.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
