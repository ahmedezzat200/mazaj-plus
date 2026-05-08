from django.core.management.base import BaseCommand
from apps.nutrition.models import (
    FoodItem, MoodTag, FoodMoodMapping, DailyTip, HealthyAlternative,
    Allergy, HealthCondition, FoodAllergenTag, FoodHealthConditionRule
)
from apps.common.enums import SafetyRiskLevel

class Command(BaseCommand):
    help = 'Seeds comprehensive demo nutrition data for prototype graduation project'

    def handle(self, *args, **options):
        # 1. Health Conditions
        conditions = [
            'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'High Cholesterol', 
            'Heart Disease', 'Kidney Disease', 'Liver Disease', 'Thyroid Disorder', 
            'PCOS', 'Celiac Disease', 'IBS', 'Pregnancy', 'Lactose Intolerance'
        ]
        condition_objs = {}
        for c in conditions:
            obj, _ = HealthCondition.objects.update_or_create(
                name=c, defaults={'description': f'Advisory safety rules for {c}'}
            )
            condition_objs[c] = obj

        # 2. Allergies
        allergies = [
            'Peanuts', 'Tree Nuts', 'Milk/Dairy', 'Eggs', 'Wheat/Gluten', 
            'Soy', 'Fish', 'Shellfish', 'Sesame', 'Corn', 'Sulfites'
        ]
        allergy_objs = {}
        for a in allergies:
            obj, _ = Allergy.objects.update_or_create(
                name=a, defaults={'is_active': True}
            )
            allergy_objs[a] = obj

        # 3. Mood Tags
        moods = ['stress', 'sadness', 'fatigue', 'low_energy', 'focus']
        mood_objs = {}
        for mood in moods:
            obj, _ = MoodTag.objects.update_or_create(
                name=mood, defaults={'is_active': True}
            )
            mood_objs[mood] = obj

        # 4. Food Items (Name, Category, Cals, Prot, Carbs, Fat)
        food_data = [
            # Fruits
            ('Banana', 'Fruits', 105, 1.3, 27, 0.3),
            ('Apple', 'Fruits', 95, 0.5, 25, 0.3),
            ('Blueberries', 'Fruits', 84, 1.1, 21, 0.5),
            ('Avocado', 'Fruits', 234, 2.9, 12, 21),
            ('Orange', 'Fruits', 62, 1.2, 15, 0.2),
            ('Strawberries', 'Fruits', 49, 1.0, 12, 0.5),
            # Veggies
            ('Spinach', 'Vegetables', 23, 2.9, 3.6, 0.4),
            ('Broccoli', 'Vegetables', 55, 3.7, 11, 0.6),
            ('Sweet Potato', 'Vegetables', 103, 2.0, 24, 0.2),
            ('Bell Pepper', 'Vegetables', 24, 1.0, 6, 0.2),
            ('Carrots', 'Vegetables', 41, 0.9, 10, 0.2),
            # Proteins
            ('Chicken Breast', 'Proteins', 165, 31, 0, 3.6),
            ('Salmon', 'Proteins', 206, 22, 0, 13),
            ('Eggs', 'Proteins', 78, 6, 0.6, 5),
            ('Lentils', 'Proteins', 230, 18, 40, 0.8),
            ('Greek Yogurt', 'Proteins', 100, 10, 4, 0),
            ('Tofu', 'Proteins', 144, 16, 3, 9),
            ('Beef Steak', 'Proteins', 250, 26, 0, 15),
            ('Tuna', 'Proteins', 132, 28, 0, 1),
            # Carbs/Grains
            ('Oats', 'Grains', 389, 17, 66, 7),
            ('Quinoa', 'Grains', 222, 8, 39, 4),
            ('Brown Rice', 'Grains', 216, 5, 45, 1.8),
            ('Whole Wheat Bread', 'Grains', 69, 3.6, 12, 1.1),
            ('Pasta', 'Grains', 200, 7, 40, 1),
            # Nuts/Seeds
            ('Almonds', 'Nuts', 579, 21, 22, 50),
            ('Walnuts', 'Nuts', 654, 15, 14, 65),
            ('Chia Seeds', 'Nuts', 486, 17, 42, 31),
            ('Peanut Butter', 'Nuts', 588, 25, 20, 50),
            # Beverages
            ('Green Tea', 'Beverages', 2, 0, 0, 0),
            ('Black Coffee', 'Beverages', 2, 0, 0, 0),
            ('Water', 'Beverages', 0, 0, 0, 0),
            # Snacks/Desserts
            ('Dark Chocolate', 'Snacks', 604, 8, 46, 43),
            ('Potato Chips', 'Snacks', 536, 7, 53, 35),
            ('Milk Chocolate', 'Snacks', 535, 8, 59, 30),
            ('Ice Cream', 'Snacks', 207, 3.5, 24, 11),
            ('Soda', 'Beverages', 150, 0, 39, 0)
        ]
        
        food_objs = {}
        for name, category, cals, prot, carbs, fat in food_data:
            obj, _ = FoodItem.objects.update_or_create(
                name=name,
                defaults={
                    'category': category,
                    'calories': cals,
                    'protein_g': prot,
                    'carbs_g': carbs,
                    'fat_g': fat,
                    'data_source': "Manual Demo Data - verified"
                }
            )
            food_objs[name] = obj

        # 5. Mood Mappings
        mappings = [
            ('Green Tea', 'focus', 'L-theanine and caffeine promote sustained focus.'),
            ('Black Coffee', 'focus', 'Caffeine boosts alertness and concentration.'),
            ('Blueberries', 'focus', 'Antioxidants support brain health and cognitive function.'),
            ('Salmon', 'focus', 'Omega-3 fatty acids are excellent for brain function.'),
            ('Walnuts', 'focus', 'Rich in DHA, a type of Omega-3 fatty acid linked to brain health.'),
            
            ('Dark Chocolate', 'stress', 'Contains flavonoids that can help lower stress hormones.'),
            ('Greek Yogurt', 'stress', 'Probiotics can positively impact brain function and reduce stress.'),
            ('Oats', 'stress', 'Complex carbs increase serotonin production, promoting calmness.'),
            ('Spinach', 'stress', 'Magnesium helps regulate cortisol and blood pressure.'),
            
            ('Banana', 'sadness', 'Vitamin B6 helps synthesize feel-good neurotransmitters like serotonin.'),
            ('Sweet Potato', 'sadness', 'Complex carbs provide a steady source of energy and stabilize mood.'),
            ('Lentils', 'sadness', 'Rich in folate, which is linked to lower rates of depression.'),
            
            ('Quinoa', 'fatigue', 'Complex carbs and high protein provide long-lasting energy.'),
            ('Chicken Breast', 'fatigue', 'Lean protein keeps energy levels stable without a crash.'),
            ('Eggs', 'fatigue', 'B-vitamins help enzymes convert food into energy.'),
            ('Spinach', 'fatigue', 'Iron helps transport oxygen to your cells, preventing exhaustion.'),
            
            ('Banana', 'low_energy', 'Natural sugars and potassium provide a quick energy boost.'),
            ('Oats', 'low_energy', 'Beta-glucan provides a slow release of glucose into the bloodstream.'),
            ('Almonds', 'low_energy', 'Healthy fats and magnesium sustain energy levels.'),
            ('Brown Rice', 'low_energy', 'A great source of complex carbs for sustained energy.')
        ]
        FoodMoodMapping.objects.all().delete() # Clean old mappings to prevent duplicates if rules change
        for f_name, m_name, explanation in mappings:
            FoodMoodMapping.objects.create(
                food=food_objs[f_name],
                mood=mood_objs[m_name],
                explanation=explanation,
                priority=1
            )

        # 6. Allergens
        allergen_map = [
            ('Eggs', 'Eggs'),
            ('Greek Yogurt', 'Milk/Dairy'),
            ('Salmon', 'Fish'),
            ('Tuna', 'Fish'),
            ('Almonds', 'Tree Nuts'),
            ('Walnuts', 'Tree Nuts'),
            ('Peanut Butter', 'Peanuts'),
            ('Whole Wheat Bread', 'Wheat/Gluten'),
            ('Pasta', 'Wheat/Gluten'),
            ('Tofu', 'Soy'),
            ('Ice Cream', 'Milk/Dairy'),
            ('Milk Chocolate', 'Milk/Dairy')
        ]
        FoodAllergenTag.objects.all().delete()
        for f_name, a_name in allergen_map:
            FoodAllergenTag.objects.create(
                food=food_objs[f_name],
                allergy=allergy_objs[a_name]
            )

        # 7. Health Condition Rules
        health_rules = [
            ('Soda', 'Diabetes Type 1', SafetyRiskLevel.BLOCKED, 'Extremely high sugar content can cause rapid blood glucose spikes.'),
            ('Soda', 'Diabetes Type 2', SafetyRiskLevel.BLOCKED, 'Extremely high sugar content can cause rapid blood glucose spikes.'),
            ('Milk Chocolate', 'Diabetes Type 2', SafetyRiskLevel.WARNING, 'High sugar content. Advised to consume dark chocolate instead.'),
            ('Ice Cream', 'Diabetes Type 2', SafetyRiskLevel.WARNING, 'High sugar and saturated fat.'),
            ('Potato Chips', 'Hypertension', SafetyRiskLevel.WARNING, 'High sodium content can elevate blood pressure.'),
            ('Beef Steak', 'High Cholesterol', SafetyRiskLevel.WARNING, 'High saturated fat can negatively impact cholesterol levels.'),
            ('Whole Wheat Bread', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Contains gluten which triggers autoimmune response.'),
            ('Pasta', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Contains gluten which triggers autoimmune response.'),
            ('Ice Cream', 'Lactose Intolerance', SafetyRiskLevel.BLOCKED, 'High lactose content causes digestive distress.'),
            ('Greek Yogurt', 'Lactose Intolerance', SafetyRiskLevel.WARNING, 'Contains lactose but often tolerated better due to probiotics.')
        ]
        FoodHealthConditionRule.objects.all().delete()
        for f_name, cond_name, risk, reason in health_rules:
            if cond_name in condition_objs:
                FoodHealthConditionRule.objects.create(
                    food=food_objs[f_name],
                    health_condition=condition_objs[cond_name],
                    risk_level=risk,
                    reason=reason
                )

        # 8. Healthy Alternatives
        HealthyAlternative.objects.all().delete()
        alts = [
            ('Soda', 'Green Tea', 'Green tea provides clean energy without the sugar crash and contains antioxidants.'),
            ('Soda', 'Water', 'Water is essential for hydration and contains zero sugar.'),
            ('Potato Chips', 'Almonds', 'Almonds provide healthy fats and satisfying crunch without the high sodium.'),
            ('Ice Cream', 'Greek Yogurt', 'Greek yogurt offers creaminess with significantly more protein and less sugar.'),
            ('Milk Chocolate', 'Dark Chocolate', 'Dark chocolate contains less sugar and more beneficial antioxidants.'),
            ('White Bread', 'Whole Wheat Bread', 'Whole wheat offers more fiber for sustained energy.')
        ]
        for orig, alt_name, reason in alts:
            if alt_name in food_objs:
                HealthyAlternative.objects.create(
                    original_food_name=orig.lower(),
                    alternative_food=food_objs[alt_name],
                    reason=reason
                )

        # 9. Daily Tips
        DailyTip.objects.all().delete()
        tips = [
            ("Hydration is Key", "Aim for at least 8 glasses of water a day. Dehydration can mimic hunger and cause fatigue.", 1),
            ("Balance Your Plate", "Ensure every meal has a good source of protein, complex carbs, and healthy fats.", 2),
            ("Don't Skip Breakfast", "A protein-rich breakfast stabilizes your blood sugar for the rest of the day.", 3),
            ("Mindful Eating", "Eat slowly and without distractions. It takes 20 minutes for your brain to register fullness.", 4),
            ("Fiber for Digestion", "Incorporate more vegetables and whole grains to keep your digestive system healthy.", 5),
            ("Limit Added Sugars", "Check labels for hidden sugars. High sugar intake leads to energy crashes.", 6)
        ]
        for title, content, order in tips:
            DailyTip.objects.create(
                title=title,
                content=content,
                display_order=order
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(food_objs)} foods and comprehensive rules!'))
