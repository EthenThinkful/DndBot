require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

const rest = new REST({ version: '10' }).setToken(process.env.discord_token);

(async () => {
    try {
        console.log('Deleting all guild commands...');
        
        // Delete all commands for the guild
        await rest.put(Routes.applicationCommands(process.env.client_id), {
            body: [],
        });
        
        console.log('All guild commands deleted!');

        // Now re-register your commands
        const commands = [
            {
                name: 'narrate',
                description: 'Says what you want it to say',
                options: [
                    {
                        name: 'message',
                        type: 3, // STRING
                        description: 'The message to say',
                        required: true,
                    },
                ],
            },
            {
                name: 'spell',
                description: 'Look up a D&D 5e spell',
                options: [
                    {
                        name: 'name',
                        type: 3, // STRING
                        description: 'The name of the spell (e.g., "fireball", "magic missile")',
                        required: true,
                    },
                ],
            },
            {
                name: 'monster',
                description: 'Look up a D&D 5e monster',
                options: [
                    {
                        name: 'name',
                        type: 3, // STRING
                        description: 'The name of the monster (e.g., "ancient-red-dragon", "goblin")',
                        required: true,
                    },
                ],
            }
        ];
        
        await rest.put(Routes.applicationCommands(process.env.client_id), {
            body: commands,
        });
        
        console.log('Successfully re-registered slash commands');
    } catch (error) {
        console.error(error);
    }
})();