import os
import django
import pandas as pd
import random

# Initialisation de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mpage_config.settings')
django.setup()

from mpage.models import Item

def generate_mock_excel():
    items = Item.objects.all()
    
    if not items.exists():
        print("Error: No questions found in the database.")
        return

    data = []
    for item in items:
        data.append({
            'Dimension': item.factor.dimension.name,
            'Factor Code': item.factor.code,
            'Question Code': item.code,
            'Question / Item (score 1-5)': item.label,
            'Resp1': random.randint(1, 5),
            'Resp2': random.randint(1, 5),
            'Resp3': random.randint(1, 5),
            'Resp4': random.choice([1, 2, 3, 4, 5, '']),
            'Resp5': random.randint(1, 5),
        })

    df = pd.DataFrame(data)
    output_file = 'test_reponses_remplies.xlsx'
    df.to_excel(output_file, index=False, engine='openpyxl')
    print(f"Success! File '{output_file}' generated with {len(data)} responses.")

if __name__ == '__main__':
    generate_mock_excel()
