# Sparse Checkout Guide: chatdns-new-generation-ui Branch

## Overview

The `chatdns-new-generation-ui` branch uses Git sparse checkout to focus development on the `TESTES_UI/new_ui_messages/dnschat-ng/` directory while maintaining access to root-level configuration files.

## Current Configuration

**Branch**: `chatdns-new-generation-ui`
- **Parent Branch**: `ios26-liquid-glass-20251010`
- **Visible Files**: 42% of tracked files (527 files from dnschat-ng + root configs)
- **Hidden Files**: All other directories (`app/`, `src/`, `ios/`, `android/` from root project)

## Working Directory Structure

```
chat-dns/
├── .gitignore, CLAUDE.md, CHANGELOG.md, README.md (root files)
├── package.json, tsconfig.json (root configs)
└── TESTES_UI/
    └── new_ui_messages/
        └── dnschat-ng/          # PRIMARY SOURCE FOLDER
            ├── app/              # Expo Router screens
            ├── components/       # UI components
            ├── context/          # React Context providers
            ├── services/         # DNS and storage
            ├── ios/              # iOS native code
            ├── modules/          # Custom native modules
            ├── package.json      # dnschat-ng dependencies
            ├── CLAUDE.md         # Project-specific docs
            └── ... (all dnschat-ng files)
```

## Sparse Checkout Pattern

Located in `.git/info/sparse-checkout`:

```
/*
!/*/
/TESTES_UI/
!/TESTES_UI/*/
/TESTES_UI/new_ui_messages/
!/TESTES_UI/new_ui_messages/*/
/TESTES_UI/new_ui_messages/dnschat-ng/
```

**Pattern Explanation**:
- `/*` - Include all files in root directory
- `!/*/` - Exclude all subdirectories in root
- `/TESTES_UI/new_ui_messages/dnschat-ng/` - Explicitly include dnschat-ng path

## Development Commands

### Navigate to Primary Folder

```bash
cd TESTES_UI/new_ui_messages/dnschat-ng
```

### Run Development Server

```bash
# Start Expo dev server
npm start

# Build for iOS (requires development build)
npm run ios

# Build for Android (requires development build)
npm run android

# Run on web
npm run web
```

### Install Dependencies

```bash
cd TESTES_UI/new_ui_messages/dnschat-ng
npm install
```

## Git Operations

### Check Sparse Checkout Status

```bash
# Show current branch
git branch --show-current

# List sparse checkout paths
git sparse-checkout list

# View sparse checkout patterns
cat .git/info/sparse-checkout

# Count tracked files
git ls-files | wc -l
```

### Switch Branches

```bash
# Switch to parent branch
git checkout ios26-liquid-glass-20251010

# Switch back to sparse checkout branch
git checkout chatdns-new-generation-ui

# Note: Sparse checkout configuration persists across branch switches
```

### Modify Sparse Checkout

```bash
# Add additional paths
git sparse-checkout add path/to/directory

# Set new paths (replaces current configuration)
git sparse-checkout set TESTES_UI/new_ui_messages/dnschat-ng

# Disable sparse checkout (show all files)
git sparse-checkout disable

# Re-enable sparse checkout
git sparse-checkout init --cone
git sparse-checkout set TESTES_UI/new_ui_messages/dnschat-ng
```

### Merge Changes from Main

```bash
# Merge latest changes from main branch
git merge main

# Or merge from other branches
git merge feature-branch-name
```

### Push Branch to Remote

```bash
# First push (set upstream)
git push -u origin chatdns-new-generation-ui

# Subsequent pushes
git push
```

## Important Notes

### Full History Maintained

The `.git` directory contains the complete repository history for all branches. Sparse checkout only affects the **working directory** - you can access any file from any branch using Git commands.

### Root Files Available

All root-level files are accessible:
- `CLAUDE.md` - Repository guidelines
- `CHANGELOG.md` - Version history
- `README.md` - Project overview
- `package.json` - Root dependencies
- `.gitignore` - Git ignore rules
- Configuration files

### Branch Ancestry

This branch was created from `ios26-liquid-glass-20251010`, not `main`. The dnschat-ng directory only exists in branches derived from `ios26-liquid-glass-20251010`.

### Sparse Checkout Persistence

The sparse checkout configuration remains active when switching branches. To work on other parts of the repository:

```bash
# Temporarily disable sparse checkout
git sparse-checkout disable

# Work on other files...

# Re-enable sparse checkout
git sparse-checkout init --cone
git sparse-checkout set TESTES_UI/new_ui_messages/dnschat-ng
```

### Working with Multiple Projects

If you need to work on both the root project and dnschat-ng simultaneously, consider using Git worktrees:

```bash
# Create a worktree for the root project
git worktree add ../chat-dns-root main

# Work in separate directories:
# - /Users/mvneves/dev/MOBILE/chat-dns (sparse: dnschat-ng only)
# - /Users/mvneves/dev/MOBILE/chat-dns-root (full: all files)
```

## Development Workflow

### Typical Workflow

1. **Navigate to dnschat-ng**:
   ```bash
   cd TESTES_UI/new_ui_messages/dnschat-ng
   ```

2. **Install dependencies** (first time or after package.json changes):
   ```bash
   npm install
   ```

3. **Start development**:
   ```bash
   npm start
   ```

4. **Make changes** to files in dnschat-ng directory

5. **Commit changes**:
   ```bash
   git add TESTES_UI/new_ui_messages/dnschat-ng/
   git commit -m "feat: description of changes"
   ```

6. **Push to remote**:
   ```bash
   git push
   ```

### Testing Native Modules

dnschat-ng includes custom native modules that require development builds:

```bash
# iOS development build
npm run ios

# Android development build
npm run android

# Note: Expo Go does not support custom native modules
```

### Updating Root Documentation

Root files like `CLAUDE.md` and `CHANGELOG.md` are accessible:

```bash
# Edit root CLAUDE.md
vim CLAUDE.md

# Edit dnschat-ng CLAUDE.md
vim TESTES_UI/new_ui_messages/dnschat-ng/CLAUDE.md

# Both are tracked and committable
```

## Troubleshooting

### Sparse Checkout Not Working

```bash
# Check if sparse checkout is enabled
git sparse-checkout list

# If empty or incorrect, reconfigure:
git sparse-checkout init --cone
git sparse-checkout set TESTES_UI/new_ui_messages/dnschat-ng
```

### Files Missing After Branch Switch

```bash
# Verify sparse checkout configuration
cat .git/info/sparse-checkout

# Refresh working directory
git checkout HEAD -- .
```

### Want to See All Files Temporarily

```bash
# Disable sparse checkout
git sparse-checkout disable

# All files now visible in working directory

# Re-enable when done
git sparse-checkout init --cone
git sparse-checkout set TESTES_UI/new_ui_messages/dnschat-ng
```

### Merge Conflicts

Sparse checkout does not affect merge operations. Conflicts are resolved normally:

```bash
# Merge with potential conflicts
git merge main

# Resolve conflicts in visible files
# Stage resolved files
git add TESTES_UI/new_ui_messages/dnschat-ng/conflicted-file.tsx

# Complete merge
git commit
```

## Advantages of This Setup

1. **Focused Development**: Only see dnschat-ng files in your editor/IDE
2. **Fast Operations**: Git operations only scan visible files
3. **Clean Working Directory**: No clutter from unrelated project files
4. **Full History**: Access complete repository history when needed
5. **Easy Switching**: Toggle between focused and full views
6. **Root Access**: Essential configuration files remain accessible

## Performance Benefits

With sparse checkout enabled:
- Faster `git status` (42% of files)
- Quicker IDE indexing
- Reduced file system operations
- Cleaner search results
- Less memory usage

## Next Steps

1. **Test the setup**: Run `npm install` and `npm start` in dnschat-ng
2. **Verify native modules**: Check expo-chatview and DNS modules
3. **Update dnschat-ng docs**: Modify `TESTES_UI/new_ui_messages/dnschat-ng/CLAUDE.md` if needed
4. **Push branch to remote**: `git push -u origin chatdns-new-generation-ui`
5. **Start development**: Work primarily in dnschat-ng directory

## References

- [Git Sparse Checkout Documentation](https://git-scm.com/docs/git-sparse-checkout)
- [Git Cone Mode](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/)
- [Git Worktrees](https://git-scm.com/docs/git-worktree)

---

Last Updated: 2025-10-13
Branch: chatdns-new-generation-ui
Configuration: Sparse Checkout (Cone Mode)
