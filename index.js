const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// สร้างคำสั่ง Slash Command /track
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

    // ลงทะเบียนคำสั่ง Slash Command ให้เซิร์ฟเวอร์
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('กำลังรีเฟรช Slash Commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('ลงทะเบียน Slash Commands สำเร็จแล้ว!');
    } catch (error) {
        console.error(error);
    }
});

// รับคำสั่งเมื่อมีคนใช้งาน
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'track') {
        const trackNo = interaction.options.getString('code');
        
        await interaction.reply(`🔍 กำลังตรวจสอบพัสดุหมายเลข: **${trackNo}**...`);

        try {
            // ดึงข้อมูลสถานะจากระบบ Gaobat (ตัวอย่างการเชื่อมต่อ API)
            // หมายเหตุ: หากเว็บ Gaobat มีการป้องกันหรือรูปแบบ API เปลี่ยนแปลง สามารถปรับแก้ URL ตรงนี้ได้
            const response = await axios.get(`https://logistics.gaobat.com/api/track?code=${trackNo}`);
            
            // ส่งผลลัพธ์กลับไปที่ Discord
            await interaction.editReply(`📦 **สถานะพัสดุ ${trackNo}:** ตรวจสอบเรียบร้อย`);
        } catch (error) {
            // กรณีเช็กผ่าน API ตรงไม่ได้ ให้แสดงลิงก์สำหรับกดคลิกเช็กแทน
            await interaction.editReply(`📦 **สถานะพัสดุ ${trackNo}**\nคลิกเพื่อตรวจสอบสถานะ: https://logistics.gaobat.com/hongtwap/#/track?code=${trackNo}`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
