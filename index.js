require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== 'narrate') return;
        const message = interaction.options.getString('message');
        // defer / send / delete 
        await interaction.deferReply({ ephemeral: true });
        await interaction.channel.send(message);
        await interaction.deleteReply();

});

client.login(process.env.discord_token)
    .then(() => console.log('Bot is online!'))