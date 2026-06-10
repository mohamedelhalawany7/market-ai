# ai_engine.py - محرك الذكاء الاصطناعي لتوقع الأسعار

import json
import random
from datetime import datetime, timedelta
import pandas as pd
from prophet import Prophet
import warnings
warnings.filterwarnings('ignore')


def scrape_cotton_prices() -> pd.DataFrame:
    """
    الدالة الأولى: جمع بيانات أسعار القطن.
    في MVP نستخدم بيانات وهمية واقعية تحاكي تقلبات السوق المصري.
    في الإنتاج، يُستبدل هذا بـ BeautifulSoup لجلب البيانات الحقيقية.
    """
    print("جاري جمع بيانات أسعار القطن...")

    base_price = 8500  # السعر الأساسي للطن بالجنيه المصري
    records = []

    # توليد بيانات تاريخية لـ 180 يوماً مع تقلبات واقعية
    start_date = datetime.now() - timedelta(days=180)
    for i in range(180):
        current_date = start_date + timedelta(days=i)

        # إضافة تأثير موسمي (موسم الحصاد في الصيف يخفض الأسعار)
        seasonal_effect = -300 * (1 if 6 <= current_date.month <= 9 else 0)

        # إضافة اتجاه تصاعدي تدريجي + تذبذب عشوائي
        trend = i * 5
        noise = random.uniform(-200, 200)

        price = base_price + trend + seasonal_effect + noise

        records.append({
            "ds": current_date.strftime("%Y-%m-%d"),  # Prophet يتطلب عمود ds
            "y": round(price, 2)                       # Prophet يتطلب عمود y
        })

    df = pd.DataFrame(records)
    print(f"✅ تم جمع {len(df)} سجلاً تاريخياً.")
    return df


def predict_prices(df: pd.DataFrame, periods: int = 30) -> list:
    """
    الدالة الثانية: التنبؤ بالأسعار باستخدام مكتبة Prophet.
    تأخذ DataFrame بعمودين (ds, y) وتعيد توقعات الـ 30 يوماً القادمة.
    """
    print(f"جاري تدريب نموذج Prophet للتنبؤ بـ {periods} يوماً...")

    # إنشاء وتدريب النموذج مع إعدادات مناسبة للبيانات الاقتصادية
    model = Prophet(
        changepoint_prior_scale=0.1,
        seasonality_prior_scale=10.0,
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False
    )

    model.fit(df)

    future = model.make_future_dataframe(periods=periods)
    forecast = model.predict(future)

    # استخراج توقعات الفترة المستقبلية فقط
    future_predictions = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)

    results = []
    for _, row in future_predictions.iterrows():
        results.append({
            "predictedAt": row['ds'].strftime("%Y-%m-%d"),
            "yhat": round(row['yhat'], 2),
            "yhatLower": round(row['yhat_lower'], 2),
            "yhatUpper": round(row['yhat_upper'], 2)
        })

    print("✅ اكتمل التنبؤ بنجاح.")
    return results


if __name__ == "__main__":
    historical_data = scrape_cotton_prices()
    predictions = predict_prices(historical_data, periods=30)

    output = {
        "material": "قطن مصري",
        "unit": "جنيه/طن",
        "historical_count": len(historical_data),
        "predictions": predictions
    }

    print("\n--- نتائج التنبؤ ---")
    print(json.dumps(output, ensure_ascii=False, indent=2))
