# Deployment Instructions

## Frontend Deployment

1. **SSH to Server**

   ```bash
   ssh <server-address>
   ```

2. **Navigate to Project Directory**

   ```bash
   cd sales-management
   ```

3. **Install New Packages (if applicable)**
   If any new packages have been added, run:

   ```bash
   npm i --legacy-peer-deps
   ```

4. **Build the Project**

   ```bash
   npm run build
   ```

5. **Restart PM2**

   ```bash
   pm2 restart all
   ```

6. **View Logs**
   To check the application logs:
   ```bash
   pm2 logs
   ```
