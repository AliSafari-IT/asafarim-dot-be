#!/bin/bash

# Script to remove duplicate authentication logic from admin pages
# All admin pages are now wrapped with ProtectedRoute which handles auth centrally

echo "🔧 Fixing duplicate authentication logic in admin pages..."

# Array of files to fix
files=(
  "apps/web/src/pages/admin/EditEntity.tsx"
  "apps/web/src/pages/admin/ViewEntity.tsx"
  "apps/web/src/pages/admin/EntityTableView.tsx"
  "apps/web/src/pages/admin/AddNewEntity.tsx"
  "apps/web/src/pages/admin/resume/ResumeSectionManagement.tsx"
  "apps/web/src/pages/admin/resume/ResumeSectionItemsView.tsx"
  "apps/web/src/pages/admin/resume/ProjectForm.tsx"
  "apps/web/src/pages/admin/resume/LanguageForm.tsx"
  "apps/web/src/pages/admin/resume/CertificateForm.tsx"
  "apps/web/src/pages/admin/resume/AwardForm.tsx"
  "apps/web/src/pages/admin/resume/EducationForm.tsx"
  "apps/web/src/pages/admin/resume/SocialLinkForm.tsx"
  "apps/web/src/pages/admin/resume/SkillForm.tsx"
  "apps/web/src/pages/admin/resume/ReferenceForm.tsx"
  "apps/web/src/pages/admin/resume/ExperienceForm.tsx"
)

count=0

for file in "${files[@]}"; do
  filepath="/var/repos/asafarim-dot-be/$file"
  
  if [ ! -f "$filepath" ]; then
    echo "⚠️  File not found: $file"
    continue
  fi
  
  echo "📝 Processing: $file"
  
  # Create backup
  cp "$filepath" "$filepath.bak"
  
  # Remove the useEffect auth redirect block
  # This is a complex pattern, so we'll use a Python script for precise editing
  python3 << 'PYTHON_SCRIPT'
import re
import sys

filepath = sys.argv[1]

with open(filepath, 'r') as f:
    content = f.read()

# Pattern 1: Remove useEffect with window.location.href redirect
pattern1 = r'\s*// Redirect if not authenticated\s*\n\s*useEffect\(\(\) => \{\s*\n\s*if \(!authLoading && !isAuthenticated\) \{\s*\n\s*window\.location\.href = `http://identity\.asafarim\.local:5177/login\?returnUrl=\$\{encodeURIComponent\(\s*\n\s*window\.location\.href\s*\n\s*\)\}\`;?\s*\n\s*\}\s*\n\s*\}, \[authLoading, isAuthenticated\]\);?\s*\n'

pattern2 = r'\s*useEffect\(\(\) => \{\s*\n\s*if \(!authLoading && !isAuthenticated\) \{\s*\n\s*window\.location\.href = `http://identity\.asafarim\.local:5177/login\?returnUrl=\$\{encodeURIComponent\(window\.location\.href\)\}\`;?\s*\n\s*\}\s*\n\s*\}, \[authLoading, isAuthenticated\]\);?\s*\n'

# Remove the patterns
content = re.sub(pattern1, '\n', content)
content = re.sub(pattern2, '\n', content)

# Pattern 3: Remove conditional render for !isAuthenticated
pattern3 = r'\s*if \(!isAuthenticated\) \{\s*\n\s*return \(\s*\n.*?<p>Redirecting to login\.\.\.</p>\s*\n.*?\n\s*\);\s*\n\s*\}\s*\n'
content = re.sub(pattern3, '\n', content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)

print(f"✅ Fixed: {filepath}")
PYTHON_SCRIPT
  
  python3 -c "
import re
import sys

filepath = '$filepath'

with open(filepath, 'r') as f:
    content = f.read()

# Remove useEffect auth redirect
patterns = [
    r'\s*// Redirect if not authenticated\s*\n\s*useEffect\(\(\) => \{\s*\n\s*if \(!authLoading && !isAuthenticated\) \{\s*\n\s*window\.location\.href = \`http://identity\.asafarim\.local:5177/login\?returnUrl=\$\{encodeURIComponent\(\s*\n\s*window\.location\.href\s*\n\s*\)\}\`;\s*\n\s*\}\s*\n\s*\}, \[authLoading, isAuthenticated\]\);',
    r'\s*useEffect\(\(\) => \{\s*\n\s*if \(!authLoading && !isAuthenticated\) \{\s*\n\s*window\.location\.href = \`http://identity\.asafarim\.local:5177/login\?returnUrl=\$\{encodeURIComponent\(window\.location\.href\)\}\`;\s*\n\s*\}\s*\n\s*\}, \[authLoading, isAuthenticated\]\);'
]

for pattern in patterns:
    content = re.sub(pattern, '', content)

# Remove conditional render
pattern = r'  if \(!isAuthenticated\) \{\s*\n\s*return \(\s*\n.*?<p>Redirecting to login\.\.\.</p>\s*\n.*?\n\s*\);\s*\n\s*\}\s*\n'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)
" 2>/dev/null || echo "⚠️  Python processing failed for $file"
  
  count=$((count + 1))
done

echo ""
echo "✅ Processed $count files"
echo "📝 Backups created with .bak extension"
echo ""
echo "Next steps:"
echo "1. Review the changes"
echo "2. Run: pnpm run build:web to verify no errors"
echo "3. If successful, remove .bak files: find apps/web/src/pages/admin -name '*.bak' -delete"
echo "4. Redeploy: pnpm run sd"
