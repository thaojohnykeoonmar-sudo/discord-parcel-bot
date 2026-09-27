const axios = require('axios'); // เรียกใช้งานตัวช่วยยิงเว็บ

// ฟังก์ชันสำหรับเช็กพัสดุ
async function checkTracking(trackNumber) {
    try {
        const response = await axios.post('https://logistics.gaobat.com/hongt-api/bus/inware/track', {
            code: trackNumber // ตรงนี้คือช่องใส่เลขพัสดุ
        });
        
        // ถ้าสำเร็จ จะแสดงข้อมูลที่ได้ออกมา
        console.log('ข้อมูลพัสดุ:', response.data);
        return response.data;
        
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error.message);
    }
}

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const axios = require('axios');

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
        .setDescription('เช็กสถานะพัสดุ Gaobat')
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
        await interaction.deferReply();

        try {
            const response = await axios.get(`https://logistics.gaobat.com/api/track?code=${trackNo}`);
            const data = response.data;

            if (data && (data.status || data.message)) {
                const statusText = data.status || data.message;
                await interaction.editReply(`📦 ผลการตรวจสอบพัสดุ: **${trackNo}**\n📍 สถานะ: **${statusText}**\n🔗 ดูเพิ่มเติม: https://logistics.gaobat.com/hongtwap/#/track?code=${trackNo}`);
            } else {
                await interaction.editReply(`📦 พัสดุหมายเลข: **${trackNo}**\n⚠️ ไม่พบข้อมูลสถานะในระบบ ตรวจสอบผ่านเว็บโดยตรงได้ที่: https://logistics.gaobat.com/hongtwap/#/track?code=${trackNo}`);
            }
        } catch (error) {
            await interaction.editReply(`🔍 ตรวจสอบพัสดุหมายเลข: **${trackNo}**\n🔗 คลิกเพื่อดูสถานะ: https://logistics.gaobat.com/hongtwap/#/track?code=${trackNo}`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
