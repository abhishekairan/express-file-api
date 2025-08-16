
# 📂 File API Project 🚀  

A lightweight, secure, and scalable **File Upload API**, designed as an alternative to relying on static `public/` directories or costly third-party storage options like S3.  

Deployed successfully on a **Linux VPS**, configured with **Nginx + Certbot (SSL)**, and tested for performance, scalability, and reusability.  

---

## ✨ Features
- ✅ Upload and manage files via REST API  
- ✅ Secure HTTPS support (via **Certbot + Nginx**)  
- ✅ Configured for large file uploads (no more “Request Entity Too Large”!)  
- ✅ Reusable & extendable module (can be plugged into future projects)  
- ✅ Lightweight, works with **Next.js, Node.js, or frontend clients**  

---

## ⚙️ Tech Stack
- **Backend**: Node.js / Express (API)  
- **Hosting**: Linux VPS (Debian/Ubuntu)  
- **Web Server**: Nginx  
- **SSL**: Let’s Encrypt / Certbot  
- **File System**: Custom storage on VPS disk (configurable)  

---

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/abhishekairan/express-file-api.git
cd file-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create `.env` file:
```txt
PORT=4000
UPLOAD_DIR=./uploads
```

### 4. Run Locally
```bash
node index.js
```
API will be available at:  
```
http://localhost:5500
```

---

## 🌐 Deployment on Linux VPS

### 1. Connect to VPS
```bash
ssh root@your-vps-ip
```
Repeat installation on linux vps

### 2. Install Node.js, Nginx, Certbot
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 3. Configure Reverse Proxy (Nginx)
Replace `yourdomain.com` with your domain you wish to use
```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```
copy and paste the following in your file
```
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    client_max_body_size 20M;
}
```
Enable + restart:
```bash
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -s reload
```

### 4. Enable SSL
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📡 Usage Examples

### Upload File
```bash
curl -F "file=@mydocument.pdf" https://yourdomain.com/api/upload
```

Response:
```json
{
  "success": true,
  "path": "/uploads/1755381965870-image.png"
}
```

### Retrieve File
```bash
https://yourdomain.com/api/files/1755381965870-image.png
```

---

## 🚧 Future Improvements
- ⬆️ Add authentication & JWT-based permissions  
- ⬆️ File versioning & metadata handling  
- ⬆️ Optional storage adapters (DigitalOcean, AWS S3, etc.)  

---

## 🙌 Acknowledgements
- [Let’s Encrypt](https://letsencrypt.org/) for free SSL certificates  
- [Nginx](https://www.nginx.org/) for blazing-fast reverse proxy  
- [Linux VPS](https://www.digitalocean.com/) for affordable hosting  

---

### 📝 License
This project is licensed under the **MIT License** – feel free to use and extend.

---

> Built with ⚡ passion & problem-solving: replacing costly cloud storage with a **self-hosted File API** that I’ll be reusing in many upcoming projects. 🚀
