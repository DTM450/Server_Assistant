/* eslint consistent-return: 0, no-console: 0 */

const os = require('os');

const tcpp = require('tcp-ping');

const Discord = require('discord.js');
const config = require('./config.json');
const package = require('./package.json');

const childProcess = require('child_process');
childProcess.exec(`title ${package.name} - ${package.main}`);

const client = new Discord.Client();
const guild = new Discord.Guild();

// When pushing to live version remove .WIP

const TSserver = require(`./Servers/TSserver.WIP.json`);
const DTMserver = require(`./Servers/DTMserver.WIP.json`);
const GCserver = require(`./Servers/GCserver.WIP.json`);

var cooldown = [0,0,0];


client.on('ready', () =>
{
  console.log(`Logged in as ${client.user.tag}!`);

  if(__filename.substr(-12,) === 'index.WIP.js')
  {
    client.user.setActivity('DTM450 teach me', { type: 'LISTENING'});
    client.user.setStatus('dnd');
  };

  if(__filename.substr(-8,) === 'index.js')
  {
    // TODO add a help command and add command to activity
    // client.user.setActivity(, { type: 'PLAYING'}).then(presence => console.log(`Activity set to ${presence.game ? presence.game.name : 'none'}`)).catch(console.error);
  };

});

client.on('message', (message) => 
{
  try
  {
    processing(message);
  }

  catch(err)
  {
    message.channel.send(`Its Broken.\nStack Trace.\n\`\`\`${err.name}\n ${err.stack}\`\`\``)
  }

});

function processing(message)
{
  if(message.author.bot) return;

  if(message.guild.id == TSserver.guildID){var SC = TSserver;var SCCooldown = cooldown[0];}
  else if(message.guild.id == DTMserver.guildID){var SC = DTMserver;var SCCooldown = cooldown[1];}
  else if(message.guild.id == GCserver.guildID){var SC = GCserver;var SCCooldown = cooldown[2];};

  if(message.content.indexOf(SC.prefix) !== 0) return;

  const args = message.content.slice(SC.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if(args[0] !== undefined){var subCommand = args.shift().toLowerCase();}
  else {var subCommand = null;};

// todo make args array lowercase

  console.log(os.EOL);
  console.log(`Server Name: ${message.guild.name}`);
  console.log(`User: ${message.author.tag}, ID: ${message.author.id}`);
  console.log(`Pf: ${SC.prefix}, Cmd: ${command}, Args: ${args}`);

  if (command === 'ping')
  {

    message.channel.send('Self Pinging...').then((msg) => {
      msg.edit(`Pong! | Client Ping: ${msg.createdTimestamp - message.createdTimestamp}ms | API Latency is ${Math.round(client.ping)}ms`);
    });

  }


  else if (command === 'test')
  {

    //console.log(cooldown[0]);
    //console.log(cooldown[1]);
    //console.log(cooldown[2]);

  }


  else if (command === 'info' || command ===  'help')
  {
    if (subCommand === 'all')
    {
      message.channel.send('all');
    }

    //TODO add cooldown and add servername commands, add help command
    else
    { 
      message.channel.send(SC.info).then((msg) => {msg.delete(5000);});
    };
  }

  else if (command === 'startserver')
  {
    
    if(SCCooldown == 0)
    {

      if(SC == TSserver){cooldown[0] = 1};
      if(SC == DTMserver){cooldown[1] = 1};
      if(SC == GCserver){cooldown[2] = 1};

      if(message.member.roles.has(SC.roleID))
      {

        console.log(`${SC.guildName} on cooldown`);
        setTimeout(() =>
        {
                
          if(SC == TSserver){cooldown[0] = 0};
          if(SC == DTMserver){cooldown[1] = 0};
          if(SC == GCserver){cooldown[2] = 0};
              
        },SC.timeOut);

        message.channel.send('Checking if server is up.')

        tcpp.probe(SC.serverIP,SC.serverPort1,function(err, result)
        {

          //console.log(`Result: ${result}`);

          if(result == true)
          {

            console.log('Server is up.');
            message.channel.send('Server is already up.');
            return;

          }

          else
            
          {

            console.log(SC.startMessage);
            message.channel.send(SC.startMessage);

            childProcess.exec(`start ${SC.serverPath1}`, function (err, stdout, stderr)
            {

              if(err)
              {

                console.error(err);
                return;

              }
            });
        
          }
        });

      }

      else
      
      {
      
        message.channel.send('You do not have permission to use that command!');
      
      }
    }
                    
    else
                
    {

      message.channel.send(SC.cooldownMessage);

    }

  }

  else if (command === 'kill')
  {

    if (message.author.id === config.ownerID)
    {
      process.exit(0);
    }

  }

  else if (command === 'throwerr')
  {
    let e = new Error('This is a test error.');
    throw e;
  }
};

client.login(config.token);