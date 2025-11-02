#!/usr/bin/env python3
"""
Secret Scanner for Repository
Scans for common secret patterns in code and configuration files
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

# Common secret patterns
SECRET_PATTERNS = {
    'aws_access_key': {
        'pattern': r'(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}',
        'description': 'AWS Access Key ID'
    },
    'aws_secret_key': {
        'pattern': r'aws.{0,20}?[\'"\s][0-9a-zA-Z/+]{40}[\'"\s]',
        'description': 'AWS Secret Access Key'
    },
    'github_token': {
        'pattern': r'gh[pousr]_[A-Za-z0-9_]{36,251}',
        'description': 'GitHub Token'
    },
    'github_classic': {
        'pattern': r'[gG][iI][tT][hH][uU][bB].*[\'"\s][0-9a-zA-Z]{35,40}[\'"\s]',
        'description': 'GitHub Classic Token'
    },
    'api_key_generic': {
        'pattern': r'[aA][pP][iI][-_]?[kK][eE][yY].*[\'"\s][0-9a-zA-Z]{20,}[\'"\s]',
        'description': 'Generic API Key'
    },
    'private_key': {
        'pattern': r'-----BEGIN [A-Z]+ PRIVATE KEY-----',
        'description': 'Private Key'
    },
    'slack_token': {
        'pattern': r'xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,}',
        'description': 'Slack Token'
    },
    'stripe_key': {
        'pattern': r'(?:r|s)k_live_[0-9a-zA-Z]{24,}',
        'description': 'Stripe Live Key'
    },
    'google_api': {
        'pattern': r'AIza[0-9A-Za-z-_]{35}',
        'description': 'Google API Key'
    },
    'password_in_url': {
        'pattern': r'[a-zA-Z]{3,10}://[^:@/\s]*:[^:@/\s]+@[^\s]+',
        'description': 'Password in URL'
    },
    'jwt': {
        'pattern': r'eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+',
        'description': 'JSON Web Token'
    }
}

# Files to skip
SKIP_PATTERNS = [
    'node_modules',
    '.git',
    'vendor',
    'dist',
    'build',
    '*.min.js',
    '*.bundle.js',
    'docs/REF_DOC',
    '.claude/skills',
    'test-fixtures',
    'test_data',
    '__tests__',
    '*.test.js',
    '*.spec.js'
]

# Known false positives
FALSE_POSITIVES = [
    'example',
    'sample',
    'test',
    'demo',
    'placeholder',
    'AKIA00000000000000000',  # Example AWS key
    'AKIAIOSFODNN7EXAMPLE',    # AWS docs example
]

def should_skip_file(filepath):
    """Check if file should be skipped"""
    path_str = str(filepath)

    for pattern in SKIP_PATTERNS:
        if pattern in path_str:
            return True

    # Skip binary files by extension
    binary_exts = {'.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.tar', '.gz', '.exe', '.dll', '.so', '.dylib'}
    if filepath.suffix.lower() in binary_exts:
        return True

    return False

def mask_secret(secret, reveal=4):
    """Mask secret showing only first/last few chars"""
    if len(secret) <= reveal * 2:
        return '*' * len(secret)
    return secret[:reveal] + '*' * (len(secret) - reveal * 2) + secret[-reveal:]

def is_false_positive(match, context):
    """Check if match is likely a false positive"""
    match_lower = match.lower()
    context_lower = context.lower()

    for fp in FALSE_POSITIVES:
        if fp in match_lower or fp in context_lower:
            return True

    return False

def scan_file(filepath, root_dir):
    """Scan a single file for secrets"""
    findings = []

    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        return findings

    lines = content.split('\n')

    for pattern_name, pattern_info in SECRET_PATTERNS.items():
        pattern = pattern_info['pattern']
        matches = re.finditer(pattern, content, re.MULTILINE | re.IGNORECASE)

        for match in matches:
            secret = match.group(0)

            # Find line number
            line_num = content[:match.start()].count('\n') + 1

            # Get context (surrounding lines)
            context_start = max(0, line_num - 2)
            context_end = min(len(lines), line_num + 2)
            context = '\n'.join(lines[context_start:context_end])

            # Check false positives
            if is_false_positive(secret, context):
                continue

            findings.append({
                'type': pattern_name,
                'description': pattern_info['description'],
                'file': str(filepath.relative_to(root_dir)),
                'line': line_num,
                'secret': mask_secret(secret),
                'secret_length': len(secret),
                'context': mask_secret(context, reveal=8)
            })

    return findings

def scan_repository(root_dir):
    """Scan entire repository for secrets"""
    root_path = Path(root_dir)
    all_findings = []

    # Scan all files
    for filepath in root_path.rglob('*'):
        if not filepath.is_file():
            continue

        if should_skip_file(filepath):
            continue

        findings = scan_file(filepath, root_path)
        all_findings.extend(findings)

    return all_findings

def main():
    root_dir = '/home/user/dnschat'
    print("Starting secret scan...")

    findings = scan_repository(root_dir)

    # Save results
    output_dir = f'{root_dir}/reports/secrets'
    os.makedirs(output_dir, exist_ok=True)

    # Save full report (masked)
    report = {
        'scan_date': datetime.now().isoformat(),
        'total_findings': len(findings),
        'findings': findings
    }

    with open(f'{output_dir}/scan_results.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

    # Group by type
    by_type = {}
    for finding in findings:
        ftype = finding['type']
        if ftype not in by_type:
            by_type[ftype] = []
        by_type[ftype].append(finding)

    # Print summary
    print(f"\nSecret Scan Complete")
    print(f"Total findings: {len(findings)}")

    if findings:
        print(f"\nFindings by Type:")
        for ftype, items in sorted(by_type.items()):
            print(f"  {ftype}: {len(items)}")

        print(f"\nFirst 5 findings:")
        for finding in findings[:5]:
            print(f"  - {finding['file']}:{finding['line']} - {finding['description']}")
            print(f"    Secret (masked): {finding['secret']}")

        if len(findings) > 5:
            print(f"  ... and {len(findings) - 5} more")

        print(f"\nWARNING: {len(findings)} potential secrets found!")
        print(f"Review report at: {output_dir}/scan_results.json")
    else:
        print(f"\nNo secrets detected in HEAD.")

    print(f"\nReport saved to: {output_dir}/scan_results.json")

if __name__ == '__main__':
    main()
