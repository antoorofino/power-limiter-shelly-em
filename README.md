# Power limiter

[![](https://img.shields.io/npm/v/power-limiter-shelly-em?label=NPM)](https://www.npmjs.com/package/power-limiter-shelly-em)

A simple script that can alerts you if the current consumption exceeds a setted threshold. It gets the data directly from the ShellyEM meter and sends repeatedly alarm's messages to one or more telegram users.

---

## Usage

The script is easy to use, but requires its configuration. Here are the steps that explain how to install and configure it.

### 1. Telegram Bot

To create the Bot just talk to [BotFather](https://t.me/botfather) and follow a few simple steps. Once you've created a bot and received your authorization token go to the next step.


### 2. Installation

Install the package by running the following command:
```
npm install -g power-limiter-shelly-em
```

### 3. Settings

In order to work the script needs a configuration file. It is provided a sample file that needs to be modified: `config_sample.json`

You need to provide the data to access the ShellEM web panel and set the channel you want to use to monitor the consumption (possible values are `1` or `2`).
```
"shellyEM":{
		"username": "<username>",
		"password": "<password>",
		"host": "<ip-address--or--hostname>",
		"channel": "1"
	}
```
Here you can define:
- the max threshold (Watt);
- the time (seconds)  in which the the current consumption must overcome the threshold before starting the alert;
- the time (milliseconds) between each repeated alarm's message.

```
"maxPower": 3300,
"timeBeforeAlert": 10,
"intervalAlertTime": 1500
```

Finally, you must provide the bot authorization token and the list of users that should be texted (`true` for receiving notifications and `false` otherwise). The `pathToDB` will be the path to a file used by the script to store users telegram's id.
```
"token": "<bot-authorization-token>",
"pathToDB": "/var/power-meter/db.json",
"notifyList": {
		"<username_1>": true,
		"<username_2>": false
	}
```

### 4. Run continuously

To start the script simple run:
```
power-limiter <path-to-your-config.json>
```

You may want to run it continuously in the background. To achieve this you can create a systemd service.

Create the file `/etc/systemd/system/power-limiter.service` and paste into it the followings lines:
```
[Unit]
Description=Power limiter
After=network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/power-limiter <path-to-your-config.json>
Restart=on-failure
RestartSec=10
KillMode=process

[Install]
WantedBy=multi-user.target
```
Then, set the right permission by running `chmod 644 /etc/systemd/system/power-limiter.service` and start the service with `systemctl start power-limiter.service`

Now the script will always execute in the background.

---

## Credits

Thanks goes to these wonderful packages:
- [telebot](https://www.npmjs.com/package/telebot)
- [simple-json-db](https://www.npmjs.com/package/node-json-db)
- [console-stamp](https://www.npmjs.com/package/console-stamp)