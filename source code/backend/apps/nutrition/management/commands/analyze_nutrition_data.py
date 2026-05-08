from django.core.management.base import BaseCommand
from django.db.models import Count
from apps.nutrition.models import (
    FoodItem, MoodTag, FoodMoodMapping, Allergy, HealthCondition,
    FoodAllergenTag, FoodHealthConditionRule, HealthyAlternative, DailyTip
)
from apps.common.enums import SafetyRiskLevel

class Command(BaseCommand):
    help = 'Analyzes the quality and coverage of the nutrition knowledge base'

    def handle(self, *args, **options):
        self.stdout.write("--- Nutrition Data Analysis ---")
        
        # 1. Total counts
        foods_count = FoodItem.objects.count()
        moods_count = MoodTag.objects.count()
        mappings_count = FoodMoodMapping.objects.count()
        allergies_count = Allergy.objects.count()
        conditions_count = HealthCondition.objects.count()
        allergen_tags_count = FoodAllergenTag.objects.count()
        health_rules_count = FoodHealthConditionRule.objects.count()
        alts_count = HealthyAlternative.objects.count()
        tips_count = DailyTip.objects.count()
        
        self.stdout.write("\n1. Total counts:")
        self.stdout.write(f"- FoodItem: {foods_count}")
        self.stdout.write(f"- MoodTag: {moods_count}")
        self.stdout.write(f"- FoodMoodMapping: {mappings_count}")
        self.stdout.write(f"- Allergy: {allergies_count}")
        self.stdout.write(f"- HealthCondition: {conditions_count}")
        self.stdout.write(f"- FoodAllergenTag: {allergen_tags_count}")
        self.stdout.write(f"- FoodHealthConditionRule: {health_rules_count}")
        self.stdout.write(f"- HealthyAlternative: {alts_count}")
        self.stdout.write(f"- DailyTip: {tips_count}")
        
        # 2. Mood coverage
        self.stdout.write("\n2. Mood coverage:")
        mood_coverage_pass = True
        for mood in MoodTag.objects.all():
            count = FoodMoodMapping.objects.filter(mood=mood).count()
            status = "PASS" if count >= 10 else "WARN"
            if count < 10:
                mood_coverage_pass = False
            self.stdout.write(f"- {mood.name}: {count} foods ({status})")
        
        # 3. Data quality checks
        self.stdout.write("\n3. Data quality checks:")
        
        # duplicates
        duplicate_foods = FoodItem.objects.values('name').annotate(name_count=Count('name')).filter(name_count__gt=1).count()
        self.stdout.write(f"- duplicate food names: {duplicate_foods}")
        
        # foods without mood mapping
        foods_no_mood = FoodItem.objects.filter(mood_mappings__isnull=True).count()
        self.stdout.write(f"- foods without any mood mapping: {foods_no_mood}")
        
        # alternatives with missing alternative_food
        alts_missing_food = HealthyAlternative.objects.filter(alternative_food__isnull=True).count()
        self.stdout.write(f"- alternatives with missing/null alternative_food: {alts_missing_food}")
        
        # allergies with zero tagged foods
        allergies_zero_foods = Allergy.objects.filter(foods__isnull=True).count()
        self.stdout.write(f"- allergies with zero tagged foods: {allergies_zero_foods}")
        
        # conditions with zero rules
        conditions_zero_rules = HealthCondition.objects.filter(food_rules__isnull=True).count()
        self.stdout.write(f"- health conditions with zero rules: {conditions_zero_rules}")
        
        # rule counts
        blocked_rules = FoodHealthConditionRule.objects.filter(risk_level=SafetyRiskLevel.BLOCKED).count()
        warning_rules = FoodHealthConditionRule.objects.filter(risk_level=SafetyRiskLevel.WARNING).count()
        self.stdout.write(f"- count of BLOCKED rules: {blocked_rules}")
        self.stdout.write(f"- count of WARNING rules: {warning_rules}")
        
        # 4. Thresholds
        self.stdout.write("\n4. Thresholds:")
        foods_status = "PASS" if foods_count >= 100 else ("WARN" if foods_count > 0 else "FAIL")
        mappings_status = "PASS" if mappings_count >= 40 else ("WARN" if mappings_count > 0 else "FAIL")
        alts_status = "PASS" if alts_count >= 20 else ("WARN" if alts_count > 0 else "FAIL")
        tips_status = "PASS" if tips_count >= 10 else ("WARN" if tips_count > 0 else "FAIL")
        blocked_status = "PASS" if blocked_rules >= 10 else ("WARN" if blocked_rules > 0 else "FAIL")
        warning_status = "PASS" if warning_rules >= 10 else ("WARN" if warning_rules > 0 else "FAIL")
        
        self.stdout.write(f"- foods >= 100: {foods_status}")
        self.stdout.write(f"- mood mappings >= 40: {mappings_status}")
        self.stdout.write(f"- alternatives >= 20: {alts_status}")
        self.stdout.write(f"- daily tips >= 10: {tips_status}")
        self.stdout.write(f"- BLOCKED rules >= 10: {blocked_status}")
        self.stdout.write(f"- WARNING rules >= 10: {warning_status}")
        
        # 5. Final summary
        self.stdout.write("\n5. Final summary:")
        
        quality_status = "PASS"
        if duplicate_foods > 0 or alts_missing_food > 0:
            quality_status = "FAIL"
        elif (not mood_coverage_pass or foods_status != "PASS" or mappings_status != "PASS" or 
              alts_status != "PASS" or tips_status != "PASS" or blocked_status != "PASS" or warning_status != "PASS"):
            quality_status = "WARN"
            
        self.stdout.write(f"DATA QUALITY: {quality_status}")
