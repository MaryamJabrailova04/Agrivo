import { MessageCircle, MapPin, Star } from "lucide-react";
import { navigateToHash } from "../../i18n/localizedRoutes";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const farmers = [
  {
    id: 1,
    name: "Rajesh Kumar",
    location: "Punjab, India",
    image: "https://images.unsplash.com/photo-1614025000673-edf238aaf5d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTc4NDA3MTR8MA&ixlib=rb-4.1.0&q=80&w=400",
    specialty: "Organic Vegetables",
    rating: 4.8,
    products: ["Tomatoes", "Onions", "Potatoes"],
    experience: "15 Years",
    whatsapp: "+91-9876543210",
    verified: true
  },
  {
    id: 2,
    name: "Meera Devi",
    location: "Maharashtra, India",
    image: "https://images.unsplash.com/photo-1614025000673-edf238aaf5d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTc4NDA3MTR8MA&ixlib=rb-4.1.0&q=80&w=400",
    specialty: "Fresh Fruits",
    rating: 4.9,
    products: ["Mangoes", "Oranges", "Bananas"],
    experience: "12 Years",
    whatsapp: "+91-9876543211",
    verified: true
  },
  {
    id: 3,
    name: "Suresh Patel",
    location: "Gujarat, India",
    image: "https://images.unsplash.com/photo-1614025000673-edf238aaf5d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NTc4NDA3MTR8MA&ixlib=rb-4.1.0&q=80&w=400",
    specialty: "Dairy Products",
    rating: 4.7,
    products: ["Fresh Milk", "Paneer", "Butter"],
    experience: "20 Years",
    whatsapp: "+91-9876543212",
    verified: true
  }
];

export default function FeaturedFarmers() {
  const handleWhatsAppClick = (whatsapp: string, farmerName: string) => {
    const message = encodeURIComponent(`Hello ${farmerName}, I'm interested in your products from FreshFarm marketplace.`);
    window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Featured Farmers
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet our trusted farmers who bring you the freshest produce directly from their farms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map((farmer) => (
            <Card key={farmer.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-sm">
              <CardContent className="p-6">
                {/* Farmer Profile */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    <ImageWithFallback
                      src={farmer.image}
                      alt={farmer.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {farmer.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        {farmer.experience}
                      </Badge>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {farmer.location}
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{farmer.rating}</span>
                      <span className="text-sm text-gray-500">(120+ reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Specialty */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Specializes in: <span className="font-medium text-green-600">{farmer.specialty}</span></p>
                  <div className="flex flex-wrap gap-1">
                    {farmer.products.map((product) => (
                      <Badge key={product} variant="outline" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => navigateToHash('farmers')}
                  >
                    View Profile
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleWhatsAppClick(farmer.whatsapp, farmer.name)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
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
            onClick={() => navigateToHash('farmers')}
          >
            View All Farmers
          </Button>
        </div>
      </div>
    </section>
  );
}