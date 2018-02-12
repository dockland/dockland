Dockland
========

![Dockland logo](dockland_logo.png)

This project combines a [Redbird](https://github.com/OptimalBits/redbird) reverse-proxy and a Travis web-hook, to automagically redeploy updated Docker images and register them as new subdomains.

## Dependencies

- systemd >= 227 (for the `WorkingDirectory` directive, you can use absolute path as a workaround)
- NodeJS >= 8.x

Tested on Debian 8

## Usage

- `git clone https://github.com/dockland/dockland.git`
- `cd dockland`
- `npm install --production`
- `sudo cp dockland.service /lib/systemd/system/dockland.service`
- `cp .env.example .env` and edit values accordingly
- Create systemd drop-in to set `User`, `WorkingDirectory` and `EnvironmentFile` correctly, eg. in file `/etc/systemd/system/dockland.service.d/dockland.conf`:

```ini
[Service]
EnvironmentFile=
EnvironmentFile=/home/mycustomuser/dockland/.env
User=mycustomuser
WorkingDirectory=/home/mycustomuser/dockland
```

- `sudo systemctl daemon-reload`
- `sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node` This allows node to bind to ports < 1024 even for non-root users
- `sudo systemctl start dockland`
- `sudo systemctl enable dockland` if you want it to run at boot

## Authors

- [Clément MICHEL](https://github.com/m1ch3lcl)
- [Thomas GAUDIN](https://github.com/nymous)
- Logo handcrafted with :heart: by [Bastien HUBER](https://github.com/searev)
