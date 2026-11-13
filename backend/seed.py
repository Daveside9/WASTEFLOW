"""
Run with: py manage.py runscript seed
Or:       py seed_runner.py
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wasteflow_api.settings')
django.setup()

from accounts.models import User

USERS = [
    ('admin@wasteflow.com',   'admin123',   'Platform Admin', 'admin',   'Lagos', True,  True),
    ('seller@wasteflow.com',  'seller123',  'Demo Seller',    'seller',  'Lagos', True,  False),
    ('buyer@wasteflow.com',   'buyer123',   'Demo Buyer',     'buyer',   'Lagos', True,  False),
    ('weigher@wasteflow.com', 'weigher123', 'Demo Weigher',   'weigher', 'Lagos', True,  False),
]

for email, pwd, name, role, region, approved, is_staff in USERS:
    if User.objects.filter(email=email).exists():
        print(f'EXISTS  {email}')
        continue
    if is_staff:
        u = User.objects.create_superuser(email=email, password=pwd, full_name=name)
    else:
        u = User.objects.create_user(
            email=email, password=pwd, full_name=name,
            role=role, region=region, approved=approved,
        )
    print(f'CREATED {email}  [{role}]')

print('Done.')
