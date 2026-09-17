---
title: आर्किटेक्चर
description: अलग ऐप्स। साझा आवश्यक घटक। एक सुसंगत कार्यक्षेत्र।
sidebar:
  order: 3
---
## कार्यक्षेत्र [#the-workspace]

```text
apps/
  web/                  Marketing and pricing · port 3000
  app/                  Authenticated UI, APIs, webhooks · port 3001
  docs/                 Documentation · port 4321
packages/
  auth/                 Better Auth, Clerk, Auth.js, Supabase Auth, or Appwrite
  config/               App name, URLs, plans, environment validation
  database/             Drizzle schema and migrations
  design-system/        Used shadcn components and shared styles
  email/                Resend authentication emails
  payments/             Stripe state and paid-access rules
  storage/              Cloudflare R2 or Vercel Blob
turbo.json
package.json
```

जनरेट किए गए प्रोजेक्ट में `apps/docs` शामिल होता है—डिफ़ॉल्ट रूप से Blume, या चुने जाने पर Mintlify अथवा Fumadocs। इस रिपॉज़िटरी में मौजूद Feldra की यह उत्पाद साइट एक अलग Blume ऐप है; इसे जनरेट किए गए प्रोजेक्ट में कॉपी नहीं किया जाता।

## डिप्लॉयमेंट की सीमाएँ [#deployable-boundaries]

`apps/web` सार्वजनिक है। इसके लिंक उपयोगकर्ताओं को साइनअप, लॉगिन और बिलिंग के लिए `APP_URL` पर भेजते हैं। प्रमाणीकरण कुकी तथा सभी API और वेबहुक रूट `apps/app` के नियंत्रण में हैं। अलग ओरिजिन रखने से कई सबडोमेन पर लागू होने वाली व्यापक कुकी नीति की आवश्यकता नहीं पड़ती है।

साझा पैकेज TypeScript स्रोत कोड एक्सपोर्ट करते हैं। प्रत्येक पैकेज केवल उन्हीं डिपेंडेंसी की घोषणा करता है जिनका वह वास्तव में उपयोग करता है। सीखने के लिए कोई प्रोवाइडर अडैप्टर या प्लगइन फ़्रेमवर्क नहीं है।

## कॉन्फ़िगरेशन [#configuration]

`packages/config/index.ts` में उत्पाद का नाम और प्लान निर्धारित करें। एनवायरनमेंट में `APP_URL` और `WEB_URL` सेट करें। भुगतान स्वीकार करने से पहले Stripe में अपनी आवर्ती भुगतान की कीमत को कॉन्फ़िगर किए गए प्लान के अनुरूप बदलें।

## स्थानीय रूप से काम करना [#working-locally]

```sh
npm run dev
npm run dev --workspace web
npm run dev --workspace app
npm run typecheck
npm run lint
```

Turborepo कार्यक्षेत्र के टास्क चलाता है और बिल्ड आउटपुट कैश करता है। टेम्पलेट से बनाए गए प्रत्येक प्रोजेक्ट की अपनी लॉकफ़ाइल और आंतरिक `@repo/*` पैकेज होते हैं।
