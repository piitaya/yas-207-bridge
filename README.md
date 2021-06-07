# Yas 207 Bluetooth to HTTP Bridge

## Description

Control your YAS 207 Sound Bar with HTTP interface

## Development

Copy and rename the `.env.example` to `.env`.

```bash
npm run start:dev
```

## Build

```bash
npm run build
npm run start
```

## Run on raspberry PI

I have done tests on PI 3 but it should work on PI 4 too.

Use `bluetoothctl` cli tool to pair and get the mac address of the YAS 207 soundbar.

Create a script to bind `/dev/rfcomm0` at startup

```bash
nano /home/pi/bind-bluetooth.sh
```

```bash
#/bin/sh
rfcomm connect 0 xx:xx:xx:xx:xx:xx 1
```

And add it to cron tab

```bash
sudo crontab -e
```

```bash
@reboot sh /home/pi/bind-bluetooth.sh
```
