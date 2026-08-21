# Office Butler & Canal Butler Architectuur en Database Schema

Je werkt aan het project **Office Butler**, dat onderdeel is van het overkoepelende ecosysteem samen met **Canal Butler** en andere applicaties.

## Supabase Integratie en Database Schema
Deze projecten delen een centrale Supabase database. Bij het toevoegen van features, ga er altijd van uit dat we verbonden zijn met de volgende tabellen in het public schema:

### 1. `ai_settings`
Instellingen voor AI-functionaliteiten, tone-of-voice en popups.
- `id` (uuid)
- `system_instruction` (text)
- `enabled` (bool)
- `popup_messages` (jsonb)

### 2. `promotions`
Actieve promoties en bijbehorende banners.
- `id` (int4)
- `active` (bool)
- `title` (text)
- `description` (text)
- `image_url` (text)

### 3. `shared_settings`
Gedeelde instellingen voor alle applicaties (openingstijden en promo messages).
- `id` (int8)
- `opening_hours` (text)
- `promo_active` (bool)
- `promo_message` (text)

### 4. `store_settings`
Configuratie voor de winkels en integraties (zoals Orderli of eigen bestelsites).
- `id` (int4)
- `override_status` (text)
- `schedule` (jsonb)
- `pickup_url` (text)
- `delivery_url` (text)

### 5. `office_butler_leads`
Specifieke leads en aanvragen voor Office Butler (gescheiden om andere websites niet te beïnvloeden).

## Authenticatie
De beheeromgeving / "Moderator Panel" is afgeschermd met de native Supabase Authentication (E-mail en Wachtwoord). Hardcoded wachtwoorden of PIN-codes zijn niet toegestaan voor de productieversie van beheerderspanels.

## Design Systeem
- Herkenbare componenten zoals de geblokte footer worden gedeeld tussen de projecten om een eenvormig merk neer te zetten (Canal Butler / Office Butler).
- Er wordt gebruik gemaakt van donkerblauw, wit en goud/bruine accenten afhankelijk van het specifieke label.

## Cross-Project Samenwerking
Zorg er altijd voor dat instellingen die aangepast worden in een gedeelde tabel, de werking van de andere websites niet negatief beïnvloeden.

**Tip voor ontwikkelaars/AI:**
Zet dit `AGENTS.md` bestand in de root-directory van alle Google AI Studio projecten die gerelateerd zijn aan dit ecosysteem. Hierdoor krijgt de AI automatisch deze richtlijnen mee, waardoor de AI precies weet hoe de tabellen in elkaar zitten en op welke manier features geïmplementeerd moeten worden in de 'Butler' architectuur.
