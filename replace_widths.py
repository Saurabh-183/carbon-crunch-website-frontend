import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We want to replace container limiting classes with a fluid approach.
    # Widen up to 1920px. 
    new_content = content.replace('max-w-[1440px]', 'w-full max-w-[1920px] xl:max-w-[92%]')
    new_content = new_content.replace('max-w-7xl', 'w-full max-w-[1920px] xl:max-w-[92%]')
    new_content = new_content.replace('max-w-6xl', 'w-full max-w-[1920px] xl:max-w-[92%]')
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))
