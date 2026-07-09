import { Search, ArrowRight } from "lucide-react";
import { navigateToHash } from "../../i18n/localizedRoutes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-green-50 to-emerald-50 py-12 md:py-20">
      <div className="container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-green-900 leading-tight">
                Buy Fresh, <span className="text-green-600">Support Farmers</span>, Save Money
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Connect directly with local farmers. Get the freshest produce at fair prices while supporting your community.
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-2 max-w-md">
              <div className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search for rice, tomatoes, mangoes..."
                    className="pl-10 border-0 focus:outline-none focus:ring-0"
                  />
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-600">Active Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">10K+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">Product Types</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigateToHash('products')}
              >
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => navigateToHash('login')}
              >
                Join as Farmer
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1573481078935-b9605167e06b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXIlMjBtYXJrZXQlMjB2ZWdldGFibGVzJTIwZnJlc2h8ZW58MXx8fHwxNTU3ODQwNzExfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Fresh vegetables at farmer's market"
                className="w-full h-[400px] object-cover"
              />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">🥕</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Fresh Today</div>
                  <div className="text-sm text-gray-600">Delivered from farm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}