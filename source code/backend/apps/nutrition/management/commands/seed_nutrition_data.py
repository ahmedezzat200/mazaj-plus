"""Seed real nutrition data: foods, moods, allergens, health rules, alternatives.

Idempotent — safe to rerun. Uses ``update_or_create`` keyed on natural fields.

Run with:
    python manage.py seed_nutrition_data
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.common.enums import SafetyRiskLevel
from apps.nutrition.models import (
    Allergy,
    DailyTip,
    FoodAllergenTag,
    FoodHealthConditionRule,
    FoodItem,
    FoodMoodMapping,
    HealthCondition,
    HealthyAlternative,
    MoodTag,
)


# -------- Reference data --------

ALLERGIES = [
    "Peanuts",
    "Tree Nuts",
    "Dairy",
    "Eggs",
    "Soy",
    "Wheat / Gluten",
    "Fish",
    "Shellfish",
    "Sesame",
]

HEALTH_CONDITIONS = [
    ("Type 2 Diabetes", "Sensitivity to high glycemic carbohydrates."),
    ("Hypertension", "Caution with high-sodium foods."),
    ("High Cholesterol", "Caution with saturated fats."),
    ("IBS", "Sensitivity to high-FODMAP foods."),
    ("Celiac Disease", "Strict gluten avoidance required."),
    ("Lactose Intolerance", "Sensitivity to lactose-containing dairy."),
]

MOODS = [
    ("stress", "Foods that support stress response — magnesium, B-vitamins, complex carbs."),
    ("sadness", "Foods that may support mood — omega-3s, tryptophan, dark leafy greens."),
    ("fatigue", "Foods that support sustained energy — iron, complex carbs, B12."),
    ("focus", "Foods that may support concentration — omega-3s, choline, antioxidants."),
    ("low_energy", "Quick + sustained energy — complex carbs and lean protein."),
]


# -------- Foods (curated, real macros per typical serving) --------
# Format: (name, category, calories, protein_g, carbs_g, fat_g, description, allergens, blocks, warnings, moods)
#   allergens: list of allergy names
#   blocks: list of (condition_name, reason)
#   warnings: list of (condition_name, reason)
#   moods: list of (mood_name, priority, explanation)

FOODS = [
    # ---- Proteins ----
    ("Grilled Chicken Breast", "Protein", 165, 31, 0, 3.6,
     "Lean protein, naturally low in saturated fat.",
     [], [], [], [("focus", 8, "Lean protein supports steady alertness.")]),
    ("Salmon (Baked)", "Protein", 208, 22, 0, 13,
     "Rich in omega-3 fatty acids.",
     ["Fish"], [], [],
     [("sadness", 9, "Omega-3s have been studied for mood support."),
      ("focus", 9, "Omega-3s support cognitive function.")]),
    ("Tuna (Canned in Water)", "Protein", 116, 26, 0, 1,
     "Lean fish, high protein, easy pantry staple.",
     ["Fish"], [], [("Hypertension", "Watch sodium in canned varieties.")],
     [("focus", 7, "Lean protein + omega-3s.")]),
    ("Boiled Eggs", "Protein", 155, 13, 1.1, 11,
     "Complete protein with choline.",
     ["Eggs"], [], [("High Cholesterol", "Moderate intake; speak with a doctor.")],
     [("focus", 7, "Choline supports neurotransmitter activity.")]),
    ("Greek Yogurt (Plain, low-fat)", "Dairy", 100, 17, 6, 0.7,
     "High protein, probiotics.",
     ["Dairy"], [("Lactose Intolerance", "Contains lactose.")], [],
     [("stress", 6, "Probiotics may support gut–brain axis.")]),
    ("Cottage Cheese (low-fat)", "Dairy", 98, 11, 3.4, 4.3,
     "Casein protein, slow-digesting.",
     ["Dairy"], [("Lactose Intolerance", "Contains lactose.")], [], []),
    ("Lentils (Cooked)", "Protein", 116, 9, 20, 0.4,
     "Plant protein + iron + fiber.",
     [], [], [("IBS", "FODMAPs may trigger symptoms.")],
     [("fatigue", 9, "Iron and B-vitamins support energy."),
      ("low_energy", 8, "Steady-release carbs.")]),
    ("Chickpeas (Cooked)", "Protein", 164, 9, 27, 2.6,
     "Plant protein and fiber.",
     [], [], [("IBS", "FODMAPs may trigger symptoms.")],
     [("fatigue", 7, "Iron + complex carbs.")]),
    ("Tofu (Firm)", "Protein", 144, 17, 3, 9,
     "Soy-based plant protein.",
     ["Soy"], [], [], [("focus", 6, "Plant protein for steady energy.")]),
    ("Black Beans (Cooked)", "Protein", 132, 9, 24, 0.5,
     "Fiber + plant protein.",
     [], [], [("IBS", "FODMAPs may trigger symptoms.")],
     [("fatigue", 7, "Iron + complex carbs.")]),

    # ---- Vegetables ----
    ("Spinach", "Vegetables", 23, 2.9, 3.6, 0.4,
     "Iron, folate, magnesium.",
     [], [], [],
     [("fatigue", 9, "Iron supports oxygen transport."),
      ("sadness", 7, "Folate is studied in mood support.")]),
    ("Broccoli (Steamed)", "Vegetables", 35, 2.4, 7.2, 0.4,
     "Fiber, vitamin C, sulforaphane.",
     [], [], [], [("focus", 6, "Antioxidants support brain health.")]),
    ("Kale", "Vegetables", 49, 4.3, 9, 0.9,
     "Calcium, vitamin K, antioxidants.",
     [], [], [], [("sadness", 7, "Dark leafy greens, folate.")]),
    ("Sweet Potato (Baked)", "Vegetables", 90, 2, 21, 0.1,
     "Complex carbs, beta carotene.",
     [], [], [("Type 2 Diabetes", "Carbohydrate-dense; portion control.")],
     [("low_energy", 9, "Slow-release carbs for sustained energy."),
      ("stress", 7, "Steady carbs help regulate cortisol response.")]),
    ("Carrots", "Vegetables", 41, 0.9, 10, 0.2,
     "Beta carotene, fiber.",
     [], [], [], []),
    ("Bell Peppers", "Vegetables", 31, 1, 6, 0.3,
     "High vitamin C.",
     [], [], [], [("focus", 5, "Vitamin C supports antioxidant defense.")]),
    ("Avocado", "Vegetables", 160, 2, 9, 15,
     "Healthy monounsaturated fats.",
     [], [], [],
     [("focus", 8, "Healthy fats support cognitive function."),
      ("stress", 6, "Magnesium and B-vitamins.")]),

    # ---- Fruits ----
    ("Banana", "Fruits", 89, 1.1, 23, 0.3,
     "Potassium, B6, quick energy.",
     [], [], [],
     [("low_energy", 9, "Quick + sustained energy."),
      ("fatigue", 7, "Potassium supports muscle function.")]),
    ("Blueberries", "Fruits", 57, 0.7, 14, 0.3,
     "Anthocyanins, antioxidants.",
     [], [], [],
     [("focus", 9, "Anthocyanins are studied for cognition."),
      ("sadness", 6, "Antioxidants support brain health.")]),
    ("Apple", "Fruits", 52, 0.3, 14, 0.2,
     "Fiber, polyphenols.",
     [], [], [], [("low_energy", 6, "Steady fiber + natural sugars.")]),
    ("Orange", "Fruits", 47, 0.9, 12, 0.1,
     "Vitamin C, folate.",
     [], [], [], [("focus", 5, "Vitamin C and natural energy.")]),
    ("Strawberries", "Fruits", 32, 0.7, 7.7, 0.3,
     "Vitamin C, antioxidants.",
     [], [], [], [("sadness", 5, "Antioxidants for mood support.")]),
    ("Dark Chocolate (70%)", "Fruits", 170, 2, 13, 12,
     "Cocoa flavanols, magnesium.",
     [], [], [],
     [("sadness", 8, "Cocoa flavanols and magnesium."),
      ("stress", 7, "Magnesium supports stress response.")]),

    # ---- Grains ----
    ("Oatmeal (Steel-cut)", "Grains", 150, 5, 27, 2.5,
     "Slow-release complex carbs, beta-glucan.",
     ["Wheat / Gluten"], [], [],
     [("stress", 8, "Complex carbs help cortisol regulation."),
      ("low_energy", 9, "Sustained-release energy."),
      ("focus", 7, "Steady glucose supports concentration.")]),
    ("Brown Rice (Cooked)", "Grains", 123, 2.7, 26, 1,
     "Whole-grain complex carbs.",
     [], [], [("Type 2 Diabetes", "Portion-control complex carbs.")],
     [("low_energy", 7, "Steady complex carbs.")]),
    ("Quinoa (Cooked)", "Grains", 120, 4.4, 21, 1.9,
     "Complete plant protein and fiber.",
     [], [], [], [("focus", 7, "Complete protein + complex carbs.")]),
    ("Whole-Grain Bread", "Grains", 247, 13, 41, 3.4,
     "Whole-wheat carbs and fiber.",
     ["Wheat / Gluten"], [("Celiac Disease", "Contains gluten.")], [],
     [("low_energy", 5, "Steady complex carbs.")]),

    # ---- Healthy fats / nuts / seeds ----
    ("Almonds", "Protein", 164, 6, 6, 14,
     "Magnesium, vitamin E, healthy fats.",
     ["Tree Nuts"], [], [],
     [("stress", 8, "Magnesium supports stress regulation."),
      ("focus", 7, "Vitamin E and healthy fats.")]),
    ("Walnuts", "Protein", 185, 4.3, 3.9, 18.5,
     "Plant omega-3s.",
     ["Tree Nuts"], [], [],
     [("focus", 8, "Plant omega-3s support cognition."),
      ("sadness", 7, "Omega-3s for mood support.")]),
    ("Chia Seeds", "Protein", 58, 2, 5, 3.7,
     "Omega-3s, fiber.",
     [], [], [], [("focus", 6, "Plant omega-3s + fiber.")]),
    ("Pumpkin Seeds", "Protein", 151, 7, 5, 13,
     "Magnesium, zinc, healthy fats.",
     [], [], [],
     [("stress", 7, "High magnesium content."),
      ("focus", 6, "Zinc supports cognitive function.")]),
    ("Olive Oil (Extra Virgin)", "Fats", 119, 0, 0, 13.5,
     "Monounsaturated fats.",
     [], [], [], [("focus", 5, "Healthy fats for brain health.")]),

    # ---- Hydration / drinks ----
    ("Green Tea", "Hydration", 2, 0, 0.5, 0,
     "L-theanine and caffeine.",
     [], [], [],
     [("focus", 8, "L-theanine + caffeine for calm focus."),
      ("stress", 6, "L-theanine may promote relaxation.")]),
    ("Chamomile Tea", "Hydration", 1, 0, 0.2, 0,
     "Calming herbal infusion.",
     [], [], [], [("stress", 7, "Traditional calming tea.")]),
    ("Water (Plain)", "Hydration", 0, 0, 0, 0,
     "Hydration baseline.",
     [], [], [], []),
]


# Healthy alternatives (original common food → curated replacement in DB)
ALTERNATIVES = [
    ("soda", "Green Tea", "Lower sugar, contains L-theanine for calm focus."),
    ("cola", "Green Tea", "Avoids added sugar; provides antioxidants."),
    ("pepsi", "Green Tea", "Avoids added sugar; provides antioxidants."),
    ("white bread", "Whole-Grain Bread", "More fiber and slower glucose response."),
    ("white rice", "Brown Rice (Cooked)", "Whole grain with more fiber and minerals."),
    ("chips", "Almonds", "Healthy fats and magnesium instead of trans fats."),
    ("french fries", "Sweet Potato (Baked)", "Complex carbs and beta carotene."),
    ("fries", "Sweet Potato (Baked)", "Complex carbs and beta carotene."),
    ("burger", "Grilled Chicken Breast", "Lean protein with less saturated fat."),
    ("pizza", "Whole-Grain Bread", "Lower saturated fat baseline; build with vegetables."),
    ("ice cream", "Greek Yogurt (Plain, low-fat)", "Higher protein, lower added sugar."),
    ("milk chocolate", "Dark Chocolate (70%)", "More cocoa flavanols, less added sugar."),
    ("cookie", "Almonds", "Steady energy without refined sugar spike."),
    ("candy", "Strawberries", "Natural sweetness with vitamin C."),
    ("donut", "Oatmeal (Steel-cut)", "Slow-release carbs instead of refined sugar."),
    ("cereal", "Oatmeal (Steel-cut)", "Lower added sugar, more fiber."),
    ("juice", "Orange", "Whole fruit retains fiber."),
    ("energy drink", "Green Tea", "Cleaner caffeine source with L-theanine."),
    ("coffee creamer", "Greek Yogurt (Plain, low-fat)", "Real dairy without added sugar."),
    ("butter", "Avocado", "Plant-based monounsaturated fats."),
    ("margarine", "Olive Oil (Extra Virgin)", "Naturally derived monounsaturated fats."),
]


TIPS = [
    ("Stay hydrated", "Aim for ~35 ml of water per kg of body weight per day, more in heat or after exercise."),
    ("Build the plate", "Half vegetables, a quarter lean protein, a quarter whole grains — adjust to your goal."),
    ("Mind the morning", "A breakfast with protein and complex carbs steadies energy through the morning."),
    ("Watch the salt", "Most sodium hides in packaged foods; cooking from whole ingredients makes a big difference."),
    ("Snack with intention", "Pair carbs with protein or healthy fat to avoid energy crashes."),
    ("Sleep is nutrition", "Poor sleep raises hunger hormones — recovery is part of the plan."),
]


class Command(BaseCommand):
    help = "Seed real curated nutrition data (idempotent)."

    @transaction.atomic
    def handle(self, *args, **options):
        # Allergies
        allergy_map = {}
        for name in ALLERGIES:
            obj, _ = Allergy.objects.update_or_create(name=name, defaults={"is_active": True})
            allergy_map[name] = obj

        # Health conditions
        condition_map = {}
        for name, desc in HEALTH_CONDITIONS:
            obj, _ = HealthCondition.objects.update_or_create(
                name=name, defaults={"description": desc, "is_active": True}
            )
            condition_map[name] = obj

        # Mood tags
        mood_map = {}
        for name, desc in MOODS:
            obj, _ = MoodTag.objects.update_or_create(
                name=name, defaults={"description": desc, "is_active": True}
            )
            mood_map[name] = obj

        # Foods + tags
        food_map = {}
        for (name, category, calories, protein, carbs, fat, description,
             allergens, blocks, warnings, moods) in FOODS:
            food, _ = FoodItem.objects.update_or_create(
                name=name,
                defaults={
                    "category": category,
                    "calories": calories,
                    "protein_g": protein,
                    "carbs_g": carbs,
                    "fat_g": fat,
                    "description": description,
                    "data_source": "Mazaj+ curated",
                    "is_active": True,
                },
            )
            food_map[name] = food

            # Allergen tags — refresh
            FoodAllergenTag.objects.filter(food=food).delete()
            for a_name in allergens:
                FoodAllergenTag.objects.create(food=food, allergy=allergy_map[a_name])

            # Health rules — refresh
            FoodHealthConditionRule.objects.filter(food=food).delete()
            for c_name, reason in blocks:
                FoodHealthConditionRule.objects.create(
                    food=food, health_condition=condition_map[c_name],
                    risk_level=SafetyRiskLevel.BLOCKED, reason=reason, is_active=True,
                )
            for c_name, reason in warnings:
                FoodHealthConditionRule.objects.create(
                    food=food, health_condition=condition_map[c_name],
                    risk_level=SafetyRiskLevel.WARNING, reason=reason, is_active=True,
                )

            # Mood mappings — refresh
            FoodMoodMapping.objects.filter(food=food).delete()
            for m_name, priority, explanation in moods:
                FoodMoodMapping.objects.create(
                    food=food, mood=mood_map[m_name],
                    priority=priority, explanation=explanation, is_active=True,
                )

        # Healthy alternatives
        HealthyAlternative.objects.all().delete()
        for original, alt_name, reason in ALTERNATIVES:
            food = food_map.get(alt_name)
            if not food:
                continue
            HealthyAlternative.objects.create(
                original_food_name=original,
                alternative_food=food,
                reason=reason,
                is_active=True,
            )

        # Daily tips
        for i, (title, content) in enumerate(TIPS):
            DailyTip.objects.update_or_create(
                title=title,
                defaults={"content": content, "is_active": True, "display_order": i},
            )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded: {len(FOODS)} foods, {len(MOODS)} moods, "
            f"{len(ALLERGIES)} allergies, {len(HEALTH_CONDITIONS)} conditions, "
            f"{len(ALTERNATIVES)} alternatives, {len(TIPS)} tips."
        ))
