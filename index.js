/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

const os = require('os');

const fs = require('fs');

const tcpp = require('tcp-ping');

const Discord = require('discord.js');
const childProcess = require('child_process');
const Pkg = require('./package.json');
const config = require('./config.json');


childProcess.exec(`title ${Pkg.name} - ${Pkg.main}`);

const client = new Discord.Client();
const guild = new Discord.Guild();
const MessageAttachment = new Discord.Attachment();

const TSserver = require('./Servers/TSserver.json');
const DTMserver = require('./Servers/DTMserver.json');
const GCserver = require('./Servers/GCserver.json');

const cooldown = [0, 0, 0];


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (message) => {
  // console.log(guild.name)

  if (message.guild.name === TSserver.guildName) { const SC = TSserver; const SCCooldown = cooldown[0]; }
  if (message.guild.name === DTMserver.guildName) { const SC = DTMserver; const SCCooldown = cooldown[1]; }
  if (message.guild.name === GCserver.guildName) { const SC = GCserver; const SCCooldown = cooldown[2]; }

  if (config.logChat === true) {
    if (!message.channel.nsfw) {
      if (!fs.existsSync(`./chatLogs/${message.guild.name}/${message.channel.id}.csv`)) {
        fs.promises.mkdir(`./chatLogs/${message.guild.name}`, { recursive: true }).then(x => fs.promises.appendFile(`./chatLogs/${message.guild.name}/${message.channel.id}.csv`, `TIMESTAMP,M/E/D,ATTACHMENTS,USER,USER ID\n"${message.createdAt}","${message.content}","${message.attachments.array()[0].url}","${message.author.tag}",${message.author.id}`));
      } else {
        fs.promises.appendFile(`./chatLogs/${message.guild.name}/${message.channel.id}.csv`, `\n"${message.createdAt}","${message.content}","${message.attachments.array()[0].url}","${message.author.tag}",${message.author.id}`);
      }
    } else return;
  }

  if (message.author.bot) return;

  if (config.caseSensitivePrefix === false) {
    const LowCasMes = message.content.toLowerCase();
    if (LowCasMes.indexOf(config.prefix.toLowerCase()) !== 0) return;
  } else if (config.caseSensitivePrefix === true) {
    if (message.content.indexOf(config.prefix) !== 0) return;
  }

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  console.log(os.EOL);
  console.log(`User: ${message.author.tag}`);
  console.log(`Server Name: ${message.guild.name}`);
  console.log(`${message.content.substring(0, `${config.prefix.length}`)}${command}`);

  if (command === 'ping') {
    message.channel.send('Self Pinging...').then((msg) => {
      msg.edit(`Pong! | Client Ping: ${msg.createdTimestamp - message.createdTimestamp}ms | API Latency is ${Math.round(client.ping)}ms`);
    });
  }


  /*   if (command === 'test')
  {

    console.log(cooldown[0]);
    console.log(cooldown[1]);
    console.log(cooldown[2]);

  } */


  /*   if (command === 'status')
  {

    console.log(`Running tcp-ping for Minecraft server ${config.serverIP}:${config.serverPort1}.`)
    message.channel.send('Probing Server.');

    tcpp.probe(config.serverIP,config.serverPort,function(err, result)
    {
//      console.log(`Result: ${result}`);

      if (result == true)
      {

        console.log('Server is up.');
        message.channel.send('Minecraft server is up.');

      }

      else

      {

        console.log('Server is down.');
        message.channel.send('Minecraft server is down.');

      }

    });
  } */
  if (command === 'reload') {
    const TSserver = fs.readFilesync('./Servers/TSserver.json');
    const DTMserver = fs.readFilesync('./Servers/DTMserver.json');
    const GCserver = fs.readFilesync('./Servers/GCserver.json');
    const config = fs.readFilesync('./config.json');
  }

  if (command === 'startserver') {
    if (SCCooldown === 0) {
      if (SC === TSserver) { cooldown[0] = 1; }
      if (SC === DTMserver) { cooldown[1] = 1; }
      if (SC === GCserver) { cooldown[2] = 1; }

      if (message.member.roles.find('name', `${SC.guildRole}`)) {
        console.log(`${SC.guildName} on cooldown`);
        setTimeout(() => {
          if (SC === TSserver) { cooldown[0] = 0; }
          if (SC === DTMserver) { cooldown[1] = 0; }
          if (SC === GCserver) { cooldown[2] = 0; }
        }, SC.timeOut);

        message.channel.send('Checking if server is up.');

        tcpp.probe(SC.serverIP, SC.serverPort, (err, result) => {
          // console.log(`Result: ${result}`);

          if (result === true) {
            console.log('Server is up.');
            message.channel.send('Server is already up.');
          } else {
            console.log(SC.startMessage);
            message.channel.send(SC.startMessage);

            childProcess.exec(`start ${SC.serverPath}`, (err, stdout, stderr) => {
              if (err) {
                console.error(err);
              }
            });
          }
        });
      } else {
        message.channel.send('You do not have permission to use that command!');
      }
    } else {
      message.channel.send(SC.cooldownMessage);
    }
  }

  if (command === 'kill') {
    if (message.author.id === config.ownerID) {
      process.exit(0);
    }
  }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
  const timeStamp = new Date();

  if (config.logChat === true) {
    if (!oldMessage.channel.nsfw) {
      if (!fs.existsSync(`./chatLogs/${oldMessage.guild.name}/${oldMessage.channel.id}.csv`)) {
        fs.promises.mkdir(`./chatLogs/${oldMessage.guild.name}`, { recursive: true }).then(x => fs.promises.appendFile(`./chatLogs/${oldMessage.guild.name}/${oldMessage.channel.id}.csv`, `TIMESTAMP,M/E/D,ATTACHMENTS,USER,USER ID\n"${oldMessage.editedAt}","${oldMessage}" => "${newMessage}","${newMessage.attachments.array()[0].url}","${oldMessage.author.tag}",${oldMessage.author.id}`));
      } else {
        fs.promises.appendFile(`./chatLogs/${oldMessage.guild.name}/${oldMessage.channel.id}.csv`, `\n"${timeStamp}","${oldMessage}" => "${newMessage}","${newMessage.attachments.array()[0].url}","${oldMessage.author.tag}",${oldMessage.author.id}`);
      }
    }
  }
});

client.on('messageDelete', (message) => {
  const timeStamp = new Date();

  if (config.logChat === true) {
    if (!message.channel.nsfw) {
      if (!fs.existsSync(`./chatLogs/${message.guild.name}/${message.channel.id}.csv`)) {
        fs.promises.mkdir(`./chatLogs/${message.guild.name}`, { recursive: true }).then(x => fs.promises.appendFile(`./chatLogs/${message.guild.name}/${message.channel.id}.csv`, `TIMESTAMP,M/E/D,ATTACHMENTS,USER,USER ID\n"${timeStamp}","${message}","${message.attachments.array()[0].url}","${message.author.tag}",${message.author.id}`));
      } else {
        fs.promises.appendFile(`./chatLogs/${message.guild.name}/${message.channel.id}.csv`, `\n"${timeStamp}","${message}","${message.attachments.array()[0].url}","${message.author.tag}",${message.author.id}`);
      }
    }
  }
});

client.login(config.token);
