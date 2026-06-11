import { useState, useMemo } from "react";
import {
  Search, ShoppingCart, ChevronDown, Star, X,
  MapPin, TrendingUp, AlertTriangle, Users,
  Crown, ShieldCheck, Tag, BarChart2, Filter, Zap, Cpu
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import rawData from "../../imports/amazon_customers_dataset.json";

type Customer = typeof rawData.customers[0];
type AiTag = { label: string; color: string; bg: string; border: string; reason: string };

const customers: Customer[] = rawData.customers;

const TIER_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  Platinum: { color: "#5b5fc7", bg: "#ede9ff", icon: "💎" },
  Gold:     { color: "#b8860b", bg: "#fff8dc", icon: "🥇" },
  Silver:   { color: "#718096", bg: "#f0f0f0", icon: "🥈" },
  Bronze:   { color: "#b7521a", bg: "#fff0e6", icon: "🥉" },
};

function churnLabel(score: number) {
  if (score >= 0.7) return { label: "High", color: "#c40000", bg: "#fff0f0", dot: "#ff4d4d" };
  if (score >= 0.4) return { label: "Medium", color: "#a34800", bg: "#fff7e6", dot: "#ff9900" };
  return { label: "Low", color: "#177245", bg: "#f0fff4", dot: "#22c55e" };
}

// ── AI-generated tags (simulated backend ML output) ──────────────────────────
function generateTags(c: Customer): AiTag[] {
  const tags: AiTag[] = [];
  const today = new Date();
  const bMonth = c.birthday_month;
  const bDay = c.birthday_day;
  const bdayDate = new Date(today.getFullYear(), bMonth - 1, bDay);
  const daysUntilBday = Math.ceil((bdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const bdaySoon = daysUntilBday >= 0 && daysUntilBday <= 30;

  if (c.is_lost_customer)
    tags.push({ label: "Win-Back", color: "#c40000", bg: "#fff0f0", border: "#fca5a5", reason: `Lost customer — last active ${Math.max(0, c.days_since_last_order)}d ago` });

  if (!c.is_lost_customer && c.is_at_risk_customer)
    tags.push({ label: "At Risk", color: "#92400e", bg: "#fffbeb", border: "#fcd34d", reason: `Churn score ${(c.churn_score * 100).toFixed(0)}% — spend drop ${c.spend_drop_pct}%` });

  if (c.abandoned_cart_flag && c.cart_value > 0)
    tags.push({ label: "Cart Abandoner", color: "#1e3a5f", bg: "#eff6ff", border: "#93c5fd", reason: `$${c.cart_value} left in cart (${c.top_cart_category})` });

  if (c.total_spend > 10000)
    tags.push({ label: "High LTV", color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", reason: `Lifetime spend $${c.total_spend.toLocaleString()}` });

  if (!c.prime_member_flag && c.total_orders >= 30)
    tags.push({ label: "Prime Candidate", color: "#1e40af", bg: "#eff6ff", border: "#93c5fd", reason: `${c.total_orders} orders — not yet a Prime member` });

  if (bdaySoon)
    tags.push({ label: "Birthday Soon", color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd", reason: `Birthday on ${bMonth}/${bDay} — ${daysUntilBday}d away` });

  if (c.discount_usage_rate >= 0.6)
    tags.push({ label: "Discount Seeker", color: "#9d174d", bg: "#fdf2f8", border: "#f9a8d4", reason: `Uses discounts on ${(c.discount_usage_rate * 100).toFixed(0)}% of purchases` });

  if (c.offer_sensitivity_score >= 0.8)
    tags.push({ label: "Offer Sensitive", color: "#92400e", bg: "#fffbeb", border: "#fcd34d", reason: `Offer sensitivity score: ${(c.offer_sensitivity_score * 100).toFixed(0)}%` });

  if (c.churn_score < 0.15 && c.total_orders >= 30)
    tags.push({ label: "Loyal Buyer", color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", reason: `${c.total_orders} orders, churn score only ${(c.churn_score * 100).toFixed(0)}%` });

  if (c.spend_drop_pct >= 25 && !c.is_lost_customer)
    tags.push({ label: "Spend Declining", color: "#7f1d1d", bg: "#fef2f2", border: "#fca5a5", reason: `Spend dropped ${c.spend_drop_pct}% vs prior period` });

  if (c.sessions_30d >= 30 && c.total_orders < 5)
    tags.push({ label: "Browser, Low Convert", color: "#1e3a5f", bg: "#eff6ff", border: "#93c5fd", reason: `${c.sessions_30d} sessions but only ${c.total_orders} orders` });

  if (c.reactivation_flag)
    tags.push({ label: "Reactivation Target", color: "#5b21b6", bg: "#f5f3ff", border: "#c4b5fd", reason: "Flagged by ML model for re-engagement campaign" });

  if (c.purchase_frequency_90d >= 10)
    tags.push({ label: "Power Shopper", color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", reason: `${c.purchase_frequency_90d} purchases in last 90 days` });

  return tags;
}

export function CustomerDashboard() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.full_name.toLowerCase().includes(q) ||
        c.customer_id.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.top_category.toLowerCase().includes(q);
      const matchTier = tierFilter === "All" || c.customer_tier === tierFilter;
      const matchRisk =
        riskFilter === "All" ||
        (riskFilter === "High" && c.churn_score >= 0.7) ||
        (riskFilter === "Medium" && c.churn_score >= 0.4 && c.churn_score < 0.7) ||
        (riskFilter === "Low" && c.churn_score < 0.4);
      return matchSearch && matchTier && matchRisk;
    });
  }, [search, tierFilter, riskFilter]);

  const stats = useMemo(() => {
    const total = customers.length;
    const atRisk = customers.filter(c => c.is_at_risk_customer).length;
    const lost = customers.filter(c => c.is_lost_customer).length;
    const prime = customers.filter(c => c.prime_member_flag).length;
    const totalSpend = customers.reduce((s, c) => s + c.total_spend, 0);
    return { total, atRisk, lost, prime, totalSpend };
  }, []);

  const churnData = [
    { name: "Low Risk", value: customers.filter(c => c.churn_score < 0.4).length, color: "#22c55e" },
    { name: "Medium Risk", value: customers.filter(c => c.churn_score >= 0.4 && c.churn_score < 0.7).length, color: "#FF9900" },
    { name: "High Risk", value: customers.filter(c => c.churn_score >= 0.7).length, color: "#c40000" },
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED] flex flex-col">
      {/* ── Top Nav ── */}
      <header className="bg-[#131921] text-white">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="flex items-center gap-0.5 mr-2 shrink-0">
            <span className="text-[#FF9900] text-xl font-bold tracking-tight">amazon</span>
            <span className="text-[#FF9900] text-lg">.</span>
          </div>
          <div className="hidden md:flex flex-col text-xs leading-tight shrink-0">
            <span className="text-gray-400">Deliver to</span>
            <span className="font-bold text-white flex items-center gap-1"><MapPin className="w-3 h-3" /> United States</span>
          </div>
          <div className="flex flex-1 rounded overflow-hidden mx-2">
            <select className="bg-[#F3F3F3] text-gray-700 text-xs px-2 border-r border-gray-300 focus:outline-none hidden md:block">
              <option>All Departments</option>
            </select>
            <div className="flex flex-1 bg-white">
              <input
                className="flex-1 px-3 py-2 text-gray-900 text-sm focus:outline-none"
                placeholder="Search customers, ID, city, category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="bg-[#FF9900] hover:bg-[#e88b00] px-4 flex items-center justify-center transition-colors">
              <Search className="w-5 h-5 text-gray-900" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="hidden md:flex flex-col leading-tight cursor-pointer hover:underline">
              <span className="text-gray-400">Hello, Admin</span>
              <span className="font-bold text-white flex items-center gap-0.5">Account <ChevronDown className="w-3 h-3" /></span>
            </div>
            <div className="flex flex-col leading-tight cursor-pointer hover:underline">
              <span className="text-gray-400">Returns &amp;</span>
              <span className="font-bold text-white">Orders</span>
            </div>
            <div className="relative cursor-pointer hover:underline flex items-end gap-1">
              <span className="absolute -top-1 -right-1 bg-[#FF9900] text-[#131921] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{stats.atRisk}</span>
              <ShoppingCart className="w-7 h-7" />
              <span className="font-bold hidden md:block">Cart</span>
            </div>
          </div>
        </div>
        <div className="bg-[#232F3E] px-4 py-1.5 flex items-center gap-5 text-xs overflow-x-auto">
          {["All", "Electronics", "Clothing", "Books", "Beauty", "Sports", "Home & Kitchen", "Garden", "Toys", "Automotive"].map(item => (
            <button key={item} className="whitespace-nowrap text-white hover:text-[#FF9900] transition-colors">{item}</button>
          ))}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-4 space-y-4">

        {/* Breadcrumb */}
        <div className="text-xs text-[#0F1111]">
          <span className="text-[#007185] hover:underline cursor-pointer">Seller Central</span>
          <span className="mx-1">›</span>
          <span className="text-[#007185] hover:underline cursor-pointer">Analytics</span>
          <span className="mx-1">›</span>
          <span>Customer Intelligence</span>
        </div>

        {/* Page title */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[#0F1111]">Customer Intelligence</h1>
            <p className="text-xs text-[#565959] mt-0.5">AI-powered customer segmentation and churn analysis · {customers.length} customers</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-white border border-[#D5D9D9] rounded px-3 py-1.5 text-[#565959]">
            <Cpu className="w-3.5 h-3.5 text-[#FF9900]" />
            <span>Tags generated by ML model</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>

        {/* Stats + Churn */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
            <AmazonStatCard label="Total Customers" value={stats.total} icon={<Users className="w-5 h-5 text-[#007185]" />} sub="in dataset" />
            <AmazonStatCard label="At-Risk" value={stats.atRisk} icon={<AlertTriangle className="w-5 h-5 text-[#c40000]" />} sub="need attention" highlight="red" />
            <AmazonStatCard label="Prime Members" value={stats.prime} icon={<Crown className="w-5 h-5 text-[#00a8e0]" />} sub={`${Math.round(stats.prime / stats.total * 100)}% of total`} />
            <AmazonStatCard label="Total Revenue" value={`$${(stats.totalSpend / 1000).toFixed(0)}K`} icon={<TrendingUp className="w-5 h-5 text-[#007600]" />} sub="lifetime value" highlight="green" />
          </div>
          <div className="bg-white border border-[#D5D9D9] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-[#FF9900]" />
              <span className="text-sm text-[#0F1111]">Churn Risk Distribution</span>
            </div>
            <div className="flex items-center gap-2">
              <ResponsiveContainer width="50%" height={100}>
                <PieChart>
                  <Pie data={churnData} dataKey="value" innerRadius={28} outerRadius={44} paddingAngle={2}>
                    {churnData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} customers`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5">
                {churnData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#0F1111]">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span>{d.name}</span>
                    <span className="ml-auto font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#D5D9D9] rounded-lg px-4 py-3 flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-[#565959]" />
          <span className="text-sm text-[#0F1111]">Filter by:</span>
          <select
            className="border border-[#D5D9D9] rounded text-sm px-2 py-1 text-[#0F1111] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
          >
            {["All", "Platinum", "Gold", "Silver", "Bronze"].map(t => <option key={t}>{t}</option>)}
          </select>
          <select
            className="border border-[#D5D9D9] rounded text-sm px-2 py-1 text-[#0F1111] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
          >
            {["All Churn Risk", "High", "Medium", "Low"].map(r => <option key={r}>{r}</option>)}
          </select>
          <div className="ml-auto text-sm text-[#565959]">
            <span className="font-medium text-[#0F1111]">{filtered.length}</span> of {customers.length} customers
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#D5D9D9] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D5D9D9] bg-[#F7F8F8]">
                  <th className="px-4 py-3 text-left text-xs text-[#565959] font-medium">Customer</th>
                  <th className="px-4 py-3 text-left text-xs text-[#565959] font-medium">Tier</th>
                  <th className="px-4 py-3 text-left text-xs text-[#565959] font-medium">AI Tags</th>
                  <th className="px-4 py-3 text-right text-xs text-[#565959] font-medium">Total Spend</th>
                  <th className="px-4 py-3 text-right text-xs text-[#565959] font-medium">Orders</th>
                  <th className="px-4 py-3 text-left text-xs text-[#565959] font-medium">Churn Score</th>
                  <th className="px-4 py-3 text-left text-xs text-[#565959] font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F2F2]">
                {filtered.map(c => {
                  const churn = churnLabel(c.churn_score);
                  const tier = TIER_CONFIG[c.customer_tier] || TIER_CONFIG.Bronze;
                  const daysAgo = Math.max(0, c.days_since_last_order);
                  const tags = generateTags(c);
                  return (
                    <tr
                      key={c.customer_id}
                      className="hover:bg-[#F7F8F8] cursor-pointer transition-colors"
                      onClick={() => setSelected(c)}
                    >
                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#232F3E] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {c.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[#0F1111] font-medium">{c.full_name}</span>
                              {c.prime_member_flag && <span className="text-[#00a8e0] text-xs font-bold">prime</span>}
                            </div>
                            <div className="text-[#565959] text-xs">{c.city}, {c.state} · {c.top_category}</div>
                          </div>
                        </div>
                      </td>
                      {/* Tier */}
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded whitespace-nowrap" style={{ background: tier.bg, color: tier.color }}>
                          {tier.icon} {c.customer_tier}
                        </span>
                      </td>
                      {/* AI Tags */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {tags.slice(0, 3).map(tag => (
                            <AiTagPill key={tag.label} tag={tag} />
                          ))}
                          {tags.length > 3 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-[#565959] border border-gray-200">
                              +{tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Spend */}
                      <td className="px-4 py-3 text-right text-[#0F1111] font-medium whitespace-nowrap">
                        ${c.total_spend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      {/* Orders */}
                      <td className="px-4 py-3 text-right text-[#0F1111]">{c.total_orders}</td>
                      {/* Churn */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, c.churn_score * 100)}%`, background: churn.dot }} />
                          </div>
                          <span className="text-xs whitespace-nowrap" style={{ color: churn.color }}>{(c.churn_score * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        {c.is_lost_customer
                          ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Lost</span>
                          : c.is_at_risk_customer
                            ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">At Risk</span>
                            : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
                        }
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[#565959]">No customers match your search or filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[#565959] text-center pb-4">
          © 2026 Amazon.com, Inc. · Seller Central · Customer Intelligence &nbsp;|&nbsp; API: <code className="bg-gray-200 px-1 rounded">GET /api/v1/customers</code>
        </p>
      </main>

      {selected && <CustomerDetail customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ── AI Tag Pill ── */
function AiTagPill({ tag, showReason }: { tag: AiTag; showReason?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border transition-opacity hover:opacity-80"
        style={{ background: tag.bg, color: tag.color, borderColor: tag.border }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={e => e.stopPropagation()}
      >
        <Zap className="w-2.5 h-2.5" />
        {tag.label}
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 z-50 w-52 bg-[#0F1111] text-white text-xs rounded p-2 shadow-lg pointer-events-none">
          <div className="flex items-center gap-1 mb-1 text-[#FF9900]">
            <Cpu className="w-3 h-3" /> ML Model Reason
          </div>
          {tag.reason}
        </div>
      )}
    </div>
  );
}

/* ── Stat Card ── */
function AmazonStatCard({ label, value, icon, sub, highlight }: {
  label: string; value: string | number; icon: React.ReactNode; sub?: string; highlight?: "red" | "green";
}) {
  return (
    <div className={`bg-white border rounded-lg p-4 flex flex-col gap-1 ${highlight === "red" ? "border-l-4 border-l-[#c40000] border-[#D5D9D9]" : highlight === "green" ? "border-l-4 border-l-[#007600] border-[#D5D9D9]" : "border-[#D5D9D9]"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#565959]">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold text-[#0F1111]">{value}</div>
      {sub && <div className="text-xs text-[#565959]">{sub}</div>}
    </div>
  );
}

/* ── Detail Drawer ── */
function CustomerDetail({ customer: c, onClose }: { customer: Customer; onClose: () => void }) {
  const churn = churnLabel(c.churn_score);
  const tier = TIER_CONFIG[c.customer_tier] || TIER_CONFIG.Bronze;
  const daysAgo = Math.max(0, c.days_since_last_order);
  const tags = generateTags(c);

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <div
        className="w-full max-w-[440px] bg-white h-full overflow-y-auto flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#131921] text-white px-5 pt-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FF9900] flex items-center justify-center text-[#131921] font-bold text-lg shrink-0">
                {c.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white">{c.full_name}</h2>
                  {c.prime_member_flag && <span className="text-[#00a8e0] text-xs font-bold">prime</span>}
                </div>
                <div className="text-gray-400 text-xs font-mono">{c.customer_id}</div>
                <div className="text-gray-400 text-xs">{c.city}, {c.state} · {c.age_band} · {c.gender}</div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white mt-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: tier.bg, color: tier.color }}>{tier.icon} {c.customer_tier}</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: churn.bg, color: churn.color }}>Churn {(c.churn_score * 100).toFixed(0)}%</span>
            {c.is_lost_customer && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Lost</span>}
            {c.is_at_risk_customer && !c.is_lost_customer && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">At Risk</span>}
          </div>
        </div>
        <div className="h-1 bg-[#FF9900]" />

        <div className="flex-1 divide-y divide-[#F0F2F2] text-sm">

          {/* ── AI Tags Section ── */}
          <section className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-3.5 h-3.5 text-[#FF9900]" />
              <h4 className="text-xs text-[#565959] uppercase tracking-wide">AI-Generated Signals</h4>
              <span className="ml-auto text-xs text-[#007185]">{tags.length} tags</span>
            </div>
            {tags.length === 0 ? (
              <p className="text-xs text-[#565959] italic">No signals detected for this customer.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <AiTagPill key={tag.label} tag={tag} showReason />
                ))}
              </div>
            )}
            <p className="text-xs text-[#565959] mt-2.5 italic">Hover tags to see ML model reasoning</p>
          </section>

          {/* Purchase Summary */}
          <section className="px-5 py-4">
            <h4 className="text-xs text-[#565959] uppercase tracking-wide mb-3">Purchase Summary</h4>
            <div className="grid grid-cols-3 gap-3">
              <MiniCard label="Total Spend" value={`$${c.total_spend.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} />
              <MiniCard label="Orders" value={String(c.total_orders)} />
              <MiniCard label="Avg Order" value={`$${c.average_order_value}`} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <MiniCard label="90d Spend" value={`$${c.last_90d_spend}`} />
              <MiniCard label="Last Order" value={daysAgo > 0 ? `${daysAgo}d ago` : "Recent"} />
            </div>
          </section>

          {/* Engagement */}
          <section className="px-5 py-4">
            <h4 className="text-xs text-[#565959] uppercase tracking-wide mb-3">Engagement (30 days)</h4>
            <div className="space-y-2">
              <ProgressRow label="Sessions" value={c.sessions_30d} max={50} />
              <ProgressRow label="Product Views" value={c.product_views_30d} max={200} />
              <ProgressRow label="Searches" value={c.search_count_30d} max={100} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <EngageRow label="Email Open Rate" value={`${(c.email_open_rate * 100).toFixed(0)}%`} />
              <EngageRow label="Push Open Rate" value={`${(c.push_open_rate * 100).toFixed(0)}%`} />
              <EngageRow label="Rec. Click Rate" value={`${(c.recommendation_click_rate * 100).toFixed(0)}%`} />
              <EngageRow label="Discount Usage" value={`${(c.discount_usage_rate * 100).toFixed(0)}%`} />
            </div>
          </section>

          {/* Cart & Wishlist */}
          <section className="px-5 py-4">
            <h4 className="text-xs text-[#565959] uppercase tracking-wide mb-3">Cart & Wishlist</h4>
            <div className="grid grid-cols-3 gap-3">
              <MiniCard label="Cart Value" value={c.cart_value > 0 ? `$${c.cart_value}` : "—"} />
              <MiniCard label="Cart Items" value={String(c.cart_item_count)} />
              <MiniCard label="Wishlist" value={String(c.wishlist_count)} />
            </div>
            {c.abandoned_cart_flag && (
              <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Abandoned cart — {c.top_cart_category || "items"} · ${c.cart_value}
              </div>
            )}
          </section>

          {/* Preferences */}
          <section className="px-5 py-4">
            <h4 className="text-xs text-[#565959] uppercase tracking-wide mb-3">Preferences</h4>
            <div className="space-y-1.5">
              <DetailRow label="Top Category">{c.top_category}</DetailRow>
              <DetailRow label="Top Brand">{c.top_brand}</DetailRow>
              <DetailRow label="Price Range"><span className="capitalize">{c.preferred_price_range}</span></DetailRow>
              <DetailRow label="Signup Channel"><span className="capitalize">{c.signup_channel.replace(/_/g, " ")}</span></DetailRow>
              <DetailRow label="Preferred Offer"><span className="capitalize">{c.preferred_offer_type?.replace(/_/g, " ") ?? "—"}</span></DetailRow>
            </div>
          </section>

          {/* Offer Intelligence */}
          <section className="px-5 py-4">
            <h4 className="text-xs text-[#565959] uppercase tracking-wide mb-3">Offer Intelligence</h4>
            <div className="flex items-center gap-2 mb-3">
              {c.offer_eligibility_flag
                ? <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded"><ShieldCheck className="w-3 h-3" /> Offer Eligible</span>
                : <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded">Not Eligible</span>
              }
              {c.reactivation_flag && (
                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded">
                  <Tag className="w-3 h-3" /> Reactivation Target
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <DetailRow label="Offer Sensitivity">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-[#FF9900]" style={{ width: `${c.offer_sensitivity_score * 100}%` }} />
                  </div>
                  <span>{(c.offer_sensitivity_score * 100).toFixed(0)}%</span>
                </div>
              </DetailRow>
              <DetailRow label="Coupon Redemption">{(c.coupon_redemption_rate * 100).toFixed(0)}%</DetailRow>
              <DetailRow label="Last Offer">{c.last_offer_type?.replace(/_/g, " ") ?? "None"}</DetailRow>
              <DetailRow label="Offer Expires">{c.offer_expiry_days} days</DetailRow>
            </div>
          </section>

          {/* Support */}
          <section className="px-5 py-4">
            <h4 className="text-xs text-[#565959] uppercase tracking-wide mb-3">Support & Quality</h4>
            <div className="grid grid-cols-2 gap-3">
              <MiniCard label="CSAT Score" value={<StarRating score={c.csat_score} />} />
              <MiniCard label="Tickets" value={String(c.support_ticket_count)} />
              <MiniCard label="Return Rate" value={`${(c.return_rate * 100).toFixed(0)}%`} />
              <MiniCard label="Refunds" value={String(c.refund_count)} />
            </div>
          </section>

          <div className="px-5 py-4 bg-[#F7F8F8]">
            <p className="text-xs text-[#565959]">
              🔌 Backend API: <code className="bg-gray-200 px-1 rounded">GET /api/v1/customers/{c.customer_id}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-[#F7F8F8] rounded p-2.5">
      <div className="text-xs text-[#565959] mb-0.5">{label}</div>
      <div className="text-sm font-medium text-[#0F1111]">{value}</div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-[#565959] shrink-0 w-32">{label}</span>
      <span className="text-xs text-[#0F1111] text-right">{children}</span>
    </div>
  );
}

function EngageRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F7F8F8] rounded px-2 py-1.5">
      <div className="text-xs text-[#565959]">{label}</div>
      <div className="text-sm font-medium text-[#0F1111]">{value}</div>
    </div>
  );
}

function ProgressRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#565959] w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className="h-1.5 rounded-full bg-[#FF9900]" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
      <span className="text-xs text-[#0F1111] w-6 text-right">{value}</span>
    </div>
  );
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className="w-3 h-3" fill={i <= Math.round(score) ? "#FF9900" : "none"} stroke={i <= Math.round(score) ? "#FF9900" : "#ccc"} />
      ))}
      <span className="text-xs ml-1 text-[#565959]">{score}</span>
    </div>
  );
}
