#!/usr/bin/env python3
"""
Link Checker for Documentation

Validates all links in markdown files:
- Internal links (relative/absolute paths)
- Anchor links (#section)
- External URLs (http/https)
- Email links (mailto:)

Reports broken internal links and collects external links for manual review.
"""

import os
import re
import sys
import json
from pathlib import Path
from typing import List, Dict, Tuple, Set
from collections import defaultdict


def extract_all_links(content: str, filepath: Path) -> List[Dict]:
    """
    Extract all links from markdown content with line numbers.

    Returns list of dicts with: url, text, type, line, file
    """
    links = []
    lines = content.split('\n')

    for line_num, line in enumerate(lines, start=1):
        # Markdown links: [text](url)
        for match in re.finditer(r'\[([^\]]*)\]\(([^\)]+)\)', line):
            text, url = match.groups()
            links.append({
                'url': url.strip(),
                'text': text.strip(),
                'type': 'markdown',
                'line': line_num,
                'file': str(filepath)
            })

        # Bare URLs (not already in markdown links)
        # Match URLs not preceded by ]( to avoid duplicating markdown links
        line_without_md_links = re.sub(r'\[([^\]]*)\]\(([^\)]+)\)', '', line)
        for match in re.finditer(r'https?://[^\s\)\]<>]+', line_without_md_links):
            url = match.group(0)
            # Clean trailing punctuation that's not part of URL
            url = re.sub(r'[.,;:!?\'"]+$', '', url)
            links.append({
                'url': url,
                'text': '',
                'type': 'bare',
                'line': line_num,
                'file': str(filepath)
            })

    return links


def categorize_link(url: str) -> str:
    """Categorize link by type."""
    url_lower = url.lower()

    if url.startswith('#'):
        return 'anchor'
    elif url_lower.startswith(('http://', 'https://')):
        return 'external'
    elif url_lower.startswith('ftp://'):
        return 'ftp'
    elif url_lower.startswith('mailto:'):
        return 'email'
    else:
        return 'internal'


def normalize_path(path: str) -> str:
    """
    Normalize path for comparison.

    Removes ./ prefix, resolves .. components, normalizes separators.
    """
    # Remove leading ./
    path = re.sub(r'^\./', '', path)

    # Convert to Path for normalization
    try:
        normalized = Path(path).as_posix()
        return normalized
    except Exception:
        return path


def check_internal_link(link_url: str, source_file: Path, root_dir: Path) -> Tuple[bool, str]:
    """
    Check if internal link target exists.

    Returns: (exists: bool, reason: str)
    """
    # Split anchor from path
    if '#' in link_url:
        path_part, anchor = link_url.split('#', 1)
    else:
        path_part, anchor = link_url, None

    # Handle anchor-only links (same file)
    if not path_part:
        return True, 'anchor-only'

    # Resolve target path
    try:
        if path_part.startswith('/'):
            # Absolute path from repo root
            target_path = root_dir / path_part.lstrip('/')
        else:
            # Relative path from source file's directory
            source_dir = source_file.parent
            target_path = source_dir / path_part

        # Normalize and resolve
        target_path = target_path.resolve()

        # Check existence
        if not target_path.exists():
            return False, 'file not found'

        # Check if target is within root (security: prevent directory traversal)
        try:
            target_path.relative_to(root_dir.resolve())
        except ValueError:
            return False, 'outside repository'

        # TODO: Validate anchor exists in target file (requires parsing markdown headers)
        # For now, just validate file exists

        return True, 'ok'

    except Exception as e:
        return False, f'error: {str(e)}'


def check_links(root_dir: str) -> Tuple[List[Dict], List[Dict]]:
    """
    Check all links in documentation.

    Returns: (all_links, broken_links)
    """
    root_path = Path(root_dir).resolve()
    all_links = []
    broken_links = []

    # Find all markdown files
    md_files = list(root_path.rglob('*.md'))

    # Skip patterns
    skip_patterns = ['node_modules', 'docs/REF_DOC', '/.git/', '/dist/', '/build/']

    for filepath in md_files:
        # Skip excluded paths
        if any(pattern in str(filepath) for pattern in skip_patterns):
            continue

        # Read file content
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}", file=sys.stderr)
            continue

        # Extract links
        try:
            rel_path = filepath.relative_to(root_path)
        except ValueError:
            print(f"Warning: {filepath} is outside root", file=sys.stderr)
            continue

        links = extract_all_links(content, rel_path)

        for link in links:
            url = link['url']
            category = categorize_link(url)
            link['category'] = category

            # Check internal links
            if category == 'internal':
                exists, reason = check_internal_link(url, filepath, root_path)
                link['status'] = 'ok' if exists else 'broken'
                link['reason'] = reason

                if not exists:
                    broken_links.append(link)

            elif category == 'anchor':
                # Anchor-only links always valid (same file)
                link['status'] = 'ok'
                link['reason'] = 'same-file anchor'

            else:
                # External links need manual review
                link['status'] = 'unchecked'
                link['reason'] = 'external link'

            all_links.append(link)

    return all_links, broken_links


def deduplicate_links(links: List[Dict]) -> Dict[str, List[Dict]]:
    """
    Group links by URL for deduplication analysis.

    Returns dict mapping URL -> list of occurrences
    """
    by_url = defaultdict(list)
    for link in links:
        by_url[link['url']].append(link)
    return dict(by_url)


def main():
    """Main entry point."""
    # Accept root directory as argument or use default
    root_dir = sys.argv[1] if len(sys.argv) > 1 else '/home/user/dnschat'

    if not os.path.isdir(root_dir):
        print(f"Error: {root_dir} is not a valid directory", file=sys.stderr)
        sys.exit(1)

    print(f"Checking links in: {root_dir}")
    all_links, broken_links = check_links(root_dir)

    # Group by category
    by_category = defaultdict(list)
    for link in all_links:
        by_category[link['category']].append(link)

    # Create output directory
    output_dir = os.path.join(root_dir, 'reports', 'docs')
    os.makedirs(output_dir, exist_ok=True)

    # Save all links
    all_links_path = os.path.join(output_dir, 'all_links.json')
    with open(all_links_path, 'w', encoding='utf-8') as f:
        json.dump(all_links, f, indent=2, ensure_ascii=False)

    # Save broken links
    broken_links_path = os.path.join(output_dir, 'broken_links.json')
    with open(broken_links_path, 'w', encoding='utf-8') as f:
        json.dump(broken_links, f, indent=2, ensure_ascii=False)

    # Save external links for review
    external_links = [l for l in all_links if l['category'] == 'external']
    external_links_path = os.path.join(output_dir, 'external_links.json')
    with open(external_links_path, 'w', encoding='utf-8') as f:
        json.dump(external_links, f, indent=2, ensure_ascii=False)

    # Deduplicate analysis
    broken_by_url = deduplicate_links(broken_links)

    # Print summary
    print(f"\n{'='*60}")
    print(f"Link Check Complete")
    print(f"{'='*60}")
    print(f"Total links found: {len(all_links)}")

    print(f"\nBy Category:")
    for cat in ['internal', 'external', 'anchor', 'email', 'ftp']:
        count = len(by_category.get(cat, []))
        if count > 0:
            print(f"  {cat:12s}: {count:4d}")

    print(f"\nBroken Internal Links:")
    print(f"  Unique URLs: {len(broken_by_url)}")
    print(f"  Total occurrences: {len(broken_links)}")

    if broken_links:
        print(f"\nTop Broken Links (by frequency):")
        # Sort by frequency
        sorted_broken = sorted(broken_by_url.items(), key=lambda x: len(x[1]), reverse=True)

        for url, occurrences in sorted_broken[:10]:
            print(f"\n  {url}")
            print(f"    Occurrences: {len(occurrences)}")
            print(f"    Reason: {occurrences[0]['reason']}")
            print(f"    Referenced in:")
            for occ in occurrences[:3]:
                print(f"      - {occ['file']}:{occ['line']}")
            if len(occurrences) > 3:
                print(f"      ... and {len(occurrences) - 3} more files")

        if len(sorted_broken) > 10:
            print(f"\n  ... and {len(sorted_broken) - 10} more unique broken links")

    print(f"\nExternal Links: {len(external_links)}")
    print(f"  (Manual review recommended)")

    print(f"\nReports saved to:")
    print(f"  All:      {all_links_path}")
    print(f"  Broken:   {broken_links_path}")
    print(f"  External: {external_links_path}")
    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
