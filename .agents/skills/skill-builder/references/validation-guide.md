# Skill Validation Guide

## Overview

This guide provides detailed information on validating Agent Skills to ensure they comply with the [official specification](https://agentskills.io/llms.txt).

---

## Validation Requirements

### Mandatory Checks

Every skill **MUST** pass these checks:

1. **Directory Structure**
   - Skill directory exists
   - `SKILL.md` file exists in the root
   - Directory name matches the `name` field in frontmatter

2. **Frontmatter Requirements**
   - Valid YAML syntax
   - `name` field present and valid
   - `description` field present and valid
   - Frontmatter properly delimited with `---`

3. **Name Field Rules**
   - Length: 1-64 characters
   - Characters: Only lowercase letters (`a-z`), numbers (`0-9`), and hyphens (`-`)
   - No leading hyphen
   - No trailing hyphen
   - No consecutive hyphens (`--`)
   - Must match the parent directory name

4. **Description Field Rules**
   - Length: 1-1024 characters
   - Must describe **what** the skill does
   - Must describe **when** to use it
   - Should include specific keywords for discoverability

---

## Optional Fields

These fields are optional but recommended when applicable:

| Field | Purpose | Example |
|-------|---------|---------|
| `version` | Skill version | `1.0` |
| `license` | License information | `MIT` or `Proprietary` |
| `compatibility` | Environment requirements | `Requires Node.js 18+, Python 3.10+` |
| `metadata` | Additional metadata | `author: name\ncreated: 2024-01-01` |
| `allowed-tools` | Pre-approved tools | `Bash Read Write` |

---

## Content Guidelines

### Structure

Follow this recommended structure for `SKILL.md`:

```
1. Frontmatter (YAML)
2. Overview
3. Quick Start
4. Detailed Instructions
5. Examples
6. Configuration/Reference
7. Best Practices
8. Troubleshooting
9. Files
10. See Also
```

### Formatting

- Use **consistent heading hierarchy** (`##`, `###`, `####`)
- Use **code blocks** for commands, code, and file paths
- Use **tables** for structured data (configuration, parameters, etc.)
- Use **lists** for enumerations and steps
- Keep **paragraphs concise** (2-4 sentences)

### Language

- **ALL content must be in English**
- This includes:
  - Frontmatter fields
  - Markdown content
  - Code comments in examples
  - File names (use kebab-case)
  - Error messages in scripts

---

## File Organization

### Required Files

| File | Purpose | Notes |
|------|---------|-------|
| `SKILL.md` | Main skill file | Must exist, contains metadata and instructions |

### Optional Directories

| Directory | Purpose | When to Use |
|-----------|---------|-------------|
| `assets/` | Templates, static resources | Store reusable templates, schemas, or data files |
| `references/` | Detailed documentation | Split large reference material from main SKILL.md |
| `scripts/` | Executable code | Store helper scripts for setup, validation, etc. |

### Best Practices for File Organization

1. **Keep it flat**: Avoid deep nesting (max 2 levels deep)
2. **Single entry point**: `SKILL.md` should be the primary file
3. **Progressive disclosure**: Load detailed content only when needed
4. **Shallow references**: Reference files directly from `SKILL.md`, avoid chains
5. **Token efficiency**: Keep `SKILL.md` under 500 lines

---

## Validation Tools

### Official Tool: skills-ref

The [skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref) tool is the official validator:

```bash
# Install globally
npm install -g @agentskills/skills-ref

# Validate a single skill
skills-ref validate ./path/to/my-skill

# Validate all skills in a directory
skills-ref validate ./skills/

# Check version
skills-ref --version
```

### Online Validators

| Tool | Purpose | URL |
|------|---------|-----|
| YAML Validator | Validate YAML syntax | https://yaml-checker.online-domain-tools.com/ |
| Markdown Validator | Validate Markdown | https://markdownlint.com/ |

### Manual Validation Checklist

Before finalizing your skill, manually verify:

- [ ] `name` field is present in frontmatter
- [ ] `name` matches directory name exactly
- [ ] `name` follows all naming rules
- [ ] `description` is present in frontmatter
- [ ] `description` explains what AND when to use
- [ ] YAML frontmatter is valid
- [ ] All referenced files exist
- [ ] Content is in English
- [ ] SKILL.md has proper structure
- [ ] Examples are complete and realistic
- [ ] No broken links (internal or external)

---

## Common Validation Errors

### Name Field Errors

| Error | Example | Fix |
|-------|---------|-----|
| Contains uppercase | `MySkill` | Use `my-skill` |
| Contains spaces | `my skill` | Use `my-skill` |
| Contains special chars | `my_skill` | Use `my-skill` |
| Starts with hyphen | `-skill` | Remove leading hyphen |
| Ends with hyphen | `skill-` | Remove trailing hyphen |
| Consecutive hyphens | `my--skill` | Use `my-skill` |
| Too long | `a-very-long-skill-name-that-exceeds-sixty-four-characters-in-length` | Shorten to <= 64 chars |
| Too short | `` | Add at least 1 char |

### Description Field Errors

| Error | Example | Fix |
|-------|---------|-----|
| Missing | (none) | Add description field |
| Too short | `Helps.` | Expand to explain purpose |
| Too long | 1025+ chars | Shorten to <= 1024 chars |
| Missing "what" | `Use for tasks.` | Add what it does |
| Missing "when" | `Processes data.` | Add when to use it |

### Frontmatter Errors

| Error | Example | Fix |
|-------|---------|-----|
| Missing `---` | Frontmatter without delimiters | Add `---` at start and end |
| Invalid YAML | `name: value\n  key: value` (bad indent) | Use proper YAML syntax |
| Tabs in YAML | Indented with tabs | Use spaces only |
| Duplicate fields | Two `name:` fields | Keep only one |

### Structure Errors

| Error | Example | Fix |
|-------|---------|-----|
| No content after frontmatter | `---\nname: x\n---` (nothing else) | Add instructions |
| SKILL.md empty | Empty file | Add frontmatter and content |
| SKILL.md not found | Missing file | Create SKILL.md |

---

## Progressive Disclosure

Agent Skills use **progressive disclosure** to optimize context usage:

### Level 1: Metadata (~100 tokens)
- Loaded: At agent startup
- Content: `name` and `description` from frontmatter
- Purpose: Quick identification of relevant skills

### Level 2: Instructions (<5000 tokens recommended)
- Loaded: When skill is activated
- Content: Full `SKILL.md` body
- Purpose: Complete instructions for using the skill

### Level 3: Resources (on-demand)
- Loaded: When specifically referenced
- Content: Files in `references/`, `assets/`, `scripts/`
- Purpose: Detailed reference, templates, helpers

### Optimization Tips

1. **Keep SKILL.md concise**: Aim for <500 lines
2. **Move large content**: Put detailed reference in `references/`
3. **Use relative paths**: Reference files from skill root
4. **Avoid deep chains**: Don't create `a.md` → `b.md` → `c.md`
5. **Test token count**: Use `wc -w` to check word count

---

## Example Validations

### Valid Skill Example

```
my-skill/
├── SKILL.md
└── scripts/
    └── helper.sh
```

**SKILL.md:**
```markdown
---
name: my-skill
description: Manages user sessions and authentication tokens. Use when handling login, logout, or token validation.
version: 1.0
license: MIT
---

## Overview

This skill handles user authentication...
```

**Validation Result:** PASS ✓

### Invalid Skill Example

```
MySkill/
└── SKILL.md
```

**SKILL.md:**
```markdown
---
name: MySkill
description: Helper
---
```

**Validation Result:** FAIL ✗
- Name contains uppercase
- Name doesn't match directory
- Description too short

---

## Automated Validation Script

The `skill-builder` skill includes a validation script at:
```
scripts/validate-skill.sh
```

### Usage

```bash
# Validate all skills in the current directory
./scripts/validate-skill.sh

# Validate a specific skill
./scripts/validate-skill.sh ../my-skill

# Make executable first
chmod +x scripts/validate-skill.sh
```

### What It Checks

The script validates:
- SKILL.md existence
- Frontmatter presence and validity
- Name field presence and format
- Name matches directory
- Description presence and length
- Content after frontmatter
- English content (basic check)
- Line length
- Tab usage in YAML

---

## See Also

- [Official Agent Skills Specification](https://agentskills.io/llms.txt)
- [skills-ref GitHub Repository](https://github.com/agentskills/agentskills/tree/main/skills-ref)
- [YAML Specification](https://yaml.org/spec/)
- [CommonMark (Markdown) Specification](https://commonmark.org/)
