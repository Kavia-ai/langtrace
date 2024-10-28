## Setup for langtrace deployment

1. I created a service file in ubuntu.

```sudo nano /etc/systemd/system/langtrace.service```

2. Add these configuration

```
[Unit]
Description=LangTrace Docker Service
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/langtrace
ExecStart=/usr/bin/docker compose up
ExecStop=/usr/bin/docker compose down
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target

```

3. ```sudo systemctl enable langtrace```

4. if you are updating the service file, then do
 ``` 
sudo systemctl daemon-reload
sudo systemctl restart langtrace
```
5. Check Status
```
sudo systemctl status langtrace
```

6. Check the logs for more detailed error information:

```
sudo journalctl -u langtrace -n 50 --no-pager
```
