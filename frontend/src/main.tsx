  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { AuthProvider } from "./app/auth/AuthContext";
  import { CartProvider } from "./app/context/CartContext";
  import { SavedProductsProvider } from "./app/context/SavedProductsContext";
  import { LanguageProvider } from "./i18n/LanguageContext";
  import { disableBrowserScrollRestoration } from "./app/utils/scrollRestoration";
  import "leaflet/dist/leaflet.css";
  import "./styles/index.css";

  disableBrowserScrollRestoration();

  createRoot(document.getElementById("root")!).render(
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <SavedProductsProvider>
            <App />
          </SavedProductsProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>,
  );
  