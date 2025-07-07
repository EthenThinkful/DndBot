require('dotenv').config();
const { Client, GatewayIntentBits, MessageFlags } = require('discord.js');
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

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isChatInputCommand() || interaction.commandName !== 'narrate') return;
        const message = interaction.options.getString('message');
        
        if (interaction.channel) {
            // Send the message to the channel as the bot
            await interaction.channel.send(message);
            // Acknowledge privately that the command worked
            await interaction.reply({
                content: "Message sent!", 
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: "Cannot send message - no channel available", 
                flags: MessageFlags.Ephemeral
            });
        }
        
        console.log(`Narrated message: ${message}`);
    } catch (error) {
        console.error('Error handling interaction:', error);
    }
});

client.login(process.env.discord_token)
    .then(() => console.log('Bot is online!'))