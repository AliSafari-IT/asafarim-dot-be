#!/usr/bin/env bash
# ASafariM Production Environment Variables
# Copy to /etc/asafarim/env on the server and adjust values
# This file will be loaded by systemd services

# Database connection strings
CONNECTIONSTRINGS__DEFAULTCONNECTION="Host=localhost;Port=5432;Database=asafarim;Username=postgres;Password=secure_password_here"
CONNECTIONSTRINGS__JOBSCONNECTION="Host=localhost;Port=5432;Database=jobs;Username=postgres;Password=secure_password_here"
CONNECTIONSTRINGS__SHAREDCONNECTION="Host=localhost;Port=5432;Database=shared_db;Username=postgres;Password=secure_password_here"

# JWT Authentication
AUTHJWT__KEY="0+a0ZklJy6DVL6osEj73W6P9inMk3+Ocn8KkQoUDR78="
AUTHJWT__ISSUER="asafarim.be"
AUTHJWT__AUDIENCE="asafarim.be"
AUTHJWT__ACCESSMINUTES="15"
AUTHJWT__REFRESHDAYS="30"
AUTHJWT__EXPIRESINMINUTES="1440"
AUTHJWT__COOKIEDOMAIN=".asafarim.be"  # Production domain (.asafarim.be instead of .asafarim.local)

# OpenAI API
OPENAI__APIKEY="sk-your-production-key-here"
OPENAI__BASEURL="https://api.openai.com/v1"
OPENAI__ORGANIZATIONNAME="Personal"
OPENAI__ORGANIZATIONID="org-x68qisvsgkmYw6ML65QIbAAs"
OPENAI__PROJECTNAME="ASafariM"
OPENAI__PROJECTID="proj_t7T80MIYsSE0UEE4JjhTeLWC"
OPENAI__MODEL="gpt-4o-mini"
OPENAI__TEMPERATURE="0.7"
OPENAI__MAXTOKENS="4096"
OPENAI__TOPP="1"
OPENAI__FREQUENCYPENALTY="0"
OPENAI__PRESENCEPENALTY="0"
OPENAI__RESPONSEFORMAT="text"
OPENAI__USEMOCKONFAILURE="false"

# Email settings
EMAIL__SMTPHOST="smtp.hostinger.com"
EMAIL__SMTPPORT="465"
EMAIL__SMTPUSERNAME="ali@asafarim.com"
EMAIL__SMTPPASSWORD="secure_password_here"
EMAIL__FROMDISPLAYNAME="ASafariM Support"

# OAuth settings
AUTHENTICATION__GOOGLE__CLIENTID="69391174556-g8vohlhm1vpmiealvmu7b9tr0la9c0sp.apps.googleusercontent.com"
AUTHENTICATION__GOOGLE__CLIENTSECRET="secure_secret_here"
AUTHENTICATION__GOOGLE__REDIRECTURI="https://identity.asafarim.be"  # Production redirect URI

# CORS origins for production (comma-separated)
ALLOWED_ORIGINS="https://asafarim.be,https://www.asafarim.be,https://identity.asafarim.be,https://ai.asafarim.be,https://core.asafarim.be,https://blog.asafarim.be"

# ASP.NET Core settings
ASPNETCORE_ENVIRONMENT="Production"
