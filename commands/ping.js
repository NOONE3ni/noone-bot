module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    execute: async (bot, message) => {
        await bot.sendMessage(message.key.remoteJid, { text: 'Pong!' })
    }
}
