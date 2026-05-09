from django.core.management.base import BaseCommand
from apps.chat.conversation.intent_router import local_intent_route

class Command(BaseCommand):
    help = 'Test chat intent routing'

    def handle(self, *args, **options):
        test_messages = [
            "hello",
            "what is mazaj",
            "what mazaj",
            "i feel stressed",
            "i feel stresed",
            "i am tired",
            "i am tierd",
            "i feel burned out",
            "i need food for focus",
            "عايز اكل عشان اركز",
            "انا مضغوط",
            "suggest something instead of soda",
            "alternative to cola",
            "بديل للكولا",
            "بديل",
            "how much water should i drink",
            "i want nutrition plan",
            "random asdasd"
        ]

        self.stdout.write(self.style.SUCCESS("--- Chat Intent Routing Test ---"))
        
        for msg in test_messages:
            try:
                result = local_intent_route(msg)
                mood_str = f" [Mood: {result.mood}]" if result.mood else ""
                food_str = f" [Food: {result.food_name}]" if result.food_name else ""
                
                # Use ascii safe representation for messages with unicode if needed
                safe_msg = msg.encode('ascii', 'ignore').decode('ascii') if not all(ord(c) < 128 for c in msg) else msg
                if not safe_msg.strip():
                    safe_msg = "[Unicode/Arabic Message]"

                output = f"Input: {safe_msg:<30} | Intent: {result.intent:<20} | Conf: {result.confidence:.2f}{mood_str}{food_str}"
                self.stdout.write(output)
            except Exception as e:
                self.stdout.write(f"Error processing message: {msg}")
