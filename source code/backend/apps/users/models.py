from django.db import models
from django.contrib.auth.models import User

# Mazaj+ relies on the built-in Django User model. 
# We enforce unique emails at the serialization / auth layer.
