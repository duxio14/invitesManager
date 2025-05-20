const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { Sequelize } = require('sequelize');
const fs = require('fs');
const config = require('./config.json');
const wait = require("wait")

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildInvites
  ],
});

const sequelize = new Sequelize('inv', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

const models = require('./models/index.js')(sequelize);
client.models = models;
client.sequelize = sequelize;
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.login(config.token);

const deployCommands = async () => {
  const commands = client.commands.map(command => command.data.toJSON());

  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    console.log('🔄 Déploiement des commandes slash...');
    await rest.put(
      Routes.applicationCommands("1360276167709556838"),
      { body: commands }
    );
    console.log('✅ Commandes slash déployées.');
  } catch (error) {
    console.error('❌ Erreur de déploiement :', error);
  }
};

deployCommands();

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  client.on(event.name, (...args) => event.execute(...args, client));
}

const invites = new Map();

client.once('ready', async () => {
  await sequelize.sync();
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  client.guilds.cache.forEach(guild => {
    guild.invites.fetch()
      .then(guildInvites => {
        invites.set(guild.id, new Map(guildInvites.map(invite => [invite.code, invite.uses])));
      })
      .catch(error => console.error(`Impossible de récupérer les invitations pour ${guild.name}:`, error));
  });
  await wait(2000)
  client.invites = invites

});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ Une erreur est survenue pendant l\'exécution de la commande.', ephemeral: true });
  }
});

