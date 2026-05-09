from typing import Dict, Any, Callable
import logging

logger = logging.getLogger(__name__)

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}

    def register(self, name: str, func: Callable):
        self._tools[name] = func

    def execute(self, name: str, **kwargs) -> Any:
        if name not in self._tools:
            logger.error(f"Attempted to execute unauthorized or unknown tool: {name}")
            raise ValueError(f"Tool '{name}' not found in registry.")
        return self._tools[name](**kwargs)

# Singleton instance
registry = ToolRegistry()

def get_tool_registry():
    return registry
