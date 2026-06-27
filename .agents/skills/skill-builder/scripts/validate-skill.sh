#!/bin/bash
#
# Skill Validation Script
# Validates Agent Skills according to the official specification
# Usage: ./validate-skill.sh [skill-directory]
#
# If no directory is provided, validates all skills in the parent directory

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print error
print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to print warning
print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to print success
print_success() {
  echo -e "${GREEN}[PASS]${NC} $1"
}

# Function to validate a single skill
validate_skill() {
  local skill_dir="$1"
  local skill_name=$(basename "$skill_dir")
  local skill_md="$skill_dir/SKILL.md"

  echo ""
  echo "Validating skill: $skill_name"
  echo "Directory: $skill_dir"

  # Check 1: SKILL.md exists
  if [ ! -f "$skill_md" ]; then
    print_error "SKILL.md not found in $skill_dir"
    ((FAILED++))
    return
  fi
  print_success "SKILL.md exists"
  ((PASSED++))

  # Check 2: Extract frontmatter
  local in_frontmatter=false
  local frontmatter=""
  local line_num=0
  local frontmatter_end=0

  while IFS= read -r line; do
    ((line_num++))

    # Check for frontmatter start
    if [[ "$line" == "---" && "$in_frontmatter" == false ]]; then
      in_frontmatter=true
      frontmatter="$line"
      frontmatter_end=$line_num
      continue
    fi

    # Collect frontmatter
    if [ "$in_frontmatter" == true ]; then
      frontmatter="${frontmatter}
${line}"

      # Check for frontmatter end
      if [[ "$line" == "---" || "$line" == "..." ]]; then
        frontmatter_end=$line_num
        break
      fi
    fi
  done < "$skill_md"

  # Check 3: Frontmatter exists (at least 3 lines: ---, content, ---)
  if [ $frontmatter_end -lt 3 ]; then
    print_error "Invalid or missing frontmatter in SKILL.md"
    ((FAILED++))
    return
  fi
  print_success "Frontmatter found"
  ((PASSED++))

  # Extract name from frontmatter
  local extracted_name=$(echo "$frontmatter" | grep "^name:" | head -1 | sed 's/^name:[[:space:]]*//;s/[[:space:]]*$//')

  # Check 4: name field exists
  if [ -z "$extracted_name" ]; then
    print_error "Missing 'name' field in frontmatter"
    ((FAILED++))
    return
  fi
  print_success "Name field found: $extracted_name"
  ((PASSED++))

  # Check 5: name matches directory
  if [ "$extracted_name" != "$skill_name" ]; then
    print_error "Name '$extracted_name' does not match directory '$skill_name'"
    ((FAILED++))
  else
    print_success "Name matches directory"
    ((PASSED++))
  fi

  # Check 6: Validate name format (use sed for macOS compatibility)
  if ! echo "$extracted_name" | grep -qE '^[a-z0-9]+(-[a-z0-9]+)*$'; then
    print_error "Name '$extracted_name' contains invalid characters. Use only lowercase alphanumeric and hyphens."
    ((FAILED++))
  else
    print_success "Name format is valid"
    ((PASSED++))
  fi

  # Check 7: name length (1-64 chars)
  local name_length=${#extracted_name}
  if [ "$name_length" -lt 1 ] || [ "$name_length" -gt 64 ]; then
    print_error "Name length $name_length is invalid. Must be 1-64 characters."
    ((FAILED++))
  else
    print_success "Name length is valid ($name_length chars)"
    ((PASSED++))
  fi

  # Check 8: No consecutive hyphens (use standard grep)
  if echo "$extracted_name" | grep -q -- "--"; then
    print_error "Name contains consecutive hyphens (--)"
    ((FAILED++))
  else
    print_success "No consecutive hyphens"
    ((PASSED++))
  fi

  # Check 9: No leading/trailing hyphens
  if [[ "$extracted_name" == -* ]] || [[ "$extracted_name" == *- ]]; then
    print_error "Name starts or ends with hyphen"
    ((FAILED++))
  else
    print_success "No leading/trailing hyphens"
    ((PASSED++))
  fi

  # Extract description
  local extracted_description=$(echo "$frontmatter" | grep "^description:" | head -1 | sed 's/^description:[[:space:]]*//;s/[[:space:]]*$//' | sed 's/^"//;s/"$//')

  # Check 10: description exists
  if [ -z "$extracted_description" ]; then
    print_error "Missing 'description' field in frontmatter"
    ((FAILED++))
  else
    print_success "Description field found"
    ((PASSED++))
  fi

  # Check 11: description length (1-1024 chars)
  if [ -n "$extracted_description" ]; then
    local desc_length=${#extracted_description}
    if [ "$desc_length" -lt 1 ] || [ "$desc_length" -gt 1024 ]; then
      print_error "Description length $desc_length is invalid. Must be 1-1024 characters."
      ((FAILED++))
    else
      print_success "Description length is valid ($desc_length chars)"
      ((PASSED++))
    fi
  fi

  # Check 12: Content after frontmatter
  # Get total lines in file
  local total_lines=$(wc -l < "$skill_md")
  # Get first non-empty line after frontmatter
  local content_after=""
  for ((i=frontmatter_end+1; i<=total_lines; i++)); do
    local line=$(sed -n "${i}p" "$skill_md")
    if [ -n "$line" ] && [ "$line" != "---" ] && [ "$line" != "..." ]; then
      # Remove leading/trailing whitespace
      line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
      if [ -n "$line" ]; then
        content_after="$line"
        break
      fi
    fi
  done
  if [ -z "$content_after" ]; then
    print_warning "No content found after frontmatter"
    ((WARNINGS++))
  else
    print_success "Content found after frontmatter"
    ((PASSED++))
  fi

  # Check 13: File is not empty
  local file_size=$(stat -f%z "$skill_md" 2>/dev/null || stat -c%s "$skill_md")
  if [ "$file_size" -eq 0 ]; then
    print_error "SKILL.md is empty"
    ((FAILED++))
  fi

  # Check 14: Line length (warn if any line > 200 chars)
  local long_lines=$(awk 'length > 200' "$skill_md" 2>/dev/null | wc -l)
  if [ "$long_lines" -gt 0 ]; then
    print_warning "Some lines exceed 200 characters. Consider breaking long lines."
    ((WARNINGS++))
  fi

  # Check 15: Check for tabs in YAML (should use spaces)
  # Use grep with literal tab character for macOS compatibility
  if grep -q $'\t' "$skill_md" 2>/dev/null; then
    print_warning "Tabs found. YAML should use spaces, not tabs."
    ((WARNINGS++))
  fi
}

# Function to validate all skills in a directory
validate_all_skills() {
  local skills_dir="$1"

  if [ ! -d "$skills_dir" ]; then
    print_error "Directory not found: $skills_dir"
    exit 1
  fi

  echo "========================================"
  echo "  Agent Skills Validation"
  echo "========================================"
  echo ""

  # Find all skill directories (directories with SKILL.md)
  local skill_dirs=()

  while IFS= read -r -d '' dir; do
    if [ -f "$dir/SKILL.md" ]; then
      skill_dirs+=("$dir")
    fi
  done < <(find "$skills_dir" -type d -print0)

  if [ ${#skill_dirs[@]} -eq 0 ]; then
    print_error "No skills found in $skills_dir"
    exit 1
  fi

  echo "Found ${#skill_dirs[@]} skill(s) to validate"
  echo ""

  # Validate each skill
  for skill_dir in "${skill_dirs[@]}"; do
    validate_skill "$skill_dir"
  done

  # Print summary
  echo ""
  echo "========================================"
  echo "  Validation Summary"
  echo "========================================"
  echo -e "${GREEN}Passed:   $PASSED${NC}"
  echo -e "${RED}Failed:   $FAILED${NC}"
  echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
  echo ""

  if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Validation FAILED${NC}"
    exit 1
  elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}Validation passed with warnings${NC}"
    exit 0
  else
    echo -e "${GREEN}Validation PASSED${NC}"
    exit 0
  fi
}

# Main execution
if [ $# -eq 0 ]; then
  # Default: validate all skills in parent directory
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  SKILLS_DIR="$(dirname "$SCRIPT_DIR")"
  validate_all_skills "$SKILLS_DIR"
else
  # Validate specific skill(s)
  for arg in "$@"; do
    if [ -d "$arg" ]; then
      validate_all_skills "$arg"
    else
      print_error "Directory not found: $arg"
      exit 1
    fi
  done
fi
