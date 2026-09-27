const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!track')) {
    const trackNo = message.content.split(' ')[1];
    if (!trackNo) return message.reply('กรุณาใส่หมายเลขพัสดุ เช่น `!track 79143158159509`');

    try {
      message.reply(`🔍 กำลังตรวจสอบพัสดุหมายเลข: ${trackNo}...`);
      message.reply(`📦 **สถานะพัสดุ ${trackNo}:** อยู่ระหว่างการขนส่ง`);
    } catch (error) {
      message.reply('❌ ไม่พบข้อมูลพัสดุ หรือระบบเกิดข้อผิดพลาด');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
