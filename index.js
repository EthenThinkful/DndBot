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
        console.log("before reply");
        await interaction.reply({content: message, flags: MessageFlags.Ephemeral});
        await interaction.channel.send(message);
        await interaction.deleteReply();
        console.log(`Replied to interaction with message: ${message}`);

        // await interaction.defer({flags: InteractionResponseFlags.EPHEMERAL});
        // console.log('Interaction deferred');
        // await interaction.followUp({content: message });
        // await interaction.deleteReply();
        // console.log(`Deferred interaction for message: ${message}`);
        // await interaction.reply({
        //     content: message,
        //     flags: InteractionResponseFlags.EPHEMERAL // Makes the response visible only to the user who invoked the command
        // });
        // await interaction.deferReply({flags: InteractionResponseFlags.EPHEMERAL});
        // await interaction.channel.send(message);
        // await interaction.deleteReply();
    } catch (error) {
        console.error('Error handling interaction:', error);
    }
});

client.login(process.env.discord_token)
    .then(() => console.log('Bot is online!'))