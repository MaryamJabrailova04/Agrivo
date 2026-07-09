import React from "react";
import { ArrowLeft, Home, ShoppingBag, Users, Package, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { navigateToHash } from "../../i18n/localizedRoutes";

interface PageNavigationProps {
  currentPage: string;
  showBackButton?: boolean;
  title?: string;
}

export default function PageNavigation({ currentPage, showBackButton = true, title }: PageNavigationProps) {
  // Navigation history management
  const getNavigationHistory = (): string[] => {
    const history = sessionStorage.getItem('navigationHistory');
    return history ? JSON.parse(history) : ['home'];
  };

  const updateNavigationHistory = (page: string) => {
    const history = getNavigationHistory();
    // Don't add the same page twice in a row
    if (history[history.length - 1] !== page) {
      history.push(page);
      // Keep only last 10 pages
      if (history.length > 10) {
        history.shift();
      }
      sessionStorage.setItem('navigationHistory', JSON.stringify(history));
    }
  };

  const handleBack = () => {
    const history = getNavigationHistory();
    // Remove current page from history
    history.pop();
    const previousPage = history[history.length - 1] || 'home';
    navigateToHash(previousPage);
  };

  const handleNavigate = (page: string) => {
    updateNavigationHistory(currentPage);
    navigateToHash(page);
  };

  // Update current page in history when component mounts
  React.useEffect(() => {
    updateNavigationHistory(currentPage);
  }, [currentPage]);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'farmers', label: 'Farmers', icon: Users },
    { id: 'bulk-orders', label: 'Bulk Orders', icon: Package },
    { id: 'dashboard', label: 'Dashboard', icon: User }
  ];

  return (
    <div className="sticky top-0 z-40 overflow-x-hidden border-b border-gray-200 bg-white shadow-sm">
      <div className="agrivo-container py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Back button and title */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="shrink-0 text-gray-600 hover:bg-green-50 hover:text-green-600"
              >
                <ArrowLeft className="mr-1 h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            {title && (
              <h1 className="truncate text-sm font-semibold text-gray-900 sm:text-base">{title}</h1>
            )}
          </div>

          {/* Right: Quick navigation */}
          <div className="hidden items-center gap-1 lg:flex">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center space-x-1 ${
                    isActive 
                      ? "bg-green-600 text-white hover:bg-green-700" 
                      : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                  }`}
                  disabled={isActive}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Mobile quick navigation */}
        <div className="mt-3 lg:hidden">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-2">
              <div className="flex items-center justify-between gap-1 overflow-x-auto">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleNavigate(item.id)}
                      className={`flex-1 flex flex-col items-center space-y-1 h-auto py-2 ${
                        isActive 
                          ? "bg-green-600 text-white hover:bg-green-700" 
                          : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                      }`}
                      disabled={isActive}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}