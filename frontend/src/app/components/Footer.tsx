import { MessageCircle, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from "lucide-react";
import { navigateToHash } from "../../i18n/localizedRoutes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white font-semibold">🌾</span>
              </div>
              <span className="font-bold text-green-400 text-xl">FreshFarm</span>
            </div>
            <p className="text-gray-300">
              Connecting farmers directly with consumers for fresh produce and fair prices. Supporting local agriculture and sustainable farming.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-green-400">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-green-400">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-green-400">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* For Buyers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-green-400">For Buyers</h3>
            <ul className="space-y-2 text-gray-300">
              <li><button onClick={() => navigateToHash('products')} className="hover:text-green-400 transition-colors text-left">Browse Products</button></li>
              <li><button onClick={() => navigateToHash('farmers')} className="hover:text-green-400 transition-colors text-left">Find Farmers</button></li>
              <li><button onClick={() => navigateToHash('bulk-orders')} className="hover:text-green-400 transition-colors text-left">Bulk Orders</button></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Track Orders</a></li>
              <li><button onClick={() => navigateToHash('login')} className="hover:text-green-400 transition-colors text-left">My Account</button></li>
            </ul>
          </div>

          {/* For Farmers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-green-400">For Farmers</h3>
            <ul className="space-y-2 text-gray-300">
              <li><button onClick={() => navigateToHash('login')} className="hover:text-green-400 transition-colors text-left">Join as Farmer</button></li>
              <li><button onClick={() => navigateToHash('login')} className="hover:text-green-400 transition-colors text-left">Farmer Dashboard</button></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">List Products</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Farming Tips</a></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-green-400">Get in Touch</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-green-400" />
                <span>+91-1800-123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-green-400" />
                <span>support@freshfarm.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-green-400" />
                <span>New Delhi, India</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MessageCircle className="h-4 w-4 text-green-400" />
                <span>WhatsApp: +91-9876543200</span>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="pt-4">
              <h4 className="font-medium text-white mb-2">Stay Updated</h4>
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Enter email" 
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                />
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 FreshFarm. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-green-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}