import { useState, useEffect } from 'react';
import { X, Mail, Gift, Target, ShoppingBag, ExternalLink, Loader2 } from 'lucide-react';
// IMPORT THE API CALLS HERE
import { fetchSingleProfile, fetchAdRecommendations } from '../services/api';

interface AIInsightsPanelProps {
  customer: any;
  onClose: () => void;
}

export default function AIInsightsPanel({ customer, onClose }: AIInsightsPanelProps) {
  // --- 1. EXISTING TAB STATE ---
  const [activeTab, setActiveTab] = useState<'recovery' | 'ads' | 'details'>('recovery');

  // --- 2. NEW HOOKS GO HERE (Directly under the other state) ---
  const [detailedProfile, setDetailedProfile] = useState<any>(null);
  const [adData, setAdData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // --- 3. THE EFFECT HOOK (Fires the API calls when the 'customer' prop changes) ---
  useEffect(() => {
    const fetchDetails = async () => {
      // If no customer is clicked, don't fetch anything
      if (!customer?.customer_id) return; 
      
      setLoading(true);
      try {
        const [profile, ads] = await Promise.all([
          fetchSingleProfile(customer.customer_id),
          fetchAdRecommendations(customer.customer_id)
        ]);
        setDetailedProfile(profile);
        setAdData(ads);
      } catch (error) {
        console.error("Error fetching insights", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [customer]);

  // --- 4. EARLY EXIT (Must be AFTER all hooks) ---
  if (!customer) return null;

  // --- 5. DYNAMIC VARIABLES (Prefer backend data if it exists, otherwise fallback to the table data) ---
  const churnPercent = Math.round((detailedProfile?.churn_score || customer.churn_score || 0) * 100);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg h-[800px] flex flex-col sticky top-6 animate-in slide-in-from-right-4 duration-300">
      
      {/* Header Profile */}
      <div className="p-5 border-b bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-t-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-xl font-bold border border-white/20">
            {customer.full_name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              {customer.full_name}
              {customer.prime_member_flag && <span className="bg-[#00a8e1] text-white text-[10px] px-1.5 py-0.5 rounded font-sans italic tracking-tighter">prime</span>}
            </h2>
            <p className="text-gray-300 text-sm">{customer.city}, {customer.state} • Customer since {customer.signup_date.split('-')[0]}</p>
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-xs font-medium backdrop-blur-sm">
                Tier: {customer.customer_tier}
              </span>
              <span className={`px-2 py-0.5 border rounded text-xs font-medium backdrop-blur-sm ${churnPercent > 50 ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'}`}>
                Risk: {churnPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b text-sm font-medium">
        <button 
          onClick={() => setActiveTab('recovery')}
          className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === 'recovery' ? 'border-[#007185] text-[#007185]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Recovery Blueprint
        </button>
        <button 
          onClick={() => setActiveTab('ads')}
          className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === 'ads' ? 'border-[#007185] text-[#007185]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Ad Targets
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="p-5 flex-1 overflow-y-auto bg-gray-50/50">
        
        {/* TAB 1: RECOVERY */}
        {activeTab === 'recovery' && (
          <div className="space-y-5">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">AI Intervention Strategy</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Recommended Channel</div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-2 rounded-md w-fit">
                    <Mail className="w-4 h-4" /> Personalized Email
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Suggested Reward Incentives</div>
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-md w-fit">
                    <Gift className="w-4 h-4" /> {customer.preferred_offer_type.replace('_', ' ').toUpperCase()} ({customer.offer_expiry_days} Days)
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1 flex justify-between">
                    Generated Copy <span className="text-[#007185] cursor-pointer hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3"/> Edit in SES</span>
                  </div>
                  <div className="bg-gray-50 border p-3 rounded-md text-sm text-gray-700 font-mono leading-relaxed">
                    "Hi {customer.full_name.split(' ')[0]}, we noticed you left some {customer.top_cart_category || customer.top_category} items behind. As a valued {customer.customer_tier} member, enjoy this exclusive {customer.preferred_offer_type.replace('_', ' ')} on us. Click here to claim."
                  </div>
                  <button className="mt-3 w-full bg-[#febd69] hover:bg-[#f3a847] text-gray-900 font-medium py-2 rounded-md transition-colors text-sm">
                    Deploy Recovery Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADS */}
        {activeTab === 'ads' && (
          <div className="space-y-5">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" /> Google Ads Mapping
              </h3>
              <div className="flex flex-wrap gap-2">
                {customer.preferred_price_range === 'premium' && <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-md text-xs font-medium">High Value Audience</span>}
                {customer.abandoned_cart_flag && <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-medium">Cart Re-engagement</span>}
                <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-md text-xs font-medium">In-Market: {customer.top_category}</span>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Recommended Products
              </h3>
              <div className="space-y-3">
                {/* Mocked products based on their top category */}
                <div className="flex gap-3 items-center border p-2 rounded-md hover:border-[#007185] cursor-pointer transition-colors">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">📦</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{customer.top_brand} Premium Item</div>
                    <div className="text-xs text-gray-500">Based on recent searches</div>
                  </div>
                  <div className="text-sm font-bold text-[#b12704]">$129.99</div>
                </div>
                <div className="flex gap-3 items-center border p-2 rounded-md hover:border-[#007185] cursor-pointer transition-colors">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">🎁</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{customer.top_category} Bundle</div>
                    <div className="text-xs text-gray-500">High affinity match</div>
                  </div>
                  <div className="text-sm font-bold text-[#b12704]">$89.50</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}