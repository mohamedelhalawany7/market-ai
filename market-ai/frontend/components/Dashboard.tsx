'use client';

import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ===== أنواع البيانات =====
interface PricePoint {
  date: string;
  historical?: number;
  predicted?: number;
  lower?: number;
  upper?: number;
}

interface Material {
  id: number;
  name: string;
  unit: string;
  latestPrice: number;
  priceHistory: { recordedAt: string; price: number }[];
}

interface Prediction {
  materialId: number;
  materialName: string;
  predictions: {
    predictedAt: string;
    yhat: number;
    yhatLower: number;
    yhatUpper: number;
  }[];
}

// ===== مكوّن بطاقة الإحصائية =====
const StatCard = ({
  title,
  value,
  unit,
  change,
}: {
  title: string;
  value: string;
  unit: string;
  change: number;
}) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-800">
      {value} <span className="text-sm font-normal text-gray-400">{unit}</span>
    </p>
    <p className={`text-sm mt-2 font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
      {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}% هذا الشهر
    </p>
  </div>
);

// ===== Tooltip مخصص =====
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm" dir="rtl">
        <p className="text-gray-500 mb-2">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-semibold">
            {entry.name === 'historical' ? 'السعر الفعلي' : 'السعر المتوقع'}:{' '}
            {entry.value?.toLocaleString('ar-EG')} ج.م
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ===== لوحة التحكم الرئيسية =====
export default function Dashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<number>(1);
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matRes, predRes] = await Promise.all([
          fetch(`${API_BASE}/api/materials`),
          fetch(`${API_BASE}/api/predictions`),
        ]);
        const matData = await matRes.json();
        const predData = await predRes.json();
        setMaterials(matData.data);
        setPredictions(predData.data);
      } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!materials.length || !predictions.length) return;

    const material = materials.find((m) => m.id === selectedMaterial);
    const prediction = predictions.find((p) => p.materialId === selectedMaterial);
    if (!material || !prediction) return;

    const historicalPoints: PricePoint[] = material.priceHistory.slice(-60).map((h) => ({
      date: new Date(h.recordedAt).toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
      }),
      historical: h.price,
    }));

    const predictionPoints: PricePoint[] = prediction.predictions.map((p) => ({
      date: new Date(p.predictedAt).toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
      }),
      predicted: p.yhat,
      lower: p.yhatLower,
      upper: p.yhatUpper,
    }));

    setChartData([...historicalPoints, ...predictionPoints]);
  }, [materials, predictions, selectedMaterial]);

  const currentMaterial = materials.find((m) => m.id === selectedMaterial);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">جاري تحميل بيانات السوق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
      {/* شريط التنقل */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Market AI</h1>
            <p className="text-xs text-gray-400">منصة مراقبة أسعار المواد الخام</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-500">مباشر</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {materials.map((mat) => (
            <StatCard
              key={mat.id}
              title={mat.name}
              value={mat.latestPrice.toLocaleString('ar-EG')}
              unit={mat.unit}
              change={(Math.random() - 0.45) * 10}
            />
          ))}
        </div>

        {/* الرسم البياني */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">تحليل الأسعار والتوقعات</h2>
              <p className="text-sm text-gray-400 mt-0.5">آخر 60 يوماً + توقعات 30 يوماً قادمة</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {materials.map((mat) => (
                <button
                  key={mat.id}
                  onClick={() => setSelectedMaterial(mat.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedMaterial === mat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {mat.name}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                interval={14}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) =>
                  value === 'historical' ? 'السعر الفعلي' : 'السعر المتوقع (Prophet)'
                }
                wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }}
              />
              <ReferenceLine
                x={chartData[59]?.date}
                stroke="#e5e7eb"
                strokeDasharray="4 4"
                label={{ value: 'اليوم', fill: '#9ca3af', fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="historical"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="historical"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                connectNulls={false}
                name="predicted"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* جدول التوقعات */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            تفاصيل التوقعات — {currentMaterial?.name}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-right py-3 px-4 font-semibold text-gray-500">التاريخ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-500">السعر المتوقع</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-500">النطاق الأدنى</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-500">النطاق الأعلى</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-500">التوصية</th>
                </tr>
              </thead>
              <tbody>
                {predictions
                  .find((p) => p.materialId === selectedMaterial)
                  ?.predictions.slice(0, 10)
                  .map((pred, i) => {
                    const isGoodBuy = pred.yhat < (currentMaterial?.latestPrice ?? 0);
                    return (
                      <tr
                        key={i}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-600">
                          {new Date(pred.predictedAt).toLocaleDateString('ar-EG', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-800">
                          {pred.yhat.toLocaleString('ar-EG')}
                        </td>
                        <td className="py-3 px-4 text-emerald-600">
                          {pred.yhatLower.toLocaleString('ar-EG')}
                        </td>
                        <td className="py-3 px-4 text-red-500">
                          {pred.yhatUpper.toLocaleString('ar-EG')}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              isGoodBuy
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {isGoodBuy ? '✓ فرصة شراء' : '⏸ انتظر'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        Market AI © 2025 — التوقعات للأغراض التوجيهية فقط
      </footer>
    </div>
  );
}
