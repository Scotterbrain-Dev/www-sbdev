# GitHub Project Management — Quick Reference

Project board: [https://github.com/orgs/Scotterbrain-Dev/projects/1](https://github.com/orgs/Scotterbrain-Dev/projects/1)
Repository: [https://github.com/Scotterbrain-Dev/www-sbdev](https://github.com/Scotterbrain-Dev/www-sbdev)

---

## Viewing the Board

**In the browser:**
Go to [https://github.com/orgs/Scotterbrain-Dev/projects/1](https://github.com/orgs/Scotterbrain-Dev/projects/1)

You'll see a table view by default. Switch to Board view (Kanban) by clicking the view dropdown in the top-left and selecting **"Board"**. This gives you columns like Todo → In Progress → Done.

**From the terminal:**

```bash
# List all issues
gh issue list --repo Scotterbrain-Dev/www-sbdev

# List issues with a specific label
gh issue list --repo Scotterbrain-Dev/www-sbdev --label agent

# View a specific issue
gh issue view 1 --repo Scotterbrain-Dev/www-sbdev

# View project board items
gh project item-list 1 --owner Scotterbrain-Dev
```

---

## Creating Issues

**In the browser:**
Click the green **"New issue"** button on the Issues tab.

**From the terminal:**

```bash
gh issue create --repo Scotterbrain-Dev/www-sbdev \
  --title "Your issue title" \
  --label "enhancement" \
  --body "Description of the work needed"
```

Then add it to the project board:

```bash
gh project item-add 1 --owner Scotterbrain-Dev \
  --url https://github.com/Scotterbrain-Dev/www-sbdev/issues/NUMBER
```

---

## Working an Issue

```bash
# Assign it to yourself
gh issue edit NUMBER --repo Scotterbrain-Dev/www-sbdev --add-assignee "@me"

# Create a branch tied to the issue (GitHub auto-links them)
git checkout -b fix/issue-NUMBER-short-description

# When done, close the issue
gh issue close NUMBER --repo Scotterbrain-Dev/www-sbdev

# Or close it automatically via commit message
git commit -m "Fix changelog scraper URLs

Closes #2"
```

---

## Moving Cards on the Board

**In the browser:** Drag cards between columns (Todo / In Progress / Done).

**From the terminal** — update the Status field:

```bash
# First get the project field and option IDs
gh project field-list 1 --owner Scotterbrain-Dev

# Then update an item's status (replace ITEM_ID and OPTION_ID with real values)
gh project item-edit --project-id PVT_kwDODqP2jc4BSJhw \
  --id ITEM_ID --field-id FIELD_ID --single-select-option-id OPTION_ID
```

Tip: It's easier to move cards in the browser — the terminal method is verbose.

---

## Labels in This Project

| Label        | Color  | Used For                     |
| ------------ | ------ | ---------------------------- |
| `agent`      | Purple | AI agent work                |
| `ui`         | Teal   | Frontend / page work         |
| `testing`    | Blue   | QA and verification tasks    |
| `setup`      | Yellow | Config, infra, environment   |
| `bug`        | Red    | Something broken             |
| `enhancement`| Cyan   | New feature or improvement   |

---

## Milestones (Optional — for grouping work into phases)

```bash
# Create a milestone
gh api repos/Scotterbrain-Dev/www-sbdev/milestones \
  --method POST \
  --field title="Phase 1 — Core Agents Working" \
  --field description="All 8 agents tested and verified"

# Assign an issue to a milestone
gh issue edit NUMBER --repo Scotterbrain-Dev/www-sbdev --milestone "Phase 1 — Core Agents Working"
```

---

## Quick Daily Workflow

```bash
# Morning: see what's open
gh issue list --repo Scotterbrain-Dev/www-sbdev

# Pick one, assign yourself, start a branch
gh issue edit 1 --repo Scotterbrain-Dev/www-sbdev --add-assignee "@me"
git checkout -b feature/issue-1-test-agents

# Do the work, commit with issue reference
git commit -m "Test github-trending agent — closes #1"
git push

# Close when done
gh issue close 1 --repo Scotterbrain-Dev/www-sbdev
```
