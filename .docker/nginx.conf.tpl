server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    location /api/ {
        proxy_pass      ${API_URL};
    }

    location /ws/ {
        proxy_pass      ${WS_URL};
    }

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
    
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
