from dataclasses import dataclass
from typing import Optional

@dataclass(frozen=True)
class IntentResult:
    intent: str
    mood: Optional[str] = None
    food_name: Optional[str] = None
    confidence: float = 0.0
    needs_clarification: bool = False
    clarification_question: Optional[str] = None
    source: str = "fallback"  # "local", "gemini", "fallback"
