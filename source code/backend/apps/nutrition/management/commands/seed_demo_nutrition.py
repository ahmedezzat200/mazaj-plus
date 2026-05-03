from django.core.management.base import BaseCommand
from apps.nutrition.models import (
    FoodItem, MoodTag, FoodMoodMapping, DailyTip, HealthyAlternative
)

class Command(BaseCommand):
    help = 'Seeds simple demo nutrition data for Phase 4'

    def handle(self, *args, **options):
        # 1. MoodTags
        moods = ['stress', 'sadness', 'fatigue', 'low_energy', 'focus']
        mood_objs = {}
        for mood in moods:
            obj, _ = MoodTag.objects.get_or_create(name=mood)
            mood_objs[mood] = obj

        # 2. FoodItems
        foods = ['Banana', 'Oats', 'Greek Yogurt', 'Eggs', 'Green Tea']
        food_objs = {}
        for food in foods:
            obj, _ = FoodItem.objects.get_or_create(
                name=food,
                defaults={
                    'category': 'Demo',
                    'calories': 100,
                    'protein_g': 5,
                    'carbs_g': 15,
                    'fat_g': 2,
                    'data_source': "Manual Demo Data — placeholder"
                }
            )
            food_objs[food] = obj

        # 3. Mappings
        mappings = [
            ('Banana', 'low_energy'),
            ('Oats', 'focus'),
            ('Greek Yogurt', 'stress'),
            ('Eggs', 'fatigue'),
            ('Green Tea', 'focus')
        ]
        for f, m in mappings:
            FoodMoodMapping.objects.get_or_create(
                food=food_objs[f],
                mood=mood_objs[m],
                defaults={'explanation': f'Helps with {m}'}
            )

        # 4. DailyTips
        tips = [
            ("Hydration Tip", "Drink 8 glasses of water a day.", 1),
            ("Balanced Breakfast", "Start your day with protein and complex carbs.", 2),
            ("Avoid Skipping Meals", "Skipping meals can lead to energy crashes and bad mood.", 3)
        ]
        for title, content, order in tips:
            DailyTip.objects.get_or_create(
                title=title,
                defaults={'content': content, 'display_order': order}
            )

        # 5. HealthyAlternative
        HealthyAlternative.objects.get_or_create(
            original_food_name='soda',
            alternative_food=food_objs['Green Tea'],
            defaults={'reason': 'Green tea is hydrating and provides clean focus without sugar crashes.'}
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded demo nutrition data!'))
