module.exports = {
    name: 'menu',
    description: 'Shows bot commands menu',
    execute: async (bot, message) => {
        const menuText = `
Welcome to NOONE Bot! 🤖

Available commands:
.ping - Test the bot
.menu - Show this menu
.antiban - Toggle Anti-Ban (Owner only)
.antidelete - Toggle Anti-Delete (Owner only)
.ai - Talk to AI
        `
        await bot.sendMessage(message.key.remoteJid, { text: menuText })
    }
}
