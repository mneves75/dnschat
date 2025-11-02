#!/usr/bin/env python3
"""
Documentation Inventory Script
Classifies documentation by Diataxis framework and generates inventory report.

Uses weighted scoring to classify docs:
- Headers: 3x weight (most indicative of purpose)
- Introduction (first 500 chars): 2x weight (sets context)
- Full content: 1x weight (general topic coverage)
"""

import os
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple
import csv
import json

# Diataxis classification keywords
# Tutorial: Learning-oriented, takes user by the hand through a series of steps
# How-to: Problem-oriented, guides through solving a specific problem
# Reference: Information-oriented, technical descriptions of machinery
# Explanation: Understanding-oriented, clarifies and deepens understanding
DIATAXIS_PATTERNS = {
    'tutorial': ['tutorial', 'getting started', 'quickstart', 'beginner', 'introduction', 'walkthrough'],
    'how-to': ['how to', 'guide', 'recipe', 'steps to', 'troubleshooting', 'fix', 'solve'],
    'reference': ['api', 'reference', 'spec', 'specification', 'protocol', 'adr', 'command'],
    'explanation': ['architecture', 'design', 'concept', 'explanation', 'understanding', 'why', 'overview']
}

# Special files with known classifications
SPECIAL_FILES = {
    'README.md': 'explanation',        # Project overview
    'CONTRIBUTING.md': 'how-to',       # How to contribute
    'CHANGELOG.md': 'reference',       # Version history reference
    'LICENSE': 'reference',            # Legal reference
    'SECURITY.md': 'how-to',          # How to report vulnerabilities
    'CODE_OF_CONDUCT.md': 'reference', # Community standards reference
    'INSTALL.md': 'how-to',           # Installation guide
    'PLANS.md': 'explanation',         # Planning methodology
    'AGENTS.md': 'explanation',        # Agent collaboration guide
    'CLAUDE.md': 'explanation',        # Claude-specific guidance
    'GEMINI.md': 'explanation'         # Gemini-specific guidance
}

# Classification weights (can be tuned)
WEIGHT_HEADER = 3    # Headers strongly indicate document purpose
WEIGHT_INTRO = 2     # Introduction sets context
WEIGHT_BODY = 1      # Body provides general topic coverage

# Age threshold for obsolescence detection (months)
AGE_THRESHOLD_MONTHS = 9

# Outdated version patterns (update as project evolves)
OUTDATED_PATTERNS = [
    (r'expo\s+sdk\s+5[0-3]', 'Expo SDK < 54'),           # Current: 54
    (r'react\s+native\s+0\.[67]', 'React Native < 0.8'), # Current: 0.81
    (r'react\s+1[0-7]\.', 'React < 18'),                 # Current: 19.1
]


def escape_regex(text: str) -> str:
    """Escape special regex characters in search text."""
    return re.escape(text)


def classify_document(filepath: str, content: str) -> str:
    """
    Classify document by Diataxis framework using weighted keyword scoring.

    Returns one of: tutorial, how-to, reference, explanation, unknown
    """
    filename = os.path.basename(filepath)

    # Check special files first (explicit classification)
    if filename in SPECIAL_FILES:
        return SPECIAL_FILES[filename]

    content_lower = content.lower()
    scores = {category: 0 for category in DIATAXIS_PATTERNS.keys()}

    for category, keywords in DIATAXIS_PATTERNS.items():
        for keyword in keywords:
            # Escape keyword for safe regex usage
            safe_keyword = escape_regex(keyword)

            # Count occurrences in headers (highest weight)
            header_pattern = rf'^#+.*\b{safe_keyword}\b'
            header_matches = len(re.findall(header_pattern, content_lower, re.MULTILINE | re.IGNORECASE))
            scores[category] += header_matches * WEIGHT_HEADER

            # Count in introduction (first 500 chars, medium weight)
            intro_text = content_lower[:500]
            intro_matches = len(re.findall(rf'\b{safe_keyword}\b', intro_text))
            scores[category] += intro_matches * WEIGHT_INTRO

            # Count in full content (lower weight, avoid double-counting intro)
            body_text = content_lower[500:] if len(content_lower) > 500 else ''
            body_matches = len(re.findall(rf'\b{safe_keyword}\b', body_text))
            scores[category] += body_matches * WEIGHT_BODY

    # Return highest scoring category (must have at least some matches)
    max_score = max(scores.values())
    if max_score > 0:
        return max(scores.items(), key=lambda x: x[1])[0]

    return 'unknown'


def extract_external_links(content: str) -> List[str]:
    """
    Extract external HTTP(S) links from markdown content.

    Handles:
    - Markdown links: [text](url)
    - Bare URLs: http://example.com
    """
    links = []

    # Markdown links: [text](url)
    md_link_pattern = r'\[([^\]]+)\]\((https?://[^\)]+)\)'
    for match in re.finditer(md_link_pattern, content):
        links.append(match.group(2))

    # Bare URLs (not already in markdown link context)
    # Negative lookbehind to avoid matching URLs inside [text](url)
    bare_url_pattern = r'(?<!\]\()https?://[^\s\)\]>]+'
    for match in re.finditer(bare_url_pattern, content):
        url = match.group(0)
        # Additional check: not preceded by ( within 5 chars
        start = max(0, match.start() - 5)
        context = content[start:match.start()]
        if '(' not in context or content[match.start()-1] != '(':
            links.append(url)

    # Remove duplicates while preserving order
    seen = set()
    unique_links = []
    for link in links:
        if link not in seen:
            seen.add(link)
            unique_links.append(link)

    return unique_links


def is_obsolete(filepath: str, content: str) -> Tuple[bool, str]:
    """
    Check if document is potentially obsolete.

    Returns: (is_obsolete: bool, reason: str)
    """
    try:
        mtime = os.path.getmtime(filepath)
        age_months = (datetime.now() - datetime.fromtimestamp(mtime)).days / 30.44

        # Age-based obsolescence (with exceptions)
        filename = os.path.basename(filepath)

        # Exempt stable docs from age-based obsolescence
        stable_docs = {'LICENSE', 'CODE_OF_CONDUCT.md', 'PLANS.md'}

        if age_months > AGE_THRESHOLD_MONTHS and filename not in stable_docs:
            # Additional check: if in archive/ or has "deprecated" in content, mark obsolete
            if '/archive/' in filepath or 'deprecated' in content.lower()[:1000]:
                return True, f'Age: {age_months:.1f} months'

        # Version-based obsolescence
        for pattern, description in OUTDATED_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                return True, f'References {description}'

    except (OSError, ValueError) as e:
        print(f"Warning: Could not check obsolescence for {filepath}: {e}", file=sys.stderr)

    return False, ''


def is_intentional_duplicate(filepath: Path, all_files: List[Path]) -> bool:
    """
    Check if file is an intentional duplicate (e.g., template structure).

    .claude/skills/*/SKILL.md are intentional, not duplicates.
    """
    # Check if file is part of a structured pattern
    if filepath.name == 'SKILL.md' and '/.claude/skills/' in str(filepath):
        return True

    if filepath.name in {'README.md', 'GEMINI.md'} and '/.claude/' in str(filepath):
        return True

    return False


def inventory_docs(root_dir: str) -> List[Dict]:
    """Generate comprehensive documentation inventory."""
    root_path = Path(root_dir)
    inventory = []

    # Find all markdown and reStructuredText files
    md_files = list(root_path.rglob('*.md')) + list(root_path.rglob('*.rst'))

    for filepath in md_files:
        # Skip node_modules, .git, and other noise
        skip_patterns = ['node_modules', '/.git/', '/dist/', '/build/']
        if any(pattern in str(filepath) for pattern in skip_patterns):
            continue

        # Read file content
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}", file=sys.stderr)
            continue

        # Extract metadata
        try:
            rel_path = filepath.relative_to(root_path)
            mtime = os.path.getmtime(filepath)
            last_modified = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
            age_months = round((datetime.now() - datetime.fromtimestamp(mtime)).days / 30.44, 1)
            size_kb = round(filepath.stat().st_size / 1024, 2)
        except Exception as e:
            print(f"Error extracting metadata for {filepath}: {e}", file=sys.stderr)
            continue

        # Classify and analyze
        diataxis_type = classify_document(str(filepath), content)
        external_links = extract_external_links(content)
        obsolete, obsolete_reason = is_obsolete(str(filepath), content)

        # Determine status
        status = 'current'
        if obsolete:
            status = f'obsolete ({obsolete_reason})'

        # Check for duplicates (same filename in different directories)
        filename = filepath.name
        duplicates = [f for f in md_files if f.name == filename and f != filepath]

        # Only mark as duplicate if not intentional structure
        if duplicates and not is_intentional_duplicate(filepath, md_files):
            status = 'duplicate'

        inventory.append({
            'path': str(rel_path),
            'filename': filename,
            'diataxis_type': diataxis_type,
            'last_modified': last_modified,
            'age_months': age_months,
            'external_links': len(external_links),
            'external_urls': '; '.join(external_links[:5]),  # First 5 for preview
            'status': status,
            'size_kb': size_kb
        })

    return sorted(inventory, key=lambda x: x['path'])


def main():
    """Main entry point."""
    # Accept root directory as argument or use default
    root_dir = sys.argv[1] if len(sys.argv) > 1 else '/home/user/dnschat'

    if not os.path.isdir(root_dir):
        print(f"Error: {root_dir} is not a valid directory", file=sys.stderr)
        sys.exit(1)

    print(f"Inventorying documentation in: {root_dir}")
    inventory = inventory_docs(root_dir)

    # Create output directory
    output_dir = os.path.join(root_dir, 'reports', 'docs')
    os.makedirs(output_dir, exist_ok=True)

    # Write CSV report
    csv_path = os.path.join(output_dir, 'inventory.csv')
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        if inventory:
            writer = csv.DictWriter(f, fieldnames=inventory[0].keys())
            writer.writeheader()
            writer.writerows(inventory)

    # Write JSON for programmatic access
    json_path = os.path.join(output_dir, 'inventory.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(inventory, f, indent=2, ensure_ascii=False)

    # Print summary statistics
    print(f"\n{'='*60}")
    print(f"Documentation Inventory Complete")
    print(f"{'='*60}")
    print(f"Total documents: {len(inventory)}")

    print(f"\nBy Diataxis Type:")
    for dtype in ['tutorial', 'how-to', 'reference', 'explanation', 'unknown']:
        count = sum(1 for d in inventory if d['diataxis_type'] == dtype)
        if count > 0:
            print(f"  {dtype:12s}: {count:3d}")

    print(f"\nBy Status:")
    status_counts = {}
    for doc in inventory:
        status = doc['status']
        # Normalize obsolete reasons for counting
        if status.startswith('obsolete'):
            status_key = 'obsolete'
        else:
            status_key = status
        status_counts[status_key] = status_counts.get(status_key, 0) + 1

    for status in ['current', 'obsolete', 'duplicate']:
        count = status_counts.get(status, 0)
        if count > 0:
            print(f"  {status:12s}: {count:3d}")

    print(f"\nReports saved to:")
    print(f"  CSV:  {csv_path}")
    print(f"  JSON: {json_path}")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
