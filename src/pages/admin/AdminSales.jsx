
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { DollarSign, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import SEO from '@/components/SEO';
import { formatDate } from '@/utils/formatDate';

const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      // Sales are just completed orders
      const { data, error } = await supabase
        .from('orders')
        .select('*, domains(name)')
        .eq('status', 'completed')
        .order('updated_at', { ascending: false });
      
      if (!error) setSales(data || []);
      setLoading(false);
    };
    fetchSales();
  }, []);

  const totalRevenue = sales.reduce((acc, sale) => acc + (Number(sale.price) || 0), 0);

  return (
    <>
      <SEO title="Sales History | RDM Admin" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h1 className="text-2xl font-bold text-slate-900">Sales History</h1>
           <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
             <span className="text-emerald-700 font-medium text-sm uppercase tracking-wider">Total Revenue</span>
             <div className="text-2xl font-bold text-emerald-900">${totalRevenue.toLocaleString()}</div>
           </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Domain Sold</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Sale Price</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {loading ? <tr><td colSpan="5" className="p-8 text-center">Loading sales data...</td></tr> :
                 sales.length === 0 ? <tr><td colSpan="5" className="p-8 text-center">No completed sales recorded.</td></tr> :
                 sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 text-slate-500">
                       {formatDate(sale.updated_at)}
                     </td>
                     <td className="px-6 py-4 font-bold text-slate-900">
                       {sale.domains?.name || 'Unknown'}
                     </td>
                     <td className="px-6 py-4 text-slate-600">
                       {sale.buyer_name} <span className="text-slate-400 text-xs">({sale.buyer_email})</span>
                     </td>
                     <td className="px-6 py-4 font-bold text-emerald-600">
                       ${Number(sale.price).toLocaleString()}
                     </td>
                     <td className="px-6 py-4 text-slate-500 italic text-xs max-w-xs truncate">
                       {sale.notes || 'No notes'}
                     </td>
                  </tr>
                 ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminSales;
