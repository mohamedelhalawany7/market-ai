// server.js - الخادم الخلفي لمنصة Market AI

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ===== بيانات وهمية مطابقة لهيكلة Prisma =====

const generateHistoricalPrices = (basePrice, materialId) => {
  const prices = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 180);

  let currentPrice = basePrice;
  for (let i = 0; i < 180; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    currentPrice += (Math.random() - 0.48) * 150;
    currentPrice = Math.max(currentPrice, basePrice * 0.7);

    prices.push({
      id: materialId * 1000 + i,
      materialId,
      price: parseFloat(currentPrice.toFixed(2)),
      currency: 'EGP',
      recordedAt: date.toISOString(),
    });
  }
  return prices;
};

const generatePredictions = (lastPrice, materialId) => {
  const predictions = [];
  let price = lastPrice;

  for (let i = 1; i <= 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    price += (Math.random() - 0.45) * 200;
    const lowerBound = price * 0.95;
    const upperBound = price * 1.05;

    predictions.push({
      id: materialId * 100 + i,
      materialId,
      predictedAt: date.toISOString(),
      yhat: parseFloat(price.toFixed(2)),
      yhatLower: parseFloat(lowerBound.toFixed(2)),
      yhatUpper: parseFloat(upperBound.toFixed(2)),
      createdAt: new Date().toISOString(),
    });
  }
  return predictions;
};

const MOCK_MATERIALS = [
  { id: 1, name: 'قطن مصري عيار 4', nameEn: 'Egyptian Cotton Grade 4', unit: 'جنيه/طن', basePrice: 85000 },
  { id: 2, name: 'بوليستر خيط', nameEn: 'Polyester Yarn', unit: 'جنيه/طن', basePrice: 62000 },
  { id: 3, name: 'غزل أكريليك', nameEn: 'Acrylic Yarn', unit: 'جنيه/طن', basePrice: 71000 },
];

// GET /api/materials
app.get('/api/materials', (req, res) => {
  try {
    const materials = MOCK_MATERIALS.map((mat) => {
      const priceHistory = generateHistoricalPrices(mat.basePrice, mat.id);
      const latestPrice = priceHistory[priceHistory.length - 1].price;
      return {
        id: mat.id,
        name: mat.name,
        nameEn: mat.nameEn,
        unit: mat.unit,
        latestPrice,
        priceHistory: priceHistory.slice(-90),
        createdAt: new Date().toISOString(),
      };
    });
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب المواد', error: error.message });
  }
});

// GET /api/predictions
app.get('/api/predictions', (req, res) => {
  try {
    const { materialId } = req.query;
    let materials = MOCK_MATERIALS;

    if (materialId) {
      materials = materials.filter((m) => m.id === parseInt(materialId));
    }

    const predictions = materials.map((mat) => {
      const history = generateHistoricalPrices(mat.basePrice, mat.id);
      const lastPrice = history[history.length - 1].price;
      return {
        materialId: mat.id,
        materialName: mat.name,
        unit: mat.unit,
        predictions: generatePredictions(lastPrice, mat.id),
      };
    });

    res.json({ success: true, data: predictions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب التوقعات', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Market AI Server يعمل على المنفذ ${PORT}`);
});
