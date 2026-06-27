---
name: skill-builder
description: Guides creation, validation, and modification of Agent Skills per official spec. Use when building new skills, updating existing ones, or ensuring format compliance.
version: 1.0
license: Proprietary
metadata:
  author: fsarch
  spec-version: 1.0
  spec-source: https://agentskills.io/llms.txt
---

## Overview

This skill provides comprehensive guidance for creating and maintaining **Agent Skills**
that follow the official [Agent Skills Specification](https://agentskills.io/llms.txt).
It covers all aspects from initial setup to validation and deployment.

**IMPORTANT**: All skills MUST be written in **English** only, regardless of the project's primary language.

---

## Quick Start

### Create a New Skill

1. **Create directory structure**:
   ```bash
   mkdir -p .agents/skills/my-skill/{assets,references,scripts}
   ```

2. **Create `SKILL.md`** with required frontmatter:
   ```markdown
   ---
   name: my-skill
   description: What this skill does and when to use it.
   ---
   
   ## Instructions
   
   Your skill content here...
   ```

3. **Validate** your skill (see [Validation](#validation) section)

---

## Specification Compliance

### Directory Structure

Every skill must follow this structure:

```
skill-name/
├── SKILL.md              # REQUIRED: Metadata + instructions
├── assets/               # OPTIONAL: Templates, static resources
│   ├── template.md
│   └── schema.json
├── references/           # OPTIONAL: Detailed documentation
│   ├── REFERENCE.md
│   └── examples.md
└── scripts/              # OPTIONAL: Executable helpers
    ├── validate.sh
    └── setup.py
```

---

## SKILL.md Format

### Frontmatter Requirements

| Field | Required | Max Length | Constraints |
|-------|----------|-------------|--------------|
| `name` | **YES** | 64 chars | Lowercase alphanumeric + hyphens only. No leading/trailing hyphens. No consecutive hyphens (`--`). Must match directory name. |
| `description` | **YES** | 1024 chars | Must describe **what** the skill does **and** **when** to use it. Include specific keywords. |
| `license` | No | - | License name or reference to bundled file |
| `compatibility` | No | 500 chars | Environment requirements (product, packages, access) |
| `metadata` | No | - | Arbitrary key-value pairs |
| `allowed-tools` | No | - | Space-separated pre-approved tools (experimental) |

### Name Field Rules

**Valid examples:**
- `pdf-processing`
- `data-analysis`
- `code-review-helper`

**Invalid examples:**
- `PDF-Processing` (uppercase)
- `-pdf` (starts with hyphen)
- `pdf--processing` (consecutive hyphens)
- `pdf-processing-` (ends with hyphen)

### Description Field Guidelines

**GOOD:** Specific, keyword-rich, explains both purpose and use case
```yaml
description: Extracts text and tables from PDF files, fills PDF forms, and merges multiple PDFs. Use when working with PDF documents or when the user mentions PDFs, forms, or document extraction.
```

**POOR:** Vague, too short, lacks context
```yaml
description: Helps with PDFs.
```

---

## Frontmatter Examples

### Minimal (Required Only)
```markdown
---
name: my-skill
description: Handles user authentication flows and session management. Use for login, logout, and token validation tasks.
---
```

### Complete
```markdown
---
name: database-migration
description: Manages database schema migrations including version control, rollback, and data transformation. Use when modifying database structure or handling migration scripts.
version: 2.1
license: MIT
compatibility: Requires PostgreSQL 14+, Node.js 18+, and knex migration tool
metadata:
  author: fsarch
  maintainer: team@fsarch.dev
  created: 2024-01-15
allowed-tools: Bash Read Write
---
```

---

## Content Structure

### Recommended Sections

Organize your skill content with these sections in order:

1. **Overview** - Brief introduction to the skill's purpose
2. **Quick Start** - Minimal steps to use the skill
3. **Detailed Instructions** - Comprehensive usage guide
4. **Examples** - Practical use cases with code samples
5. **Configuration/Reference** - API, parameters, options
6. **Best Practices** - Recommendations and patterns
7. **Troubleshooting** - Common issues and solutions
8. **Files** - Related files and their purposes
9. **See Also** - Links to related documentation

### Progressive Disclosure Principle

Structure content for optimal agent loading:
- **Level 1 (~100 tokens)**: `name` + `description` in frontmatter (loaded at startup)
- **Level 2 (<5000 tokens)**: Full `SKILL.md` body (loaded on activation)
- **Level 3 (on-demand)**: Files in `references/`, `assets/`, `scripts/` (loaded when needed)

**Best Practice**: Keep `SKILL.md` under **500 lines**. Move detailed reference to separate files.

---

## File References

### Referencing Other Files

Use **relative paths** from the skill root:

```markdown
# In SKILL.md

See [the reference guide](references/REFERENCE.md) for details.

Run the setup script:
```bash
scripts/setup.sh
```

Download the template: [template.md](assets/template.md)
```

### Keep References Shallow

- **DO**: Reference files directly from `SKILL.md`
- **DON'T**: Create deep chains like `SKILL.md` → `ref1.md` → `ref2.md` → `ref3.md`

---

## Validation

### Official Validation Tool

Use [skills-ref](https://github.com/agentskills/agentskills/tree/main/skills-ref) to validate your skills:

```bash
# Install
npm install -g @agentskills/skills-ref

# Validate a single skill
skills-ref validate ./my-skill

# Validate all skills in directory
skills-ref validate ./skills/
```

### Manual Validation Checklist

Before finalizing your skill, verify:

- [ ] Directory name matches `name` in frontmatter
- [ ] `name` follows naming rules (lowercase, no special chars, 1-64 chars)
- [ ] `description` is present and describes both **what** and **when**
- [ ] `description` is 1-1024 characters
- [ ] YAML frontmatter is valid (use [YAML validator](https://yaml-checker.online-domain-tools.com/))
- [ ] `SKILL.md` exists and is properly formatted
- [ ] All referenced files exist at specified paths
- [ ] Content is in **English** (no German or other languages)
- [ ] `SKILL.md` is under 500 lines (consider splitting if longer)

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `name` does not match directory | Frontmatter name != directory name | Rename directory or update frontmatter |
| Invalid characters in name | Uppercase, spaces, or special chars | Use only `a-z`, `0-9`, `-` |
| Missing description | No description field | Add description field |
| Description too long | >1024 characters | Shorten description |
| Name too long | >64 characters | Shorten name |
| Consecutive hyphens | `--` in name | Remove consecutive hyphens |

---

## Templates

### Basic Skill Template

See [assets/skill-template.md](assets/skill-template.md) for a complete starter template.

### Frontmatter Only Template

```markdown
---
name: REPLACE-ME
 description: REPLACE-ME - What this skill does and when to use it.
version: 1.0
license: Proprietary
metadata:
  author: YOUR-NAME
  created: $(date +%Y-%m-%d)
---

## Overview

[Your overview here]

## Quick Start

[Minimal usage example]

## Detailed Instructions

[Comprehensive guide]

## Examples

[Practical examples]

## Best Practices

[Recommendations]

## Troubleshooting

[Common issues]
```

---

## Best Practices

### 1. Naming Conventions
- Use **kebab-case** for skill names: `my-skill-name`
- Use **imperative mood** in descriptions: "Use when...", "Creates...", "Manages..."
- Include **keywords** users might search for

### 2. Content Organization
- Start with a **clear overview** (2-3 sentences)
- Include **practical examples** early
- Group related concepts together
- Use **tables** for configuration options
- Use **code blocks** for commands and examples

### 3. File Organization
- Keep `SKILL.md` as the **single entry point**
- Move large reference material to `references/`
- Put reusable scripts in `scripts/`
- Store static files in `assets/`
- Keep file hierarchy **flat** (avoid deep nesting)

### 4. Language Requirements
- **ALL content must be in English**
- This includes:
  - Frontmatter fields (name, description, etc.)
  - Markdown content
  - Code comments in examples
  - File names should be English (use kebab-case)
  - Error messages in scripts

### 5. Example Quality
- Examples should be **complete** (not partial snippets)
- Include **realistic** use cases
- Show **input and output** where applicable
- Annotate examples with **explanations**

### 6. Documentation Standards
- Use **consistent heading hierarchy** (##, ###, ####)
- Prefer **tables** for structured data
- Use **code fences** with language specification
- Include **cross-references** to related skills/files
- Document **prerequisites** and **dependencies**

---

## Examples

### Example 1: Simple Validation Script

Create `scripts/validate.sh`:

```bash
#!/bin/bash
# Validates skill structure

SKILL_DIR="$(dirname "$0")/.."
SKILL_MD="$SKILL_DIR/SKILL.md"

# Check SKILL.md exists
if [ ! -f "$SKILL_MD" ]; then
  echo "ERROR: SKILL.md not found"
  exit 1
fi

# Check name matches directory
SKILL_NAME=$(grep "^name:" "$SKILL_MD" | cut -d' ' -f2 | tr -d ' ')
DIR_NAME=$(basename "$SKILL_DIR")

if [ "$SKILL_NAME" != "$DIR_NAME" ]; then
  echo "ERROR: name ($SKILL_NAME) does not match directory ($DIR_NAME)"
  exit 1
fi

echo "Validation passed: $SKILL_NAME"
```

Make it executable:
```bash
chmod +x scripts/validate.sh
```

### Example 2: Reference Documentation

Create `references/REFERENCE.md`:

```markdown
# Technical Reference

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/resources` | GET | List all resources |
| `/api/v1/resources/{id}` | GET | Get specific resource |

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | number | 30 | Request timeout in seconds |
```

---

## Troubleshooting

### Skill Not Loading

| Symptom | Cause | Solution |
|---------|-------|----------|
| Skill not appearing in available skills | Invalid YAML frontmatter | Validate with [YAML checker](https://yaml-checker.online-domain-tools.com/) |
| Skill loads but instructions missing | `SKILL.md` not found or empty | Ensure file exists and has content after frontmatter |
| Skill name incorrect | Directory name != frontmatter name | Rename directory or update frontmatter |

### Validation Errors

| Error | Solution |
|-------|----------|
| `name` contains uppercase | Convert to lowercase |
| `name` contains spaces | Replace with hyphens |
| `name` contains special chars | Use only `a-z`, `0-9`, `-` |
| `description` missing | Add description field |
| `description` too short | Expand to explain purpose and use case |

### Frontmatter Parsing Issues

| Issue | Solution |
|-------|----------|
| YAML syntax error | Use [YAML validator](https://yaml-checker.online-domain-tools.com/) |
| Missing `---` delimiters | Ensure frontmatter starts and ends with `---` |
| Tabs in YAML | Use spaces only (YAML spec requires this) |

---

## Files Reference

| File | Purpose |
|------|---------|
| `SKILL.md` | Main skill file with metadata and instructions |
| `scripts/*.sh` | Executable shell scripts |
| `scripts/*.py` | Python helper scripts |
| `references/*.md` | Detailed documentation |
| `assets/*.md` | Templates and examples |
| `assets/*.json` | Schema and configuration templates |

---

## See Also

- [Official Agent Skills Specification](https://agentskills.io/llms.txt)
- [skills-ref Validation Tool](https://github.com/agentskills/agentskills/tree/main/skills-ref)
- [Existing Skills in this project](../auto-navigation/SKILL.md) | [generated-form](../generated-form/SKILL.md)
- [YAML Frontmatter Guide](https://jekyllrb.com/docs/front-matter/)
- [Markdown Guide](https://www.markdownguide.org/)

---

## Checklist for New Skills

- [ ] Created skill directory with correct name (kebab-case)
- [ ] Created `SKILL.md` with valid YAML frontmatter
- [ ] Added required `name` and `description` fields
- [ ] Description explains **what** AND **when** to use
- [ ] All content is in **English**
- [ ] `name` matches directory name
- [ ] `name` follows naming rules
- [ ] Validated YAML syntax
- [ ] `SKILL.md` has clear structure (Overview, Quick Start, etc.)
- [ ] Added practical examples
- [ ] Content is under 500 lines (or split into references)
- [ ] Created optional directories as needed (scripts/, references/, assets/)
- [ ] Added validation script (recommended)
- [ ] Tested skill with actual tasks
