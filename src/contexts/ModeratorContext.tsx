import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, StoreSettings, CURRENT_BRAND, CENTRAL_MODERATOR_URL, saveBrandPageContent } from '../lib/supabase';
import { TypographyType } from '../lib/typography';

export interface InlineEditField {
  key: string;
  label: string;
  value?: string;
  defaultValue?: string;
  multiline?: boolean;
  allowHtml?: boolean;
  type?: TypographyType;
}

interface ModeratorContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  isModeratorView: boolean;
  setIsModeratorView: (val: boolean) => void;
  toggleModeratorView: () => void;
  editingField: InlineEditField | null;
  openInlineEdit: (field: InlineEditField) => void;
  closeInlineEdit: () => void;
  saveFieldContent: (
    key: string,
    value: string,
    lang?: 'nl' | 'en',
    font?: string,
    size?: string
  ) => Promise<boolean>;
  openModPanel: () => void;
  openCentralDashboard: () => void;
  setOpenModPanelHandler: (handler: () => void) => void;
  logoutModerator: () => Promise<void>;
  storeSettings?: StoreSettings;
}

const ModeratorContext = createContext<ModeratorContextType | undefined>(undefined);

export function ModeratorProvider({
  children,
  storeSettings,
  onStoreSettingsUpdated
}: {
  children: React.ReactNode;
  storeSettings?: StoreSettings;
  onStoreSettingsUpdated?: (newSettings: StoreSettings) => void;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isModeratorView, setIsModeratorViewState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ob_moderator_view_active') === 'true';
    } catch {
      return false;
    }
  });
  const [editingField, setEditingField] = useState<InlineEditField | null>(null);
  const [openModPanelCallback, setOpenModPanelCallback] = useState<(() => void) | null>(null);

  // Controleer Supabase Auth sessie voor moderator account
  useEffect(() => {
    if (!supabase) {
      setIsAuthenticated(false);
      return;
    }

    const checkModeratorSession = async (session: any) => {
      if (!session?.user?.id) {
        setIsAuthenticated(false);
        setIsModeratorViewState(false);
        try {
          localStorage.removeItem('ob_moderator_view_active');
        } catch {}
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('ob_user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        // Als het profiel specifiek een niet-admin rol heeft (bv. employee)
        if (profile && profile.role && profile.role !== 'admin') {
          setIsAuthenticated(false);
          setIsModeratorViewState(false);
          try {
            localStorage.removeItem('ob_moderator_view_active');
          } catch {}
          return;
        }

        // Geldige sessie van moderator account in Supabase
        setIsAuthenticated(true);
      } catch (err) {
        console.warn('[ModeratorContext] Fout bij verifiëren sessie:', err);
        // Geldige Supabase sessie behouden
        setIsAuthenticated(true);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkModeratorSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkModeratorSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logoutModerator = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setIsAuthenticated(false);
    setIsModeratorViewState(false);
    try {
      localStorage.removeItem('ob_moderator_view_active');
    } catch {}
  }, []);

  const setIsModeratorView = useCallback((val: boolean) => {
    setIsModeratorViewState(val);
    try {
      localStorage.setItem('ob_moderator_view_active', String(val));
    } catch {}
  }, []);

  const toggleModeratorView = useCallback(() => {
    setIsModeratorViewState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ob_moderator_view_active', String(next));
      } catch {}
      return next;
    });
  }, []);

  const openInlineEdit = useCallback((field: InlineEditField) => {
    setEditingField(field);
  }, []);

  const closeInlineEdit = useCallback(() => {
    setEditingField(null);
  }, []);

  const setOpenModPanelHandler = useCallback((handler: () => void) => {
    setOpenModPanelCallback(() => handler);
  }, []);

  const openCentralDashboard = useCallback(() => {
    window.open(`${CENTRAL_MODERATOR_URL}${CENTRAL_MODERATOR_URL.includes('?') ? '&' : '?'}brand=${CURRENT_BRAND}`, '_blank');
  }, []);

  const openModPanel = useCallback(() => {
    openCentralDashboard();
  }, [openCentralDashboard]);

  const saveFieldContent = useCallback(
    async (
      key: string,
      value: string,
      lang: 'nl' | 'en' = 'nl',
      font?: string,
      size?: string
    ): Promise<boolean> => {
      try {
        const targetKey = lang === 'en' ? `${key}_en` : key;
        const currentPC = { ...(storeSettings?.page_content || {}) };
        
        currentPC[targetKey] = value;

        // Font override: verwijder bij 'auto' zodat het default lettertype actief is
        if (!font || font === 'auto') {
          delete currentPC[`${key}_font`];
        } else {
          currentPC[`${key}_font`] = font;
        }

        // Size override: verwijder bij 'auto', 'default', '100%' zodat originele responsieve classes actief zijn
        if (!size || size === 'auto' || size === '100%' || size === 'default') {
          delete currentPC[`${key}_size`];
        } else {
          currentPC[`${key}_size`] = size;
        }

        const updatedSettings: StoreSettings = {
          ...(storeSettings || {
            id: 1,
            override_status: 'AUTO',
            schedule: {},
            pickup_url: '',
            delivery_url: ''
          }),
          page_content: currentPC
        };

        // 1. Live state update direct in de app zodat potloodjes en UI meteen verversen
        if (onStoreSettingsUpdated) {
          onStoreSettingsUpdated(updatedSettings);
        }

        // 2. Cache in localStorage voor instant behoud
        try {
          localStorage.setItem('canal_butler_page_content', JSON.stringify(currentPC));
          localStorage.setItem(`brand_page_content_${CURRENT_BRAND}`, JSON.stringify(currentPC));
        } catch {}

        // 3. Sla op naar Supabase brand_page_content met brand_id = 'canal_butler'
        if (supabase) {
          await saveBrandPageContent('canal_butler', currentPC);
        }

        return true;
      } catch (err) {
        console.error('Fout bij opslaan tekst in brand_page_content voor canal_butler:', err);
        return false;
      }
    },
    [storeSettings, onStoreSettingsUpdated]
  );

  return (
    <ModeratorContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isModeratorView,
        setIsModeratorView,
        toggleModeratorView,
        editingField,
        openInlineEdit,
        closeInlineEdit,
        saveFieldContent,
        openModPanel,
        openCentralDashboard,
        setOpenModPanelHandler,
        logoutModerator,
        storeSettings
      }}
    >
      {children}
    </ModeratorContext.Provider>
  );
}

export function useModerator() {
  const context = useContext(ModeratorContext);
  if (!context) {
    throw new Error('useModerator must be used within a ModeratorProvider');
  }
  return context;
}
