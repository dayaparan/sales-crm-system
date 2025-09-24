# Deployment Instructions (Node.js Backend)

## Backend Deployment

1. **SSH to Server**

   ```bash
   ssh <server-address>
   ```

2. **Navigate to Project Directory**

   ```bash
   cd sales-management-sql
   ```

3. **Install Dependencies**

   ```bash
   npm install 
   ```

   *(agar dependency conflicts aayen tu use karen **`npm i --legacy-peer-deps`**)*

4. **Restart PM2**

   ```bash
   pm2 restart all
   ```

5. **View Logs**

   ```bash
    pm2 logs
   ```

