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
            ('Blueberries', 'Fruits', 84, 1.1, 21.4, 0.5),
            ('Strawberries', 'Fruits', 53, 1.1, 12.7, 0.5),
            ('Avocado', 'Fruits', 234, 2.9, 11.8, 21),
            ('Mango', 'Fruits', 202, 1.4, 50, 0.6),
            ('Grapes', 'Fruits', 104, 1.1, 27, 0.2),
            ('Pineapple', 'Fruits', 82, 0.9, 21.6, 0.2),
            ('Kiwi', 'Fruits', 42, 0.8, 10, 0.4),
            ('Watermelon', 'Fruits', 46, 0.9, 11.5, 0.2),
            ('Peach', 'Fruits', 59, 1.4, 14, 0.4),
            ('Cherry', 'Fruits', 50, 1.0, 12, 0.3),
            ('Pomegranate', 'Fruits', 234, 4.7, 52, 3.3),
            ('Raspberries', 'Fruits', 64, 1.5, 14.7, 0.8),
            ('Grapefruit', 'Fruits', 52, 0.9, 13, 0.2),
            
            # Vegetables
            ('Spinach', 'Vegetables', 7, 0.9, 1.1, 0.1),
            ('Broccoli', 'Vegetables', 55, 3.7, 11.2, 0.6),
            ('Sweet Potato', 'Vegetables', 103, 2, 23.6, 0.2),
            ('Carrots', 'Vegetables', 41, 0.9, 9.6, 0.2),
            ('Bell Peppers', 'Vegetables', 24, 1, 5.5, 0.3),
            ('Tomatoes', 'Vegetables', 22, 1.1, 4.8, 0.2),
            ('Zucchini', 'Vegetables', 17, 1.2, 3.1, 0.3),
            ('Cauliflower', 'Vegetables', 25, 1.9, 4.9, 0.3),
            ('Kale', 'Vegetables', 33, 2.9, 6, 0.6),
            ('Cucumber', 'Vegetables', 16, 0.7, 3.8, 0.1),
            ('Asparagus', 'Vegetables', 20, 2.2, 3.9, 0.1),
            ('Brussels Sprouts', 'Vegetables', 38, 3, 8, 0.3),
            ('Mushrooms', 'Vegetables', 15, 2.2, 2.3, 0.2),
            ('Cabbage', 'Vegetables', 22, 1.1, 5.2, 0.1),
            ('Eggplant', 'Vegetables', 20, 0.8, 4.8, 0.2),
            ('Green Beans', 'Vegetables', 31, 1.8, 7.1, 0.2),
            ('Onion', 'Vegetables', 40, 1.1, 9.3, 0.1),
            ('Garlic', 'Vegetables', 149, 6.4, 33, 0.5),
            
            # Proteins (Meat/Fish)
            ('Chicken Breast', 'Proteins', 165, 31, 0, 3.6),
            ('Salmon', 'Proteins', 208, 20, 0, 13),
            ('Tuna', 'Proteins', 132, 28, 0, 1.3),
            ('Turkey Breast', 'Proteins', 135, 30, 0, 1),
            ('Beef Steak', 'Proteins', 271, 25, 0, 19),
            ('Ground Beef (Lean)', 'Proteins', 250, 26, 0, 15),
            ('Shrimp', 'Proteins', 99, 24, 0.2, 0.3),
            ('Cod', 'Proteins', 82, 18, 0, 0.7),
            ('Pork Tenderloin', 'Proteins', 143, 26, 0, 3.5),
            ('Mackerel', 'Proteins', 305, 19, 0, 25),
            ('Sardines', 'Proteins', 208, 25, 0, 11),
            
            # Proteins (Plant/Eggs)
            ('Eggs', 'Proteins', 72, 6.3, 0.4, 4.8),
            ('Lentils', 'Proteins', 230, 18, 40, 0.8),
            ('Quinoa', 'Proteins', 222, 8.1, 39, 3.6),
            ('Tofu', 'Proteins', 144, 15.5, 2.8, 8.7),
            ('Chickpeas', 'Proteins', 269, 14.5, 45, 4.2),
            ('Black Beans', 'Proteins', 227, 15.2, 40.8, 0.9),
            ('Edamame', 'Proteins', 188, 18.4, 13.8, 8),
            ('Tempeh', 'Proteins', 193, 19, 9, 11),
            
            # Dairy
            ('Greek Yogurt', 'Dairy', 100, 10, 3.6, 5),
            ('Milk (Whole)', 'Dairy', 149, 7.7, 11.7, 8),
            ('Cottage Cheese', 'Dairy', 98, 11, 3.4, 4.3),
            ('Cheddar Cheese', 'Dairy', 402, 25, 1.3, 33),
            ('Kefir', 'Dairy', 104, 9, 12, 2.5),
            ('Butter', 'Dairy', 717, 0.8, 0.1, 81),
            
            # Nuts/Seeds
            ('Almonds', 'Nuts/Seeds', 164, 6, 6.1, 14),
            ('Walnuts', 'Nuts/Seeds', 185, 4.3, 3.9, 18.5),
            ('Chia Seeds', 'Nuts/Seeds', 138, 4.7, 12, 8.7),
            ('Flaxseeds', 'Nuts/Seeds', 150, 5.2, 8.1, 11.8),
            ('Pumpkin Seeds', 'Nuts/Seeds', 151, 7, 5, 13),
            ('Sunflower Seeds', 'Nuts/Seeds', 164, 5.8, 5.8, 14),
            ('Peanut Butter', 'Nuts/Seeds', 188, 8, 6, 16),
            ('Almond Butter', 'Nuts/Seeds', 196, 7, 6, 18),
            
            # Grains/Carbs
            ('Oats', 'Grains', 150, 5, 27, 2.5),
            ('Brown Rice', 'Grains', 216, 5, 45, 1.8),
            ('White Rice', 'Grains', 242, 4.4, 53, 0.4),
            ('Whole Wheat Bread', 'Grains', 69, 3.6, 11.6, 1.1),
            ('White Bread', 'Grains', 67, 2.7, 13, 0.8),
            ('Pasta', 'Grains', 220, 8, 43, 1.3),
            ('Couscous', 'Grains', 176, 6, 36, 0.3),
            ('Barley', 'Grains', 193, 3.5, 44, 0.7),
            ('Sweet Corn', 'Grains', 86, 3.2, 19, 1.2),
            ('Bagel', 'Grains', 245, 10, 48, 1.5),
            ('Sourdough Bread', 'Grains', 104, 4, 20, 0.4),
            ('Pita Bread', 'Grains', 165, 5.5, 33, 1.2),
            ('Tortilla', 'Grains', 147, 4, 24, 3.5),
            
            # Snacks/Sweets
            ('Dark Chocolate', 'Snacks', 170, 2, 13, 12),
            ('Milk Chocolate', 'Snacks', 535, 8, 59, 30),
            ('Potato Chips', 'Snacks', 536, 7, 53, 35),
            ('Ice Cream', 'Snacks', 207, 3.5, 24, 11),
            ('Popcorn (Air-popped)', 'Snacks', 93, 3, 18, 1.2),
            ('Pretzels', 'Snacks', 108, 2.9, 22.5, 0.8),
            ('Rice Cakes', 'Snacks', 35, 0.7, 7.3, 0.3),
            ('Gummy Bears', 'Snacks', 140, 2, 32, 0),
            ('Cookies', 'Snacks', 148, 1.5, 20, 7),
            ('Mixed Nuts', 'Snacks', 175, 5, 6, 15),
            ('Trail Mix', 'Snacks', 137, 4, 13, 9),
            ('Energy Bar', 'Snacks', 230, 10, 30, 8),
            ('Nachos', 'Snacks', 346, 9, 36, 19),
            
            # Beverages
            ('Water', 'Beverages', 0, 0, 0, 0),
            ('Green Tea', 'Beverages', 2, 0, 0, 0),
            ('Black Coffee', 'Beverages', 2, 0.3, 0, 0),
            ('Soda', 'Beverages', 150, 0, 39, 0),
            ('Sparkling Water', 'Beverages', 0, 0, 0, 0),
            ('Orange Juice', 'Beverages', 112, 1.7, 26, 0.5),
            ('Herbal Tea', 'Beverages', 2, 0, 0.5, 0),
            ('Kombucha', 'Beverages', 30, 0, 7, 0),
            ('Almond Milk', 'Beverages', 39, 1, 3, 2.5),
            ('Soy Milk', 'Beverages', 131, 8, 15, 4),
            ('Oat Milk', 'Beverages', 120, 3, 16, 5),
            ('Coconut Water', 'Beverages', 45, 1, 9, 0.5),
            ('Sports Drink', 'Beverages', 80, 0, 21, 0),
            ('Energy Drink', 'Beverages', 110, 0, 27, 0),
            ('Lemonade', 'Beverages', 99, 0.1, 26, 0),
            ('Chamomile Tea', 'Beverages', 2, 0, 0, 0),
            
            # Condiments/Fats
            ('Olive Oil', 'Fats', 119, 0, 0, 13.5),
            ('Coconut Oil', 'Fats', 117, 0, 0, 13.6),
            ('Honey', 'Condiments', 64, 0.1, 17.3, 0),
            ('Maple Syrup', 'Condiments', 52, 0, 13.4, 0),
            ('Soy Sauce', 'Condiments', 9, 1.3, 0.8, 0),
            ('Mayonnaise', 'Condiments', 94, 0.1, 0.1, 10.3),
            ('Ketchup', 'Condiments', 17, 0.2, 4.5, 0),
            ('Mustard', 'Condiments', 3, 0.2, 0.3, 0.2)
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
            # Focus
            ('Green Tea', 'focus', 'L-theanine and caffeine promote sustained focus without jitteriness.'),
            ('Black Coffee', 'focus', 'Caffeine boosts alertness and concentration effectively.'),
            ('Blueberries', 'focus', 'Antioxidants support brain health and cognitive function over time.'),
            ('Salmon', 'focus', 'Omega-3 fatty acids are excellent for brain function and sustained mental clarity.'),
            ('Walnuts', 'focus', 'Rich in DHA, a type of Omega-3 fatty acid linked directly to brain health.'),
            ('Dark Chocolate', 'focus', 'Contains flavonoids and a small amount of caffeine to naturally boost mental acuity.'),
            ('Avocado', 'focus', 'Monounsaturated fats support healthy blood flow to the brain.'),
            ('Eggs', 'focus', 'Choline found in egg yolks is crucial for memory and cognitive function.'),
            ('Water', 'focus', 'Even mild dehydration can impair cognitive performance and concentration.'),
            ('Pumpkin Seeds', 'focus', 'Rich in zinc, iron, and magnesium, essential for brain signaling.'),
            
            # Stress
            ('Dark Chocolate', 'stress', 'Contains flavonoids that can help lower stress hormones like cortisol.'),
            ('Greek Yogurt', 'stress', 'Probiotics can positively impact brain function and reduce anxiety/stress levels.'),
            ('Oats', 'stress', 'Complex carbs gently increase serotonin production, promoting a sense of calmness.'),
            ('Spinach', 'stress', 'Magnesium helps regulate cortisol and relax blood vessels.'),
            ('Chamomile Tea', 'stress', 'Natural relaxing properties can soothe the nervous system.'),
            ('Herbal Tea', 'stress', 'Warm, caffeine-free liquids are inherently soothing to the nervous system.'),
            ('Almonds', 'stress', 'Rich in vitamin E and magnesium, which help the body defend against stress.'),
            ('Sweet Potato', 'stress', 'Nutrient-dense carbohydrates help keep cortisol levels in check.'),
            ('Salmon', 'stress', 'Omega-3s can reduce inflammation and anxiety symptoms.'),
            ('Blueberries', 'stress', 'High in vitamin C, which helps repair and protect cells during times of stress.'),

            # Sadness
            ('Banana', 'sadness', 'Vitamin B6 helps synthesize feel-good neurotransmitters like serotonin.'),
            ('Sweet Potato', 'sadness', 'Complex carbs provide a steady source of energy and stabilize mood swings.'),
            ('Lentils', 'sadness', 'Rich in folate, which is linked to lower rates of depression and sadness.'),
            ('Salmon', 'sadness', 'High levels of Omega-3s have been shown to help manage mood disorders.'),
            ('Dark Chocolate', 'sadness', 'Triggers the release of endorphins, improving mood almost instantly.'),
            ('Chicken Breast', 'sadness', 'Contains tryptophan, an amino acid needed to produce serotonin.'),
            ('Quinoa', 'sadness', 'Provides steady energy and contains flavonoids with anti-depressant effects.'),
            ('Oats', 'sadness', 'Provides a slow, sustained release of energy to prevent mood crashes.'),
            ('Eggs', 'sadness', 'Contains vitamin D and B12, which are important for mood regulation.'),
            ('Spinach', 'sadness', 'Folate supports dopamine production in the brain.'),

            # Fatigue
            ('Quinoa', 'fatigue', 'Complex carbs and high protein provide long-lasting energy without a spike.'),
            ('Chicken Breast', 'fatigue', 'Lean protein keeps energy levels stable without a sluggish crash.'),
            ('Eggs', 'fatigue', 'B-vitamins help enzymes convert food into actionable energy.'),
            ('Spinach', 'fatigue', 'Iron helps transport oxygen to your cells, preventing physical exhaustion.'),
            ('Almonds', 'fatigue', 'Healthy fats and magnesium sustain long-term energy levels.'),
            ('Water', 'fatigue', 'Dehydration is one of the leading hidden causes of fatigue.'),
            ('Sweet Potato', 'fatigue', 'Complex carbohydrates digest slowly, providing steady fuel.'),
            ('Brown Rice', 'fatigue', 'Packed with manganese, a mineral that helps enzymes break down carbs and proteins.'),
            ('Salmon', 'fatigue', 'Provides a potent mix of protein, fats, and B-vitamins for prolonged endurance.'),
            ('Oats', 'fatigue', 'Complex carbohydrates provide a steady release of energy.'),

            # Low Energy
            ('Banana', 'low_energy', 'Natural sugars and potassium provide a quick, accessible energy boost.'),
            ('Oats', 'low_energy', 'Beta-glucan provides a slow release of glucose into the bloodstream.'),
            ('Almonds', 'low_energy', 'Healthy fats and magnesium sustain energy levels.'),
            ('Brown Rice', 'low_energy', 'A great source of complex carbs for sustained daily energy.'),
            ('Apple', 'low_energy', 'Natural sugars and fiber deliver a slow, sustained release of energy.'),
            ('Green Tea', 'low_energy', 'Provides a mild, sustained caffeine lift paired with L-theanine.'),
            ('Peanut Butter', 'low_energy', 'Dense in calories, healthy fats, and protein for a quick, lasting boost.'),
            ('Honey', 'low_energy', 'Easily absorbed simple sugars provide immediate, natural energy.'),
            ('Greek Yogurt', 'low_energy', 'The protein and simple carbs provide a fast but sustained energy lift.'),
            ('Walnuts', 'low_energy', 'Healthy fats and protein provide a dense, sustainable energy source.')
        ]
        FoodMoodMapping.objects.all().delete() # Clean old mappings to prevent duplicates if rules change
        for f_name, m_name, explanation in mappings:
            if f_name in food_objs and m_name in mood_objs:
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
            ('Milk (Whole)', 'Milk/Dairy'),
            ('Cottage Cheese', 'Milk/Dairy'),
            ('Cheddar Cheese', 'Milk/Dairy'),
            ('Kefir', 'Milk/Dairy'),
            ('Butter', 'Milk/Dairy'),
            ('Ice Cream', 'Milk/Dairy'),
            ('Milk Chocolate', 'Milk/Dairy'),
            
            ('Salmon', 'Fish'),
            ('Tuna', 'Fish'),
            ('Cod', 'Fish'),
            ('Mackerel', 'Fish'),
            ('Sardines', 'Fish'),
            
            ('Shrimp', 'Shellfish'),
            
            ('Almonds', 'Tree Nuts'),
            ('Walnuts', 'Tree Nuts'),
            ('Almond Butter', 'Tree Nuts'),
            ('Almond Milk', 'Tree Nuts'),
            ('Mixed Nuts', 'Tree Nuts'),
            ('Trail Mix', 'Tree Nuts'), # Often contains nuts
            
            ('Peanut Butter', 'Peanuts'),
            ('Mixed Nuts', 'Peanuts'), # Often contains peanuts
            ('Trail Mix', 'Peanuts'), # Often contains peanuts
            
            ('Whole Wheat Bread', 'Wheat/Gluten'),
            ('White Bread', 'Wheat/Gluten'),
            ('Pasta', 'Wheat/Gluten'),
            ('Couscous', 'Wheat/Gluten'),
            ('Bagel', 'Wheat/Gluten'),
            ('Sourdough Bread', 'Wheat/Gluten'),
            ('Pita Bread', 'Wheat/Gluten'),
            ('Tortilla', 'Wheat/Gluten'),
            ('Pretzels', 'Wheat/Gluten'),
            ('Cookies', 'Wheat/Gluten'),
            ('Soy Sauce', 'Wheat/Gluten'), # Traditional soy sauce has wheat
            ('Soy Sauce', 'Sulfites'),
            
            ('Tofu', 'Soy'),
            ('Edamame', 'Soy'),
            ('Tempeh', 'Soy'),
            ('Soy Milk', 'Soy'),
            ('Soy Sauce', 'Soy'),
            
            ('Chia Seeds', 'Sesame'), # Often processed in same facilities, let's keep it safe. Actually just use Sesame seeds if added.
            ('Sweet Corn', 'Corn'),
            ('Popcorn (Air-popped)', 'Corn'),
            ('Nachos', 'Corn')
        ]
        FoodAllergenTag.objects.all().delete()
        for f_name, a_name in allergen_map:
            if f_name in food_objs and a_name in allergy_objs:
                FoodAllergenTag.objects.create(
                    food=food_objs[f_name],
                    allergy=allergy_objs[a_name]
                )

        # 7. Health Condition Rules
        health_rules = [
            # Diabetes Type 1 & 2
            ('Soda', 'Diabetes Type 1', SafetyRiskLevel.BLOCKED, 'Extremely high sugar content can cause rapid blood glucose spikes.'),
            ('Soda', 'Diabetes Type 2', SafetyRiskLevel.BLOCKED, 'Extremely high sugar content can cause rapid blood glucose spikes.'),
            ('Energy Drink', 'Diabetes Type 1', SafetyRiskLevel.BLOCKED, 'High sugar and caffeine content.'),
            ('Energy Drink', 'Diabetes Type 2', SafetyRiskLevel.BLOCKED, 'High sugar and caffeine content.'),
            ('Milk Chocolate', 'Diabetes Type 2', SafetyRiskLevel.WARNING, 'High sugar content. Advised to consume dark chocolate instead.'),
            ('Ice Cream', 'Diabetes Type 2', SafetyRiskLevel.WARNING, 'High sugar and saturated fat.'),
            ('Cookies', 'Diabetes Type 2', SafetyRiskLevel.WARNING, 'High glycemic index carbohydrates and refined sugar.'),
            ('Gummy Bears', 'Diabetes Type 2', SafetyRiskLevel.BLOCKED, 'Pure sugar, causes rapid spikes.'),
            ('White Bread', 'Diabetes Type 2', SafetyRiskLevel.WARNING, 'High glycemic index can cause blood sugar spikes.'),
            ('White Rice', 'Diabetes Type 2', SafetyRiskLevel.WARNING, 'High glycemic index can cause blood sugar spikes.'),
            ('Orange Juice', 'Diabetes Type 2', SafetyRiskLevel.WARNING, 'Lacks fiber, causing rapid fructose absorption.'),
            ('Soda', 'PCOS', SafetyRiskLevel.WARNING, 'High glycemic index foods can worsen insulin resistance associated with PCOS.'),
            
            # Hypertension
            ('Potato Chips', 'Hypertension', SafetyRiskLevel.WARNING, 'High sodium content can elevate blood pressure.'),
            ('Soy Sauce', 'Hypertension', SafetyRiskLevel.BLOCKED, 'Extremely high sodium content.'),
            ('Pretzels', 'Hypertension', SafetyRiskLevel.WARNING, 'High sodium content.'),
            ('Nachos', 'Hypertension', SafetyRiskLevel.WARNING, 'High sodium and saturated fat content.'),
            
            # High Cholesterol
            ('Beef Steak', 'High Cholesterol', SafetyRiskLevel.WARNING, 'High saturated fat can negatively impact cholesterol levels.'),
            ('Butter', 'High Cholesterol', SafetyRiskLevel.WARNING, 'Very high in saturated fats.'),
            ('Ice Cream', 'High Cholesterol', SafetyRiskLevel.WARNING, 'High in saturated fats from heavy cream.'),
            ('Cheddar Cheese', 'High Cholesterol', SafetyRiskLevel.WARNING, 'High saturated fat content.'),
            ('Pork Tenderloin', 'High Cholesterol', SafetyRiskLevel.WARNING, 'Moderate saturated fat content, consume in moderation.'),
            ('Butter', 'Liver Disease', SafetyRiskLevel.WARNING, 'High saturated fat intake should be limited in individuals with liver conditions.'),
            
            # Celiac Disease
            ('Whole Wheat Bread', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Contains gluten which triggers autoimmune response.'),
            ('White Bread', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Contains gluten which triggers autoimmune response.'),
            ('Pasta', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Contains gluten which triggers autoimmune response.'),
            ('Couscous', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Contains gluten.'),
            ('Bagel', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Contains gluten.'),
            ('Pita Bread', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Contains gluten.'),
            ('Pretzels', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Contains gluten.'),
            ('Cookies', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Contains gluten.'),
            ('Soy Sauce', 'Celiac Disease', SafetyRiskLevel.BLOCKED, 'Traditional soy sauce contains wheat.'),
            ('Oats', 'Celiac Disease', SafetyRiskLevel.WARNING, 'Often cross-contaminated with gluten unless certified gluten-free.'),
            
            # Lactose Intolerance
            ('Milk (Whole)', 'Lactose Intolerance', SafetyRiskLevel.BLOCKED, 'High lactose content causes digestive distress.'),
            ('Ice Cream', 'Lactose Intolerance', SafetyRiskLevel.BLOCKED, 'High lactose content causes digestive distress.'),
            ('Cottage Cheese', 'Lactose Intolerance', SafetyRiskLevel.WARNING, 'Contains moderate lactose.'),
            ('Greek Yogurt', 'Lactose Intolerance', SafetyRiskLevel.WARNING, 'Contains lactose but often tolerated better due to probiotics.'),
            ('Cheddar Cheese', 'Lactose Intolerance', SafetyRiskLevel.WARNING, 'Aged cheeses have less lactose, but still require caution.'),
            ('Milk Chocolate', 'Lactose Intolerance', SafetyRiskLevel.WARNING, 'Contains milk solids.'),
            
            # Kidney Disease
            ('Banana', 'Kidney Disease', SafetyRiskLevel.WARNING, 'High in potassium, which compromised kidneys cannot filter properly.'),
            ('Sweet Potato', 'Kidney Disease', SafetyRiskLevel.WARNING, 'Very high in potassium.'),
            ('Tomatoes', 'Kidney Disease', SafetyRiskLevel.WARNING, 'High in potassium.'),
            ('Avocado', 'Kidney Disease', SafetyRiskLevel.WARNING, 'Very high in potassium.'),
            ('Spinach', 'Kidney Disease', SafetyRiskLevel.WARNING, 'High in potassium and oxalates.'),
            
            # Pregnancy
            ('Tuna', 'Pregnancy', SafetyRiskLevel.WARNING, 'Contains mercury; should be limited during pregnancy.'),
            ('Mackerel', 'Pregnancy', SafetyRiskLevel.BLOCKED, 'King mackerel is very high in mercury.'),
            ('Black Coffee', 'Pregnancy', SafetyRiskLevel.WARNING, 'Caffeine intake should be limited during pregnancy.'),
            ('Energy Drink', 'Pregnancy', SafetyRiskLevel.BLOCKED, 'High caffeine and unregulated herbal supplements.'),
            ('Kombucha', 'Pregnancy', SafetyRiskLevel.WARNING, 'Unpasteurized and contains trace amounts of alcohol.')
        ]
        FoodHealthConditionRule.objects.all().delete()
        for f_name, cond_name, risk, reason in health_rules:
            if cond_name in condition_objs and f_name in food_objs:
                FoodHealthConditionRule.objects.create(
                    food=food_objs[f_name],
                    health_condition=condition_objs[cond_name],
                    risk_level=risk,
                    reason=reason
                )

        # 8. Healthy Alternatives
        HealthyAlternative.objects.all().delete()
        alts = [
            ('Soda', 'Sparkling Water', 'Sparkling water provides the fizz without the artificial sugar and calories.'),
            ('Soda', 'Green Tea', 'Green tea provides clean energy without the sugar crash and contains antioxidants.'),
            ('Soda', 'Water', 'Water is essential for hydration and contains zero sugar.'),
            ('Potato Chips', 'Popcorn (Air-popped)', 'Air-popped popcorn is a whole grain and provides crunch with much less fat.'),
            ('Potato Chips', 'Almonds', 'Almonds provide healthy fats and satisfying crunch without the high sodium.'),
            ('Ice Cream', 'Greek Yogurt', 'Greek yogurt offers creaminess with significantly more protein and less sugar.'),
            ('Milk Chocolate', 'Dark Chocolate', 'Dark chocolate contains less sugar and more beneficial antioxidants.'),
            ('White Bread', 'Whole Wheat Bread', 'Whole wheat offers more fiber for sustained energy.'),
            ('White Rice', 'Brown Rice', 'Brown rice retains its fiber and nutrient-rich bran layer.'),
            ('White Rice', 'Quinoa', 'Quinoa is a complete protein and has a much lower glycemic index than white rice.'),
            ('Cookies', 'Apple', 'An apple provides natural sweetness paired with fiber for a slower release of energy.'),
            ('Gummy Bears', 'Grapes', 'Grapes provide natural sweetness and hydration instead of processed refined sugar.'),
            ('Energy Drink', 'Black Coffee', 'Black coffee provides a clean caffeine boost without the excessive artificial sugar.'),
            ('Mayonnaise', 'Avocado', 'Mashed avocado provides a creamy texture with heart-healthy monounsaturated fats.'),
            ('Candy', 'Blueberries', 'Fresh berries provide natural sweetness with fiber and antioxidants.'),
            ('French Fries', 'Sweet Potato', 'Baked sweet potatoes provide more fiber and vitamins than deep-fried potatoes.'),
            ('Fried Chicken', 'Chicken Breast', 'Grilled chicken breast is a lean protein source without the excessive saturated fat of frying.'),
            ('Sugary Cereal', 'Oats', 'Oats provide complex carbohydrates and fiber for sustained energy without the sugar crash.'),
            ('Donut', 'Whole Wheat Bread', 'Whole wheat bread provides complex carbs and fiber compared to refined sugar and fats.'),
            ('Creamy Dessert', 'Greek Yogurt', 'Greek yogurt provides a similar creamy texture with much higher protein and lower sugar.'),
            ('Processed Meat Sandwich', 'Turkey Breast', 'Turkey breast is a leaner protein choice compared to processed deli meats.')
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
            ("Limit Added Sugars", "Check labels for hidden sugars. High sugar intake leads to energy crashes.", 6),
            ("Manage Stress Eating", "Before grabbing a snack, ask yourself if you're physically hungry or emotionally stressed. Try drinking a glass of water first.", 7),
            ("Sleep and Weight", "Lack of sleep increases the hunger hormone ghrelin. Aim for 7-9 hours of quality sleep to support your nutrition goals.", 8),
            ("Mood and Food Balance", "What you eat directly affects your brain. Incorporate Omega-3s and complex carbs to naturally support a positive mood.", 9),
            ("Power of Protein", "Including protein with every meal helps maintain muscle mass and keeps you feeling full longer.", 10),
            ("Color Your Plate", "Different colors of vegetables provide different antioxidants. Aim for a 'rainbow' plate to maximize your nutrient intake.", 11)
        ]
        for title, content, order in tips:
            DailyTip.objects.create(
                title=title,
                content=content,
                display_order=order
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(food_objs)} foods and comprehensive rules!'))
