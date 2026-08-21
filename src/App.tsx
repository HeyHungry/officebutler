import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  supabase,
  fallbackSettings,
  fallbackStoreSettings,
  SharedSettings,
  StoreSettings,
} from "./lib/supabase";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ModeratorPanel } from "./components/ModeratorPanel";
import { WhatsAppWidget } from "./components/WhatsAppWidget";

import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { CompanyDashboard } from "./pages/CompanyDashboard";
import { EmployeeOrdering } from "./pages/EmployeeOrdering";

export default function App() {
  const [settings, setSettings] = useState<SharedSettings>(fallbackSettings);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(
    fallbackStoreSettings,
  );
  const [isModPanelOpen, setIsModPanelOpen] = useState(false);

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
          setStoreSettings(storeRes.data as StoreSettings);
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    }

    fetchSettings();
  }, []);

  return (
    <BrowserRouter>
      <div className="font-serif min-h-screen flex flex-col relative selection:bg-ob-accent/30">
        <Navbar storeSettings={storeSettings} />

        <Routes>
          <Route path="/" element={<Home settings={settings} />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<CompanyDashboard />} />
          <Route path="/order" element={<EmployeeOrdering />} />
        </Routes>

        <Footer onOpenModPanel={() => setIsModPanelOpen(true)} />

        <WhatsAppWidget />

        <ModeratorPanel
          isOpen={isModPanelOpen}
          onClose={() => setIsModPanelOpen(false)}
          settings={settings}
          storeSettings={storeSettings}
          onSettingsUpdated={setSettings}
          onStoreSettingsUpdated={setStoreSettings}
        />
      </div>
    </BrowserRouter>
  );
}
