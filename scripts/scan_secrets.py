#!/usr/bin/env python3
"""
Secret Scanner for Repository

Production-grade secret detection with:
- Pattern matching for known secret formats
- Shannon entropy analysis for high-entropy strings
- Confidence scoring to reduce false positives
- Comprehensive exclusion rules

Security Note: This scanner is designed to catch common secrets. It is not
a substitute for proper secret management practices. Never commit secrets.
"""

import os
import re
import sys
import json
import math
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple, Optional
from collections import defaultdict


# High-confidence secret patterns (well-defined formats)
HIGH_CONFIDENCE_PATTERNS = {
    'aws_access_key': {
        'pattern': r'\b((?:AKIA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16})\b',
        'description': 'AWS Access Key ID',
        'entropy_min': 3.5
    },
    'github_token_new': {
        'pattern': r'\b(gh[pousr]_[A-Za-z0-9_]{36,251})\b',
        'description': 'GitHub Token (Fine-grained)',
        'entropy_min': 4.0
    },
    'slack_token': {
        'pattern': r'\b(xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,})\b',
        'description': 'Slack Token',
        'entropy_min': 3.8
    },
    'stripe_live_key': {
        'pattern': r'\b([rs]k_live_[0-9a-zA-Z]{24,})\b',
        'description': 'Stripe Live Key',
        'entropy_min': 3.5
    },
    'google_api_key': {
        'pattern': r'\b(AIza[0-9A-Za-z\-_]{35})\b',
        'description': 'Google API Key',
        'entropy_min': 3.5
    },
    'private_key_header': {
        'pattern': r'-----BEGIN[A-Z ]+PRIVATE KEY-----',
        'description': 'Private Key (PEM format)',
        'entropy_min': 0.0  # Header doesn't need entropy check
    },
}

# Medium-confidence patterns (require context analysis)
MEDIUM_CONFIDENCE_PATTERNS = {
    'generic_api_key': {
        'pattern': r'(?i)(?:api[_-]?key|apikey)[\s]*[=:]+[\s]*[\'"]?([a-zA-Z0-9\-_]{20,})[\'"]?',
        'description': 'Generic API Key',
        'entropy_min': 4.0  # Higher entropy required for generic pattern
    },
    'password_assignment': {
        'pattern': r'(?i)(?:password|passwd|pwd)[\s]*[=:]+[\s]*[\'"]([^\'"\s]{8,})[\'"]',
        'description': 'Password Assignment',
        'entropy_min': 3.5
    },
    'jwt_token': {
        'pattern': r'\b(eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+)\b',
        'description': 'JSON Web Token',
        'entropy_min': 4.5  # JWTs should have high entropy
    },
}

# File extensions to scan (text files only)
SCANNABLE_EXTENSIONS = {
    '.js', '.ts', '.jsx', '.tsx', '.json', '.env', '.yml', '.yaml',
    '.xml', '.txt', '.md', '.sh', '.bash', '.py', '.rb', '.go',
    '.java', '.kt', '.swift', '.m', '.h', '.c', '.cpp', '.cs',
    '.php', '.pl', '.r', '.scala', '.sql', '.toml', '.ini', '.cfg',
    '.conf', '.config'
}

# Paths to skip (performance and noise reduction)
SKIP_PATH_PATTERNS = [
    'node_modules',
    '.git',
    'vendor',
    'dist',
    'build',
    'docs/REF_DOC',
    '.claude/skills',
    '__pycache__',
    '*.min.js',
    '*.min.css',
    '*.bundle.js',
]

# Files to skip entirely
SKIP_FILE_PATTERNS = [
    'package-lock.json',  # Contains integrity hashes that trigger patterns
    'yarn.lock',
    'Gemfile.lock',
    'Cargo.lock',
    'poetry.lock',
    '*.test.js',
    '*.spec.js',
    '*.test.ts',
    '*.spec.ts',
]

# Max file size to scan (bytes) - skip huge files
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Known false positive strings
FALSE_POSITIVE_INDICATORS = [
    'example', 'sample', 'test', 'demo', 'placeholder',
    'YOUR_API_KEY', 'INSERT_KEY_HERE', 'REPLACE_ME',
    'xxxxxxxx', '00000000',
    'AKIAIOSFODNN7EXAMPLE',  # AWS documentation example
    'wJalrXUtnFEMI/K7MDENG',  # AWS documentation example
]

# Known safe patterns (entropy can be high but not secrets)
SAFE_PATTERNS = [
    r'sha\d+[-:]?[a-f0-9]+',  # SHA hashes (e.g., sha256:abc123...)
    r'md5[-:]?[a-f0-9]{32}',  # MD5 hashes
    r'[a-f0-9]{40}',  # Git commit SHAs
    r'[a-f0-9]{64}',  # SHA256 hashes
    r'integrity[\s]*[=:][\s]*[\'"]?sha\d+',  # package.json integrity
]


def calculate_entropy(string: str) -> float:
    """
    Calculate Shannon entropy of a string.

    Returns entropy value (0-8 for typical strings, higher = more random).
    Typical values:
    - Low entropy (< 3.0): "aaaaa", "12345", "password"
    - Medium entropy (3.0-4.5): "P@ssw0rd", "MyAPIKey"
    - High entropy (> 4.5): "hK9x2Lp8Q7mW3vN5", random tokens
    """
    if not string:
        return 0.0

    # Count character frequencies
    freq = defaultdict(int)
    for char in string:
        freq[char] += 1

    # Calculate Shannon entropy
    entropy = 0.0
    length = len(string)

    for count in freq.values():
        probability = count / length
        if probability > 0:
            entropy -= probability * math.log2(probability)

    return entropy


def is_safe_pattern(string: str) -> bool:
    """Check if string matches a known safe pattern (hash, etc.)."""
    for pattern in SAFE_PATTERNS:
        if re.search(pattern, string, re.IGNORECASE):
            return True
    return False


def is_false_positive(secret: str, context: str, filepath: str) -> Tuple[bool, Optional[str]]:
    """
    Determine if a match is likely a false positive.

    Returns: (is_false_positive, reason)
    """
    secret_lower = secret.lower()
    context_lower = context.lower()
    path_lower = str(filepath).lower()

    # Check for false positive indicators in content
    for indicator in FALSE_POSITIVE_INDICATORS:
        if indicator in secret_lower or indicator in context_lower:
            return True, f'contains "{indicator}"'

    # Check if in test/example file
    test_indicators = ['test', 'example', 'sample', 'demo', 'fixture', 'mock']
    for indicator in test_indicators:
        if indicator in path_lower:
            return True, f'in {indicator} file'

    # Check for comment indicators
    comment_patterns = [r'//.*example', r'#.*test', r'/\*.*sample', r'<!--.*demo']
    for pattern in comment_patterns:
        if re.search(pattern, context, re.IGNORECASE):
            return True, 'in example/test comment'

    # Check safe patterns (hashes, etc.)
    if is_safe_pattern(secret):
        return True, 'matches safe pattern (hash/checksum)'

    return False, None


def should_skip_file(filepath: Path) -> Tuple[bool, str]:
    """
    Determine if file should be skipped.

    Returns: (should_skip, reason)
    """
    path_str = str(filepath)

    # Check path patterns
    for pattern in SKIP_PATH_PATTERNS:
        if pattern in path_str:
            return True, f'path matches {pattern}'

    # Check file patterns
    filename = filepath.name
    for pattern in SKIP_FILE_PATTERNS:
        if pattern.startswith('*.'):
            if filename.endswith(pattern[1:]):
                return True, f'matches {pattern}'
        elif pattern == filename:
            return True, f'matches {pattern}'

    # Check extension
    ext = filepath.suffix.lower()
    if ext and ext not in SCANNABLE_EXTENSIONS:
        return True, f'unscannable extension {ext}'

    # Check file size
    try:
        if filepath.stat().st_size > MAX_FILE_SIZE:
            return True, f'file too large (>{MAX_FILE_SIZE/1024/1024:.1f}MB)'
    except OSError:
        return True, 'cannot stat file'

    return False, ''


def scan_file(filepath: Path, root_dir: Path) -> List[Dict]:
    """
    Scan a single file for secrets.

    Returns list of findings with metadata.
    """
    findings = []

    # Read file content
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception:
        return findings

    lines = content.split('\n')

    # Combine pattern dictionaries with confidence levels
    patterns_with_confidence = [
        (HIGH_CONFIDENCE_PATTERNS, 'high'),
        (MEDIUM_CONFIDENCE_PATTERNS, 'medium'),
    ]

    for pattern_dict, confidence in patterns_with_confidence:
        for pattern_name, pattern_info in pattern_dict.items():
            regex = pattern_info['pattern']
            min_entropy = pattern_info['entropy_min']

            for match in re.finditer(regex, content):
                # Extract the secret (group 1 if exists, else group 0)
                secret = match.group(1) if match.lastindex and match.lastindex >= 1 else match.group(0)

                # Check entropy requirement
                entropy = calculate_entropy(secret)
                if entropy < min_entropy:
                    continue

                # Find line number
                line_num = content[:match.start()].count('\n') + 1

                # Get context (5 lines around match)
                context_start = max(0, line_num - 3)
                context_end = min(len(lines), line_num + 2)
                context = '\n'.join(lines[context_start:context_end])

                # Check false positives
                is_fp, fp_reason = is_false_positive(secret, context, filepath)
                if is_fp:
                    # Still record but mark as likely false positive
                    findings.append({
                        'type': pattern_name,
                        'description': pattern_info['description'],
                        'file': str(filepath.relative_to(root_dir)),
                        'line': line_num,
                        'secret': mask_secret(secret),
                        'secret_length': len(secret),
                        'entropy': round(entropy, 2),
                        'confidence': 'false_positive',
                        'fp_reason': fp_reason,
                        'context_preview': context[:100] + '...' if len(context) > 100 else context
                    })
                    continue

                # Real finding
                findings.append({
                    'type': pattern_name,
                    'description': pattern_info['description'],
                    'file': str(filepath.relative_to(root_dir)),
                    'line': line_num,
                    'secret': mask_secret(secret),
                    'secret_length': len(secret),
                    'entropy': round(entropy, 2),
                    'confidence': confidence,
                    'context_preview': context[:100] + '...' if len(context) > 100 else context
                })

    return findings


def mask_secret(secret: str, reveal: int = 4) -> str:
    """
    Mask secret showing only first/last few characters.

    For security, even masked secrets should not be overly revealing.
    """
    if len(secret) <= reveal * 2:
        # Very short strings - mask completely
        return '*' * min(len(secret), 16)

    return secret[:reveal] + '*' * min(len(secret) - reveal * 2, 32) + secret[-reveal:]


def scan_repository(root_dir: str) -> Dict:
    """
    Scan entire repository for secrets.

    Returns dict with findings and statistics.
    """
    root_path = Path(root_dir).resolve()
    all_findings = []
    stats = {
        'files_scanned': 0,
        'files_skipped': 0,
        'skip_reasons': defaultdict(int)
    }

    for filepath in root_path.rglob('*'):
        if not filepath.is_file():
            continue

        # Check if should skip
        should_skip, reason = should_skip_file(filepath)
        if should_skip:
            stats['files_skipped'] += 1
            stats['skip_reasons'][reason] += 1
            continue

        # Scan file
        stats['files_scanned'] += 1
        findings = scan_file(filepath, root_path)
        all_findings.extend(findings)

    return {
        'findings': all_findings,
        'stats': stats
    }


def main():
    """Main entry point."""
    # Accept root directory as argument or use default
    root_dir = sys.argv[1] if len(sys.argv) > 1 else '/home/user/dnschat'

    if not os.path.isdir(root_dir):
        print(f"Error: {root_dir} is not a valid directory", file=sys.stderr)
        sys.exit(1)

    print(f"Starting secret scan of: {root_dir}")
    print("This may take a moment...\n")

    result = scan_repository(root_dir)
    findings = result['findings']
    stats = result['stats']

    # Separate real findings from false positives
    real_findings = [f for f in findings if f.get('confidence') != 'false_positive']
    false_positives = [f for f in findings if f.get('confidence') == 'false_positive']

    # Save results
    output_dir = os.path.join(root_dir, 'reports', 'secrets')
    os.makedirs(output_dir, exist_ok=True)

    # Full report
    report = {
        'scan_date': datetime.now().isoformat(),
        'scan_directory': str(root_dir),
        'statistics': {
            'files_scanned': stats['files_scanned'],
            'files_skipped': stats['files_skipped'],
            'total_findings': len(findings),
            'real_findings': len(real_findings),
            'false_positives': len(false_positives),
        },
        'findings': real_findings,
        'false_positives': false_positives,
    }

    report_path = os.path.join(output_dir, 'scan_results.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    # Print summary
    print(f"{'='*60}")
    print(f"Secret Scan Complete")
    print(f"{'='*60}")
    print(f"Files scanned: {stats['files_scanned']}")
    print(f"Files skipped: {stats['files_skipped']}")

    print(f"\nFindings:")
    print(f"  Real secrets (high/medium confidence): {len(real_findings)}")
    print(f"  Likely false positives: {len(false_positives)}")

    if real_findings:
        print(f"\n{'!'*60}")
        print(f"WARNING: {len(real_findings)} POTENTIAL SECRETS FOUND!")
        print(f"{'!'*60}")

        # Group by confidence
        by_confidence = defaultdict(list)
        for finding in real_findings:
            by_confidence[finding['confidence']].append(finding)

        for conf in ['high', 'medium']:
            items = by_confidence[conf]
            if items:
                print(f"\n{conf.upper()} Confidence ({len(items)} findings):")
                for finding in items[:5]:
                    print(f"  - {finding['file']}:{finding['line']}")
                    print(f"    Type: {finding['description']}")
                    print(f"    Secret: {finding['secret']} (entropy: {finding['entropy']})")
                if len(items) > 5:
                    print(f"  ... and {len(items) - 5} more")

        print(f"\nACTION REQUIRED:")
        print(f"1. Review findings in: {report_path}")
        print(f"2. Revoke/rotate any real secrets immediately")
        print(f"3. Remove secrets from repository")
        print(f"4. Consider using environment variables or secret management")

    else:
        print(f"\nNo high/medium confidence secrets detected.")

    if false_positives:
        print(f"\n{len(false_positives)} likely false positives filtered out.")

    print(f"\nFull report: {report_path}")
    print(f"{'='*60}\n")

    # Exit with error code if secrets found
    sys.exit(1 if real_findings else 0)


if __name__ == '__main__':
    main()
