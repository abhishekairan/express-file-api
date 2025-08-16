# Express File API
A Simple file API build on nodejs with multer

Made this simple app to store files for my websites and apps, since S3 is expensive and i already own a VPS

# Host This App on VPS and Domain

To host your Express file upload/fetch API at `file.mydomain.com`, you'll need to configure a subdomain and set up DNS, web server, and HTTPS as follows:

***

***

## 1. **Clone the repo**

- Clone the repo using following command: 
  ```bash
  git clone https://github.com/abhishekairan/express-file-api.git
  ```
- Make sure you have git installed on your device

***

## 2. **Create a DNS Record for Your Subdomain**
- In your domain registrar’s dashboard, add an **A Record**:
  - **Hostname:** `file`  
  - **Points to:** Your VPS's public IP address.
- Example:
  ```
  Hostname: file.mydomain.com
  Type:    A
  Value:   1.2.3.4
  ```
- Wait for DNS to propagate (may take minutes to hours).

***

## 3. **Nginx Reverse Proxy for Subdomain**
- Edit your Nginx config (usually `/etc/nginx/sites-available/file`):

```nginx
server {
  listen 80;
  server_name file.mydomain.com;

  location / {
    proxy_pass http://localhost:3000/; # or your Express port
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

- Enable the site by symlinking to `sites-enabled` and restart nginx:


```bash
sudo ln -s /etc/nginx/sites-available/file /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

***

## 3. **Optional: Enable HTTPS for Security**
- Use Certbot/Let's Encrypt to generate an SSL certificate:
  ```bash
  sudo certbot --nginx -d file.mydomain.com
  ```
- This secures all traffic over HTTPS.

***

## 4. **Result**
- Your API is now publicly available at:
  ```
  https://file.mydomain.com/api/upload
  https://file.mydomain.com/api/files/filename
  ```
- You can call these endpoints from anywhere using the subdomain.

***

The **correct way to run your Express file upload API app in production on a VPS** follows these best practices:

## 5. **Install PM2 for Process Management**

PM2 keeps your app running, restarts it on failure, logs output, lets you scale with clusters, and can run as a system service.

- Install globally:
  ```bash
  npm install -g pm2
  ```
- Start your app:
  ```bash
  pm2 start server.js --name "file-api"
  ```
- List/manage processes:
  ```bash
  pm2 list
  pm2 logs file-api
  pm2 restart file-api
  pm2 stop file-api
  ```
- Set PM2 to resurrect your app on server reboot:
  ```bash
  pm2 startup        # prints command, run that command
  pm2 save           # saves current process list
  ```

***
Your app is not ready to use.