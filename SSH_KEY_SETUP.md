# SSH Key Setup Guide - AWFR Deployment

## Overview

This guide explains how to set up and manage SSH keys for secure deployment of the AWFR restaurant ordering system.

## SSH Key Details

### Current Public Key
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFGvcOwrADeC3e18PmYRDDPnJegwfYGrjAKGkoyGZhGg awfr-delivery-comparison@runner
```

**Key Information:**
- **Algorithm**: Ed25519 (modern, secure)
- **Key Type**: Public key for deployment authentication
- **Identifier**: `awfr-delivery-comparison@runner`
- **Purpose**: Automated deployment and CI/CD pipeline access

## SSH Key Management

### 1. Understanding SSH Key Types

#### Ed25519 Keys (Recommended)
- **Security**: High security with small key size
- **Performance**: Fast signing and verification
- **Compatibility**: Supported by all modern SSH implementations
- **Key Size**: 256 bits (equivalent to 3072-bit RSA)

#### RSA Keys (Legacy)
- **Security**: Good security with larger key size
- **Performance**: Slower than Ed25519
- **Compatibility**: Widely supported
- **Key Size**: Minimum 2048 bits (3072+ recommended)

### 2. Generating New SSH Keys

#### Generate Ed25519 Key Pair
```bash
# Generate new Ed25519 key pair
ssh-keygen -t ed25519 -C "awfr-delivery-comparison@runner" -f ~/.ssh/awfr_deploy_key

# Set proper permissions
chmod 600 ~/.ssh/awfr_deploy_key
chmod 644 ~/.ssh/awfr_deploy_key.pub

# View public key
cat ~/.ssh/awfr_deploy_key.pub
```

#### Generate RSA Key Pair (Alternative)
```bash
# Generate new RSA key pair (4096 bits)
ssh-keygen -t rsa -b 4096 -C "awfr-delivery-comparison@runner" -f ~/.ssh/awfr_deploy_key_rsa

# Set proper permissions
chmod 600 ~/.ssh/awfr_deploy_key_rsa
chmod 644 ~/.ssh/awfr_deploy_key_rsa.pub
```

### 3. Adding SSH Keys to Deployment Platforms

#### Render.com
1. **Access SSH Keys Section:**
   - Go to Render Dashboard
   - Navigate to Account Settings
   - Click on "SSH Keys" tab

2. **Add Public Key:**
   ```bash
   # Copy your public key
   cat ~/.ssh/awfr_deploy_key.pub
   ```
   - Paste the public key in Render
   - Label: `awfr-delivery-comparison-runner`
   - Click "Add SSH Key"

3. **Verify Connection:**
   ```bash
   # Test SSH connection to Render
   ssh -T git@git.render.com
   ```

#### Vercel
1. **Access Git Settings:**
   - Go to Vercel Dashboard
   - Navigate to Settings > Git
   - Click "Add SSH Key"

2. **Add Public Key:**
   - Paste your public key
   - Give it a descriptive name
   - Click "Add SSH Key"

3. **Verify Connection:**
   ```bash
   # Test SSH connection to Vercel
   ssh -T git@vercel.com
   ```

#### GitHub Actions
1. **Add Private Key as Secret:**
   - Go to your GitHub repository
   - Navigate to Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `DEPLOY_SSH_KEY`
   - Value: Copy the entire private key content

2. **Add Public Key to Server:**
   ```bash
   # Copy public key to server's authorized_keys
   ssh-copy-id -i ~/.ssh/awfr_deploy_key.pub user@your-server.com
   ```

### 4. SSH Configuration File

Create `~/.ssh/config` for easier management:

```bash
# AWFR Deployment Configuration
Host awfr-staging
    HostName staging.awfr.com
    User deploy
    IdentityFile ~/.ssh/awfr_deploy_key
    IdentitiesOnly yes
    StrictHostKeyChecking no

Host awfr-production
    HostName production.awfr.com
    User deploy
    IdentityFile ~/.ssh/awfr_deploy_key
    IdentitiesOnly yes
    StrictHostKeyChecking no

Host render-git
    HostName git.render.com
    User git
    IdentityFile ~/.ssh/awfr_deploy_key
    IdentitiesOnly yes

Host vercel-git
    HostName git.vercel.com
    User git
    IdentityFile ~/.ssh/awfr_deploy_key
    IdentitiesOnly yes
```

### 5. Testing SSH Connections

#### Test Server Connections
```bash
# Test staging server
ssh awfr-staging "echo 'SSH connection successful'"

# Test production server
ssh awfr-production "echo 'SSH connection successful'"

# Test Render Git
ssh -T render-git

# Test Vercel Git
ssh -T vercel-git
```

#### Test GitHub Actions Integration
```bash
# Simulate GitHub Actions SSH setup
export SSH_PRIVATE_KEY="$(cat ~/.ssh/awfr_deploy_key)"
eval $(ssh-agent -s)
echo "$SSH_PRIVATE_KEY" | ssh-add -

# Test connection
ssh -T awfr-production "echo 'GitHub Actions SSH test successful'"
```

## Security Best Practices

### 1. Key Security
- **Permissions**: Private keys should have 600 permissions
- **Storage**: Store private keys securely, never commit to version control
- **Rotation**: Rotate keys every 90 days
- **Access Control**: Limit key access to deployment operations only

### 2. Server Security
```bash
# Secure SSH server configuration (/etc/ssh/sshd_config)
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

### 3. Key Rotation Process
```bash
# 1. Generate new key pair
ssh-keygen -t ed25519 -C "awfr-delivery-comparison@runner-v2" -f ~/.ssh/awfr_deploy_key_new

# 2. Add new public key to servers
ssh-copy-id -i ~/.ssh/awfr_deploy_key_new.pub user@server.com

# 3. Test new key
ssh -i ~/.ssh/awfr_deploy_key_new user@server.com

# 4. Update deployment platforms
# - Add new public key to Render, Vercel, etc.
# - Update GitHub Actions secrets

# 5. Remove old key
# - Remove old public key from servers
# - Remove old key from deployment platforms
# - Delete old private key
```

## Troubleshooting

### Common Issues

#### 1. Permission Denied
```bash
# Check key permissions
ls -la ~/.ssh/awfr_deploy_key*

# Fix permissions
chmod 600 ~/.ssh/awfr_deploy_key
chmod 644 ~/.ssh/awfr_deploy_key.pub
```

#### 2. Key Not Found
```bash
# Check if key is loaded in SSH agent
ssh-add -l

# Add key to SSH agent
ssh-add ~/.ssh/awfr_deploy_key
```

#### 3. Host Key Verification Failed
```bash
# Add host to known_hosts
ssh-keyscan -H your-server.com >> ~/.ssh/known_hosts

# Or disable strict host key checking (not recommended for production)
ssh -o StrictHostKeyChecking=no user@server.com
```

#### 4. GitHub Actions SSH Issues
```bash
# Debug SSH in GitHub Actions
- name: Debug SSH
  run: |
    eval $(ssh-agent -s)
    echo "${{ secrets.DEPLOY_SSH_KEY }}" | ssh-add -
    ssh-add -l
    ssh -vT user@server.com
```

### Debug Commands
```bash
# Verbose SSH connection
ssh -vT user@server.com

# Test specific key
ssh -i ~/.ssh/awfr_deploy_key -vT user@server.com

# Check SSH agent
ssh-add -l

# List known hosts
cat ~/.ssh/known_hosts
```

## Monitoring and Logging

### 1. SSH Connection Logging
```bash
# Monitor SSH connections
tail -f /var/log/auth.log | grep ssh

# Check failed login attempts
grep "Failed password" /var/log/auth.log
```

### 2. Key Usage Monitoring
```bash
# Monitor key usage in GitHub Actions
# Add logging to deployment scripts
echo "$(date): SSH key used for deployment" >> /var/log/deployments.log
```

## Backup and Recovery

### 1. Key Backup
```bash
# Create encrypted backup of private key
gpg -c ~/.ssh/awfr_deploy_key

# Store backup securely (not in version control)
# Consider using a password manager or secure vault
```

### 2. Recovery Process
```bash
# Restore private key from backup
gpg -d awfr_deploy_key.gpg > ~/.ssh/awfr_deploy_key
chmod 600 ~/.ssh/awfr_deploy_key

# Re-add to SSH agent
ssh-add ~/.ssh/awfr_deploy_key
```

## Conclusion

This SSH key setup ensures secure, automated deployment of the AWFR restaurant ordering system. Follow the security best practices and regularly rotate keys to maintain system security.

For additional support or questions about SSH key management, refer to the platform-specific documentation or contact the development team.
