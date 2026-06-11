import { Users, AlertTriangle, Crown, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface KPIGridProps {
  metrics: {
    totalCustomers: number;
    atRisk: number;
    primeMembers: number;
    primePercentage: number;
    totalRevenue: number;
    churnDist: { name: string; value: number; color: string }[];
  };
}

export default function KPIGrid({ metrics }: KPIGridProps) {
  // Prevent crash if metrics aren't loaded yet
  if (!metrics || !metrics.churnDist) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative">
        <Users className="absolute top-5 right-5 w-5 h-5 text-[#007185]" />
        <div className="text-gray-500 text-sm mb-1">Total Customers</div>
        <div className="text-3xl font-bold text-gray-900">{metrics.totalCustomers}</div>
        <div className="text-xs text-gray-500 mt-2">in dataset</div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative border-l-4 border-l-red-600">
        <AlertTriangle className="absolute top-5 right-5 w-5 h-5 text-red-600" />
        <div className="text-gray-500 text-sm mb-1">At-Risk</div>
        <div className="text-3xl font-bold text-gray-900">{metrics.atRisk}</div>
        <div className="text-xs text-gray-500 mt-2">need attention</div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative">
        <Crown className="absolute top-5 right-5 w-5 h-5 text-blue-500" />
        <div className="text-gray-500 text-sm mb-1">Prime Members</div>
        <div className="text-3xl font-bold text-gray-900">{metrics.primeMembers}</div>
        <div className="text-xs text-gray-500 mt-2">{metrics.primePercentage}% of total</div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative border-l-4 border-l-emerald-600">
        <TrendingUp className="absolute top-5 right-5 w-5 h-5 text-emerald-600" />
        <div className="text-gray-500 text-sm mb-1">Total Revenue</div>
        <div className="text-3xl font-bold text-gray-900">
          ${(metrics.totalRevenue / 1000).toFixed(0)}K
        </div>
        <div className="text-xs text-gray-500 mt-2">lifetime value</div>
      </div>

      {/* Churn Chart Card */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm col-span-1 md:col-span-1 flex flex-col justify-between">
        <div className="text-sm text-gray-800 font-medium mb-1">Churn Risk</div>
        <div className="flex items-center justify-between flex-1">
          <div className="w-20 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.churnDist} innerRadius={22} outerRadius={36} dataKey="value" stroke="none">
                  {metrics.churnDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs space-y-1.5 flex-1 ml-2">
            {metrics.churnDist.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-gray-600 whitespace-nowrap">{d.name}</span>
                </div>
                <span className="font-bold text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}