import { Search, ShoppingCart, MapPin, Menu, ChevronDown } from 'lucide-react';

export default function AmazonHeader() {
  return (
    <div className="w-full flex flex-col z-50 relative shadow-sm">
      {/* Top Dark Bar */}
      <header className="bg-[#131921] text-white flex items-center h-16 px-4 gap-4 text-sm whitespace-nowrap">
        <div className="flex items-center pt-2">
          <span className="text-2xl font-bold tracking-tighter">amazon<span className="text-[#febd69]">.</span></span>
        </div>
        
        <div className="flex items-center gap-1 hover:outline hover:outline-1 hover:outline-white p-1 cursor-pointer rounded-sm">
          <MapPin className="w-4 h-4 mt-2" />
          <div className="leading-tight">
            <div className="text-xs text-gray-300">Deliver to</div>
            <div className="font-bold">United States</div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex flex-1 h-10 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#f3a847]">
          <button className="bg-gray-100 text-gray-600 px-3 border-r flex items-center gap-1 text-xs hover:bg-gray-200">
            All <ChevronDown className="w-3 h-3" />
          </button>
          <input 
            type="text" 
            placeholder="Search customers, ID, city, category..." 
            className="flex-1 px-3 text-black outline-none w-full"
          />
          <button className="bg-[#febd69] hover:bg-[#f3a847] w-12 flex items-center justify-center text-gray-900 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="leading-tight hover:outline hover:outline-1 hover:outline-white p-1 cursor-pointer rounded-sm">
          <div className="text-xs text-gray-300">Hello, Admin</div>
          <div className="font-bold flex items-center gap-1">Account & Lists <ChevronDown className="w-3 h-3" /></div>
        </div>
        
        <div className="leading-tight hover:outline hover:outline-1 hover:outline-white p-1 cursor-pointer rounded-sm">
          <div className="text-xs text-gray-300">Returns</div>
          <div className="font-bold">& Orders</div>
        </div>
        
        <div className="flex items-center font-bold hover:outline hover:outline-1 hover:outline-white p-1 cursor-pointer rounded-sm">
          <div className="relative">
            <ShoppingCart className="w-8 h-8" />
            <span className="absolute -top-1 right-0 text-[#f3a847] text-xs font-bold">14</span>
          </div>
          <span className="mt-2 ml-1">Cart</span>
        </div>
      </header>

      {/* Bottom Sub-Nav */}
      <nav className="bg-[#232f3e] text-white flex items-center h-10 px-4 gap-4 text-sm font-medium overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-1 cursor-pointer hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm">
          <Menu className="w-4 h-4"/> All
        </div>
        {['Electronics', 'Clothing', 'Books', 'Beauty', 'Sports', 'Home & Kitchen', 'Garden', 'Toys'].map(item => (
          <div key={item} className="cursor-pointer hover:outline hover:outline-1 hover:outline-white p-1 rounded-sm">
            {item}
          </div>
        ))}
      </nav>
    </div>
  );
}