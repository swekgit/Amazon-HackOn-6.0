export interface Customer {
  customer_id: string;
  name: string;
  age: number;

  preferred_brand: string;

  budget_range: string;

  wishlist: string[];

  order_frequency: number;

  last_purchase_date: string;
}