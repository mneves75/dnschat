#!/usr/bin/env python3
"""
Documentation Inventory Script
Classifies documentation by Diataxis framework and generates inventory report
"""

import os
import re
from datetime import datetime
from pathlib import Path
import csv
import json

# Diataxis classification keywords
DIATAXIS_PATTERNS = {
    'tutorial': ['tutorial', 'getting started', 'quickstart', 'beginner', 'introduction'],
    'how-to': ['how to', 'guide', 'recipe', 'steps to', 'troubleshooting'],
    'reference': ['api', 'reference', 'spec', 'specification', 'protocol', 'adr'],
    'explanation': ['architecture', 'design', 'concept', 'explanation', 'understanding', 'why']
}

# Special file classifications
SPECIAL_FILES = {
    'README.md': 'explanation',
    'CONTRIBUTING.md': 'how-to',
    'CHANGELOG.md': 'reference',
    'LICENSE': 'reference',
    'SECURITY.md': 'how-to',
    'CODE_OF_CONDUCT.md': 'reference',
    'INSTALL.md': 'how-to',
    'PLANS.md': 'explanation',
    'AGENTS.md': 'explanation',
    'CLAUDE.md': 'explanation',
    'GEMINI.md': 'explanation'
}

AGE_THRESHOLD_MONTHS = 9

def classify_document(filepath, content):
    """Classify document by Diataxis framework"""
    filename = os.path.basename(filepath)

    # Check special files first
    if filename in SPECIAL_FILES:
        return SPECIAL_FILES[filename]

    # Analyze content for classification
    content_lower = content.lower()

    scores = {category: 0 for category in DIATAXIS_PATTERNS.keys()}

    for category, keywords in DIATAXIS_PATTERNS.items():
        for keyword in keywords:
            # Count occurrences in title/headers (higher weight)
            header_matches = len(re.findall(rf'^#+.*{keyword}', content_lower, re.MULTILINE))
            scores[category] += header_matches * 3

            # Count occurrences in first 500 chars (medium weight)
            intro_matches = content_lower[:500].count(keyword)
            scores[category] += intro_matches * 2

            # Count in full content (lower weight)
            full_matches = content_lower.count(keyword)
            scores[category] += full_matches

    # Return highest scoring category
    if max(scores.values()) > 0:
        return max(scores.items(), key=lambda x: x[1])[0]

    return 'unknown'

def extract_external_links(content):
    """Extract external HTTP(S) links from content"""
    # Match markdown links and bare URLs
    link_pattern = r'\[([^\]]+)\]\((https?://[^\)]+)\)|(?<!\()(https?://[^\s\)]+)'
    matches = re.findall(link_pattern, content)

    links = []
    for match in matches:
        if match[1]:  # Markdown link
            links.append(match[1])
        elif match[2]:  # Bare URL
            links.append(match[2])

    return list(set(links))  # Remove duplicates

def is_obsolete(filepath, content):
    """Check if document is potentially obsolete"""
    # Check last modified date
    mtime = os.path.getmtime(filepath)
    age_months = (datetime.now() - datetime.fromtimestamp(mtime)).days / 30.44

    if age_months > AGE_THRESHOLD_MONTHS:
        return True

    # Check for outdated version references
    outdated_patterns = [
        r'expo.*sdk.*5[0-3]',  # Expo SDK < 54
        r'react native.*0\.[67]',  # React Native < 0.8
        r'react.*1[0-7]\.',  # React < 18
    ]

    for pattern in outdated_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            return True

    return False

def inventory_docs(root_dir):
    """Generate documentation inventory"""
    root_path = Path(root_dir)
    inventory = []

    # Find all markdown files
    md_files = list(root_path.rglob('*.md')) + list(root_path.rglob('*.rst'))

    for filepath in md_files:
        # Skip node_modules and hidden dirs
        if 'node_modules' in str(filepath) or '/.git/' in str(filepath):
            continue

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            continue

        rel_path = filepath.relative_to(root_path)
        mtime = os.path.getmtime(filepath)
        last_modified = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')

        diataxis_type = classify_document(str(filepath), content)
        external_links = extract_external_links(content)
        obsolete = is_obsolete(str(filepath), content)

        status = 'obsolete' if obsolete else 'current'

        # Check for duplicates (simplified - same filename in different dirs)
        filename = filepath.name
        duplicates = [f for f in md_files if f.name == filename and f != filepath]
        if duplicates:
            status = 'duplicate'

        inventory.append({
            'path': str(rel_path),
            'diataxis_type': diataxis_type,
            'last_modified': last_modified,
            'age_months': round((datetime.now() - datetime.fromtimestamp(mtime)).days / 30.44, 1),
            'external_links': len(external_links),
            'links': '; '.join(external_links[:5]),  # First 5 links
            'status': status,
            'size_kb': round(filepath.stat().st_size / 1024, 2)
        })

    return sorted(inventory, key=lambda x: x['path'])

def main():
    root_dir = '/home/user/dnschat'
    inventory = inventory_docs(root_dir)

    # Write CSV report
    csv_path = f'{root_dir}/reports/docs/inventory.csv'
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)

    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        if inventory:
            writer = csv.DictWriter(f, fieldnames=inventory[0].keys())
            writer.writeheader()
            writer.writerows(inventory)

    # Write JSON for easier processing
    json_path = f'{root_dir}/reports/docs/inventory.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, indent=2)

    # Print summary
    print(f"Documentation Inventory Complete")
    print(f"Total documents: {len(inventory)}")
    print(f"\nBy Diataxis Type:")
    for dtype in ['tutorial', 'how-to', 'reference', 'explanation', 'unknown']:
        count = sum(1 for d in inventory if d['diataxis_type'] == dtype)
        print(f"  {dtype}: {count}")

    print(f"\nBy Status:")
    for status in ['current', 'obsolete', 'duplicate']:
        count = sum(1 for d in inventory if d['status'] == status)
        print(f"  {status}: {count}")

    print(f"\nReports saved to:")
    print(f"  - {csv_path}")
    print(f"  - {json_path}")

if __name__ == '__main__':
    main()
