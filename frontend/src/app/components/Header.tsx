import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useCart } from "../context/CartContext";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-white font-semibold">🌾</span>
          </div>
          <span className="font-bold text-green-800 text-lg">FreshFarm</span>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search for rice, tomatoes, mangoes..."
              className="pl-10 bg-gray-50 border-0 focus:bg-white"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => onNavigate('products')}
            className={`transition-colors ${currentPage === 'products' ? 'text-green-600 font-medium' : 'text-gray-700 hover:text-green-600'}`}
          >
            Browse
          </button>
          <button 
            onClick={() => onNavigate('farmers')}
            className={`transition-colors ${currentPage === 'farmers' ? 'text-green-600 font-medium' : 'text-gray-700 hover:text-green-600'}`}
          >
            Farmers
          </button>
          <button 
            onClick={() => onNavigate('bulk-orders')}
            className={`transition-colors ${currentPage === 'bulk-orders' ? 'text-green-600 font-medium' : 'text-gray-700 hover:text-green-600'}`}
          >
            Bulk Orders
          </button>
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-green-600">
            <ShoppingCart className="h-4 w-4 mr-1" />
            Cart ({cartCount ?? 0})
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-700 hover:text-green-600"
            onClick={() => onNavigate('login')}
          >
            <User className="h-4 w-4 mr-1" />
            Login
          </Button>
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-10"
                  />
                </div>
                <nav className="flex flex-col space-y-4">
                  <button 
                    onClick={() => onNavigate('products')}
                    className="text-left text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Browse Products
                  </button>
                  <button 
                    onClick={() => onNavigate('farmers')}
                    className="text-left text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Find Farmers
                  </button>
                  <button 
                    onClick={() => onNavigate('bulk-orders')}
                    className="text-left text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Bulk Orders
                  </button>
                  <button 
                    onClick={() => onNavigate('login')}
                    className="text-left text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Login / Register
                  </button>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}