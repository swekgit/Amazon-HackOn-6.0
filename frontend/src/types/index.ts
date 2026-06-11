export interface Customer {
  customer_id: string;
  name: string;
  age: number;
  preferred_brand: string;
  budget_range: string;
  wishlist: string[];
  last_purchase_date: string;
  order_frequency: number;
  segment: 'Brand Loyal' | 'Premium Buyer' | 'Budget Buyer' | 'Frequent Buyer' | 'Inactive Buyer';
  days_inactive: number;
}

export interface AnalyticsMetrics {
  recoveredCustomers: number;
  lostCustomers: number;
  revenueRecovered: number;
  adPerformanceClick: number;
  recommendationCtr: number;
  campaignSuccessRate: number;
}

export interface Campaign {
  id: string;
  name: string;
  targetSegment: string;
  channel: 'SMS' | 'Email' | 'WhatsApp';
  status: 'Active' | 'Draft' | 'Completed';
  sentCount: number;
}