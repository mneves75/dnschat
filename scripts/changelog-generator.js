#!/usr/bin/env node
/**
 * Changelog Generator for DNSChat
 * 
 * Implements the /changelog command functionality as described in docs/CHANGELOG-GUIDE.md
 * 
 * Features:
 * - Analyzes git history and actual file changes
 * - Generates user-friendly changelog entries
 * - Detects first-time contributors
 * - Creates GitHub release notes
 * - Excludes bot contributors
 * - Proper attribution with GitHub links
 * 
 * Usage: node scripts/changelog-generator.js [options]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ChangelogGenerator {
  constructor(options = {}) {
    this.options = {
      since: options.since || this.getLastTag(),
      until: options.until || 'HEAD',
      nextVersion: options.nextVersion || this.getNextVersion(),
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      ...options
    };
    
    this.botPatterns = [
      /\[bot\]$/,
      /^devin-ai-integration/,
      /^blacksmith-sh/,
      /^dependabot/,
      /^github-actions/
    ];
    
    this.categoryKeywords = {
      'Features': ['feat', 'feature', 'add', 'new', 'implement', 'create'],
      'Improvements': ['improve', 'enhance', 'update', 'upgrade', 'refactor', 'optimize'],
      'Bug Fixes': ['fix', 'bug', 'resolve', 'correct', 'patch'],
      'Performance': ['perf', 'performance', 'speed', 'optimize', 'cache'],
      'Developer Experience': ['dev', 'build', 'test', 'ci', 'cd', 'lint', 'format'],
      'Documentation': ['doc', 'docs', 'readme', 'guide', 'comment'],
      'Security': ['security', 'auth', 'permission', 'vulnerability', 'secure']
    };
  }

  /**
   * Main entry point - generates complete changelog
   */
  async generate() {
    try {
      console.log('🚀 DNSChat Changelog Generator');
      console.log('================================\n');
      
      if (this.options.verbose) {
        console.log(`📊 Analysis range: ${this.options.since}..${this.options.until}`);
        console.log(`🏷️  Next version: ${this.options.nextVersion}\n`);
      }
      
      // Get commit data
      const commits = this.getCommits();
      console.log(`📝 Found ${commits.length} commits to analyze\n`);
      
      // Analyze changes
      const changes = this.analyzeChanges(commits);
      
      // Get contributors
      const contributors = this.getContributors();
      const firstTimeContributors = this.getFirstTimeContributors(contributors);
      
      // Generate changelog sections
      const changelogEntry = this.generateChangelogEntry(changes, firstTimeContributors);
      const releaseNotes = this.generateReleaseNotes(changes, firstTimeContributors);
      
      // Output results
      if (this.options.dryRun) {
        console.log('🔍 DRY RUN MODE - Preview output:\n');
        console.log('CHANGELOG.md entry:');
        console.log('='.repeat(50));
        console.log(changelogEntry);
        console.log('\nGitHub Release Notes:');
        console.log('='.repeat(50));
        console.log(releaseNotes);
      } else {
        this.updateChangelog(changelogEntry);
        this.saveReleaseNotes(releaseNotes);
        console.log('✅ Changelog updated successfully!');
        console.log('📝 Release notes saved to release-notes.md');
      }
      
      return { changelogEntry, releaseNotes, changes, firstTimeContributors };
      
    } catch (error) {
      console.error('❌ Error generating changelog:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Get commits since last tag or specified range
   */
  getCommits() {
    const cmd = `git log --format="%H|%an|%ae|%s|%ai" ${this.options.since}..${this.options.until}`;
    const output = execSync(cmd, { encoding: 'utf8' }).trim();
    
    if (!output) return [];
    
    return output.split('\n').map(line => {
      const [hash, author, email, subject, date] = line.split('|');
      return { hash, author, email, subject, date };
    }).filter(commit => !this.isBotContributor(commit));
  }

  /**
   * Analyze commits and categorize changes
   */
  analyzeChanges(commits) {
    const changes = {
      'Features': [],
      'Improvements': [],
      'Bug Fixes': [],
      'Performance': [],
      'Developer Experience': [],
      'Documentation': [],
      'Security': [],
      'Other': []
    };

    commits.forEach(commit => {
      const analysis = this.analyzeCommit(commit);
      const category = this.categorizeCommit(commit, analysis);
      
      changes[category].push({
        ...commit,
        analysis,
        description: this.generateUserFriendlyDescription(commit, analysis),
        attribution: this.generateAttribution(commit)
      });
    });

    // Remove empty categories
    Object.keys(changes).forEach(category => {
      if (changes[category].length === 0) {
        delete changes[category];
      }
    });

    return changes;
  }

  /**
   * Analyze individual commit for file changes and impact
   */
  analyzeCommit(commit) {
    try {
      // Get file changes
      const filesCmd = `git show --name-only --format="" ${commit.hash}`;
      const files = execSync(filesCmd, { encoding: 'utf8' }).trim().split('\n').filter(f => f);
      
      // Get detailed changes
      const diffCmd = `git show --stat ${commit.hash}`;
      const diffStats = execSync(diffCmd, { encoding: 'utf8' });
      
      return {
        files,
        diffStats,
        isBreaking: this.isBreakingChange(commit, files),
        affectedAreas: this.getAffectedAreas(files)
      };
    } catch (error) {
      return { files: [], diffStats: '', isBreaking: false, affectedAreas: [] };
    }
  }

  /**
   * Categorize commit based on content and file changes
   */
  categorizeCommit(commit, analysis) {
    const subject = commit.subject.toLowerCase();
    
    // Check for explicit category indicators
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => subject.includes(keyword))) {
        return category;
      }
    }
    
    // Analyze file changes for implicit categorization
    const { files } = analysis;
    
    if (files.some(f => f.includes('test') || f.includes('spec'))) {
      return 'Developer Experience';
    }
    
    if (files.some(f => f.includes('doc') || f.includes('README') || f.includes('.md'))) {
      return 'Documentation';
    }
    
    if (files.some(f => f.includes('src/') || f.includes('ios/') || f.includes('android/'))) {
      return subject.includes('fix') ? 'Bug Fixes' : 'Features';
    }
    
    return 'Other';
  }

  /**
   * Generate user-friendly description from commit
   */
  generateUserFriendlyDescription(commit, analysis) {
    let description = commit.subject;
    
    // Remove technical prefixes
    description = description.replace(/^(feat|fix|docs|style|refactor|test|chore|perf)(\(.+\))?:\s*/i, '');
    
    // Remove emoji if it's just decorative
    description = description.replace(/^[📱🚀🔧🐛⚡🎯📋💡🛡️]+\s*/, '');
    
    // Capitalize first letter
    description = description.charAt(0).toUpperCase() + description.slice(1);
    
    // Add context based on file changes
    if (analysis.affectedAreas.length > 0) {
      const areas = analysis.affectedAreas.join(', ');
      if (!description.toLowerCase().includes(areas.toLowerCase())) {
        description += ` (${areas})`;
      }
    }
    
    return description;
  }

  /**
   * Generate attribution for commit
   */
  generateAttribution(commit) {
    if (this.isBotContributor(commit)) {
      return null;
    }
    
    // For now, return basic attribution
    // In a real implementation, you'd map email to GitHub username
    const username = this.getGitHubUsername(commit.email) || commit.author.replace(/\s+/g, '').toLowerCase();
    return `(via [@${username}](https://github.com/${username}))`;
  }

  /**
   * Get contributors for the range
   */
  getContributors() {
    const cmd = `git log --format="%an|%ae" ${this.options.since}..${this.options.until} | sort -u`;
    const output = execSync(cmd, { encoding: 'utf8' }).trim();
    
    if (!output) return [];
    
    return output.split('\n').map(line => {
      const [name, email] = line.split('|');
      return { name, email };
    }).filter(contributor => !this.isBotContributor(contributor));
  }

  /**
   * Detect first-time contributors
   */
  getFirstTimeContributors(contributors) {
    if (!this.options.since || this.options.since === 'HEAD') {
      return [];
    }
    
    const previousCmd = `git log --format="%an|%ae" ${this.options.since} | sort -u`;
    let previousContributors = [];
    
    try {
      const output = execSync(previousCmd, { encoding: 'utf8' }).trim();
      if (output) {
        previousContributors = output.split('\n').map(line => {
          const [name, email] = line.split('|');
          return email;
        });
      }
    } catch (error) {
      // If no previous commits, all are first-time
      return contributors;
    }
    
    return contributors.filter(contributor => 
      !previousContributors.includes(contributor.email)
    );
  }

  /**
   * Generate changelog entry for CHANGELOG.md
   */
  generateChangelogEntry(changes, firstTimeContributors) {
    const date = new Date().toISOString().split('T')[0];
    let entry = `## [${this.options.nextVersion}] - ${date}\n\n`;
    
    // Add categories
    Object.entries(changes).forEach(([category, items]) => {
      entry += `### ${category}\n\n`;
      items.forEach(item => {
        const attribution = item.attribution ? ` ${item.attribution}` : '';
        entry += `- ${item.description}${attribution}\n`;
      });
      entry += '\n';
    });
    
    // Add first-time contributors if any
    if (firstTimeContributors.length > 0) {
      entry += '### First-time Contributors\n\n';
      firstTimeContributors.forEach(contributor => {
        const username = this.getGitHubUsername(contributor.email) || contributor.name.replace(/\s+/g, '').toLowerCase();
        entry += `- [@${username}](https://github.com/${username}) - ${contributor.name}\n`;
      });
      entry += '\n';
    }
    
    return entry;
  }

  /**
   * Generate GitHub release notes
   */
  generateReleaseNotes(changes, firstTimeContributors) {
    let notes = `## Highlights\n\n`;
    
    // Get top 3 most significant changes
    const highlights = this.getHighlights(changes);
    highlights.forEach(highlight => {
      notes += `- ${highlight.icon} ${highlight.description}\n`;
    });
    
    notes += `\n## What's Changed\n\n`;
    
    // Add all changes
    Object.entries(changes).forEach(([category, items]) => {
      notes += `### ${category}\n\n`;
      items.forEach(item => {
        const attribution = item.attribution ? ` ${item.attribution}` : '';
        notes += `- ${item.description}${attribution}\n`;
      });
      notes += '\n';
    });
    
    // Add first-time contributors
    if (firstTimeContributors.length > 0) {
      notes += '## First-time Contributors\n\n';
      firstTimeContributors.forEach(contributor => {
        const username = this.getGitHubUsername(contributor.email) || contributor.name.replace(/\s+/g, '').toLowerCase();
        notes += `- @${username} made their first contribution\n`;
      });
      notes += '\n';
    }
    
    notes += '## Installation\n\n';
    notes += 'See [installation instructions](https://github.com/mneves75/dnschat#installation)\n';
    
    return notes;
  }

  /**
   * Get highlights for release notes
   */
  getHighlights(changes) {
    const highlights = [];
    const categoryIcons = {
      'Features': '🎯',
      'Bug Fixes': '🐛',
      'Performance': '⚡',
      'Security': '🛡️',
      'Improvements': '🔧'
    };
    
    // Get one highlight from each major category
    ['Features', 'Bug Fixes', 'Performance', 'Security', 'Improvements'].forEach(category => {
      if (changes[category] && changes[category].length > 0) {
        const item = changes[category][0]; // Take first item
        highlights.push({
          icon: categoryIcons[category] || '✨',
          description: item.description.split('(')[0].trim() // Remove attribution for highlights
        });
      }
    });
    
    return highlights.slice(0, 3); // Max 3 highlights
  }

  /**
   * Utility methods
   */
  
  getLastTag() {
    try {
      return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'HEAD~10'; // Fallback to last 10 commits
    }
  }

  getNextVersion() {
    const lastTag = this.getLastTag();
    if (lastTag.startsWith('v')) {
      return lastTag.slice(1);
    }
    return '1.7.4'; // Default next version
  }

  isBotContributor(contributor) {
    const email = contributor.email || '';
    const name = contributor.name || contributor.author || '';
    
    return this.botPatterns.some(pattern => 
      pattern.test(email) || pattern.test(name)
    );
  }

  getGitHubUsername(email) {
    // Simple mapping - in production, this could use GitHub API
    const emailMap = {
      'mvneves@users.noreply.github.com': 'mneves75',
      // Add more mappings as needed
    };
    
    return emailMap[email];
  }

  isBreakingChange(commit, files) {
    const subject = commit.subject.toLowerCase();
    return subject.includes('breaking') || 
           subject.includes('major:') ||
           files.some(f => f.includes('package.json') && subject.includes('bump'));
  }

  getAffectedAreas(files) {
    const areas = new Set();
    
    files.forEach(file => {
      if (file.startsWith('ios/')) areas.add('iOS');
      if (file.startsWith('android/')) areas.add('Android');
      if (file.startsWith('src/')) areas.add('Core');
      if (file.includes('test')) areas.add('Testing');
      if (file.includes('doc') || file.endsWith('.md')) areas.add('Documentation');
      if (file === 'package.json' || file === 'app.json') areas.add('Configuration');
    });
    
    return Array.from(areas);
  }

  updateChangelog(entry) {
    const changelogPath = 'CHANGELOG.md';
    const content = fs.readFileSync(changelogPath, 'utf8');
    
    // Insert after "## [Unreleased]" section
    const unreleasedIndex = content.indexOf('## [Unreleased]');
    if (unreleasedIndex === -1) {
      throw new Error('Could not find [Unreleased] section in CHANGELOG.md');
    }
    
    const nextLineIndex = content.indexOf('\n', unreleasedIndex);
    const beforeUnreleased = content.substring(0, nextLineIndex + 1);
    const afterUnreleased = content.substring(nextLineIndex + 1);
    
    const newContent = beforeUnreleased + '\n' + entry + afterUnreleased;
    fs.writeFileSync(changelogPath, newContent);
  }

  saveReleaseNotes(notes) {
    fs.writeFileSync('release-notes.md', notes);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    
    if (key === 'dry-run') {
      options.dryRun = true;
      i--; // No value for this flag
    } else if (key === 'verbose') {
      options.verbose = true;
      i--; // No value for this flag
    } else if (value) {
      options[key] = value;
    }
  }
  
  const generator = new ChangelogGenerator(options);
  generator.generate();
}

module.exports = ChangelogGenerator;