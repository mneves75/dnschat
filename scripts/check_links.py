#!/usr/bin/env python3
"""
Link Checker for Documentation
Checks both internal and external links in markdown files
"""

import os
import re
import json
from pathlib import Path
from urllib.parse import urlparse
import subprocess

def extract_all_links(content, filepath):
    """Extract all links (internal and external) from markdown"""
    links = []

    # Markdown link pattern: [text](url)
    md_links = re.findall(r'\[([^\]]*)\]\(([^\)]+)\)', content)
    for text, url in md_links:
        links.append({
            'text': text,
            'url': url,
            'type': 'markdown',
            'file': str(filepath)
        })

    # Bare URLs
    bare_urls = re.findall(r'(?<!\()(https?://[^\s\)>\]]+)', content)
    for url in bare_urls:
        links.append({
            'text': '',
            'url': url,
            'type': 'bare',
            'file': str(filepath)
        })

    return links

def check_internal_link(link_url, source_file, root_dir):
    """Check if internal link target exists"""
    # Remove anchor
    path_part = link_url.split('#')[0]
    if not path_part:
        return True  # Anchor-only link to same file

    source_dir = os.path.dirname(source_file)

    # Resolve relative path
    if path_part.startswith('/'):
        target_path = Path(root_dir) / path_part.lstrip('/')
    else:
        target_path = Path(source_dir) / path_part

    return target_path.exists()

def categorize_link(url):
    """Categorize link as internal, external, or anchor"""
    if url.startswith('#'):
        return 'anchor'
    elif url.startswith(('http://', 'https://', 'ftp://')):
        return 'external'
    elif url.startswith('mailto:'):
        return 'email'
    else:
        return 'internal'

def check_links(root_dir):
    """Check all links in documentation"""
    root_path = Path(root_dir)
    all_links = []
    broken_links = []

    # Find all markdown files
    md_files = list(root_path.rglob('*.md'))

    for filepath in md_files:
        # Skip node_modules and hidden dirs (except .claude and .github)
        skip_patterns = ['node_modules', 'docs/REF_DOC']
        if any(pattern in str(filepath) for pattern in skip_patterns):
            continue

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            continue

        links = extract_all_links(content, filepath.relative_to(root_path))

        for link in links:
            category = categorize_link(link['url'])
            link['category'] = category

            # Check internal links
            if category == 'internal':
                exists = check_internal_link(link['url'], filepath, root_dir)
                link['status'] = 'ok' if exists else 'broken'

                if not exists:
                    broken_links.append(link)
            else:
                # External links - mark for manual review
                link['status'] = 'unchecked'

            all_links.append(link)

    return all_links, broken_links

def main():
    root_dir = '/home/user/dnschat'
    all_links, broken_links = check_links(root_dir)

    # Group by category
    by_category = {}
    for link in all_links:
        cat = link['category']
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(link)

    # Save results
    output_dir = f'{root_dir}/reports/docs'
    os.makedirs(output_dir, exist_ok=True)

    # All links
    with open(f'{output_dir}/all_links.json', 'w', encoding='utf-8') as f:
        json.dump(all_links, f, indent=2)

    # Broken links
    with open(f'{output_dir}/broken_links.json', 'w', encoding='utf-8') as f:
        json.dump(broken_links, f, indent=2)

    # External links for review
    external_links = [l for l in all_links if l['category'] == 'external']
    with open(f'{output_dir}/external_links.json', 'w', encoding='utf-8') as f:
        json.dump(external_links, f, indent=2)

    # Print summary
    print(f"Link Check Complete")
    print(f"Total links found: {len(all_links)}")
    print(f"\nBy Category:")
    for cat, links in sorted(by_category.items()):
        print(f"  {cat}: {len(links)}")

    print(f"\nBroken internal links: {len(broken_links)}")
    if broken_links:
        print("\nBroken Links:")
        for link in broken_links[:10]:  # Show first 10
            print(f"  - {link['file']}: {link['url']}")
        if len(broken_links) > 10:
            print(f"  ... and {len(broken_links) - 10} more")

    print(f"\nExternal links (manual review needed): {len(external_links)}")

    print(f"\nReports saved to:")
    print(f"  - {output_dir}/all_links.json")
    print(f"  - {output_dir}/broken_links.json")
    print(f"  - {output_dir}/external_links.json")

if __name__ == '__main__':
    main()
