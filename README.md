# MaliPamoja — Mfumo wa VICOBA Kidijitali

![MaliPamoja](https://img.shields.io/badge/MaliPamoja-VICOBA%20Platform-emerald?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)

> Jukwaa la kidijitali kwa ajili ya kusimamia vikundi vya VICOBA (Village Community Banking) — michango, mikopo, wanachama, na taarifa zote mahali pamoja.

---

## Maelezo

**MaliPamoja** ni mfumo wa usimamizi wa vikundi vya akiba na mkopo (VICOBA) ulioundwa kwa ajili ya Tanzania. Mfumo huu unaruhusu vikundi kusimamia:

- Usajili wa wanachama kupitia fomu ya umma
- Idhini ya maombi na kutuma SMS otomatiki
- Rekodi za michango ya kila mwanachama
- Maombi na idhini ya mikopo
- Takwimu za kikundi kwa wakati halisi

---

## Vipengele Vikuu

### Wafanyakazi (Staff Dashboard)
| Kipengele | Maelezo |
|-----------|---------|
| **Vikundi** | Unda, hariri na simamia vikundi vya VICOBA |
| **Maombi** | Kagua na kuidhinisha maombi ya kujiunga |
| **Wanachama** | Angalia orodha ya wanachama wote na takwimu zao |
| **Michango** | Rekodi na ufuatilie michango ya kila mwezi/wiki |
| **Mikopo** | Simamia maombi ya mikopo na malipo ya kurudisha |
| **Wafanyakazi** | Mwenyekiti anaweza kuongeza Katibu, Mweka Hazina, Msimamizi |

### Mwanachama (Member Dashboard)
| Kipengele | Maelezo |
|-----------|---------|
| **Akaunti Yangu** | Angalia michango yako na hali ya mkopo |
| **Omba Mkopo** | Wasilisha ombi la mkopo moja kwa moja |
| **Historia** | Fuatilia malipo yote ya nyuma |

### Mtiririko wa Kusajili Mwanachama
```
1. Mwombaji → Jaza fomu ya umma (/join) → Chagua kundi
2. Mwenyekiti → Kagua ombi → Kubali au Kataa
3. Ukubaliwa → Code ya kipekee izalishwe (mfano: FRA001)
4. SMS itumwe kwa mwombaji na code yake
5. Mwanachama → Login kwa code → Dashboard yake
```

---

## Teknolojia

| Teknolojia | Matumizi |
|-----------|---------|
| **Next.js 16** | Framework ya frontend na backend (App Router) |
| **Supabase** | Database (PostgreSQL), Uthibitishaji, RLS |
| **TypeScript** | Usalama wa aina za data |
| **Tailwind CSS** | Muundo wa UI |
| **Beem Africa** | Kutuma SMS Tanzania |
| **Vercel** | Hosting na deployment |

---

## Mfumo wa Majukumu

```
Mwenyekiti (Admin)
├── Anaunda vikundi
├── Anaidhinisha/kukataa maombi
├── Anaunda wafanyakazi wengine
└── Ana uwezo wote wa mfumo

Katibu / Mweka Hazina / Msimamizi
├── Wanaweza kuona maombi
├── Wanaweza kudhibiti michango na mikopo
└── Hawawezi kuunda wafanyakazi wapya

Mwanachama
├── Login kwa code tu (bila nenosiri)
├── Anaona dashboard yake tu
└── Anaweza kuomba mkopo
```

---

## Kuanzisha Mradi (Development)

### Mahitaji
- Node.js 18+
- Akaunti ya Supabase
- Akaunti ya Beem Africa (kwa SMS)

### Hatua

```bash
# 1. Clone mradi
git clone https://github.com/FrancHK/Malipamoja.git
cd Malipamoja

# 2. Sakinisha packages
npm install

# 3. Weka mazingira
cp .env.example .env.local
# Hariri .env.local na thamani zako

# 4. Anzisha server
npm run dev
```

### Mazingira (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Usalama wa codes za wanachama
MEMBER_SECRET=neno_lako_la_siri

# Beem Africa SMS
BEEM_API_KEY=xxxx
BEEM_SECRET_KEY=xxxx

# URL ya app
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Muundo wa Foleni

```
malipamoja/
├── app/
│   ├── (auth)/          # Login na Sajili
│   ├── (dashboard)/     # Staff dashboard
│   │   ├── dashboard/   # Ukurasa mkuu
│   │   ├── groups/      # Vikundi
│   │   ├── members/     # Wanachama
│   │   ├── applications/# Maombi
│   │   ├── contributions/# Michango
│   │   ├── loans/       # Mikopo
│   │   └── staff/       # Wafanyakazi
│   ├── member/          # Member dashboard
│   ├── join/            # Fomu ya umma
│   └── api/             # API routes
├── components/          # Vipande vya UI
├── lib/                 # Utilities (Supabase, SMS, types)
└── supabase/            # Schema ya database
```

---

## Deployment

Mradi unapigwa kwenye **Vercel** kiotomatiki kila `git push` kwenye `main`.

```bash
git add .
git commit -m "mabadiliko yako"
git push
```

---

## Leseni

Mradi huu ni wa kibinafsi — MaliPamoja © 2026
