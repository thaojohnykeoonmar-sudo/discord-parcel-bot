const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
const axios = require('axios'); // ใช้สำหรับดึงข้อมูลจากเว็บ

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
        .setDescription('เช็กสถานะพัสดุ Gaobat และแสดงผลในแชท')
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
        await interaction.deferReply(); // ให้บอทขึ้นสถานะกำลังคิด เพื่อรอโหลดข้อมูล

        try {
            // ดึงข้อมูลจากระบบของ Gaobat
            const response = await axios.get(`https://logistics.gaobat.com/api/track?code=${trackNo}`);
            const data = response.data;

            // ตรวจสอบว่ามีข้อมูลสถานะส่งกลับมาไหม
            if (data && data.status) {
                await interaction.editReply(`📦 ผลการตรวจสอบพัสดุ: **${trackNo}**\n📍 สถานะ: **${data.status}**\n🔗 ดูเพิ่มเติม: https://logistics.gaobat.com/hongtwap/#/track?code=${trackNo}`);
            } else {
                await interaction.editReply(`📦 พัสดุหมายเลข: **${trackNo}**\n⚠️ ไม่พบข้อมูลสถานะ หรือสามารถตรวจสอบได้ที่ลิงก์นี้: https://logistics.gaobat.com/hongtwap/#/track?code=${trackNo}`);
            }
        } catch (error) {
            // หากระบบ API ดึงตรงๆ ไม่ได้ จะแสดงลิงก์หลักให้กดเช็ก
            await interaction.editReply(`🔍 ตรวจสอบพัสดุหมายเลข: **${trackNo}**\n🔗 คลิกเพื่อดูสถานะ: https://logistics.gaobat.com/hongtwap/#/track?code=${trackNo}`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
