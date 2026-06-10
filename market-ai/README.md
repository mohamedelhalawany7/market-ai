# Market AI — منصة مراقبة أسعار المواد الخام

منصة B2B لمساعدة مصانع الغزل والنسيج في مصر على مراقبة وتوقع أسعار المواد الخام.

## 🚀 تشغيل المشروع

```bash
docker compose up --build
```

ثم افتح المتصفح على: **http://localhost:3000**

## 📁 هيكل المشروع

```
market-ai/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── prisma/
│       └── schema.prisma
├── ai_engine/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── ai_engine.py
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    └── components/
        └── Dashboard.tsx
```

## 🛠 Tech Stack

| الطبقة | التقنية |
|--------|---------|
| قاعدة البيانات | PostgreSQL + Prisma ORM |
| الخادم الخلفي | Node.js + Express.js |
| الذكاء الاصطناعي | Python + Prophet |
| الواجهة الأمامية | Next.js + Tailwind CSS + Recharts |
| DevOps | Docker Compose |

## 🔌 API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/materials` | جلب المواد وأسعارها التاريخية |
| GET | `/api/predictions` | جلب توقعات الأسعار |
| GET | `/api/predictions?materialId=1` | توقعات مادة محددة |

## 🤖 تشغيل محرك الذكاء الاصطناعي منفرداً

```bash
cd ai_engine
pip install -r requirements.txt
python ai_engine.py
```
