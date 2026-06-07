# Mazaj+ Final Project-Ready Dataset Package

هذه هي حزمة الداتا النهائية الجاهزة لوضعها داخل مشروع Mazaj+.

## أين أضعها؟

افتح ملف ZIP هذا داخل جذر المشروع:

```text
C:\Users\Lenovo\Downloads\mazaj\mazaj
```

بعد فك الضغط، يجب أن يكون المسار النهائي:

```text
C:\Users\Lenovo\Downloads\mazaj\mazaj\source code\backend\data\mazaj_1500_food_dataset
```

داخل هذا المسار ستجد كل ملفات CSV المطلوبة.

## ما الذي تحتويه الحزمة؟

- foods.csv — 1500 أكلة
- food_aliases_final.csv — 3440 اسم بديل تقريبًا
- allergies.csv
- food_allergens.csv
- health_conditions.csv
- food_condition_rules.csv
- mood_mappings.csv
- healthy_alternatives_final.csv
- hydration_guides_final.csv
- food_nutrition_basis.csv
- food_portions.csv
- food_usage_policy.csv
- food_categories.csv
- food_components.csv
- food_sources.csv
- data_sources.csv
- validation_report.txt
- README.md

## قواعد الاعتماد

- هذه الداتا هي النسخة النهائية المعتمدة للديمو الأكاديمي.
- كل القيم الغذائية محسوبة لكل 100 جرام.
- لا يوجد API وقت تشغيل الموقع.
- قاعدة بيانات Mazaj+ الداخلية هي مصدر القيم الغذائية.
- Gemini Vision يتعرف على اسم الطعام فقط.
- Gemini لا يحسب السعرات ولا يغير القيم الغذائية.
- يجب احترام food_usage_policy.csv.
- أطعمة USDA الجديدة تستخدم للبحث، تحليل الصور، عرض القيم الغذائية، والتتبع فقط.
- لا تستخدم أطعمة USDA الجديدة في توصيات المزاج أو خطط التغذية إلا إذا كانت:
  - recommendation_allowed=true
  - أو plan_allowed=true

## أمر الاستيراد المقترح

بعد أن يضيف Antigravity أمر الاستيراد أو يحدثه، يكون التشغيل مثل:

```powershell
cd "C:\Users\Lenovo\Downloads\mazaj\mazaj\source code\backend"
.\.venv\Scripts\python.exe manage.py reset_and_import_final_dataset --data-dir "data\mazaj_1500_food_dataset"
```

قبل التنفيذ الحقيقي، الأفضل تشغيل dry-run لو الأمر يدعمه:

```powershell
.\.venv\Scripts\python.exe manage.py reset_and_import_final_dataset --data-dir "data\mazaj_1500_food_dataset" --dry-run
```

## تحذير مهم

لا تجعل النظام يستخدم كل 1500 أكلة تلقائيًا في خطط التغذية أو توصيات المزاج. هذا قد يسبب قرارات غير مراجعة. استخدم food_usage_policy.csv لتحديد ما هو مسموح وما هو غير مسموح.
