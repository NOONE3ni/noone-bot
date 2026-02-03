// ==================== NOONE BOT ====================
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const fs = require('fs')

// Owner Settings
const ownerNumber = '254728107967'  // Replace with your number

// Load Commands
const commands = {}
fs.readdirSync('./commands').forEach(file => {
    if(file.endsWith('.js')){
        const cmd = require(`./commands/${file}`)
        commands[cmd.name] = cmd
    }
})

// Load Paid Users
let paidUsers = []
if(fs.existsSync('./data/paidUsers.json')){
    paidUsers = JSON.parse(fs.readFileSync('./data/paidUsers.json'))
}

function isOwner(number){ return number === ownerNumber }
function isPaid(number){ return paidUsers.includes(number) }

async function startBot(){
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const { version } = await fetchLatestBaileysVersion()
    const sock = makeWASocket({ version, auth: state })

    sock.ev.on('connection.update', (update)=>{
        const { connection, lastDisconnect, qr } = update
        if(qr){
            console.log('📱 Scan this QR code with WhatsApp:')
            qrcode.generate(qr, { small: true })
        }
        if(connection === 'close'){
            console.log('❌ Connection closed')
            if(lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut){
                startBot()
            }
        } else if(connection === 'open'){
            console.log('✅ Connected to WhatsApp')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages, type })=>{
        if(type!=='notify') return
        const msg = messages[0]
        if(!msg.message || msg.key.fromMe) return

        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text
        if(!messageText) return
        const senderNumber = msg.key.remoteJid.split('@')[0]

        if(messageText.startsWith('.')){
            const args = messageText.slice(1).trim().split(/ +/)
            const commandName = args.shift().toLowerCase()
            if(commands[commandName]){
                if(['antiban','antidelete','antibug'].includes(commandName) && !isOwner(senderNumber)){
                    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Only the owner can use this command.' })
                    return
                }
                if(!isPaid(senderNumber) && !isOwner(senderNumber)){
                    await sock.sendMessage(msg.key.remoteJid, { text: '💳 You need to pay to use this bot.' })
                    return
                }
                commands[commandName].execute(sock, msg, args)
            }
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

startBot()
