from .seed_test_users import Command as SeedTestUsersCommand


class Command(SeedTestUsersCommand):
    help = "Alias for seed_test_users — seeds the four demo accounts shown in the LoginForm."
