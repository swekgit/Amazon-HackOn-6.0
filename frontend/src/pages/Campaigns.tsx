import { useState } from 'react';
import axios from 'axios';

export default function Campaigns() {
  const [targetSegment, setTargetSegment] = useState('Inactive Buyer');
  const [channel, setChannel] = useState<'SMS' | 'Email' | 'WhatsApp'>('Email');
  const [loading, setLoading] = useState(false);

  const handleTriggerCampaign = async () => {
    setLoading(true);
    try {
      await axios.post('/api/campaigns/trigger', {
        segment: targetSegment,
        channel: channel,
        reward_type: 'Discount Coupon' // Tied to Reward Engine
      });
      alert('Recovery campaign initiated successfully!');
    } catch (error) {
      console.error('Failed to deploy recovery steps', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Recovery & Marketing Automation</h1>
      
      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Customer Cohort</label>
          <select 
            className="w-full p-2 border border-slate-200 rounded-lg bg-white"
            value={targetSegment}
            onChange={(e) => setTargetSegment(e.target.value)}
          >
            <option value="Inactive Buyer">Inactive Buyers (&gt;90 Days Dormant)</option>
            <option value="Budget Buyer">Budget Buyers</option>
            <option value="Premium Buyer">Premium Buyers</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">AWS Delivery Gateway</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Email', 'SMS', 'WhatsApp'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setChannel(mode)}
                className={`p-3 text-sm font-medium border rounded-lg transition-all ${
                  channel === mode 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {mode === 'Email' ? 'Amazon SES' : mode === 'SMS' ? 'Amazon SNS' : 'Twilio API'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleTriggerCampaign}
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Generating AI Copies & Sending...' : 'Execute Recovery Campaign'}
        </button>
      </div>
    </div>
  );
}