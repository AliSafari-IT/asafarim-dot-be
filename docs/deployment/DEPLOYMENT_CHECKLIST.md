# 🚀 Production Deployment Checklist

> **Critical**: Complete ALL items in this checklist before deploying to production. Each unchecked item represents a potential production issue.

## 📋 Pre-Deployment Checklist

### 🔐 Security & Configuration

- [ ] **Environment Variables**
  - [ ] All production `.env` files are configured (NOT committed to git)
  - [ ] Database connection strings use production credentials
  - [ ] JWT secrets are strong and unique (minimum 32 characters)
  - [ ] API keys are production-ready (not development/test keys)
  - [ ] CORS origins are properly configured for production domains
  - [ ] Cookie domains are set to production domain (e.g., `.asafarim.be`)

- [ ] **Secrets Management**
  - [ ] No hardcoded secrets in codebase
  - [ ] `appsettings.Production.json` contains production-only settings
  - [ ] Sensitive files are in `.gitignore` (verify with `git status`)
  - [ ] User secrets are properly configured for .NET APIs

- [ ] **Authentication & Authorization**
  - [ ] Token expiration times are appropriate for production (currently 4 hours)
  - [ ] Password policies are enforced
  - [ ] Role-based access control is properly configured
  - [ ] Cookie security flags are enabled (`Secure`, `HttpOnly`, `SameSite`)

### 🗄️ Database

- [ ] **Migrations & Schema**
  - [ ] All Entity Framework migrations are applied: `dotnet ef database update`
  - [ ] Database backup exists before migration
  - [ ] Migration rollback plan is documented
  - [ ] Database indexes are optimized for production load

- [ ] **Data Integrity**
  - [ ] Production database is seeded with initial data
  - [ ] Test data is cleaned from production database
  - [ ] Database constraints and foreign keys are properly configured
  - [ ] Backup strategy is in place and tested

### 🏗️ Application Build

- [ ] **Frontend Builds**
  - [ ] All React applications build successfully: `pnpm run app:build`
  - [ ] Production builds are optimized (minified, chunked)
  - [ ] Static assets are properly versioned
  - [ ] Service worker is configured for caching

- [ ] **Backend Builds**
  - [ ] All .NET APIs compile without errors: `dotnet build --configuration Release`
  - [ ] Release configuration is used (not Debug)
  - [ ] All tests pass: `dotnet test`
  - [ ] Code analysis passes (if configured)

- [ ] **Shared Packages**
  - [ ] Shared UI components build correctly: `pnpm run dev:shared`
  - [ ] All consuming applications work with shared components
  - [ ] TypeScript declarations are properly generated

### 🌐 Infrastructure & Deployment

- [ ] **Server Configuration**
  - [ ] Production servers are ready and accessible
  - [ ] SSL certificates are valid and installed
  - [ ] Domain DNS is pointing to correct servers
  - [ ] Firewall rules allow necessary ports

- [ ] **Reverse Proxy Setup**
  - [ ] Nginx/Caddy is configured for all applications
  - [ ] Load balancing is configured if using multiple servers
  - [ ] Health check endpoints are configured
  - [ ] Static file serving is optimized

- [ ] **Process Management**
  - [ ] PM2/Systemd configuration files are ready
  - [ ] Startup scripts handle graceful shutdowns
  - [ ] Log rotation is configured
  - [ ] Monitoring/alerting is set up

### 🔍 Testing & Quality Assurance

- [ ] **Functional Testing**
  - [ ] All major user flows work in production-like environment
  - [ ] Authentication flows work correctly
  - [ ] Database operations complete successfully
  - [ ] File uploads/downloads work (if applicable)

- [ ] **Performance Testing**
  - [ ] Application handles expected load
  - [ ] Database queries are optimized
  - [ ] API response times are acceptable
  - [ ] Frontend bundle sizes are reasonable

- [ ] **Security Testing**
  - [ ] No XSS vulnerabilities in forms
  - [ ] SQL injection protection is in place
  - [ ] CSRF protection is enabled
  - [ ] HTTPS is enforced throughout application

### 📊 Monitoring & Logging

- [ ] **Application Monitoring**
  - [ ] Error tracking is configured (Sentry, Application Insights, etc.)
  - [ ] Performance monitoring is in place
  - [ ] Health check endpoints are accessible
  - [ ] API rate limiting is configured

- [ ] **Infrastructure Monitoring**
  - [ ] Server resource monitoring is set up
  - [ ] Database performance monitoring is configured
  - [ ] Log aggregation is in place
  - [ ] Alert thresholds are configured

### 📚 Documentation

- [ ] **Runbooks**
  - [ ] Deployment procedures are documented
  - [ ] Rollback procedures are documented
  - [ ] Troubleshooting guides are available
  - [ ] Emergency contact information is current

- [ ] **API Documentation**
  - [ ] Swagger/OpenAPI documentation is updated
  - [ ] API versioning strategy is documented
  - [ ] Breaking changes are communicated to consumers

## 🚢 Deployment Steps

### **Phase 1: Pre-Deployment Verification**

```bash
# 1. Verify all tests pass
pnpm run test  # If configured
dotnet test    # For all APIs

# 2. Build all applications
pnpm run app:build

# 3. Verify builds are production-ready
ls -la dist/ build/ wwwroot/  # Check build outputs

# 4. Run database migrations (on production database)
dotnet ef database update --project apis/Core.Api
```

### **Phase 2: Production Deployment**

```bash
# 1. Backup production database
# (Use your backup strategy)

# 2. Deploy backend APIs first
# Copy built APIs to production servers
# Start API services

# 3. Deploy frontend applications
# Copy built frontend apps to web servers
# Configure reverse proxy

# 4. Verify deployment
# Check health endpoints
# Test critical user flows
```

### **Phase 3: Post-Deployment Verification**

- [ ] **Health Checks**
  - [ ] All applications respond to health check endpoints
  - [ ] Database connections are working
  - [ ] External APIs are accessible
  - [ ] Static assets load correctly

- [ ] **Functional Testing**
  - [ ] User registration/login works
  - [ ] Portfolio pages load correctly
  - [ ] Publication management functions properly
  - [ ] Resume publishing works (if enabled)

- [ ] **Performance Monitoring**
  - [ ] Response times are acceptable
  - [ ] Error rates are within acceptable thresholds
  - [ ] Resource usage is normal
  - [ ] Database performance is good

## 🔄 Rollback Plan

### **Immediate Rollback (if critical issues discovered)**

```bash
# 1. Stop all new application instances
# 2. Restore database from backup
# 3. Restart previous version of applications
# 4. Verify rollback success
```

### **Gradual Rollback (if non-critical issues)**

```bash
# 1. Deploy previous version alongside current
# 2. Gradually route traffic back to previous version
# 3. Monitor for issue resolution
# 4. Complete rollback if issues persist
```

## 📞 Emergency Contacts

- **Technical Lead**: [Your Name] - [Your Contact Info]
- **DevOps Team**: [Team Contact Info]
- **Infrastructure Team**: [Infra Contact Info]
- **Security Team**: [Security Contact Info]

## ✅ Final Sign-Off

**Deployment Authorized By:**

- Name: ______________________________ Date: _______________
- Role: ______________________________ Time: _______________

**All checklist items completed**: ☐ YES ☐ NO

**Notes**: ________________________________________________________________________________
________________________________________________________________________________
________________________________________________________________________________

---

⚠️ **REMINDER**: Never deploy to production without completing this entire checklist. Production issues can affect real users and business operations.
