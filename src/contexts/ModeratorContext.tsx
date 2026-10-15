import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, StoreSettings, saveBrandPageContent, CURRENT_BRAND, CENTRAL_MODERATOR_URL } from '../lib/supabase';

export interface InlineEditField {
  key: string;
  label: string;
  value?: string;
  defaultValue?: string;
  multiline?: boolean;
  allowHtml?: boolean;
  tag?: string;
  type?: string;
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
  setOpenModPanelHandler: (handler: () => void) => void;
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

  // Check Supabase Auth session on mount and listen to changes
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAuthenticated(true);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
        if (!session) {
          setIsModeratorViewState(false);
          try {
            localStorage.removeItem('ob_moderator_view_active');
          } catch {}
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
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

  const openModPanel = useCallback(() => {
    if (CENTRAL_MODERATOR_URL) {
      const separator = CENTRAL_MODERATOR_URL.includes('?') ? '&' : '?';
      const targetUrl = `${CENTRAL_MODERATOR_URL}${separator}brand=${CURRENT_BRAND}&panel=open&tab=content`;
      window.open(targetUrl, '_blank');
      return;
    }
    if (openModPanelCallback) {
      openModPanelCallback();
    }
  }, [openModPanelCallback]);

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
        const updatedPC = { ...(storeSettings?.page_content || {}) };
        
        updatedPC[targetKey] = value;

        // Clean up font override if 'auto' or empty so it cleanly reverts to original
        if (font !== undefined) {
          if (!font || font === 'auto') {
            delete updatedPC[`${key}_font`];
          } else {
            updatedPC[`${key}_font`] = font;
          }
        }

        // Clean up size override if 'auto', '', or '100%' so it cleanly reverts to original
        if (size !== undefined) {
          if (!size || size === 'auto' || size === '100%' || size === 'default') {
            delete updatedPC[`${key}_size`];
          } else {
            updatedPC[`${key}_size`] = size;
          }
        }

        const updatedSettings: StoreSettings = {
          ...(storeSettings || {
            id: 1,
            override_status: 'AUTO',
            schedule: {},
            pickup_url: '',
            delivery_url: ''
          }),
          page_content: updatedPC
        };

        // 1. Live state update directly in app
        if (onStoreSettingsUpdated) {
          onStoreSettingsUpdated(updatedSettings);
        }

        // 2. Persist to Supabase if connected
        if (supabase) {
          try {
            await saveBrandPageContent(CURRENT_BRAND, updatedPC);
          } catch (e) {
            console.error(`Fout bij opslaan brand_page_content voor ${CURRENT_BRAND}:`, e);
          }

          // If on canal_butler, also keep store_settings id=1 in sync for backward compatibility
          if (CURRENT_BRAND === 'canal_butler') {
            const { error } = await supabase
              .from('store_settings')
              .update({ page_content: updatedPC })
              .eq('id', 1);

            if (error) {
              console.error('Fout bij opslaan naar Supabase store_settings voor canal_butler:', error);
            }
          }
        }

        return true;
      } catch (err) {
        console.error('Fout bij opslaan tekst:', err);
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
        setOpenModPanelHandler,
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
