# omxweb

Web interface and API for Raspberry Pi Omxplayer.

## Overview

This is fork of [omxremote](https://github.com/sosedoff/omxremote) project. 
Features:
* New WebGUI developed with VueJS
  * update status every 5s;
  * progressbar for display watching status.
* Bug Fix.

## Requirements

In order to use `omxremote` you must have `omxplayer` installed on your RPi. Most
recent distributions on Rasbpian should already come with `omxplayer` preinstalled.

In case if you dont have it installed, use the following commands:

```
sudo apt-get update
sudo apt-get install -y omxplayer
```

No special permissions are required in order to play videos with `omxplayer` and `omxremote`.

## Compile

Compiling this project on RPi is a bit of a difficult task and does not necessarily makes
sense since Go provides ability to cross-compile source code for multiple platforms on
your local development environment. You can do that by following the steps:

```
make setup
make release
```

That will produce a binary that's ready to be transferred and executed on your RPi. 
In cases if you dont have Make available on your system, you can execute the following commands:

```
go get
GOOS=linux GOARCH=arm go build
```

For debugging proposes:

```
export DEBUG=1
```

## Usage

Options:

```
Usage of omxweb:
  -frontend
      Enable frontend applicaiton (default true)
  -media string
      Path to media files (default "./")
  -v  Print version
  -zeroconf
      Enable service advertisement with Zeroconf (default true)
```

To start omxremote, run the following command:

```
omxweb -media /path/to/media
```

By default server will start on port 8080 and listen on all network interfaces. You can
connect to it if you have any device (laptop, phone) on the same wifi network.
If you dont know the IP address of your RPi, run `ifconfig`.

To enable service discovery using [Zeroconf](http://zeroconf.org/), use the flag:

```
omxweb -media ./ -zeroconf
```

Omxremote advertises itself as `omxremote._tcp`

To start the server on a specific interface or a given port, set the HOST and PORT variables.
```
HOST=192.168.1.100 PORT=8081 omxweb -media ./
```

### Running as daemon

First, make sure you have copied the binary to `/usr/bin/`:

```
sudo cp omxweb /usr/bin/
```

To test if omxremote could be found in $PATH, run:

```
which omxweb
# => /usr/bin/omxweb
```

Next step is to create a media directory:

```
mkdir /home/pi/media
```

This directory will be used by omxremote to scan for all media files. The following
section config files will also use that directory.

#### init.d

```
sudo nano /etc/init.d/omxweb
sudo chmod +x /etc/init.d/omxweb
```

And then you can start the remote:

```
sudo /etc/init.d/omxweb start
```

#### systemd

```
sudo nano /etc/systemd/system/omxweb.unit
sudo systemctl enable omxweb
sudo service omxweb start
```

### API

Endpoints:

- `/status`        - Returns current player status
- `/browse`        - Returns files in specified media directory
- `/play`          - Start media playback
- `/command/:name` - Execute a command
- `/host`          - Get host stats (memory, storage)
- `/remove`        - Remove a media file or directory

Available commands:

- `pause`
- `stop`
- `volume_up`
- `volume_down`
- `subtitles`
- `seek_back`
- `seek_back_fast`
- `seek_forward`
- `seek_forward_fast`

### Troubleshooting

```
ERROR: COMXAudio::Decode timeout
```

If you see this error when playing video files, make sure to give more memory
to raspberry pi GPU. On B+ model the default is 16mb. Try setting it to 64/128mb.
To edit settings, run: `sudo raspi-config`.

#### Raspbian 8

Raspbian 8 does not carry `omxplayer` binary. You must install the player before
using omxremote:

```
sudo apt-get install -y omxplayer
```
