from django.core.management.base import BaseCommand
from apps.chat.agent.orchestrator import get_orchestrator

class Command(BaseCommand):
    help = 'Test Hybrid Gemini Chat Agent'

    def handle(self, *args, **options):
        test_cases = [
            # GENERAL_CHAT
            ("hello", "GENERAL_CHAT"),
            ("hi", "GENERAL_CHAT"),
            ("good afternoon", "GENERAL_CHAT"),
            ("good evening", "GENERAL_CHAT"),
            ("thanks", "GENERAL_CHAT"),
            ("thank you", "GENERAL_CHAT"),
            ("what is Mazaj", "GENERAL_CHAT"),
            ("what can you do", "GENERAL_CHAT"),
            ("how does this work", "GENERAL_CHAT"),
            ("صباح الخير", "GENERAL_CHAT"),
            ("مساء الخير", "GENERAL_CHAT"),
            ("السلام عليكم", "GENERAL_CHAT"),
            
            # BACKEND_TOOL
            ("I feel stressed", "BACKEND_TOOL"),
            ("I feel burned out", "BACKEND_TOOL"),
            ("I need food for studying", "BACKEND_TOOL"),
            ("suggest something instead of soda", "BACKEND_TOOL"),
            ("alternative to cola", "BACKEND_TOOL"),
            ("how much water should I drink", "BACKEND_TOOL"),
            ("I want a nutrition plan", "BACKEND_TOOL"),
            ("عايز اكل عشان اركز", "BACKEND_TOOL"),
            ("بديل للكولا", "BACKEND_TOOL"),
            
            # OUT_OF_SCOPE
            ("diagnose my diabetes", "OUT_OF_SCOPE"),
            ("treat my depression", "OUT_OF_SCOPE"),
            ("prescribe me medicine", "OUT_OF_SCOPE"),
            ("اعمل تشخيص للسكر", "OUT_OF_SCOPE"),
            ("اكتبلي دواء", "OUT_OF_SCOPE"),
            
            # CLARIFICATION
            ("random unclear text asdasd", "CLARIFICATION"),
            ("asdasdasd", "CLARIFICATION"),
        ]

        self.stdout.write(self.style.SUCCESS("--- Hybrid Gemini Chat Agent Test ---"))
        
        orchestrator = get_orchestrator()
        total = len(test_cases)
        passed = 0
        failed = 0
        
        for msg, expected_mode in test_cases:
            try:
                action = orchestrator.plan(msg)
                
                # Use ascii safe representation for messages with unicode if needed
                safe_msg = msg.encode('ascii', 'ignore').decode('ascii') if not all(ord(c) < 128 for c in msg) else msg
                if not safe_msg.strip():
                    safe_msg = "[Unicode/Arabic Message]"

                is_pass = (action.mode == expected_mode)
                if is_pass:
                    passed += 1
                    status_text = self.style.SUCCESS("PASS")
                else:
                    failed += 1
                    status_text = self.style.ERROR(f"FAIL (Expected {expected_mode})")

                self.stdout.write("-" * 40)
                self.stdout.write(f"Input: {safe_msg}")
                self.stdout.write(f"Mode: {action.mode} | {status_text}")
                self.stdout.write(f"Action: {action.action}")
                self.stdout.write(f"Intent: {action.intent}")
                self.stdout.write(f"Tool: {action.tool}")
                self.stdout.write(f"Arguments: {action.arguments}")
                self.stdout.write(f"Confidence: {action.confidence:.2f}")
                self.stdout.write(f"Source: {action.source}")
                
                if action.mode == "GENERAL_CHAT" and action.direct_response:
                    self.stdout.write(f"Response: {action.direct_response[:50]}...")
                
            except Exception as e:
                failed += 1
                safe_msg = msg.encode('ascii', 'ignore').decode('ascii') if not all(ord(c) < 128 for c in msg) else msg
                self.stdout.write(self.style.ERROR(f"CRASH processing '{safe_msg}': {str(e)}"))

        self.stdout.write("-" * 40)
        self.stdout.write(f"TOTAL: {total}")
        self.stdout.write(self.style.SUCCESS(f"PASSED: {passed}"))
        if failed > 0:
            self.stdout.write(self.style.ERROR(f"FAILED: {failed}"))
        else:
            self.stdout.write(self.style.SUCCESS("ALL TESTS PASSED!"))
