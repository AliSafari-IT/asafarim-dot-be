#!/usr/bin/env bash

# Selective deployment script for asafarim-dot-be
# Allows users to choose which apps and APIs to deploy with multi-selection support
# Usage: ./selective-deploy.sh
# Selection formats supported:
#   - Single: 1
#   - Multiple: 1,3,5
#   - Range: 1-5
#   - Mixed: 1,3-5,7

set -euo pipefail

#############################################
# Configuration
#############################################
REPO_DIR="/var/repos/asafarim-dot-be"
WWW_ROOT="/var/www"
SITE_ROOT="$WWW_ROOT/asafarim-dot-be"

# Packages directory
PACKAGES_DIR="$REPO_DIR/packages"
LIBS_DIR="$REPO_DIR/libs"
declare -A PACKAGES=(
    ["shared-ui-react"]="$PACKAGES_DIR/shared-ui-react"
    ["shared-i18n"]="$PACKAGES_DIR/shared-i18n"
    ["react-themes"]="$PACKAGES_DIR/react-themes"
    ["helpers"]="$PACKAGES_DIR/helpers"
    ["shared-validation"]="$LIBS_DIR/shared-validation"
    ["shared-logging"]="$LIBS_DIR/shared-logging"
)

# Frontend apps with their build paths
declare -A FRONTEND_APPS=(
    ["web"]="apps/web/dist"
    ["core-app"]="apps/core-app/dist"
    ["ai-ui"]="apps/ai-ui/dist"
    ["identity-portal"]="apps/identity-portal/dist"
    ["testora-ui"]="apps/test-automation-ui/dist"
    ["blog"]="apps/blog/build"
    ["jobs-ui"]="apps/jobs-ui/dist"
    ["taskmanagement-web"]="showcases/TaskManagement/taskmanagement-web/dist"
    ["smartops-web"]="showcases/SmartOperationsDashboard/smartops-web/dist"
    ["studynotes-ui"]="learn/learn-java-notes/java-notes-ui/dist"
)

# .NET APIs with their project paths and output directories
declare -A DotNet_API_PROJECTS=(
    ["Identity.Api"]="apis/Identity.Api/Identity.Api.csproj"
    ["Core.Api"]="apis/Core.Api/Core.Api.csproj"
    ["Ai.Api"]="apis/Ai.Api/Ai.Api.csproj"
    ["TestAutomation.Api"]="apis/TestAutomation.Api/TestAutomation.Api.csproj"
    ["TaskManagement.Api"]="showcases/TaskManagement/TaskManagement.Api/TaskManagement.Api.csproj"
    ["SmartOps.Api"]="showcases/SmartOperationsDashboard/SmartOps.Api/SmartOps.Api.csproj"
)

# Java APIs with their project paths and output directories
declare -A Java_API_PROJECTS=(
    ["StudyNotes.Api"]="learn/learn-java-notes/java-notes-api"
)

# Nodejs APIs with their project paths and output directories
declare -A Nodejs_API_PROJECTS=(
    ["TestRunner"]="apis/TestRunner/src/index.ts"
    )

declare -A API_OUTPUTS=(
    ["Identity.Api"]="$SITE_ROOT/apis/identity"
    ["Core.Api"]="$SITE_ROOT/apis/core"
    ["Ai.Api"]="$SITE_ROOT/apis/ai"
    ["TestAutomation.Api"]="$SITE_ROOT/apis/testora"
    ["TestRunner"]="$SITE_ROOT/apis/testrunner"
    ["TaskManagement.Api"]="$SITE_ROOT/apis/taskmanagement"
    ["SmartOps.Api"]="$SITE_ROOT/apis/smartops"
    ["StudyNotes.Api"]="$SITE_ROOT/apis/studynotes"
)

# Systemd services
declare -A API_SERVICES=(
    ["Identity.Api"]="dotnet-identity"
    ["Core.Api"]="dotnet-core"
    ["Ai.Api"]="dotnet-ai"
    ["TestAutomation.Api"]="dotnet-testora"
    ["TestRunner"]="nodejs-testora"
    ["TaskManagement.Api"]="dotnet-taskmanagement"
    ["SmartOps.Api"]="dotnet-smartops"
    ["StudyNotes.Api"]="java-studynotes"
)

#############################################
# Color codes for better UI
#############################################
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

#############################################
# Helper functions
#############################################
need_bin() { 
    command -v "$1" >/dev/null 2>&1 || { 
        echo -e "${RED}Error: missing dependency '$1'${NC}" >&2
        exit 1
    }
}

print_header() {
    echo -e "${CYAN}=============================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}=============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

restart_service_if_exists() {
    local svc="$1"
    if sudo systemctl list-unit-files "${svc}.service" >/dev/null 2>&1; then
        print_info "Restarting ${svc}..."
        sudo systemctl restart "${svc}"
        
        # Wait and check if service started successfully
        sleep 2
        if sudo systemctl is-active --quiet "${svc}"; then
            print_success "Service ${svc} restarted and running"
        else
            print_error "Service ${svc} failed to start!"
            sudo systemctl status "${svc}" --no-pager -l
            exit 1
        fi
    else
        print_warning "Service ${svc}.service not found, skipping"
    fi
}

# Parse selection input (supports 1,3,5 and 1-5 formats)
parse_selection() {
    local input="$1"
    local max_items="$2"
    local selected=()
    
    # Split by comma
    IFS=',' read -ra PARTS <<< "$input"
    
    for part in "${PARTS[@]}"; do
        part=$(echo "$part" | xargs) # trim whitespace
        
        if [[ "$part" =~ ^[0-9]+$ ]]; then
            # Single number
            if [ "$part" -ge 1 ] && [ "$part" -le "$max_items" ]; then
                selected+=("$part")
            else
                print_error "Invalid selection: $part (must be between 1 and $max_items)"
                return 1
            fi
        elif [[ "$part" =~ ^[0-9]+-[0-9]+$ ]]; then
            # Range (e.g., 1-5)
            local start=$(echo "$part" | cut -d'-' -f1)
            local end=$(echo "$part" | cut -d'-' -f2)
            
            if [ "$start" -ge 1 ] && [ "$end" -le "$max_items" ] && [ "$start" -le "$end" ]; then
                for ((i=start; i<=end; i++)); do
                    selected+=("$i")
                done
            else
                print_error "Invalid range: $part (must be between 1 and $max_items, start <= end)"
                return 1
            fi
        else
            print_error "Invalid format: $part (use numbers, ranges like 1-5, or comma-separated)"
            return 1
        fi
    done
    
    # Remove duplicates and sort
    printf '%s\n' "${selected[@]}" | sort -nu
}

#############################################
# Pre-flight checks
#############################################
print_header "Pre-flight Checks"

need_bin pnpm
need_bin node
need_bin rsync
need_bin dotnet
need_bin mvn
need_bin systemctl

if [[ $(id -u) -ne 0 ]]; then
    print_error "This script should be run with sudo/root (needed for systemctl and writing /var/www)"
    exit 1
fi

print_success "All dependencies found"

#############################################
# Display menus and get user selections
#############################################

# Frontend Apps Menu
print_header "Frontend Applications"
frontend_keys=($(printf '%s\n' "${!FRONTEND_APPS[@]}" | sort))
for i in "${!frontend_keys[@]}"; do
    key="${frontend_keys[$i]}"
    echo -e "${PURPLE}$((i+1)).${NC} ${key} (${FRONTEND_APPS[$key]})"
done

echo ""
echo -e "${YELLOW}Select frontend apps to deploy:${NC}"
echo -e "${CYAN}Examples: 1 | 1,3,5 | 1-3 | 1,3-5,7 | all | none${NC}"
read -p "Frontend selection: " frontend_selection

selected_frontends=()
# all or a
if [[ "$frontend_selection" == "all" || "$frontend_selection" == "a" ]]; then
    for i in "${!frontend_keys[@]}"; do
        selected_frontends+=("$((i+1))")
    done
    # none or 0
elif [[ "$frontend_selection" == "none" || "$frontend_selection" == "0" ]]; then
    selected_frontends=()
else
    mapfile -t selected_frontends < <(parse_selection "$frontend_selection" "${#frontend_keys[@]}")
fi

# API Menu - Combine .NET and Node.js APIs
echo ""
print_header "API Services"

# Create combined list of all APIs (.NET + Node.js)
declare -A ALL_API_PROJECTS
declare -A ALL_API_TYPES

# Add .NET APIs
for key in "${!DotNet_API_PROJECTS[@]}"; do
    ALL_API_PROJECTS[$key]="${DotNet_API_PROJECTS[$key]}"
    ALL_API_TYPES[$key]="dotnet"
done

# Add Java APIs
for key in "${!Java_API_PROJECTS[@]}"; do
    ALL_API_PROJECTS[$key]="${Java_API_PROJECTS[$key]}"
    ALL_API_TYPES[$key]="java"
done

# Add Node.js APIs
for key in "${!Nodejs_API_PROJECTS[@]}"; do
    ALL_API_PROJECTS[$key]="${Nodejs_API_PROJECTS[$key]}"
    ALL_API_TYPES[$key]="nodejs"
done

api_keys=($(printf '%s\n' "${!ALL_API_PROJECTS[@]}" | sort))
for i in "${!api_keys[@]}"; do
    key="${api_keys[$i]}"
    api_type="${ALL_API_TYPES[$key]}"
    echo -e "${PURPLE}$((i+1)).${NC} ${key} [${api_type}] (${ALL_API_PROJECTS[$key]})"
done

echo ""
echo -e "${YELLOW}Select APIs to deploy:${NC}"
echo -e "${CYAN}Examples: 1 | 1,3,5 | 1-3 | all | none${NC}"
read -p "API selection: " api_selection

selected_apis=()
if [[ "$api_selection" == "all" || "$api_selection" == "a" ]]; then
    for i in "${!api_keys[@]}"; do
        selected_apis+=("$((i+1))")
    done
    # none or 0
elif [[ "$api_selection" == "none" || "$api_selection" == "0" ]]; then
    selected_apis=()
else
    mapfile -t selected_apis < <(parse_selection "$api_selection" "${#api_keys[@]}")
fi

#############################################
# Confirmation
#############################################
echo ""
print_header "Deployment Summary"

if [ ${#selected_frontends[@]} -gt 0 ]; then
    echo -e "${GREEN}Frontend apps to deploy:${NC}"
    for idx in "${selected_frontends[@]}"; do
        key="${frontend_keys[$((idx-1))]}"
        echo -e "  • ${key}"
    done
else
    echo -e "${YELLOW}No frontend apps selected${NC}"
fi

if [ ${#selected_apis[@]} -gt 0 ]; then
    echo -e "${GREEN}APIs to deploy:${NC}"
    for idx in "${selected_apis[@]}"; do
        key="${api_keys[$((idx-1))]}"
        api_type="${ALL_API_TYPES[$key]}"
        echo -e "  • ${key} [${api_type}]"
    done
else
    echo -e "${YELLOW}No APIs selected${NC}"
fi

if [ ${#selected_frontends[@]} -eq 0 ] && [ ${#selected_apis[@]} -eq 0 ]; then
    print_warning "Nothing selected for deployment. Exiting."
    exit 0
fi

echo ""
read -p "Continue with deployment? (Y/n): " confirm
if [[ "$confirm" =~ ^[Nn]$ ]]; then
    print_info "Deployment cancelled by user"
    exit 0
fi

#############################################
# Install dependencies if needed
#############################################
if [ ${#selected_frontends[@]} -gt 0 ]; then
    print_header "Installing Dependencies"
    cd "$REPO_DIR"
    
    # Clean node_modules for selected apps
    for idx in "${selected_frontends[@]}"; do
        key="${frontend_keys[$((idx-1))]}"
        build_path="${FRONTEND_APPS[$key]}"
        # Extract app directory from build path (e.g., "apps/web/dist" -> "apps/web")
        app_path="$REPO_DIR/${build_path%/dist}"
        if [ -d "$app_path/node_modules" ]; then
            print_info "Cleaning node_modules for $key"
            rm -rf "$app_path/node_modules"
        fi
    done
    
    print_info "Installing workspace dependencies"
    pnpm i
    print_success "Dependencies installed"
fi

#############################################
# Build and deploy frontend apps
#############################################
if [ ${#selected_frontends[@]} -gt 0 ]; then
    print_header "Building Frontend Applications"
    
    cd "$REPO_DIR"
    
    # Build shared packages first: @asafarim/shared-ui-react, @asafarim/shared-i18n, @asafarim/react-themes, @asafarim/helpers
    print_info "Building shared packages..."
    pnpm rm:nm && pnpm i
    for pkg in "${!PACKAGES[@]}"; do
        pkg_path="${PACKAGES[$pkg]}"
        if [ -d "$pkg_path" ]; then
            print_info "Building package $pkg..."
            cd "$pkg_path"
            if pnpm build; then
                print_success "Package $pkg built successfully"
                print_info "----------------------------------"
            else
                print_error "Failed to build package $pkg"
                exit 1
            fi
        else
            print_warning "Package path not found: $pkg_path, skipping build for $pkg"
        fi
    done
    print_success "Shared packages built"
    print_info "----------------------------------"

    cd "$REPO_DIR"
    
    # Clean build directories for selected apps
    for idx in "${selected_frontends[@]}"; do
        key="${frontend_keys[$((idx-1))]}"
        build_path="${FRONTEND_APPS[$key]}"
        full_build_path="$REPO_DIR/$build_path"
        
        if [ -d "$full_build_path" ]; then
            print_info "Cleaning build directory for $key"
            rm -rf "$full_build_path"
        fi
    done
    
    # Build selected apps
    for idx in "${selected_frontends[@]}"; do
        key="${frontend_keys[$((idx-1))]}"
        print_info "Building $key..."
        
        build_path="${FRONTEND_APPS[$key]}"
        # Extract app directory from build path
        # Handle both /dist and /build suffixes (e.g., "apps/web/dist" -> "apps/web", "apps/blog/build" -> "apps/blog")
        app_dir="$REPO_DIR/${build_path%/dist}"
        app_dir="${app_dir%/build}"
        
        if [ ! -d "$app_dir" ]; then
            print_error "App directory not found: $app_dir"
            exit 1
        fi
        
        cd "$app_dir"
        if pnpm build; then
            print_success "$key built successfully"
        else
            print_error "Failed to build $key"
            exit 1
        fi
        cd "$REPO_DIR"
    done
    
    # Deploy built apps
    print_header "Deploying Frontend Applications"
    mkdir -p "$SITE_ROOT/apps"
    
    for idx in "${selected_frontends[@]}"; do
        key="${frontend_keys[$((idx-1))]}"
        build_path="${FRONTEND_APPS[$key]}"
        source_path="$REPO_DIR/$build_path"
        
        # Determine destination based on app location
        if [[ "$build_path" == showcases/* ]]; then
            # For showcases apps, deploy to apps/ directory with app name
            dest_path="$SITE_ROOT/apps/$key"
        else
            # For regular apps, deploy to apps/ directory with app name
            dest_path="$SITE_ROOT/apps/$key"
        fi
        
        if [ -d "$source_path" ]; then
            # Backup existing deployment
            if [ -d "$dest_path" ]; then
                backup_path="$dest_path.backup.$(date +%Y%m%d_%H%M%S)"
                print_info "Backing up existing deployment to $backup_path"
                cp -r "$dest_path" "$backup_path"
            fi
            
            print_info "Deploying $key to $dest_path"
            mkdir -p "$dest_path"
            rsync -av --delete "$source_path/" "$dest_path/"
            print_success "$key deployed successfully"
            chown -R www-data:www-data "$dest_path"
            chmod -R 755 "$dest_path"
        else
            print_error "Build directory not found for $key: $source_path"
            exit 1
        fi
    done
fi



#############################################
# Build and deploy APIs
#############################################
if [ ${#selected_apis[@]} -gt 0 ]; then
    print_header "Building and Deploying APIs"
    
    mkdir -p "$SITE_ROOT/apis"
    
    # Separate .NET, Java, and Node.js APIs
    dotnet_apis=()
    java_apis=()
    nodejs_apis=()
    
    for idx in "${selected_apis[@]}"; do
        key="${api_keys[$((idx-1))]}"
        api_type="${ALL_API_TYPES[$key]}"
        
        if [ "$api_type" = "dotnet" ]; then
            dotnet_apis+=("$idx")
        elif [ "$api_type" = "java" ]; then
            java_apis+=("$idx")
        elif [ "$api_type" = "nodejs" ]; then
            nodejs_apis+=("$idx")
        fi
    done
    
    # Deploy .NET APIs
    if [ ${#dotnet_apis[@]} -gt 0 ]; then
        print_info "Restoring NuGet packages for .NET APIs..."
        cd "$REPO_DIR"
        dotnet restore
        print_success "NuGet packages restored"
        
        for idx in "${dotnet_apis[@]}"; do
            key="${api_keys[$((idx-1))]}"
            project_path="${DotNet_API_PROJECTS[$key]}"
            output_path="${API_OUTPUTS[$key]}"
            
            print_info "Building $key..."
            
            # Verify build succeeds
            if dotnet build "$REPO_DIR/$project_path" -c Release --no-restore; then
                print_success "$key build verification successful"
                
                # Remove existing output directory
                if [ -d "$output_path" ]; then
                    print_info "Removing existing deployment for $key"
                    rm -rf "$output_path"
                fi
                
                # Publish the API
                print_info "Publishing $key to $output_path"
                mkdir -p "$output_path"
                
                if dotnet publish "$REPO_DIR/$project_path" -c Release -o "$output_path" --no-restore; then
                    print_success "$key published successfully"
                    
                    # Set proper permissions for .NET API
                    chown -R www-data:www-data "$output_path"
                    chmod -R 755 "$output_path"
                else
                    print_error "Failed to publish $key"
                    exit 1
                fi
            else
                print_error "Failed to build $key"
                exit 1
            fi
        done
    fi
    
    # Deploy Java APIs
    if [ ${#java_apis[@]} -gt 0 ]; then
        print_info "Building Java APIs..."
        cd "$REPO_DIR"
        
        for idx in "${java_apis[@]}"; do
            key="${api_keys[$((idx-1))]}"
            project_path="${Java_API_PROJECTS[$key]}"
            output_path="${API_OUTPUTS[$key]}"
            project_dir="$REPO_DIR/$project_path"
            
            print_info "Building $key..."
            
            if [ ! -d "$project_dir" ]; then
                print_error "Project directory not found: $project_dir"
                exit 1
            fi
            
            cd "$project_dir"
            
            # Build with Maven
            if [ -f "pom.xml" ]; then
                print_info "Building $key with Maven..."
                if mvn clean package -DskipTests -q; then
                    print_success "$key build successful"
                    
                    # Remove existing output directory
                    if [ -d "$output_path" ]; then
                        print_info "Removing existing deployment for $key"
                        rm -rf "$output_path"
                    fi
                    
                    # Deploy built JAR
                    print_info "Deploying $key to $output_path"
                    mkdir -p "$output_path"
                    
                    # Copy JAR file
                    jar_file=$(find target -name "*.jar" -type f | head -1)
                    if [ -n "$jar_file" ]; then
                        cp "$jar_file" "$output_path/app.jar"
                        
                        # Set proper permissions for Java API
                        chown -R www-data:www-data "$output_path"
                        chmod -R 755 "$output_path"
                        chmod 644 "$output_path/app.jar"
                        
                        print_success "$key deployed successfully"
                    else
                        print_error "JAR file not found for $key"
                        exit 1
                    fi
                else
                    print_error "Failed to build $key with Maven"
                    exit 1
                fi
            else
                print_error "pom.xml not found in $project_dir"
                exit 1
            fi
        done
    fi
    
    # Deploy Node.js APIs
    if [ ${#nodejs_apis[@]} -gt 0 ]; then
        print_info "Building Node.js APIs..."
        cd "$REPO_DIR"
        
        for idx in "${nodejs_apis[@]}"; do
            key="${api_keys[$((idx-1))]}"
            project_path="${Nodejs_API_PROJECTS[$key]}"
            output_path="${API_OUTPUTS[$key]}"
            project_dir="$REPO_DIR/${project_path%/src/index.ts}"
            
            print_info "Building $key..."
            
            if [ ! -d "$project_dir" ]; then
                print_error "Project directory not found: $project_dir"
                exit 1
            fi
            
            cd "$project_dir"
            
            # Install dependencies
            if [ -f "package.json" ]; then
                print_info "Installing dependencies for $key..."
                pnpm install
            fi
            
            # Build the project
            if pnpm run build; then
                print_success "$key build successful"
                
                # Remove existing output directory
                if [ -d "$output_path" ]; then
                    print_info "Removing existing deployment for $key"
                    rm -rf "$output_path"
                fi
                
                # Deploy built files
                print_info "Deploying $key to $output_path"
                
                # Use pnpm deploy to handle workspace dependencies correctly
                cd "$REPO_DIR"
                # Ensure parent directory exists
                mkdir -p "$(dirname "$output_path")"
                
                # Get package name from package.json
                pkg_name=$(grep -o '"name": *"[^"]*"' "$project_dir/package.json" | cut -d'"' -f4)
                
                if pnpm deploy --filter "$pkg_name" --prod "$output_path"; then
                    print_success "Deployed $pkg_name structure with dependencies"
                    
                    # Ensure dist directory is present (pnpm deploy might exclude it if ignored)
                    if [ -d "$project_dir/dist" ]; then
                        # Check if dist exists in output and matches source
                        # We force copy to be sure we have the latest build
                        print_info "Syncing build artifacts..."
                        cp -r "$project_dir/dist" "$output_path/"
                    fi
                    
                    # Set proper permissions for Node.js API
                    chown -R www-data:www-data "$output_path"
                    chmod -R 755 "$output_path"
                    
                    # For TestRunner, ensure temp directory exists and has proper permissions
                    if [ "$key" = "TestRunner" ]; then
                        print_info "Setting up TestRunner temp directory..."
                        TEMP_DIR="${TEMP_TESTS_DIR:-/var/tmp/testrunner-tests}"
                        mkdir -p "$TEMP_DIR"
                        chown www-data:www-data "$TEMP_DIR" 2>/dev/null || true
                        chmod 1777 "$TEMP_DIR" 2>/dev/null || chmod 755 "$TEMP_DIR"
                        print_success "TestRunner temp directory ready: $TEMP_DIR"
                    fi
                    
                    print_success "$key deployed successfully"
                else
                    print_error "Deployment failed for $key"
                    exit 1
                fi
            else
                print_error "Failed to build $key"
                exit 1
            fi
        done
    fi
    
    # Restart services for deployed APIs
    print_header "Restarting API Services"
    for idx in "${selected_apis[@]}"; do
        key="${api_keys[$((idx-1))]}"
        service_name="${API_SERVICES[$key]}"
        restart_service_if_exists "$service_name"
    done
    
fi

#############################################
# Reload Nginx
#############################################
print_header "Reloading Nginx"
if systemctl is-active --quiet nginx; then
    systemctl reload nginx
    print_success "Nginx reloaded"
else
    print_warning "Nginx is not running"
fi

#############################################
# Summary
#############################################
print_header "Deployment Complete"
print_success "Selected components have been deployed successfully!"

if [ ${#selected_frontends[@]} -gt 0 ]; then
    echo -e "${GREEN}Deployed frontend apps:${NC}"
    for idx in "${selected_frontends[@]}"; do
        key="${frontend_keys[$((idx-1))]}"
        echo -e "  ✓ ${key}"
    done
fi

if [ ${#selected_apis[@]} -gt 0 ]; then
    echo -e "${GREEN}Deployed APIs:${NC}"
    for idx in "${selected_apis[@]}"; do
        key="${api_keys[$((idx-1))]}"
        api_type="${ALL_API_TYPES[$key]}"
        echo -e "  ✓ ${key} [${api_type}]"
    done
fi

print_info "Deployment completed at $(date)"
