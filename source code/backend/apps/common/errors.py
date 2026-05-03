class MazajError(Exception):
    """Base exception for Mazaj backend."""
    pass

class ValidationError(MazajError):
    pass

class AuthenticationError(MazajError):
    pass

class AuthorizationError(MazajError):
    pass

class OnboardingRequiredError(MazajError):
    pass

class SubscriptionRequiredError(MazajError):
    pass

class TierLimitExceededError(MazajError):
    pass

class SafetyValidationError(MazajError):
    pass

class IdempotencyConflictError(MazajError):
    pass

class DatabaseTransactionError(MazajError):
    pass

class NotFoundError(MazajError):
    pass
