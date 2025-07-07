require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const rest = new REST({ version: '10' }).setToken(process.env.discord_token);

(async () => {
    try {
        console.log('Deleting all guild commands...');
        
        // Delete all commands for the guild
        await rest.put(Routes.applicationGuildCommands(process.env.client_id, process.env.guild_id), {
            body: [], // Empty array deletes all commands
        });
        
        console.log('All guild commands deleted!');
        
        // Now re-register your command
        const commands = [
            {
                name: 'narrate',
                description: 'says what you want it to say',
                options: [
                    {
                        name: 'message',
                        type: 3,
                        description: 'The message to say',
                        required: true,
                    },
                ],
            }
        ];
        
        await rest.put(Routes.applicationGuildCommands(process.env.client_id, process.env.guild_id), {
            body: commands,
        });
        
        console.log('Successfully re-registered slash commands');
    } catch (error) {
        console.error(error);
    }
})();