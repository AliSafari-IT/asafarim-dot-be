#!/bin/bash

# Setup script for i18n integration across ASafariM monorepo
# This script installs dependencies, builds packages, and runs database migrations

set -e  # Exit on error

echo "🌍 Setting up i18n for ASafariM monorepo..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Build shared-i18n package
echo -e "${BLUE}🔨 Step 2: Building shared-i18n package...${NC}"
cd packages/shared-i18n
pnpm build
cd ../..
echo -e "${GREEN}✓ shared-i18n package built${NC}"
echo ""

# Step 3: Build shared-ui-react package (includes LanguageSwitcher)
echo -e "${BLUE}🔨 Step 3: Building shared-ui-react package...${NC}"
cd packages/shared-ui-react
pnpm build
cd ../..
echo -e "${GREEN}✓ shared-ui-react package built${NC}"
echo ""

# Step 4: Run database migration
echo -e "${BLUE}💾 Step 4: Running database migration...${NC}"
echo -e "${YELLOW}⚠️  This will add PreferredLanguage column to AspNetUsers table${NC}"
read -p "Continue with migration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    cd apis/Identity.Api
    
    # Check if dotnet-ef is installed
    if ! command -v dotnet-ef &> /dev/null
    then
        echo "Installing dotnet-ef tool..."
        dotnet tool install --global dotnet-ef
    fi
    
    # Create and apply migration
    echo "Creating migration..."
    dotnet ef migrations add AddPreferredLanguageToUser
    
    echo "Applying migration..."
    dotnet ef database update
    
    cd ../..
    echo -e "${GREEN}✓ Database migration completed${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping database migration${NC}"
    echo -e "${YELLOW}   You can run it manually later with:${NC}"
    echo -e "${YELLOW}   cd apis/Identity.Api && dotnet ef migrations add AddPreferredLanguageToUser && dotnet ef database update${NC}"
fi
echo ""

# Step 5: Verify setup
echo -e "${BLUE}🔍 Step 5: Verifying setup...${NC}"

# Check if translation files exist
if [ -f "packages/shared-i18n/locales/en/common.json" ] && [ -f "packages/shared-i18n/locales/nl/common.json" ]; then
    echo -e "${GREEN}✓ Translation files exist${NC}"
else
    echo -e "${YELLOW}⚠️  Translation files missing${NC}"
fi

# Check if LanguageSwitcher component exists
if [ -f "packages/shared-ui-react/components/LanguageSwitcher/LanguageSwitcher.tsx" ]; then
    echo -e "${GREEN}✓ LanguageSwitcher component exists${NC}"
else
    echo -e "${YELLOW}⚠️  LanguageSwitcher component missing${NC}"
fi

# Check if PreferencesController exists
if [ -f "apis/Identity.Api/Controllers/PreferencesController.cs" ]; then
    echo -e "${GREEN}✓ PreferencesController exists${NC}"
else
    echo -e "${YELLOW}⚠️  PreferencesController missing${NC}"
fi

echo ""
echo -e "${GREEN}✅ i18n setup complete!${NC}"
echo ""
echo -e "${BLUE}📚 Next steps:${NC}"
echo "1. Review the integration guide: docs/i18n-integration-guide.md"
echo "2. Add LanguageSwitcher to your app's navigation"
echo "3. Use useTranslation() hook in components"
echo "4. Test language switching across apps"
echo ""
echo -e "${BLUE}🚀 To start development:${NC}"
echo "   pnpm dev          # Start all frontend apps"
echo "   pnpm api          # Start all backend APIs"
echo "   pnpm app          # Start everything"
echo ""
