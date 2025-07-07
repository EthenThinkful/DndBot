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
            // Check permissions first
            const botMember = interaction.guild.members.cache.get(client.user.id);
            const permissions = interaction.channel.permissionsFor(botMember);
            
            if (!permissions.has('SendMessages')) {
                await interaction.reply({
                    content: "❌ I don't have permission to send messages in this channel!", 
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
            
            await interaction.channel.send(message);
            await interaction.reply({
                content: "✅ Message sent!", 
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: "❌ Cannot send message - no channel available", 
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