#!/ pencil/bash

# Update and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx git

# Install global tools
sudo npm install -g n
sudo n stable
sudo npm install -g pm2

# Configure Nginx
cat <<EOF | sudo tee /etc/nginx/sites-available/bitespeed
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/bitespeed/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /identify {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/bitespeed /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "Server setup complete. Please clone the repo into /var/www/bitespeed"
