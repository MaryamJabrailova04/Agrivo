import { ShoppingCart, Package, MessageCircle, TrendingUp, Users, Star } from "lucide-react";
import { navigateToHash } from "../../i18n/localizedRoutes";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import PageNavigation from "../components/PageNavigation";

export default function DashboardPage() {
  return (
    <>
      <PageNavigation currentPage="dashboard" title="Your Dashboard" />
      <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard!</h1>
        <p className="text-gray-600">Manage your orders, track deliveries, and explore fresh products</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Favorite Farmers</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">₹2,340</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "ORD-001", farmer: "Rajesh Kumar", items: "Tomatoes, Onions", amount: "₹480", status: "Delivered" },
              { id: "ORD-002", farmer: "Meera Devi", items: "Fresh Mangoes", amount: "₹320", status: "In Transit" },
              { id: "ORD-003", farmer: "Suresh Patel", items: "Farm Fresh Milk", amount: "₹165", status: "Pending" }
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.farmer} • {order.items}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{order.amount}</p>
                  <Badge 
                    variant={order.status === "Delivered" ? "default" : order.status === "In Transit" ? "secondary" : "outline"}
                    className={order.status === "Delivered" ? "bg-green-100 text-green-700" : ""}
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">View All Orders</Button>
          </CardContent>
        </Card>

        {/* Favorite Farmers */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Your Favorite Farmers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Rajesh Kumar", location: "Punjab", specialty: "Organic Vegetables", rating: 4.8 },
              { name: "Meera Devi", location: "Maharashtra", specialty: "Fresh Fruits", rating: 4.9 },
              { name: "Suresh Patel", location: "Gujarat", specialty: "Dairy Products", rating: 4.7 }
            ].map((farmer) => (
              <div key={farmer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{farmer.name}</p>
                  <p className="text-sm text-gray-600">{farmer.location} • {farmer.specialty}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{farmer.rating}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigateToHash('farmers')}
            >
              Discover More Farmers
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white h-auto p-4"
                onClick={() => navigateToHash('products')}
              >
                <div className="text-center">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Browse Products</div>
                  <div className="text-sm opacity-80">Find fresh produce</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4"
                onClick={() => navigateToHash('bulk-orders')}
              >
                <div className="text-center">
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Bulk Orders</div>
                  <div className="text-sm text-gray-600">For businesses</div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4"
                onClick={() => navigateToHash('farmers')}
              >
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Find Farmers</div>
                  <div className="text-sm text-gray-600">Connect directly</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </>
  );
}