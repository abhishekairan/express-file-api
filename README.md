
# 📂 File API Project 🚀  

A lightweight, secure, and scalable **File Upload API**, designed as an alternative to relying on static `public/` directories or costly third-party storage options like S3.  

Deployed successfully on a **Linux VPS**, configured with **Nginx + Certbot (SSL)**, and tested for performance, scalability, and reusability.  

---

## ✨ Features
- ✅ Upload and manage files via REST API  
- ✅ **Enhanced CORS security** with configurable origins
- ✅ **Comprehensive error handling** with detailed error responses
- ✅ **File validation** with type and size restrictions
- ✅ **Security headers** for protection against common attacks
- ✅ **Health check endpoint** for monitoring
- ✅ Secure HTTPS support (via **Certbot + Nginx**)  
- ✅ Configured for large file uploads (no more "Request Entity Too Large"!)  
- ✅ Reusable & extendable module (can be plugged into future projects)  
- ✅ Lightweight, works with **Next.js, Node.js, or frontend clients**  

---

## ⚙️ Tech Stack
- **Backend**: Node.js / Express (API) with ES6 Modules  
- **Module System**: ES6 (ESM) - Modern JavaScript  
- **Hosting**: Linux VPS (Debian/Ubuntu)  
- **Web Server**: Nginx  
- **SSL**: Let's Encrypt / Certbot  
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
# Server Configuration
PORT=5500
NODE_ENV=development

# Site URL for file access (adjust for production)
SITE=http://localhost:5500

# CORS Configuration
# Comma-separated list of allowed origins for production
# Example: ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
ALLOWED_ORIGINS=
```

### 4. Run Locally
```bash
# Using npm scripts
npm start

# Or directly with node
node index.js

# For development with auto-restart
npm run dev
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
  "message": "File uploaded successfully",
  "data": {
    "filename": "1755381965870-mydocument.pdf",
    "originalName": "mydocument.pdf",
    "size": 1024000,
    "mimetype": "application/pdf",
    "url": "https://yourdomain.com/api/files/1755381965870-mydocument.pdf"
  }
}
```

### Retrieve File
```bash
https://yourdomain.com/api/files/1755381965870-mydocument.pdf
```

### Health Check
```bash
curl https://yourdomain.com/api/health
```

Response:
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

## 🔒 Security Features

### CORS Configuration
- Configurable allowed origins via environment variables
- Support for multiple domains in production
- Secure default settings for development

### Error Handling
- Comprehensive error responses with proper HTTP status codes
- File validation with size and type restrictions
- Security headers to prevent common attacks
- Detailed error logging for debugging

### File Validation
- Maximum file size: 100MB
- Allowed file types: images, PDFs, text files, archives
- Path traversal protection
- Filename sanitization

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
