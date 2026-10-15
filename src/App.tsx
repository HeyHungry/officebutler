import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unexpected error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="font-serif min-h-screen bg-gray-50 flex items-center justify-center p-6 text-slate-800">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100 space-y-4">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900">Er is een onverwachte fout opgetreden</h2>
            <p className="text-sm text-slate-600">
              Uw bestelling of verzoek is mogelijk al goed ontvangen. Klik op de knop hieronder om de pagina opnieuw te laden.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#05053D] hover:bg-[#0a0a5c] text-white rounded-xl font-medium text-sm transition-colors cursor-pointer"
            >
              Pagina herladen
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import {
  supabase,
  fallbackSettings,
  fallbackStoreSettings,
  SharedSettings,
  StoreSettings,
  CURRENT_BRAND,
  fetchBrandPageContent,
} from "./lib/supabase";

import { Navbar } from "./components/Navbar";
import { OrderModalProvider } from "./contexts/OrderModalContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { ModeratorProvider, useModerator } from "./contexts/ModeratorContext";
import { ModeratorViewWidget } from "./components/ModeratorViewWidget";
import { InlineTextEditModal } from "./components/InlineTextEditModal";
import { OrderModal } from "./components/OrderModal";
import { GuestOrdering } from "./pages/GuestOrdering";
import { Footer } from "./components/Footer";
import { ModeratorPanel } from "./components/ModeratorPanel";
import { ModeratorLoginModal } from "./components/ModeratorLoginModal";
import { WhatsAppWidget } from "./components/WhatsAppWidget";
import { PrivacyModal } from "./components/PrivacyModal";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";

import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { CompanyDashboard } from "./pages/CompanyDashboard";
import { EmployeeOrdering } from "./pages/EmployeeOrdering";

function AppContent({
  settings,
  setSettings,
  storeSettings,
  setStoreSettings,
}: {
  settings: SharedSettings;
  setSettings: (s: SharedSettings) => void;
  storeSettings: StoreSettings;
  setStoreSettings: (s: StoreSettings) => void;
}) {
  const [isModPanelOpen, setIsModPanelOpen] = useState(false);
  const [isModeratorLoginOpen, setIsModeratorLoginOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const { getTranslatedStoreSettings, getTranslatedSharedSettings } = useLanguage();
  const { setOpenModPanelHandler, openCentralDashboard } = useModerator();

  useEffect(() => {
    setOpenModPanelHandler(() => {
      openCentralDashboard();
    });
  }, [setOpenModPanelHandler, openCentralDashboard]);

  const activeStoreSettings = getTranslatedStoreSettings(storeSettings) || storeSettings;
  const activeSettings = getTranslatedSharedSettings(settings) || settings;

  return (
    <div className="font-serif min-h-screen flex flex-col relative selection:bg-ob-accent/30">
      <Navbar storeSettings={activeStoreSettings} />

      <Routes>
        <Route path="/" element={<Home settings={activeSettings} storeSettings={activeStoreSettings} />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<CompanyDashboard />} />
        <Route path="/order" element={<EmployeeOrdering />} />
        <Route path="/guest-order" element={<GuestOrdering />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
      </Routes>

      <Footer 
        onOpenModPanel={() => setIsModeratorLoginOpen(true)} 
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      <WhatsAppWidget />

      {/* Moderator View Widget (linksonder) & Inline Text Edit Modal */}
      <ModeratorViewWidget />
      <InlineTextEditModal />

      {/* Moderator Login & Direct Hub Modal (aangeroepen via Mokum Local Kitchen logo) */}
      <ModeratorLoginModal
        isOpen={isModeratorLoginOpen}
        onClose={() => setIsModeratorLoginOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        pageContent={storeSettings?.page_content}
      />

      <ModeratorPanel
        isOpen={isModPanelOpen}
        onClose={() => setIsModPanelOpen(false)}
        settings={settings}
        storeSettings={storeSettings}
        onSettingsUpdated={setSettings}
        onStoreSettingsUpdated={setStoreSettings}
      />

      <OrderModal content={activeStoreSettings?.page_content} />
    </div>
  );
}

export default function App() {
  const [settings, setSettings] = useState<SharedSettings>(fallbackSettings);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(
    fallbackStoreSettings,
  );

  useEffect(() => {
    async function fetchSettings() {
      // 1. Direct lokale cache laden voor canal_butler indien aanwezig
      try {
        const cached = localStorage.getItem('canal_butler_page_content') || localStorage.getItem(`brand_page_content_${CURRENT_BRAND}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Object.keys(parsed).length > 0) {
            setStoreSettings(prev => ({
              ...prev,
              page_content: { ...(prev.page_content || {}), ...parsed }
            }));
          }
        }
      } catch {}

      try {
        const [sharedRes, storeRes, brandContent] = await Promise.all([
          supabase ? supabase.from("shared_settings").select("*").eq("id", 1).single() : Promise.resolve({ data: null, error: null }),
          supabase ? supabase.from("store_settings").select("*").eq("id", 1).single() : Promise.resolve({ data: null, error: null }),
          fetchBrandPageContent('canal_butler'),
        ]);

        if (sharedRes?.data) {
          setSettings(sharedRes.data as SharedSettings);
        }

        const baseStore = storeRes?.data ? (storeRes.data as StoreSettings) : fallbackStoreSettings;
        
        // Start met de specifieke Canal Butler instellingen en teksten
        let mergedPageContent = { ...(fallbackStoreSettings.page_content || {}) };

        // Behoud product-, categorie- en leverregels en achtergrondafbeelding uit de centrale store_settings
        if (baseStore.page_content) {
          if (baseStore.page_content.product_brands) mergedPageContent.product_brands = baseStore.page_content.product_brands;
          if (baseStore.page_content.category_descriptions) mergedPageContent.category_descriptions = baseStore.page_content.category_descriptions;
          if (baseStore.page_content.category_variant_rules) mergedPageContent.category_variant_rules = baseStore.page_content.category_variant_rules;
          if (baseStore.page_content.hide_image_products) mergedPageContent.hide_image_products = baseStore.page_content.hide_image_products;
          if (baseStore.page_content.packaging_options) mergedPageContent.packaging_options = baseStore.page_content.packaging_options;
          if (baseStore.page_content.delivery_methods) mergedPageContent.delivery_methods = baseStore.page_content.delivery_methods;
          if (baseStore.page_content.section_order) mergedPageContent.section_order = baseStore.page_content.section_order;
          if (baseStore.page_content.hero_background_image) mergedPageContent.hero_background_image = baseStore.page_content.hero_background_image;
        }

        // Overschrijf met de specifieke Canal Butler content uit Supabase (brand_page_content)
        if (brandContent && Object.keys(brandContent).length > 0) {
          const brandBg = brandContent.hero_background_image;
          mergedPageContent = { ...mergedPageContent, ...brandContent };
          // Behoud store_settings achtergrond als brandContent leeg is of de oude standaardwaarde bevat
          if (baseStore.page_content?.hero_background_image && (!brandBg || brandBg === 'https://i.imgur.com/owrXF8B.png')) {
            mergedPageContent.hero_background_image = baseStore.page_content.hero_background_image;
          }
        }

        // Overschrijf met eventuele lokale offline bewerkingen, maar behoud verse database hero_background_image
        try {
          const cached = localStorage.getItem('canal_butler_page_content') || localStorage.getItem(`brand_page_content_${CURRENT_BRAND}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === 'object') {
              const liveDbBg = mergedPageContent.hero_background_image;
              mergedPageContent = { ...mergedPageContent, ...parsed };
              if (liveDbBg && liveDbBg !== 'https://i.imgur.com/owrXF8B.png') {
                mergedPageContent.hero_background_image = liveDbBg;
              }
            }
          }
        } catch {}

        // Zorg dat het Canal Butler logo en de achtergrondafbeelding altijd correct ingesteld staan
        if (!mergedPageContent.header_logo_url || mergedPageContent.header_logo_url.includes('ymXR7tL') || mergedPageContent.header_logo_url.includes('gr8l4hR')) {
          mergedPageContent.header_logo_url = 'https://i.imgur.com/psrYTWD.png';
        }
        if (!mergedPageContent.hero_background_image) {
          mergedPageContent.hero_background_image = 'https://i.imgur.com/owrXF8B.png';
        }

        // Werk ook de lokale cache direct bij met de geverifieerde database content
        try {
          localStorage.setItem('canal_butler_page_content', JSON.stringify(mergedPageContent));
          localStorage.setItem(`brand_page_content_${CURRENT_BRAND}`, JSON.stringify(mergedPageContent));
        } catch {}

        setStoreSettings({
          ...baseStore,
          page_content: mergedPageContent,
        });
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    }

    fetchSettings();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider customTranslations={storeSettings?.page_content?.custom_translations}>
          <OrderModalProvider>
            <ModeratorProvider
              storeSettings={storeSettings}
              onStoreSettingsUpdated={setStoreSettings}
            >
              <AppContent
                settings={settings}
                setSettings={setSettings}
                storeSettings={storeSettings}
                setStoreSettings={setStoreSettings}
              />
            </ModeratorProvider>
          </OrderModalProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

