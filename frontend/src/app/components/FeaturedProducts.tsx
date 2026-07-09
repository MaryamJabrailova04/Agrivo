import { ShoppingCart, MessageCircle, MapPin, Star } from "lucide-react";
import { navigateToHash } from "../../i18n/localizedRoutes";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ProductImage } from "./products/ProductImage";

const products = [
  {
    id: 1,
    name: "Organic Tomatoes",
    farmer: "Rajesh Kumar",
    location: "Punjab",
    image: "https://images.unsplash.com/photo-1613295759649-e16cdcdf22fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwdmVnZXRhYmxlcyUyMHRvbWF0b2VzJTIwZnJlc2h8ZW58MXx8fHwxNzU3ODQwNzE3fDA&ixlib=rb-4.1.0&q=80&w=400",
    price: "₹40",
    unit: "/kg",
    originalPrice: "₹60",
    rating: 4.8,
    category: "Vegetables",
    isOrganic: true,
    inStock: true,
    whatsapp: "+91-9876543210",
    description: "Fresh, juicy tomatoes grown without pesticides"
  },
  {
    id: 2,
    name: "Fresh Mangoes",
    farmer: "Meera Devi",
    location: "Maharashtra",
    image: "https://images.unsplash.com/photo-1668029407328-4cba9084c3a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0cyUyMGFwcGxlcyUyMG9yYW5nZXN8ZW58MXx8fHwxNzU3ODI3MDE0fDA&ixlib=rb-4.1.0&q=80&w=400",
    price: "₹80",
    unit: "/kg",
    originalPrice: "₹120",
    rating: 4.9,
    category: "Fruits",
    isOrganic: false,
    inStock: true,
    whatsapp: "+91-9876543211",
    description: "Sweet Alphonso mangoes, harvested at perfect ripeness"
  },
  {
    id: 3,
    name: "Farm Fresh Milk",
    farmer: "Suresh Patel",
    location: "Gujarat",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtJTIwZnJlc2glMjBtaWxrfGVufDF8fHx8MTc1Nzg0MDczMXww&ixlib=rb-4.1.0&q=80&w=400",
    price: "₹55",
    unit: "/liter",
    originalPrice: "₹70",
    rating: 4.7,
    category: "Dairy",
    isOrganic: true,
    inStock: true,
    whatsapp: "+91-9876543212",
    description: "Pure cow milk from grass-fed cows, delivered fresh daily"
  },
  {
    id: 4,
    name: "Organic Spinach",
    farmer: "Priya Sharma",
    location: "Haryana",
    image: "https://images.unsplash.com/photo-1576045057624-7c7696632670?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwc3BpbmFjaCUyMGxlYWZ5JTIwZ3JlZW5zfGVufDF8fHx8MTc1Nzg0MDczM3ww&ixlib=rb-4.1.0&q=80&w=400",
    price: "₹30",
    unit: "/bunch",
    originalPrice: "₹45",
    rating: 4.6,
    category: "Vegetables",
    isOrganic: true,
    inStock: true,
    whatsapp: "+91-9876543213",
    description: "Fresh leafy spinach, rich in iron and vitamins"
  },
  {
    id: 5,
    name: "Basmati Rice",
    farmer: "Amit Singh",
    location: "Punjab",
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNtYXRpJTIwcmljZSUyMGdyYWluc3xlbnwxfHx8fDE3NTc4NDA3MzZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    price: "₹120",
    unit: "/kg",
    originalPrice: "₹150",
    rating: 4.8,
    category: "Grains",
    isOrganic: false,
    inStock: true,
    whatsapp: "+91-9876543214",
    description: "Premium quality basmati rice with long grains"
  },
  {
    id: 6,
    name: "Fresh Carrots",
    farmer: "Lata Devi",
    location: "Rajasthan",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d9a5da37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNhcnJvdHMlMjBvcmFuZ2V8ZW58MXx8fHwxNzU3ODQwNzM4fDA&ixlib=rb-4.1.0&q=80&w=400",
    price: "₹35",
    unit: "/kg",
    originalPrice: "₹50",
    rating: 4.5,
    category: "Vegetables",
    isOrganic: true,
    inStock: false,
    whatsapp: "+91-9876543215",
    description: "Crunchy orange carrots, perfect for salads and cooking"
  }
];

export default function FeaturedProducts() {
  const handleWhatsAppClick = (whatsapp: string, productName: string, farmerName: string) => {
    const message = encodeURIComponent(`Hello ${farmerName}, I'm interested in buying ${productName} from FreshFarm marketplace.`);
    window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <section className="py-12 bg-white">
      <div className="container px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the freshest products from our verified farmers at the best prices
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-sm overflow-hidden">
              <div className="relative">
                <ProductImage
                  name={product.name}
                  src={product.image}
                  category={product.category}
                  alt={`${product.name} product image`}
                  className="h-48 w-full"
                />
                {product.isOrganic && (
                  <Badge className="absolute top-2 left-2 bg-green-600 hover:bg-green-700 text-white">
                    Organic
                  </Badge>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                {/* Product Info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  
                  {/* Farmer & Location */}
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.farmer}, {product.location}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-gray-500">(50+ reviews)</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl font-bold text-green-600">{product.price}</span>
                  <span className="text-sm text-gray-600">{product.unit}</span>
                  <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    {Math.round(((parseInt(product.originalPrice.replace('₹', '')) - parseInt(product.price.replace('₹', ''))) / parseInt(product.originalPrice.replace('₹', ''))) * 100)}% OFF
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleWhatsAppClick(product.whatsapp, product.name, product.farmer)}
                    disabled={!product.inStock}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            className="border-green-600 text-green-600 hover:bg-green-50"
            onClick={() => navigateToHash('products')}
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}