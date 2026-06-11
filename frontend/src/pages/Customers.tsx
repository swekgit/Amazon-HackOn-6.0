import { useState, useEffect } from 'react';
// Import your Shadcn components
import { Badge } from '../components/ui/badge'; 
import { Button } from '../components/ui/button';
// Import your JSON dataset directly (Vite handles this automatically)
import data from '../imports/amazon_customers_data.json';

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief network delay, then load the JSON data
    const timer = setTimeout(() => {
      // Access the "customers" array inside your JSON structure
      setCustomers(data.customers); 
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse">Loading Customer Intelligence Data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Displaying {data.total_customers} customers from dataset version {data.dataset_version}
          </p>
        </div>
        <Button variant="outline">Export Data</Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Customer</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Tier</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Total Spend</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Top Category</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Risk Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                // Apply your lost customer rule here!
                const isLost = customer.days_since_last_order > 90;
                
                return (
                  <tr key={customer.customer_id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="font-medium">{customer.full_name}</div>
                      <div className="text-xs text-muted-foreground">{customer.customer_id}</div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="secondary">{customer.customer_tier}</Badge>
                    </td>
                    <td className="p-4 align-middle font-medium">
                      ${customer.total_spend.toLocaleString()}
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {customer.top_category}
                    </td>
                    <td className="p-4 align-middle">
                      {isLost ? (
                        <Badge variant="destructive">Lost ({customer.days_since_last_order} Days)</Badge>
                      ) : (
                        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}