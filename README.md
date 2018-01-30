Nodock
======

This project combines a [Redbird](https://github.com/OptimalBits/redbird) reverse-proxy and a Travis web-hook, to automagically redeploy updated Docker images and register them as new subdomains.

## Usage

- Install NodeJS >= 8.x
- `git clone https://github.com/nodock/nodock.git`
- `cd nodock`
- `npm install --production`
- `sudo cp nodock.service /lib/systemd/system/nodock.service`
- `cp .env.example .env` and edit values accordingly
- Create systemd drop-in to set `User`, `WorkingDirectory` and `EnvironmentFile` correctly, eg. in file `/etc/systemd/system/nodock.service.d/nodock.conf`:
```ini
[Service]
EnvironmentFile=/home/mycustomuser/nodock/.env
User=mycustomuser
WorkingDirectory=/home/mycustomuser/nodock
```
- `sudo systemctl daemon-reload`
- `sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node` This allows node to bind to ports < 1024 even for non-root users
- `sudo systemctl start nodock`
- `sudo systemctl enable nodock` if you want it to run at boot

## Authors

- [Clément MICHEL](https://github.com/m1ch3lcl)
- [Thomas GAUDIN](https://github.com/nymous)
