require('dotenv').config();
const { Client, GatewayIntentBits, MessageFlags, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Helper function to make API calls
async function fetchDnDData(endpoint) {
    try {
        const response = await fetch(`https://www.dnd5eapi.co/api/${endpoint}`);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Helper function to format spell components
function formatSpellComponents(components) {
    const componentNames = [];
    if (components.verbal) componentNames.push('V');
    if (components.somatic) componentNames.push('S');
    if (components.material) componentNames.push(`M (${components.material})`);
    return componentNames.join(', ');
}

// Helper function to format monster abilities
function formatAbilities(abilities) {
    return `**STR:** ${abilities.strength} (${Math.floor((abilities.strength - 10) / 2) >= 0 ? '+' : ''}${Math.floor((abilities.strength - 10) / 2)}) | ` +
           `**DEX:** ${abilities.dexterity} (${Math.floor((abilities.dexterity - 10) / 2) >= 0 ? '+' : ''}${Math.floor((abilities.dexterity - 10) / 2)}) | ` +
           `**CON:** ${abilities.constitution} (${Math.floor((abilities.constitution - 10) / 2) >= 0 ? '+' : ''}${Math.floor((abilities.constitution - 10) / 2)})\n` +
           `**INT:** ${abilities.intelligence} (${Math.floor((abilities.intelligence - 10) / 2) >= 0 ? '+' : ''}${Math.floor((abilities.intelligence - 10) / 2)}) | ` +
           `**WIS:** ${abilities.wisdom} (${Math.floor((abilities.wisdom - 10) / 2) >= 0 ? '+' : ''}${Math.floor((abilities.wisdom - 10) / 2)}) | ` +
           `**CHA:** ${abilities.charisma} (${Math.floor((abilities.charisma - 10) / 2) >= 0 ? '+' : ''}${Math.floor((abilities.charisma - 10) / 2)})`;
}

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isChatInputCommand()) return;

        // Handle /narrate command
        if (interaction.commandName === 'narrate') {
            const message = interaction.options.getString('message');
            
            if (interaction.channel) {
                const botMember = interaction.guild.members.cache.get(client.user.id);
                const permissions = interaction.channel.permissionsFor(botMember);
                
                if (!permissions || !permissions.has('SendMessages')) {
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
        }

        // Handle /spell command
        else if (interaction.commandName === 'spell') {
            const spellName = interaction.options.getString('name').toLowerCase().replace(/\s+/g, '-');
            
            try {
                const spellData = await fetchDnDData(`spells/${spellName}`);
                
                const embed = new EmbedBuilder()
                    .setTitle(`🪄 ${spellData.name}`)
                    .setColor(0x7B68EE)
                    .addFields(
                        { name: 'Level', value: spellData.level === 0 ? 'Cantrip' : `${spellData.level}`, inline: true },
                        { name: 'School', value: spellData.school.name, inline: true },
                        { name: 'Casting Time', value: spellData.casting_time, inline: true },
                        { name: 'Range', value: spellData.range, inline: true },
                        { name: 'Duration', value: spellData.duration, inline: true },
                        { name: 'Components', value: formatSpellComponents(spellData.components), inline: true }
                    )
                    .setDescription(spellData.desc.join('\n\n'));

                // Add higher level info if available
                if (spellData.higher_level && spellData.higher_level.length > 0) {
                    embed.addFields({ name: 'At Higher Levels', value: spellData.higher_level.join('\n'), inline: false });
                }

                // Add damage info if available
                if (spellData.damage) {
                    let damageInfo = '';
                    if (spellData.damage.damage_at_slot_level) {
                        const levels = Object.keys(spellData.damage.damage_at_slot_level);
                        damageInfo = `**Damage:** ${spellData.damage.damage_at_slot_level[levels[0]]} ${spellData.damage.damage_type?.name || ''}`;
                    }
                    if (damageInfo) {
                        embed.addFields({ name: 'Damage', value: damageInfo, inline: false });
                    }
                }

                await interaction.reply({ embeds: [embed] });
                
            } catch (error) {
                await interaction.reply({
                    content: `❌ Spell "${interaction.options.getString('name')}" not found. Try checking the spelling or use the exact spell name.`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        // Handle /monster command
        else if (interaction.commandName === 'monster') {
            const monsterName = interaction.options.getString('name').toLowerCase().replace(/\s+/g, '-');
            
            try {
                const monsterData = await fetchDnDData(`monsters/${monsterName}`);
                
                const embed = new EmbedBuilder()
                    .setTitle(`🐉 ${monsterData.name}`)
                    .setColor(0xFF4500)
                    .addFields(
                        { name: 'Type', value: `${monsterData.type} (${monsterData.size})`, inline: true },
                        { name: 'AC', value: `${monsterData.armor_class}`, inline: true },
                        { name: 'HP', value: `${monsterData.hit_points} (${monsterData.hit_dice})`, inline: true },
                        { name: 'Speed', value: Object.entries(monsterData.speed).map(([type, speed]) => `${type}: ${speed}`).join(', '), inline: false },
                        { name: 'Challenge Rating', value: `${monsterData.challenge_rating} (${monsterData.xp} XP)`, inline: true }
                    )
                    .setDescription(formatAbilities(monsterData));

                // Add saving throws if available
                if (monsterData.proficiencies && monsterData.proficiencies.length > 0) {
                    const saves = monsterData.proficiencies
                        .filter(prof => prof.proficiency.name.startsWith('Saving Throw'))
                        .map(prof => `${prof.proficiency.name.replace('Saving Throw: ', '')}: +${prof.value}`)
                        .join(', ');
                    if (saves) {
                        embed.addFields({ name: 'Saving Throws', value: saves, inline: false });
                    }
                }

                // Add skills if available
                if (monsterData.proficiencies && monsterData.proficiencies.length > 0) {
                    const skills = monsterData.proficiencies
                        .filter(prof => prof.proficiency.name.startsWith('Skill'))
                        .map(prof => `${prof.proficiency.name.replace('Skill: ', '')}: +${prof.value}`)
                        .join(', ');
                    if (skills) {
                        embed.addFields({ name: 'Skills', value: skills, inline: false });
                    }
                }

                // Add damage resistances/immunities if available
                if (monsterData.damage_resistances && monsterData.damage_resistances.length > 0) {
                    embed.addFields({ name: 'Damage Resistances', value: monsterData.damage_resistances.join(', '), inline: false });
                }
                if (monsterData.damage_immunities && monsterData.damage_immunities.length > 0) {
                    embed.addFields({ name: 'Damage Immunities', value: monsterData.damage_immunities.join(', '), inline: false });
                }

                // Add actions (limited to avoid hitting Discord's embed limits)
                if (monsterData.actions && monsterData.actions.length > 0) {
                    const firstAction = monsterData.actions[0];
                    let actionText = firstAction.desc;
                    if (actionText.length > 300) {
                        actionText = actionText.substring(0, 300) + '...';
                    }
                    embed.addFields({ name: `Action: ${firstAction.name}`, value: actionText, inline: false });
                    
                    if (monsterData.actions.length > 1) {
                        embed.addFields({ name: 'Additional Actions', value: `${monsterData.actions.length - 1} more action(s) available`, inline: false });
                    }
                }

                await interaction.reply({ embeds: [embed] });
                
            } catch (error) {
                await interaction.reply({
                    content: `❌ Monster "${interaction.options.getString('name')}" not found. Try checking the spelling or use the exact monster name (e.g., "ancient-red-dragon").`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        console.log(`Handled ${interaction.commandName} command`);
    } catch (error) {
        console.error('Error handling interaction:', error);
        
        // Try to respond if we haven't already
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ Something went wrong while processing your command.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
});

client.login(process.env.discord_token)
    .then(() => console.log('Bot is online!'))
    .catch(console.error);