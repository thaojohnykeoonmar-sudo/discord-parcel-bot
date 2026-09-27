const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is Online!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const commands = [
    new SlashCommandBuilder()
        .setName('track')
        .setDescription('ตรวจสอบสถานะพัสดุ Gaobat')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('ใส่หมายเลขพัสดุ')
                .setRequired(true)
        ),
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('ลงทะเบียน Slash Commands สำเร็จแล้ว!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'track') {
        const trackNo = interaction.options.getString('code');
        await interaction.reply(`🔍 กำลังตรวจสอบพัสดุหมายเลข: **${trackNo}**...\n📦 คลิกเพื่อตรวจสอบสถานะ: https://logistics.gaobat.com/hongtwap/#/track?code=${trackNo}`);
    }
});

client.login(process.env.DISCORD_TOKEN);
