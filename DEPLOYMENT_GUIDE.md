# Deployment Guide - AWFR Restaurant Ordering System

## Overview

This guide covers the deployment configuration for the AWFR restaurant ordering system, including SSH key management, CI/CD setup, and deployment platforms.

## SSH Key Configuration

### SSH Public Key
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFGvcOwrADeC3e18PmYRDDPnJegwfYGrjAKGkoyGZhGg awfr-delivery-comparison@runner
```

This Ed25519 SSH public key is configured for automated deployment runners.

### Key Details
- **Algorithm**: Ed25519 (modern, secure SSH key algorithm)
- **Key Type**: Public key for deployment authentication
- **Identifier**: `awfr-delivery-comparison@runner`
- **Purpose**: Automated deployment and CI/CD pipeline access

### SSH Key Management

#### 1. Adding SSH Key to Deployment Platforms

**For Render.com:**
1. Go to your Render dashboard
2. Navigate to Account Settings > SSH Keys
3. Add the public key with label: `awfr-delivery-comparison-runner`

**For Vercel:**
1. Go to Vercel dashboard
2. Navigate to Settings > Git
3. Add SSH key for repository access

**For GitHub Actions:**
1. Go to repository Settings > Secrets and variables > Actions
2. Add SSH private key as `DEPLOY_SSH_KEY`

#### 2. Environment Variables Setup

```bash
# Required environment variables for deployment
NEXT_PUBLIC_APP_NAME=AWFR
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENVIRONMENT=production
NODE_ENV=production
```

## Deployment Platforms

### 1. Render.com (Primary)

**Configuration File**: `render.yaml`

```yaml
services:
  - type: web
    name: awfr-delivery-comparison
    env: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_APP_NAME
        value: AWFR
      - key: NEXT_PUBLIC_APP_VERSION
        value: 1.0.0
      - key: NEXT_PUBLIC_APP_ENVIRONMENT
        value: production
    healthCheckPath: /
    autoDeploy: true
    branch: main
```

**Deployment Steps:**
1. Connect your GitHub repository to Render
2. Configure environment variables
3. Set up SSH key for secure deployment
4. Enable auto-deploy on main branch

### 2. Vercel (Alternative)

**Configuration File**: `vercel.json`

```json
{
  "name": "awfr-delivery-comparison",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
        }
      ]
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_NAME": "AWFR",
    "NEXT_PUBLIC_APP_VERSION": "1.0.0",
    "NEXT_PUBLIC_APP_ENVIRONMENT": "production"
  }
}
```

### 3. Docker Deployment

**Configuration File**: `Dockerfile`

```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS base
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
```

## CI/CD Pipeline Configuration

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm run test
    - name: Run E2E tests
      run: npm run test:e2e
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Setup SSH
      uses: webfactory/ssh-agent@v0.8.0
      with:
        ssh-private-key: ${{ secrets.DEPLOY_SSH_KEY }}
    - name: Deploy to Render
      run: |
        # Add deployment commands here
        echo "Deploying to production..."
```

### Environment-Specific Configurations

#### Development Environment
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_ENVIRONMENT=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Staging Environment
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENVIRONMENT=staging
NEXT_PUBLIC_API_URL=https://staging.awfr.com
```

#### Production Environment
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENVIRONMENT=production
NEXT_PUBLIC_API_URL=https://awfr.com
```

## Security Configuration

### 1. SSH Key Security

- **Key Type**: Ed25519 (recommended for modern deployments)
- **Key Length**: 256 bits (standard for Ed25519)
- **Access Control**: Limited to deployment operations only
- **Rotation**: Rotate keys every 90 days

### 2. Environment Variables Security

```bash
# Sensitive data should be encrypted
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_encrypted_key
NEXT_PUBLIC_ANALYTICS_ID=your_encrypted_id
DATABASE_URL=your_encrypted_database_url
```

### 3. Content Security Policy

Configured in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
        },
      ],
    },
  ];
}
```

## Monitoring and Logging

### 1. Application Monitoring

```javascript
// Add to your application
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT,
  tracesSampleRate: 1.0,
});
```

### 2. Health Checks

Configure health check endpoints:

```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_APP_ENVIRONMENT,
    version: process.env.NEXT_PUBLIC_APP_VERSION,
  });
}
```

## Troubleshooting

### Common Deployment Issues

1. **SSH Key Authentication Failed**
   - Verify the public key is correctly added to the deployment platform
   - Check key permissions (should be 600 for private key)
   - Ensure the key is in the correct format

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific error messages

3. **Environment Variables Missing**
   - Ensure all required environment variables are set
   - Check variable naming conventions
   - Verify variable values are correct

### Debug Commands

```bash
# Check SSH connection
ssh -T awfr-delivery-comparison@runner

# Verify deployment status
curl -I https://your-app-url.com

# Check application logs
npm run logs

# Test build locally
npm run build
```

## Best Practices

1. **Security**
   - Use Ed25519 SSH keys for better security
   - Rotate keys regularly
   - Limit key permissions to minimum required

2. **Deployment**
   - Use blue-green deployment for zero downtime
   - Implement proper rollback procedures
   - Monitor deployment metrics

3. **Environment Management**
   - Separate development, staging, and production environments
   - Use environment-specific configurations
   - Implement proper secrets management

4. **Monitoring**
   - Set up application performance monitoring
   - Configure error tracking and alerting
   - Monitor resource usage and costs

## Conclusion

This deployment guide provides a comprehensive setup for deploying the AWFR restaurant ordering system securely and efficiently. The SSH key configuration ensures secure automated deployments, while the multi-platform support allows for flexible hosting options.

For additional support or questions about deployment, refer to the platform-specific documentation or contact the development team.
