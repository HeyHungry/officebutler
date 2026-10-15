import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  supabase,
  fallbackSettings,
  fallbackStoreSettings,
  SharedSettings,
  StoreSettings,
  CURRENT_BRAND,
  CENTRAL_MODERATOR_URL,
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
import { WhatsAppWidget } from "./components/WhatsAppWidget";
import { PrivacyModal } from "./components/PrivacyModal";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

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
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const { getTranslatedStoreSettings, getTranslatedSharedSettings } = useLanguage();
  const { setOpenModPanelHandler } = useModerator();

  const handleOpenModPanel = () => {
    if (CENTRAL_MODERATOR_URL) {
      const separator = CENTRAL_MODERATOR_URL.includes('?') ? '&' : '?';
      const targetUrl = `${CENTRAL_MODERATOR_URL}${separator}brand=${CURRENT_BRAND}&panel=open&tab=content`;
      window.open(targetUrl, '_blank');
      return;
    }
    setIsModPanelOpen(true);
  };

  useEffect(() => {
    setOpenModPanelHandler(() => handleOpenModPanel());
  }, [setOpenModPanelHandler]);

  // Support opening moderator panel from URL query parameter (e.g. ?panel=open)
  // or direct pathname (e.g. /moderator of /admin)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const isQueryTrigger = 
        searchParams.get('panel') === 'open' || 
        searchParams.get('panel') === 'true' || 
        searchParams.get('moderator') === 'open';
      const isPathTrigger = 
        window.location.pathname === '/moderator' || 
        window.location.pathname === '/admin';

      if (isQueryTrigger || isPathTrigger) {
        setIsModPanelOpen(true);
      }
    } catch {}
  }, []);

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
        onOpenModPanel={handleOpenModPanel} 
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      <WhatsAppWidget />

      {/* Moderator View Widget (linksonder) & Inline Text Edit Modal */}
      <ModeratorViewWidget />
      <InlineTextEditModal />

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
      if (!supabase) return; // Use fallback if env vars missing

      try {
        const [sharedRes, storeRes] = await Promise.all([
          supabase.from("shared_settings").select("*").eq("id", 1).single(),
          supabase.from("store_settings").select("*").eq("id", 1).single(),
        ]);

        if (sharedRes.error) {
          console.warn(
            "Supabase fetch error for shared_settings:",
            sharedRes.error.message,
          );
        } else if (sharedRes.data) {
          setSettings(sharedRes.data as SharedSettings);
        }

        if (storeRes.error) {
          console.warn(
            "Supabase fetch error for store_settings:",
            storeRes.error.message,
          );
        } else if (storeRes.data) {
          let sData = storeRes.data as StoreSettings;

          // Load this brand's specific texts and banners from brand_page_content
          try {
            const brandContent = await fetchBrandPageContent(CURRENT_BRAND);
            if (brandContent && Object.keys(brandContent).length > 0) {
              sData = {
                ...sData,
                page_content: {
                  ...(sData.page_content || {}),
                  ...brandContent
                }
              };
            }
          } catch (bErr) {
            console.warn(`[Supabase] Kon brand content voor ${CURRENT_BRAND} niet laden:`, bErr);
          }

          setStoreSettings(sData);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    }

    fetchSettings();
  }, []);

  return (
    <BrowserRouter>
      <LanguageProvider customTranslations={storeSettings?.page_content?.custom_translations}>
        <OrderModalProvider>
          <ModeratorProvider
            storeSettings={storeSettings}
            onStoreSettingsUpdated={setStoreSettings}
          >
            <ErrorBoundary>
              <AppContent
                settings={settings}
                setSettings={setSettings}
                storeSettings={storeSettings}
                setStoreSettings={setStoreSettings}
              />
            </ErrorBoundary>
          </ModeratorProvider>
        </OrderModalProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

