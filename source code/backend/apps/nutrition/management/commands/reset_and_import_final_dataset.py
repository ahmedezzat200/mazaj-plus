import os
import csv
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from apps.chat.models import ChatSession, ChatMessage, ChatRecommendation
from apps.nutrition.models import (
    Allergy, HealthCondition, FoodItem, FoodAlias, MoodTag,
    FoodMoodMapping, FoodAllergenTag, FoodHealthConditionRule,
    HealthyAlternative, HydrationGuide, UserAllergy, UserHealthCondition,
    DataSource, FoodCategory, FoodNutritionBasis, FoodPortion,
    FoodSource, FoodUsagePolicy, FoodComponent
)

class Command(BaseCommand):
    help = "Safely clear old nutrition and chat data, validate and import the final expanded 1500-food dataset."

    def add_arguments(self, parser):
        parser.add_argument(
            '--data-dir',
            type=str,
            required=True,
            help="Absolute path to the final expanded CSV dataset directory"
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help="Validate files and count records without modifying the database"
        )

    def handle(self, *args, **options):
        data_dir = options['data_dir']
        dry_run = options['dry_run']

        if not os.path.isdir(data_dir):
            raise CommandError(f"Data directory '{data_dir}' does not exist or is not a directory.")

        # 1. Check all required 16 files exist
        required_files = [
            'data_sources.csv',
            'allergies.csv',
            'health_conditions.csv',
            'food_categories.csv',
            'foods.csv',
            'food_nutrition_basis.csv',
            'food_portions.csv',
            'food_sources.csv',
            'food_usage_policy.csv',
            'food_aliases_final.csv',
            'food_allergens.csv',
            'food_condition_rules.csv',
            'mood_mappings.csv',
            'healthy_alternatives_final.csv',
            'food_components.csv',
            'hydration_guides_final.csv'
        ]

        file_paths = {}
        for f in required_files:
            path = os.path.join(data_dir, f)
            if not os.path.isfile(path):
                raise CommandError(f"Required file '{f}' is missing from data directory '{data_dir}'.")
            file_paths[f] = path

        self.stdout.write("All 16 required CSV files found. Starting pre-import validation...")

        # Helper to read CSV rows
        def read_csv(filename):
            rows = []
            with open(file_paths[filename], mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for idx, row in enumerate(reader, start=2): # 1-based, line 2 is first row of data
                    rows.append((idx, row))
            return rows

        def normalize(text):
            if not text:
                return ""
            return " ".join(text.strip().lower().split())

        # 2. Read and Validate CSV files
        # A. data_sources.csv
        data_sources_rows = read_csv('data_sources.csv')
        source_keys = set()
        for idx, row in data_sources_rows:
            key = row.get('source_key')
            name = row.get('source_name')
            if not key or not name:
                raise CommandError(f"Validation error in data_sources.csv at row {idx}: source_key and source_name must be non-empty.")
            if key in source_keys:
                raise CommandError(f"Validation error in data_sources.csv at row {idx}: Duplicate source_key '{key}'.")
            source_keys.add(key)

        # B. allergies.csv
        allergies_rows = read_csv('allergies.csv')
        allergy_keys = set()
        for idx, row in allergies_rows:
            key = row.get('allergy_key')
            name = row.get('name')
            if not key or not name:
                raise CommandError(f"Validation error in allergies.csv at row {idx}: allergy_key and name must be non-empty.")
            if key in allergy_keys:
                raise CommandError(f"Validation error in allergies.csv at row {idx}: Duplicate allergy_key '{key}'.")
            allergy_keys.add(key)

        # C. health_conditions.csv
        conditions_rows = read_csv('health_conditions.csv')
        condition_keys = set()
        for idx, row in conditions_rows:
            key = row.get('condition_key')
            name = row.get('name')
            if not key or not name:
                raise CommandError(f"Validation error in health_conditions.csv at row {idx}: condition_key and name must be non-empty.")
            if key in condition_keys:
                raise CommandError(f"Validation error in health_conditions.csv at row {idx}: Duplicate condition_key '{key}'.")
            condition_keys.add(key)

        # D. food_categories.csv
        categories_rows = read_csv('food_categories.csv')
        category_keys = set()
        for idx, row in categories_rows:
            key = row.get('category_key')
            if not key:
                raise CommandError(f"Validation error in food_categories.csv at row {idx}: category_key must be non-empty.")
            if key in category_keys:
                raise CommandError(f"Validation error in food_categories.csv at row {idx}: Duplicate category_key '{key}'.")
            category_keys.add(key)

        # E. foods.csv
        foods_rows = read_csv('foods.csv')
        if len(foods_rows) != 1500:
            raise CommandError(f"Validation error in foods.csv: Expected exactly 1500 foods, but found {len(foods_rows)}.")

        food_keys = set()
        food_names_normalized = set()
        food_key_to_name = {}

        for idx, row in foods_rows:
            key = row.get('food_key')
            name = row.get('name')
            category = row.get('category')
            if not key or not name or not category:
                raise CommandError(f"Validation error in foods.csv at row {idx}: food_key, name, and category must be non-empty.")
            
            if key in food_keys:
                raise CommandError(f"Validation error in foods.csv at row {idx}: Duplicate food_key '{key}'.")
            
            norm_name = normalize(name)
            if norm_name in food_names_normalized:
                raise CommandError(f"Validation error in foods.csv at row {idx}: Duplicate normalized food name '{norm_name}'.")
            
            # Validate numeric fields
            for fld in ['calories_kcal', 'protein_g', 'carbs_g', 'fat_g']:
                val = row.get(fld)
                try:
                    float_val = float(val)
                    if float_val < 0:
                        raise ValueError("Value cannot be negative.")
                except (TypeError, ValueError):
                    raise CommandError(f"Validation error in foods.csv at row {idx}: Field '{fld}' must be a valid non-negative number (got '{val}').")
            
            # Validate calorie range (reasonable range rule: e.g. <= 1000 kcal)
            cals = float(row.get('calories_kcal'))
            if cals > 1000:
                raise CommandError(f"Validation error in foods.csv at row {idx}: Calories '{cals}' exceed reasonable range (max 1000 kcal).")

            # Validate macros sum <= 102g (allow a small tolerance for rounding errors in FNDDS/USDA database)
            protein = float(row.get('protein_g'))
            carbs = float(row.get('carbs_g'))
            fat = float(row.get('fat_g'))
            if protein + carbs + fat > 102.0:
                raise CommandError(f"Validation error in foods.csv at row {idx}: Macronutrient sum ({protein + carbs + fat}g) exceeds 102g limit.")

            # Optional fields
            for fld in ['sugar_g', 'fiber_g', 'sodium_mg']:
                val = row.get(fld)
                if val:
                    try:
                        float_val = float(val)
                        if float_val < 0:
                            raise ValueError("Value cannot be negative.")
                    except (TypeError, ValueError):
                        raise CommandError(f"Validation error in foods.csv at row {idx}: Optional field '{fld}' must be a valid non-negative number if present (got '{val}').")

            food_keys.add(key)
            food_names_normalized.add(norm_name)
            food_key_to_name[key] = name

        # F. food_nutrition_basis.csv
        basis_rows = read_csv('food_nutrition_basis.csv')
        basis_keys = set()
        for idx, row in basis_rows:
            f_key = row.get('food_key')
            if not f_key:
                raise CommandError(f"Validation error in food_nutrition_basis.csv at row {idx}: food_key must be non-empty.")
            if f_key not in food_keys:
                raise CommandError(f"Validation error in food_nutrition_basis.csv at row {idx}: Referenced food_key '{f_key}' does not exist in foods.csv.")
            if f_key in basis_keys:
                raise CommandError(f"Validation error in food_nutrition_basis.csv at row {idx}: Duplicate entry for food_key '{f_key}'.")
            basis_keys.add(f_key)

        missing_basis = food_keys - basis_keys
        if missing_basis:
            raise CommandError(f"Validation error: food_nutrition_basis.csv does not cover all foods. Missing: {missing_basis}")

        # G. food_portions.csv
        portions_rows = read_csv('food_portions.csv')
        portion_keys = set()
        portions_by_food = set()
        for idx, row in portions_rows:
            p_key = row.get('portion_key')
            f_key = row.get('food_key')
            if not p_key or not f_key:
                raise CommandError(f"Validation error in food_portions.csv at row {idx}: portion_key and food_key must be non-empty.")
            if p_key in portion_keys:
                raise CommandError(f"Validation error in food_portions.csv at row {idx}: Duplicate portion_key '{p_key}'.")
            if f_key not in food_keys:
                raise CommandError(f"Validation error in food_portions.csv at row {idx}: Referenced food_key '{f_key}' does not exist in foods.csv.")
            
            grams = row.get('grams')
            try:
                float_grams = float(grams)
                if float_grams <= 0:
                    raise ValueError()
            except (TypeError, ValueError):
                raise CommandError(f"Validation error in food_portions.csv at row {idx}: grams must be a valid positive number.")

            portion_keys.add(p_key)
            portions_by_food.add(f_key)

        missing_portions = food_keys - portions_by_food
        if missing_portions:
            raise CommandError(f"Validation error: food_portions.csv does not cover all foods. Missing: {missing_portions}")

        # H. food_sources.csv
        sources_rows = read_csv('food_sources.csv')
        sources_keys = set()
        for idx, row in sources_rows:
            f_key = row.get('food_key')
            if not f_key:
                raise CommandError(f"Validation error in food_sources.csv at row {idx}: food_key must be non-empty.")
            if f_key not in food_keys:
                raise CommandError(f"Validation error in food_sources.csv at row {idx}: Referenced food_key '{f_key}' does not exist in foods.csv.")
            if f_key in sources_keys:
                raise CommandError(f"Validation error in food_sources.csv at row {idx}: Duplicate entry for food_key '{f_key}'.")
            sources_keys.add(f_key)

        missing_sources = food_keys - sources_keys
        if missing_sources:
            raise CommandError(f"Validation error: food_sources.csv does not cover all foods. Missing: {missing_sources}")

        # I. food_usage_policy.csv
        policy_rows = read_csv('food_usage_policy.csv')
        policy_keys = set()
        for idx, row in policy_rows:
            f_key = row.get('food_key')
            if not f_key:
                raise CommandError(f"Validation error in food_usage_policy.csv at row {idx}: food_key must be non-empty.")
            if f_key not in food_keys:
                raise CommandError(f"Validation error in food_usage_policy.csv at row {idx}: Referenced food_key '{f_key}' does not exist in foods.csv.")
            if f_key in policy_keys:
                raise CommandError(f"Validation error in food_usage_policy.csv at row {idx}: Duplicate entry for food_key '{f_key}'.")
            policy_keys.add(f_key)

        missing_policy = food_keys - policy_keys
        if missing_policy:
            raise CommandError(f"Validation error: food_usage_policy.csv does not cover all foods. Missing: {missing_policy}")

        # J. food_aliases_final.csv
        aliases_rows = read_csv('food_aliases_final.csv')
        alias_names_normalized = set()
        for idx, row in aliases_rows:
            alias = row.get('alias')
            f_key = row.get('food_key')
            if not alias or not f_key:
                raise CommandError(f"Validation error in food_aliases_final.csv at row {idx}: alias and food_key must be non-empty.")
            
            norm_alias = normalize(alias)
            if norm_alias in alias_names_normalized:
                raise CommandError(f"Validation error in food_aliases_final.csv at row {idx}: Duplicate alias '{alias}' after normalization.")
            if f_key not in food_keys:
                raise CommandError(f"Validation error in food_aliases_final.csv at row {idx}: Referenced food_key '{f_key}' does not exist in foods.csv.")
            
            # Safeguard checks on mapping relationships
            target_food_name = food_key_to_name[f_key]
            
            # no fish alias maps to chicken
            if "fish" in norm_alias:
                f_name_norm = normalize(target_food_name)
                f_key_norm = normalize(f_key)
                if "chicken" in f_name_norm or "chicken" in f_key_norm:
                    raise CommandError(f"Validation error in food_aliases_final.csv at row {idx}: Fish/grilled fish alias '{alias}' maps to chicken food '{target_food_name}'.")
            
            # no cola alias maps to unrelated food
            if "cola" in norm_alias:
                f_name_norm = normalize(target_food_name)
                f_key_norm = normalize(f_key)
                if "cola" not in f_name_norm and "cola" not in f_key_norm:
                    raise CommandError(f"Validation error in food_aliases_final.csv at row {idx}: Cola alias '{alias}' maps to unrelated food '{target_food_name}'.")

            # no pizza alias maps to bread as if they are the same food
            if "pizza" in norm_alias:
                f_name_norm = normalize(target_food_name)
                f_key_norm = normalize(f_key)
                if "pizza" not in f_name_norm and "pizza" not in f_key_norm:
                    raise CommandError(f"Validation error in food_aliases_final.csv at row {idx}: Pizza alias '{alias}' maps to bread/unrelated food '{target_food_name}'.")

            alias_names_normalized.add(norm_alias)

        # K. food_allergens.csv
        allergens_rows = read_csv('food_allergens.csv')
        for idx, row in allergens_rows:
            f_key = row.get('food_key')
            a_key = row.get('allergy_key')
            if not f_key or not a_key:
                raise CommandError(f"Validation error in food_allergens.csv at row {idx}: food_key and allergy_key must be non-empty.")
            if f_key not in food_keys:
                raise CommandError(f"Validation error in food_allergens.csv at row {idx}: Referenced food_key '{f_key}' does not exist in foods.csv.")
            if a_key not in allergy_keys:
                raise CommandError(f"Validation error in food_allergens.csv at row {idx}: Referenced allergy_key '{a_key}' does not exist in allergies.csv.")

        # L. food_condition_rules.csv
        condition_rules_rows = read_csv('food_condition_rules.csv')
        for idx, row in condition_rules_rows:
            f_key = row.get('food_key')
            c_key = row.get('condition_key')
            risk = row.get('risk_level')
            reason = row.get('reason')
            if not f_key or not c_key or not risk or not reason:
                raise CommandError(f"Validation error in food_condition_rules.csv at row {idx}: food_key, condition_key, risk_level, and reason must be non-empty.")
            if f_key not in food_keys:
                raise CommandError(f"Validation error in food_condition_rules.csv at row {idx}: Referenced food_key '{f_key}' does not exist in foods.csv.")
            if c_key not in condition_keys:
                raise CommandError(f"Validation error in food_condition_rules.csv at row {idx}: Referenced condition_key '{c_key}' does not exist in health_conditions.csv.")
            if risk not in ['SAFE', 'WARNING', 'BLOCKED']:
                raise CommandError(f"Validation error in food_condition_rules.csv at row {idx}: Invalid risk_level '{risk}' (must be SAFE, WARNING, or BLOCKED).")

        # M. mood_mappings.csv
        mood_mappings_rows = read_csv('mood_mappings.csv')
        valid_moods = {'stress', 'sadness', 'fatigue', 'focus', 'low_energy'}
        for idx, row in mood_mappings_rows:
            f_key = row.get('food_key')
            mood = row.get('mood')
            reason = row.get('reason')
            if not f_key or not mood or not reason:
                raise CommandError(f"Validation error in mood_mappings.csv at row {idx}: food_key, mood, and reason must be non-empty.")
            if f_key not in food_keys:
                raise CommandError(f"Validation error in mood_mappings.csv at row {idx}: Referenced food_key '{f_key}' does not exist in foods.csv.")
            if mood not in valid_moods:
                raise CommandError(f"Validation error in mood_mappings.csv at row {idx}: Invalid mood '{mood}' (must be one of {valid_moods}).")

        # N. healthy_alternatives_final.csv
        alternatives_rows = read_csv('healthy_alternatives_final.csv')
        alt_pairs = set()
        for idx, row in alternatives_rows:
            orig_key = row.get('original_food_key')
            alt_key = row.get('alternative_food_key')
            reason = row.get('reason')
            if not orig_key or not alt_key or not reason:
                raise CommandError(f"Validation error in healthy_alternatives_final.csv at row {idx}: original_food_key, alternative_food_key, and reason must be non-empty.")
            if orig_key not in food_keys:
                raise CommandError(f"Validation error in healthy_alternatives_final.csv at row {idx}: Referenced original_food_key '{orig_key}' does not exist in foods.csv.")
            if alt_key not in food_keys:
                raise CommandError(f"Validation error in healthy_alternatives_final.csv at row {idx}: Referenced alternative_food_key '{alt_key}' does not exist in foods.csv.")
            pair = (orig_key, alt_key)
            if pair in alt_pairs:
                raise CommandError(f"Validation error in healthy_alternatives_final.csv at row {idx}: Duplicate alternative pair '{orig_key} -> {alt_key}'.")
            alt_pairs.add(pair)

        # O. food_components.csv
        components_rows = read_csv('food_components.csv')
        component_ratios_by_parent = {}
        for idx, row in components_rows:
            p_key = row.get('parent_food_key')
            c_key = row.get('component_food_key')
            ratio = row.get('default_ratio')
            if not p_key or not c_key or ratio is None:
                raise CommandError(f"Validation error in food_components.csv at row {idx}: parent_food_key, component_food_key, and default_ratio must be non-empty.")
            
            if p_key not in food_keys:
                raise CommandError(f"Validation error in food_components.csv at row {idx}: Referenced parent_food_key '{p_key}' does not exist in foods.csv.")
            if c_key not in food_keys:
                raise CommandError(f"Validation error in food_components.csv at row {idx}: Referenced component_food_key '{c_key}' does not exist in foods.csv.")
            
            try:
                float_ratio = float(ratio)
                if float_ratio < 0 or float_ratio > 1:
                    raise ValueError()
            except (TypeError, ValueError):
                raise CommandError(f"Validation error in food_components.csv at row {idx}: default_ratio must be a valid float between 0 and 1.")

            component_ratios_by_parent.setdefault(p_key, []).append(float_ratio)

        for p_key, ratios in component_ratios_by_parent.items():
            total_ratio = sum(ratios)
            if total_ratio > 1.0:
                raise CommandError(f"Validation error in food_components.csv: Sum of ratios for parent food '{p_key}' exceeds 1.0 (got {total_ratio}).")

        # P. hydration_guides_final.csv
        hydration_rows = read_csv('hydration_guides_final.csv')
        guide_keys = set()
        for idx, row in hydration_rows:
            g_key = row.get('guide_key')
            title = row.get('title')
            ctx_type = row.get('context_type')
            ctx_key = row.get('context_key')
            msg = row.get('message')
            min_c = row.get('min_cups')
            max_c = row.get('max_cups')
            if not g_key or not title or not ctx_type or not ctx_key or not msg or min_c is None or max_c is None:
                raise CommandError(f"Validation error in hydration_guides_final.csv at row {idx}: All fields must be non-empty.")
            if g_key in guide_keys:
                raise CommandError(f"Validation error in hydration_guides_final.csv at row {idx}: Duplicate guide_key '{g_key}'.")
            
            try:
                min_cups_int = int(min_c)
                max_cups_int = int(max_c)
                if min_cups_int < 0 or max_cups_int < 0:
                    raise ValueError()
            except ValueError:
                raise CommandError(f"Validation error in hydration_guides_final.csv at row {idx}: min_cups and max_cups must be valid non-negative integers.")
            
            # Validate contexts
            if ctx_type == 'condition':
                if ctx_key not in condition_keys:
                    raise CommandError(f"Validation error in hydration_guides_final.csv at row {idx}: context_key '{ctx_key}' for condition type does not exist in health_conditions.csv.")
            elif ctx_type == 'mood':
                if ctx_key not in valid_moods:
                    raise CommandError(f"Validation error in hydration_guides_final.csv at row {idx}: context_key '{ctx_key}' for mood type is not a valid mood.")
            elif ctx_type != 'general':
                raise CommandError(f"Validation error in hydration_guides_final.csv at row {idx}: Invalid context_type '{ctx_type}' (must be general, mood, or condition).")

            guide_keys.add(g_key)

        self.stdout.write(self.style.SUCCESS("All 16 files passed all 27 pre-import validation rules successfully!"))

        # Report counts for dry-run
        if dry_run:
            self.stdout.write(self.style.WARNING("=== DRY-RUN MODE: No changes will be written to the database ==="))
            self.stdout.write(f"Data Sources to import: {len(data_sources_rows)}")
            self.stdout.write(f"Allergies to import: {len(allergies_rows)}")
            self.stdout.write(f"Health Conditions to import: {len(conditions_rows)}")
            self.stdout.write(f"Food Categories to import: {len(categories_rows)}")
            self.stdout.write(f"Foods to import: {len(foods_rows)}")
            self.stdout.write(f"Food Nutrition Bases to import: {len(basis_rows)}")
            self.stdout.write(f"Food Portions to import: {len(portions_rows)}")
            self.stdout.write(f"Food Sources to import: {len(sources_rows)}")
            self.stdout.write(f"Food Usage Policies to import: {len(policy_rows)}")
            self.stdout.write(f"Food Aliases to import: {len(aliases_rows)}")
            self.stdout.write(f"Food Allergens to import: {len(allergens_rows)}")
            self.stdout.write(f"Food Condition Rules to import: {len(condition_rules_rows)}")
            self.stdout.write(f"Mood Mappings to import: {len(mood_mappings_rows)}")
            self.stdout.write(f"Healthy Alternatives to import: {len(alternatives_rows)}")
            self.stdout.write(f"Food Components to import: {len(components_rows)}")
            self.stdout.write(f"Hydration Guides to import: {len(hydration_rows)}")
            self.stdout.write(self.style.SUCCESS("Dry-run validation complete. Database is untouched."))
            return

        # 3. Database transaction to perform Deletion and Import
        self.stdout.write("Backing up user onboarding profiles and starting database reset...")
        
        # Backup UserAllergy and UserHealthCondition selections
        user_allergies_backup = []
        for ua in UserAllergy.objects.all().select_related('allergy'):
            user_allergies_backup.append({
                'user_id': ua.user_id,
                'allergy_name': ua.allergy.name
            })

        user_conditions_backup = []
        for uc in UserHealthCondition.objects.all().select_related('health_condition'):
            user_conditions_backup.append({
                'user_id': uc.user_id,
                'condition_name': uc.health_condition.name
            })

        self.stdout.write(f"Backed up {len(user_allergies_backup)} user-allergy links and {len(user_conditions_backup)} user-condition links.")

        try:
            with transaction.atomic():
                # A. Clear old tables
                self.stdout.write("Deleting old chat sessions, recommendations, and messages...")
                ChatMessage.objects.all().delete()
                ChatRecommendation.objects.all().delete()
                ChatSession.objects.all().delete()

                self.stdout.write("Deleting old nutrition tables (including new supporting tables)...")
                FoodAllergenTag.objects.all().delete()
                FoodHealthConditionRule.objects.all().delete()
                FoodMoodMapping.objects.all().delete()
                HealthyAlternative.objects.all().delete()
                FoodAlias.objects.all().delete()
                FoodPortion.objects.all().delete()
                FoodSource.objects.all().delete()
                FoodUsagePolicy.objects.all().delete()
                FoodComponent.objects.all().delete()
                FoodNutritionBasis.objects.all().delete()
                FoodItem.objects.all().delete()
                MoodTag.objects.all().delete()
                Allergy.objects.all().delete()
                HealthCondition.objects.all().delete()
                DataSource.objects.all().delete()
                FoodCategory.objects.all().delete()
                HydrationGuide.objects.all().delete()

                # B. Seed MoodTags table
                self.stdout.write("Creating MoodTag database records...")
                mood_objs = {}
                for m in valid_moods:
                    obj = MoodTag.objects.create(name=m, description=f"{m.capitalize()} mood tag.")
                    mood_objs[m] = obj

                # C. Import CSVs in exact required order
                # 1. data_sources.csv
                self.stdout.write("Importing data sources...")
                source_objs = {}
                for idx, row in data_sources_rows:
                    obj = DataSource.objects.create(
                        source_key=row['source_key'],
                        source_name=row['source_name'],
                        source_url=row.get('source_url', ''),
                        allowed_use=row.get('allowed_use', ''),
                        notes=row.get('notes', '')
                    )
                    source_objs[row['source_key']] = obj

                # 2. allergies.csv
                self.stdout.write("Importing allergies...")
                allergy_objs = {}
                for idx, row in allergies_rows:
                    obj = Allergy.objects.create(
                        key=row['allergy_key'],
                        name=row['name'],
                        is_active=True
                    )
                    allergy_objs[row['allergy_key']] = obj

                # 3. health_conditions.csv
                self.stdout.write("Importing health conditions...")
                condition_objs = {}
                for idx, row in conditions_rows:
                    obj = HealthCondition.objects.create(
                        key=row['condition_key'],
                        name=row['name'],
                        is_active=True
                    )
                    condition_objs[row['condition_key']] = obj

                # 4. food_categories.csv
                self.stdout.write("Importing food categories...")
                category_objs = {}
                for idx, row in categories_rows:
                    obj = FoodCategory.objects.create(
                        category_key=row['category_key'],
                        description=row.get('description', ''),
                        default_plan_role=row.get('default_plan_role', '')
                    )
                    category_objs[row['category_key']] = obj

                # 5. foods.csv
                self.stdout.write("Importing foods...")
                food_objs = {}
                for idx, row in foods_rows:
                    sugar = row.get('sugar_g')
                    fiber = row.get('fiber_g')
                    sodium = row.get('sodium_mg')
                    
                    obj = FoodItem.objects.create(
                        food_key=row['food_key'],
                        name=row['name'],
                        category=row['category'],
                        calories=row['calories_kcal'],
                        protein_g=row['protein_g'],
                        carbs_g=row['carbs_g'],
                        fat_g=row['fat_g'],
                        sugar_g=sugar if sugar else None,
                        fiber_g=fiber if fiber else None,
                        sodium_mg=sodium if sodium else None,
                        data_source="Mazaj+ Final 1500-Food Dataset",
                        is_active=True
                    )
                    food_objs[row['food_key']] = obj

                # 6. food_nutrition_basis.csv
                self.stdout.write("Importing food nutrition bases...")
                basis_count = 0
                for idx, row in basis_rows:
                    FoodNutritionBasis.objects.create(
                        food=food_objs[row['food_key']],
                        nutrition_basis=row['nutrition_basis'],
                        basis_amount_g=row['basis_amount_g'],
                        basis_note=row.get('basis_note', '')
                    )
                    basis_count += 1

                # 7. food_portions.csv
                self.stdout.write("Importing food portions...")
                portion_count = 0
                for idx, row in portions_rows:
                    FoodPortion.objects.create(
                        portion_key=row['portion_key'],
                        food=food_objs[row['food_key']],
                        portion_name=row['portion_name'],
                        grams=row['grams'],
                        is_reference_portion=row['is_reference_portion'].strip().lower() == 'true',
                        portion_note=row.get('portion_note', '')
                    )
                    portion_count += 1

                # 8. food_sources.csv
                self.stdout.write("Importing food sources...")
                source_count = 0
                for idx, row in sources_rows:
                    FoodSource.objects.create(
                        food=food_objs[row['food_key']],
                        source_type=row['source_type'],
                        source_reference=row.get('source_reference', ''),
                        source_note=row.get('source_note', ''),
                        source_review_status=row.get('source_review_status', '')
                    )
                    source_count += 1

                # 9. food_usage_policy.csv
                self.stdout.write("Importing food usage policies...")
                policy_count = 0
                for idx, row in policy_rows:
                    FoodUsagePolicy.objects.create(
                        food=food_objs[row['food_key']],
                        image_lookup_allowed=row['image_lookup_allowed'].strip().lower() == 'true',
                        recommendation_allowed=row['recommendation_allowed'].strip().lower() == 'true',
                        plan_allowed=row['plan_allowed'].strip().lower() == 'true',
                        tracking_allowed=True,  # Default to True for search/matching/tracking
                        safety_review_status=row.get('safety_review_status', ''),
                        plan_role=row.get('plan_role', ''),
                        notes=row.get('notes', '')
                    )
                    policy_count += 1

                # 10. food_aliases_final.csv
                self.stdout.write("Importing food aliases...")
                alias_count = 0
                for idx, row in aliases_rows:
                    FoodAlias.objects.create(
                        alias=row['alias'],
                        food=food_objs[row['food_key']],
                        language=row['language'],
                        source=row['source']
                    )
                    alias_count += 1

                # 11. food_allergens.csv
                self.stdout.write("Importing food allergens...")
                allergen_count = 0
                for idx, row in allergens_rows:
                    FoodAllergenTag.objects.create(
                        food=food_objs[row['food_key']],
                        allergy=allergy_objs[row['allergy_key']],
                        note=""
                    )
                    allergen_count += 1

                # 12. food_condition_rules.csv
                self.stdout.write("Importing food condition rules...")
                rule_count = 0
                for idx, row in condition_rules_rows:
                    FoodHealthConditionRule.objects.create(
                        food=food_objs[row['food_key']],
                        health_condition=condition_objs[row['condition_key']],
                        risk_level=row['risk_level'],
                        reason=row['reason'],
                        is_active=True
                    )
                    rule_count += 1

                # 13. mood_mappings.csv
                self.stdout.write("Importing food mood mappings...")
                mood_count = 0
                for idx, row in mood_mappings_rows:
                    FoodMoodMapping.objects.create(
                        food=food_objs[row['food_key']],
                        mood=mood_objs[row['mood']],
                        explanation=row['reason'],
                        priority=1,
                        is_active=True
                    )
                    mood_count += 1

                # 14. healthy_alternatives_final.csv
                self.stdout.write("Importing healthy alternatives...")
                alt_count = 0
                for idx, row in alternatives_rows:
                    HealthyAlternative.objects.create(
                        original_food_name=row['original_food_key'],
                        alternative_food=food_objs[row['alternative_food_key']],
                        reason=row['reason'],
                        is_active=True
                    )
                    alt_count += 1

                # 15. food_components.csv
                self.stdout.write("Importing food components...")
                component_count = 0
                for idx, row in components_rows:
                    FoodComponent.objects.create(
                        parent_food=food_objs[row['parent_food_key']],
                        component_food=food_objs[row['component_food_key']],
                        default_ratio=row['default_ratio'],
                        composition_note=row.get('composition_note', '')
                    )
                    component_count += 1

                # 16. hydration_guides_final.csv
                self.stdout.write("Importing hydration guides...")
                hydration_count = 0
                for idx, row in hydration_rows:
                    HydrationGuide.objects.create(
                        guide_key=row['guide_key'],
                        title=row['title'],
                        context_type=row['context_type'],
                        context_key=row['context_key'],
                        message=row['message'],
                        min_cups=int(row['min_cups']),
                        max_cups=int(row['max_cups'])
                    )
                    hydration_count += 1

                # D. Restore UserAllergy and UserHealthCondition safely
                self.stdout.write("Restoring user onboarding allergy and health condition profiles...")
                
                # Setup names mapping to Allergy/Condition objects (case-insensitive)
                new_allergies_by_name = {a.name.lower(): a for a in Allergy.objects.all()}
                new_conditions_by_name = {c.name.lower(): c for c in HealthCondition.objects.all()}
                
                # Specific name mappings for legacy compatibility
                allergy_mapping = {
                    "dairy": "milk / dairy",
                    "eggs": "egg",
                    "wheat / gluten": "gluten / wheat"
                }
                condition_mapping = {
                    "hypertension": "high blood pressure (hypertension)",
                }

                restored_allergies_count = 0
                unmatched_allergies = []
                for item in user_allergies_backup:
                    uid = item['user_id']
                    name = item['allergy_name'].lower()
                    mapped_name = allergy_mapping.get(name, name)
                    
                    matched_obj = new_allergies_by_name.get(mapped_name)
                    if matched_obj:
                        UserAllergy.objects.create(user_id=uid, allergy=matched_obj)
                        restored_allergies_count += 1
                    else:
                        unmatched_allergies.append(item)

                restored_conditions_count = 0
                unmatched_conditions = []
                for item in user_conditions_backup:
                    uid = item['user_id']
                    name = item['condition_name'].lower()
                    mapped_name = condition_mapping.get(name, name)
                    
                    matched_obj = new_conditions_by_name.get(mapped_name)
                    if matched_obj:
                        UserHealthCondition.objects.create(user_id=uid, health_condition=matched_obj)
                        restored_conditions_count += 1
                    else:
                        unmatched_conditions.append(item)

                # Report results
                self.stdout.write(self.style.SUCCESS("=== RESET AND IMPORT COMPLETED SUCCESSFULLY ==="))
                self.stdout.write(f"Data Sources imported: {len(source_objs)}")
                self.stdout.write(f"Allergies imported: {len(allergy_objs)}")
                self.stdout.write(f"Health Conditions imported: {len(condition_objs)}")
                self.stdout.write(f"Food Categories imported: {len(category_objs)}")
                self.stdout.write(f"Food Items imported: {len(food_objs)}")
                self.stdout.write(f"Food Nutrition Bases imported: {basis_count}")
                self.stdout.write(f"Food Portions imported: {portion_count}")
                self.stdout.write(f"Food Sources imported: {source_count}")
                self.stdout.write(f"Food Usage Policies imported: {policy_count}")
                self.stdout.write(f"Food Aliases imported: {alias_count}")
                self.stdout.write(f"Food Allergens imported: {allergen_count}")
                self.stdout.write(f"Food Condition Rules imported: {rule_count}")
                self.stdout.write(f"Food Mood Mappings imported: {mood_count}")
                self.stdout.write(f"Healthy Alternatives imported: {alt_count}")
                self.stdout.write(f"Food Components imported: {component_count}")
                self.stdout.write(f"Hydration Guides imported: {hydration_count}")
                self.stdout.write(f"User Onboarding Allergies Restored: {restored_allergies_count}")
                if unmatched_allergies:
                    self.stdout.write(self.style.WARNING(f"Unmatched Onboarding Allergies (not restored): {len(unmatched_allergies)}"))
                    for ua in unmatched_allergies:
                        self.stdout.write(f"  - User ID {ua['user_id']}: '{ua['allergy_name']}'")
                self.stdout.write(f"User Onboarding Conditions Restored: {restored_conditions_count}")
                if unmatched_conditions:
                    self.stdout.write(self.style.WARNING(f"Unmatched Onboarding Conditions (not restored): {len(unmatched_conditions)}"))
                    for uc in unmatched_conditions:
                        self.stdout.write(f"  - User ID {uc['user_id']}: '{uc['condition_name']}'")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Import process failed and has been completely rolled back. Error: {str(e)}"))
            raise CommandError(e)
