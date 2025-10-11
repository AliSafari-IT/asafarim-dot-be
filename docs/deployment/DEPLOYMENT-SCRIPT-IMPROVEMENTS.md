# Deployment Script Improvements

**Date**: October 11, 2025  
**Script**: `scripts/selective-deploy.sh`  
**Status**: ⚠️ **Needs Minor Fixes**

---

## Issues Found

### 🔴 Critical Issues

#### 1. Missing `dotnet restore` Before Build (Line 355)

**Current:**
```bash
if dotnet build "$REPO_DIR/$project_path" -c Release --no-restore; then
```

**Problem:** Using `--no-restore` without running `dotnet restore` first will fail.

**Fix:** Add restore step before building APIs:

```bash
# After line 345, add:
print_info "Restoring NuGet packages for APIs..."
cd "$REPO_DIR"
dotnet restore
print_success "NuGet packages restored"
```

#### 2. Shared Packages Not Rebuilt (Line 288)

**Problem:** Frontend apps use `@asafarim/shared-ui-react` package, but the script doesn't rebuild it first. This means the useAuth fix won't be included.

**Fix:** Add shared package build before frontend builds:

```bash
# After line 288, before building frontend apps:
if [ ${#selected_frontends[@]} -gt 0 ]; then
    print_header "Building Shared Packages"
    
    print_info "Building shared-ui-react package..."
    cd "$REPO_DIR/packages/shared-ui-react"
    pnpm build
    print_success "Shared packages built"
    cd "$REPO_DIR"
    
    print_header "Building Frontend Applications"
    # ... rest of frontend build code
fi
```

---

### ⚠️ Recommended Improvements

#### 3. Add File Permissions After Deployment

**After line 331:**
```bash
# Set correct ownership and permissions
chown -R www-data:www-data "$dest_path"
chmod -R 755 "$dest_path"
print_info "Permissions set for $key"
```

#### 4. Verify Service Health After Restart

**Replace `restart_service_if_exists` function (around line 90):**

```bash
restart_service_if_exists() {
    local svc="$1"
    if sudo systemctl list-unit-files "${svc}.service" >/dev/null 2>&1; then
        print_info "Restarting ${svc}..."
        sudo systemctl restart "${svc}"
        
        # Wait for service to start
        sleep 2
        
        # Verify service is running
        if sudo systemctl is-active --quiet "${svc}"; then
            print_success "Service ${svc} restarted and running"
        else
            print_error "Service ${svc} failed to start!"
            print_error "Service status:"
            sudo systemctl status "${svc}" --no-pager -l | head -20
            exit 1
        fi
    else
        print_warning "Service ${svc}.service not found, skipping"
    fi
}
```

#### 5. Add Backup Before Overwriting

**Before line 330:**
```bash
# Backup existing deployment
if [ -d "$dest_path" ]; then
    backup_path="$dest_path.backup.$(date +%Y%m%d_%H%M%S)"
    print_info "Backing up existing deployment to $backup_path"
    cp -r "$dest_path" "$backup_path"
    
    # Keep only last 3 backups
    ls -dt "$SITE_ROOT/apps/$key.backup."* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true
fi
```

#### 6. Add Rollback Function

**Add after helper functions (around line 110):**

```bash
rollback_deployment() {
    local app_name="$1"
    local backup_dir=$(ls -dt "$SITE_ROOT/apps/$app_name.backup."* 2>/dev/null | head -1)
    
    if [ -n "$backup_dir" ]; then
        print_warning "Rolling back $app_name to previous version..."
        rm -rf "$SITE_ROOT/apps/$app_name"
        cp -r "$backup_dir" "$SITE_ROOT/apps/$app_name"
        print_success "Rollback complete"
    else
        print_error "No backup found for $app_name"
    fi
}
```

#### 7. Add Deployment Verification

**After line 336:**
```bash
# Verify deployment
print_header "Verifying Frontend Deployments"
for idx in "${selected_frontends[@]}"; do
    key="${frontend_keys[$((idx-1))]}"
    dest_path="$SITE_ROOT/apps/$key"
    
    # Check if index.html exists (for most frontend apps)
    if [ -f "$dest_path/index.html" ]; then
        print_success "$key deployment verified (index.html found)"
    else
        print_warning "$key deployed but index.html not found (might be normal for some apps)"
    fi
    
    # Check file count
    file_count=$(find "$dest_path" -type f | wc -l)
    print_info "$key: $file_count files deployed"
done
```

---

## Complete Patch

Here's the complete set of changes to apply:

### Patch 1: Add Shared Package Build

**Location:** After line 288

```bash
if [ ${#selected_frontends[@]} -gt 0 ]; then
    print_header "Building Shared Packages"
    
    print_info "Building shared-ui-react package..."
    cd "$REPO_DIR/packages/shared-ui-react"
    if pnpm build; then
        print_success "Shared packages built"
    else
        print_error "Failed to build shared packages"
        exit 1
    fi
    cd "$REPO_DIR"
    
    print_header "Building Frontend Applications"
```

### Patch 2: Add dotnet restore

**Location:** After line 345

```bash
if [ ${#selected_apis[@]} -gt 0 ]; then
    print_header "Building and Deploying APIs"
    
    # Restore NuGet packages first
    print_info "Restoring NuGet packages..."
    cd "$REPO_DIR"
    if dotnet restore; then
        print_success "NuGet packages restored"
    else
        print_error "Failed to restore NuGet packages"
        exit 1
    fi
    
    mkdir -p "$SITE_ROOT/apis"
```

### Patch 3: Improve Service Restart Function

**Location:** Replace function around line 90

```bash
restart_service_if_exists() {
    local svc="$1"
    if sudo systemctl list-unit-files "${svc}.service" >/dev/null 2>&1; then
        print_info "Restarting ${svc}..."
        sudo systemctl restart "${svc}"
        
        # Wait for service to start
        sleep 2
        
        # Verify service is running
        if sudo systemctl is-active --quiet "${svc}"; then
            print_success "Service ${svc} restarted and running"
            
            # Show last few log lines
            print_info "Recent logs for ${svc}:"
            sudo journalctl -u "${svc}" -n 3 --no-pager | tail -3
        else
            print_error "Service ${svc} failed to start!"
            print_error "Service status:"
            sudo systemctl status "${svc}" --no-pager -l | head -20
            
            print_error "Recent error logs:"
            sudo journalctl -u "${svc}" -n 10 --no-pager
            exit 1
        fi
    else
        print_warning "Service ${svc}.service not found, skipping"
    fi
}
```

---

## Quick Fix Script

Run this to apply the most critical fixes:

```bash
cd /var/repos/asafarim-dot-be/scripts

# Backup original
cp selective-deploy.sh selective-deploy.sh.backup

# Apply fixes manually or use the improved version
```

---

## Testing the Fixed Script

After applying fixes:

```bash
# Test with a single frontend app
sudo ./scripts/selective-deploy.sh
# Select: identity-portal (1)
# Select: Identity.Api (1)

# Verify:
1. Check shared package was built first
2. Check dotnet restore ran
3. Check services restarted successfully
4. Check logs show no errors
```

---

## Summary

| Issue | Severity | Status |
|-------|----------|--------|
| Missing dotnet restore | 🔴 Critical | Needs fix |
| Shared packages not rebuilt | 🔴 Critical | Needs fix |
| No service health check | ⚠️ Important | Recommended |
| No backup before deploy | ⚠️ Important | Recommended |
| No deployment verification | ⚠️ Nice to have | Optional |
| Missing file permissions | ⚠️ Nice to have | Optional |

---

## Next Steps

1. **Apply critical fixes** (dotnet restore + shared package build)
2. **Test deployment** with identity-portal to verify useAuth fix works
3. **Add recommended improvements** for production safety
4. **Document rollback procedure** for emergencies

Your script structure is excellent - these are just refinements for production reliability!
