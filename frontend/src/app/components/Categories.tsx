import { Card, CardContent } from "./ui/card";
import { navigateToHash } from "../../i18n/localizedRoutes";

const categories = [
  { name: "Vegetables", icon: "🥦", count: "150+ items", color: "bg-green-100 hover:bg-green-200" },
  { name: "Fruits", icon: "🍎", count: "80+ items", color: "bg-red-100 hover:bg-red-200" },
  { name: "Dairy", icon: "🥛", count: "25+ items", color: "bg-blue-100 hover:bg-blue-200" },
  { name: "Grains", icon: "🌾", count: "40+ items", color: "bg-yellow-100 hover:bg-yellow-200" },
  { name: "Organic", icon: "🌱", count: "200+ items", color: "bg-emerald-100 hover:bg-emerald-200" },
  { name: "Herbs", icon: "🌿", count: "30+ items", color: "bg-green-100 hover:bg-green-200" },
];

export default function Categories() {
  return (
    <section className="py-12 bg-white">
      <div className="container px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover fresh, locally sourced products from farmers in your area
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.name} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${category.color} border-0`}
              onClick={() => navigateToHash('products')}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="text-3xl md:text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-xs text-gray-600">{category.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <button 
            className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
            onClick={() => navigateToHash('products')}
          >
            View All Categories
            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}