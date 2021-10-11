#!/usr/bin/env node

var http = require('http');
var config = require('./config.json');
const TeleBot = require('telebot');
const JSONdb = require('simple-json-db');
require('console-stamp')(console, {format: ':date(yyyy/mm/dd HH:MM:ss)'});

const db = new JSONdb(config.pathToDB);
const bot = new TeleBot(config.token);
var options = {'hostname': config.shellyEM.host,
  'path': '/status',
  'auth': config.shellyEM.username + ':' + config.shellyEM.password
}
var currentPower = 0;
var alertIntervalID = 0;
var timeBeforeAlertCounter = 0;

var permissionAcceptedMsg = `Congratulazioni 🥳 \n
  Telefono abilitato a ricevere le notifiche nel caso di superamento della soglia di: \n
  \t \t \t \t ⚡️🔌${config.maxPower} W 🔌⚡️`;
var permissionDeniedMsg = `❌    Utente non abilitato   ❌\n
  \n Rivolgersi all'amministratore`;
var alertMsg = `‼️‼️ Consumo attuale maggiore di ${config.maxPower} W 🔌⚡️  ‼️‼️`;

callback = (response) => {
  response.on('data', function (chunk) {
    currentPower = JSON.parse(chunk).emeters[config.shellyEM.channel - 1].power;
    if(currentPower >= config.maxPower){
      timeBeforeAlertCounter++;
      if(timeBeforeAlertCounter == config.timeBeforeAlert){
        console.log('[ALERT] Threshold exceeded alarm: ' + currentPower + ' W');
        alertIntervalID = setInterval(alertCallback, config.intervalAlertTime)
      }
    } else if(currentPower < config.maxPower){
      timeBeforeAlertCounter = 0;
      if(alertIntervalID != 0){
        console.log('[ALERT] Alarm reset');
        clearInterval(alertIntervalID);
        alertIntervalID = 0;
      }
    }
  });
}
alertCallback = function (){
  for(const user in config.notifyList){
    if(db.has(user) && config.notifyList[user])
      bot.sendMessage(db.get(user), alertMsg)
  }
}
setInterval(() => {http.request(options,callback).end();}, 1000);

bot.on('text', (msg) => {
  if(config.notifyList[msg.from.username]){
    console.log('[BOT] Current consumption sent to: ' + msg.from.username);
    bot.sendMessage(msg.from.id, `Consumo attuale: \t ${ currentPower } W 🔌⚡️`);
  }
});
bot.on(['/start'], (msg) => {
  console.log('[BOT] Bot started by user: ' + msg.from.username);
  if(config.notifyList[msg.from.username] && db.has(msg.from.username) == false){
    db.set(msg.from.username, msg.from.id);
    console.log('[DB] User ' + msg.from.username + ' added to database');
  }
  if(config.notifyList[msg.from.username]){
    bot.sendMessage(msg.from.id, permissionAcceptedMsg);
  } else {
    bot.sendMessage(msg.from.id, permissionDeniedMsg);
  }
});

bot.start();
