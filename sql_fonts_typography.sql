-- ==============================================================================
-- Office Butler: Typografie & Lettertype Standaarden (Supabase SQL)
-- ==============================================================================
-- VEILIGHEID: 
-- Deze query maakt gebruik van de PostgreSQL JSONB '||' (concat/merge) operator
-- met een JSONB literal cast ipv jsonb_build_object.
-- Hierdoor wordt de PostgreSQL limiet van max 100 functie-argumenten (FUNC_MAX_ARGS)
-- voorkomen en blijven ALLE bestaande teksten, openingsuren, schema's,
-- kortingscodes en instellingen 100% BEHOUDEN.
--
-- STANDAARD WAARDEN:
-- - Titels: Postman's Serif Regular ('postman_regular')
-- - Ondertitels: Agrandir Narrow ('agrandir_narrow')
-- - Bullets / Knoppen: Agrandir Regular ('agrandir_regular') [met capslock]
-- - Paragrafen: Agrandir Narrow ('agrandir_narrow')
-- - Kopjes: Agrandir Bold ('agrandir_bold')
-- ==============================================================================

-- 1. Zorg dat de kolom page_content bestaat (indien nog niet aanwezig)
ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS page_content JSONB DEFAULT '{}'::jsonb;

-- 2. Veilig samenvoegen van de lettertypes (behoudt alle bestaande teksten):
UPDATE public.store_settings
SET page_content = COALESCE(page_content, '{}'::jsonb) || '{
  "nav_btn_order_font": "agrandir_regular",
  "nav_btn_login_font": "agrandir_regular",
  "nav_links_font": "agrandir_regular",
  "nav_link_how": "Hoe het werkt",
  "nav_link_menu": "Assortiment",
  "nav_link_business": "Voor Bedrijven",
  "nav_link_contact": "Contact",

  "hero_title_font": "postman_regular",
  "how_title_font": "postman_regular",
  "assortments_title_font": "postman_regular",
  "menu_title_font": "postman_regular",
  "menu_category_title_font": "postman_regular",
  "business_title_font": "postman_regular",
  "contact_title_font": "postman_regular",
  "faq_title_font": "postman_regular",

  "hero_subtitle_font": "agrandir_narrow",
  "how_subtitle_font": "agrandir_narrow",
  "assortments_subtitle_font": "agrandir_narrow",
  "assort_snacks_subtitle_font": "agrandir_narrow",
  "assort_complete_subtitle_font": "agrandir_narrow",
  "menu_subtitle_font": "agrandir_narrow",
  "menu_category_desc_font": "agrandir_narrow",
  "business_subtitle_font": "agrandir_narrow",

  "hero_btn_order_font": "agrandir_regular",
  "hero_btn_offer_font": "agrandir_regular",
  "hero_btn_direct_font": "agrandir_regular",
  "hero_btn_scheduled_font": "agrandir_regular",
  "assort_snacks_btn_font": "agrandir_regular",
  "assort_complete_btn_font": "agrandir_regular",
  "assort_complete_badge_font": "agrandir_regular",
  "menu_btn_font": "agrandir_regular",
  "business_btn_font": "agrandir_regular",

  "how_step1_desc_font": "agrandir_narrow",
  "how_step2_desc_font": "agrandir_narrow",
  "how_step3_desc_font": "agrandir_narrow",
  "assort_snacks_item1_font": "agrandir_narrow",
  "assort_snacks_item2_font": "agrandir_narrow",
  "assort_snacks_item3_font": "agrandir_narrow",
  "assort_snacks_item4_font": "agrandir_narrow",
  "assort_complete_item1_font": "agrandir_narrow",
  "assort_complete_item2_font": "agrandir_narrow",
  "assort_complete_item3_font": "agrandir_narrow",
  "assort_complete_item4_font": "agrandir_narrow",
  "business_desc_font": "agrandir_narrow",
  "business_point1_font": "agrandir_narrow",
  "business_point2_font": "agrandir_narrow",
  "business_point3_font": "agrandir_narrow",
  "faq_a1_font": "agrandir_narrow",
  "faq_a2_font": "agrandir_narrow",
  "faq_a3_font": "agrandir_narrow",
  "faq_a4_font": "agrandir_narrow",

  "hero_pre_title_font": "agrandir_bold",
  "how_step1_title_font": "agrandir_bold",
  "how_step2_title_font": "agrandir_bold",
  "how_step3_title_font": "agrandir_bold",
  "assort_snacks_title_font": "agrandir_bold",
  "assort_complete_title_font": "agrandir_bold",
  "menu_item_title_font": "agrandir_bold",
  "business_form_title_font": "agrandir_bold",
  "faq_q1_font": "agrandir_bold",
  "faq_q2_font": "agrandir_bold",
  "faq_q3_font": "agrandir_bold",
  "faq_q4_font": "agrandir_bold"
}'::jsonb
WHERE id = 1;
