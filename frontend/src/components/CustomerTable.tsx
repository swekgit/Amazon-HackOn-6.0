import { Filter } from 'lucide-react';

interface CustomerTableProps {
  data: any[];
  onSelect: (customer: any) => void;
  activeId?: string;
}

// Helper for avatars
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2);
const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function CustomerTable({ data, onSelect, activeId }: CustomerTableProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col">
      {/* Table Header / Filters */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50/80 rounded-t-lg">
        <div className="flex items-center gap-4 text-sm">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 font-medium">Filter by:</span>
          <select className="border border-gray-300 rounded px-3 py-1.5 outline-none bg-white min-w-[120px] text-sm focus:ring-2 focus:ring-[#007185]/20 focus:border-[#007185]">
            <option>All Customers</option>
            <option>Prime Only</option>
          </select>
          <select className="border border-gray-300 rounded px-3 py-1.5 outline-none bg-white min-w-[140px] text-sm focus:ring-2 focus:ring-[#007185]/20 focus:border-[#007185]">
            <option>All Churn Risk</option>
            <option>High Risk (&gt;50%)</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 font-medium">
          <span className="text-gray-900">{data.length}</span> of {data.length} records
        </div>
      </div>

      {/* Scrollable Table Body */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white border-b text-gray-500 sticky top-0 z-10">
            <tr>
              <th className="font-medium py-3 px-4">Customer</th>
              <th className="font-medium py-3 px-4">Tier</th>
              <th className="font-medium py-3 px-4">AI Tags</th>
              <th className="font-medium py-3 px-4">Total Spend</th>
              <th className="font-medium py-3 px-4">Churn Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((c) => {
              const churnPercent = Math.round(c.churn_score * 100);
              const barColor = churnPercent > 50 ? 'bg-red-500' : churnPercent > 20 ? 'bg-amber-500' : 'bg-emerald-500';
              const isSelected = activeId === c.customer_id;

              // Generate tags based on data
              const tags = [];
              if (c.abandoned_cart_flag) tags.push({ label: 'Cart Abandoner', color: 'text-blue-700 bg-blue-50 border-blue-200' });
              if (c.offer_sensitivity_score > 0.8) tags.push({ label: 'Offer Sensitive', color: 'text-amber-700 bg-amber-50 border-amber-200' });
              if (c.total_orders > 30) tags.push({ label: 'Power Shopper', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' });

              return (
                <tr 
                  key={c.customer_id} 
                  onClick={() => onSelect(c)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected ? 'bg-blue-50/50 border-l-4 border-l-[#007185]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${isSelected ? 'bg-[#007185] text-white' : 'bg-slate-800 text-white'}`}>
                        {getInitials(c.full_name)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-1.5">
                          {c.full_name} 
                          {c.prime_member_flag && <span className="text-[#00a8e1] text-[10px] font-bold font-sans italic tracking-tighter">prime</span>}
                        </div>
                        <div className="text-xs text-gray-500">{c.city}, {c.state} • {c.top_category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border
                      ${c.customer_tier === 'Platinum' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 
                        c.customer_tier === 'Gold' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                        'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {c.customer_tier}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                      {tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 border rounded-md ${tag.color}`}>
                          ⚡ {tag.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">{formatCurrency(c.total_spend)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${churnPercent}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 font-medium w-8">{churnPercent}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}