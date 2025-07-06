require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const commands = [
    {
        name: 'narrate',
        description: 'says what you want it to say',
        options: [
            {
                name: 'message',
                type: 3, // STRING
                description: 'The message to say',
                required: true,
            },
        ],
    }
    ];

const rest = new REST({ version: '10' }).setToken(process.env.discord_token);

(async () => {
    try {
        console.log('registering slash commands...');

        await rest.put(Routes.applicationGuildCommands(process.env.client_id, process.env.guild_id), {
            body: commands,
        });

        console.log('successfully registered slash commands');
    } catch (error) {
        console.error(error);
    }
})();