from dataclasses import dataclass, field
from typing import Optional, Dict, Any

@dataclass(frozen=True)
class HybridAgentAction:
    mode: str  # "GENERAL_CHAT", "BACKEND_TOOL", "OUT_OF_SCOPE", "CLARIFICATION"
    action: str  # "answer_direct", "call_tool", "ask_clarification", "out_of_scope"
    intent: str  # "greeting", "help", "mood_recommendation", etc.
    tool: str = "none"
    arguments: Dict[str, Any] = field(default_factory=dict)
    direct_response: Optional[str] = None
    clarification_question: Optional[str] = None
    confidence: float = 0.0
    source: str = "gemini"

@dataclass(frozen=True)
class AgentResult:
    success: bool
    mode: str
    action: str
    intent: str
    tool: str
    message: str
    data: Dict[str, Any] = field(default_factory=dict)
    source: str = "local"
    confidence: float = 0.0
