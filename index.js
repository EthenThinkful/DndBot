require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const {InteractionType,
	InteractionResponseFlags,
	InteractionResponseType} = require('discord-interactions');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// client.on('interactionCreate', async interaction => {
//     if (!interaction.isChatInputCommand() || interaction.commandName !== 'narrate') return;
//     // console.log(`Received command: ${interaction}`);
//         // const message = interaction.options.getString('message');
//         // // defer / send / delete 
//         // await interaction.deferReply({ flags: InteractionResponseFlags.EPHEMERAL });
//         // await interaction.channel.send(message);
//         // await interaction.deleteReply();

// });

client.login(process.env.discord_token)
    .then(() => console.log('Bot is online!'))