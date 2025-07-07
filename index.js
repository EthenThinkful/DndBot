require('dotenv').config();
const { Client, GatewayIntentBits, MessageFlags } = require('discord.js');
const {InteractionType,
	InteractionResponseFlags,
	InteractionResponseType} = require('discord-interactions');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages  // Add this
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isChatInputCommand() || interaction.commandName !== 'narrate') return;
        const message = interaction.options.getString('message');
        
        console.log('Interaction details:');
        console.log('- Guild ID:', interaction.guildId);
        console.log('- Channel ID:', interaction.channelId);
        console.log('- Channel exists:', !!interaction.channel);
        console.log('- Channel name:', interaction.channel?.name);
        
        if (interaction.channel) {
            const botMember = interaction.guild.members.cache.get(client.user.id);
            const permissions = interaction.channel.permissionsFor(botMember);
            
            console.log('- Bot member found:', !!botMember);
            console.log('- Permissions object:', !!permissions);
            console.log('- Bot has SendMessages:', permissions?.has('SendMessages'));
            
            if (!permissions || !permissions.has('SendMessages')) {
                await interaction.reply({
                    content: "❌ I don't have permission to send messages in this channel!", 
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
            
            // Try to send the message
            await interaction.channel.send(message);
            await interaction.reply({
                content: "✅ Message sent!", 
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: `❌ Cannot send message - no channel available. Guild: ${interaction.guildId}, Channel ID: ${interaction.channelId}`, 
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