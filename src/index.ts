import { Client, Intents, GuildEmoji, Message, TextChannel, Interaction, CommandInteraction, GuildMember } from "discord.js";
import { VoiceConnection, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, DiscordGatewayAdapterCreator } from "@discordjs/voice";
import config from '../config.json';
import cron from 'cron';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const player = createAudioPlayer();
let connection: VoiceConnection;
let timeoutId: NodeJS.Timer | null = null;

// Object to store emotes
let emotes: { [key: string]: GuildEmoji | undefined } = {};

// Random integer between 0 and max
function getRandomRange(max: number): number {
    return Math.floor(Math.random() * max);
}

// Where is Andy random response
const verbs = ['Walking', 'Washing', 'Eating'];
const nouns = ['dog', 'dishes', 'dinner'];
function whereIsAndy(): string {
    const verb = verbs[getRandomRange(verbs.length)];
    const noun = nouns[getRandomRange(nouns.length)];
    return verb + ' his ' + noun + '.';
}

const translations = ['Prance forward', 'Shashay left', 'Boogie down', 'Shimmy right'];
function getTranslation(): string {
    return translations[getRandomRange(translations.length)];
}

const gamers = ['Rise up!', 'Disperse!', 'Discharge!'];
function getGamersResponse(): string {
    return gamers[getRandomRange(gamers.length)];
}

function getNextYear(): number {
    return new Date().getFullYear() + 1;
}

// Join voice channel and play audio
interface voiceConnection {
    channelId: string,
    guildId: string,
    adapterCreator: DiscordGatewayAdapterCreator
}
function playAudioFile(username: string, voiceConnection: voiceConnection, audioFie: string): void {
    console.log(`[${new Date().toLocaleTimeString('en-US')}] ${username} played ${audioFie}`);
    connection = joinVoiceChannel(voiceConnection);
    connection.subscribe(player);
    const resource = createAudioResource(`audio/${audioFie}.mp3`);
    player.play(resource);
}

const regexTexts = [
    {
        regex: /where.*andy/,
        getText: () => whereIsAndy()
    },
    {
        regex: /translat(e|ion)/,
        getText: () => getTranslation()
    },
    {
        regex: /gamers/,
        getText: () => getGamersResponse()
    },
    {
        regex: /bazinga|zimbabwe/,
        getText: () => 'Bazinga!'
    },
    {
        regex: /(i'?m|me).*hungr?y/,
        getText: () => 'Then go eat.'
    },
    {
        regex: /oth(er|a).*side/,
        getText: () => 'The other what?'
    },
    {
        regex: /take?.*it.*bac?k/,
        getText: () => 'Now y\'all.'
    },
    {
        regex: /no shot/,
        getText: () => 'Shot.'
    },
    {
        regex: /^(no)shot/,
        getText: () => 'No shot.'
    },
    {
        regex: /fa(x|ct(s|ual))/,
        getText: () => 'No printer.'
    },
    {
        regex: /pam/,
        getText: () => 'PAM!'
    },
    {
        regex: /166/,
        getText: () => 'https://media.discordapp.net/attachments/158049091434184705/795546735594045450/unknown.png'
    },
    {
        regex: /when.*andy.*get(ting)?.*new.*computer/,
        getText: () => getNextYear()
    },
    {
        regex: /too.*late/,
        getText: () => 'But you promised.'
    },
    {
        regex: /hell\s*halt/,
        getText: () => `I'm a leak, I'm a leak. ${emotes.sadge ?? emotes.sadge}`
    }
];

const regexAudios = [
    {
        regex: /w(oah|hoa)/,
        audio: 'basementgang'
    },
    {
        regex: /(thunder vs lightning)/,
        audio: 'thunder_vs_lightning_full'
    },
    {
        regex: /demon/,
        audio: 'demontime'
    },
    {
        regex: /i'?m.*(4|four|poor|bored)/,
        audio: 'VillagerCWhat3'
    },
    {
        regex: /((yo)?u|yu).*(no|know)|sigh/,
        audio: 'sykkuno'
    },
    {
        regex: /uh.*oh/,
        audio: 'uhohstinky'
    },
    {
        regex: /(tbc.*hype|focus.*up)/,
        audio: 'tbchype'
    },
    {
        regex: /suc(c|k|tion)/,
        audio: 'suction'
    },
    {
        regex: /stop/,
        audio: 'itstimetostop'
    },
    {
        regex: /dog/,
        audio: 'whatthedogdoin'
    },
    {
        regex: /bean/,
        audio: 'beans'
    },
    {
        regex: /smosh|shut.*up/,
        audio: 'smosh_shut_up'
    }
];

// Responses to text messages
client.on('messageCreate', async (message: Message): Promise<void> => {
    // Don't respond to bots
    if (message.author.bot) return;
    // Don't respond to Bot Abuser role
    if (message.member && message.member.roles.cache.some(role => role.name === 'Bot Abuser')) return;

    const command = message.content.toLowerCase();

    //React with emoji
    if (/cooler/.test(command)) {
        message.react('????');
    }

    // Text replies
    let botMessage = '';
    for (let regexText of regexTexts) {
        if (regexText.regex.test(command)) {
            botMessage += `${regexText.getText()}\n`;
        }
    }
    // Send message
    if (botMessage) {
        message.channel.send(botMessage);
    }

    // Audio replies
    for (let regexAudio of regexAudios) {
        if (regexAudio.regex.test(command) && message.member && message.member.voice.channel && message.guild) {
            const voiceConnection = {
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            }
            playAudioFile(message.member.user.username, voiceConnection, regexAudio.audio);
            break;
        }
    }
});

// Slash commands
client.on('interactionCreate', async (interaction: Interaction): Promise<void> => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    // Play audio
    if (commandName === 'play' && interaction.member instanceof GuildMember && interaction.guild && interaction.member.voice.channel) {
        const voiceConnection = {
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator
        }
        playAudioFile(interaction.member.user.username, voiceConnection, interaction.options.getString('audio') ?? '')
        const reply = interaction.member.voice ? `Playing ${interaction.options.getString('audio')}.` : 'You are not in a voice channel.';
        await interaction.reply({ content: reply, ephemeral: true });
    }
    // Reply with a number between 1 and 100 (or min and max)
    else if (commandName === 'roll') {
        const min = interaction.options.getInteger('min') ?? 1;
        const max = interaction.options.getInteger('max') ?? 100;
        await interaction.reply(Math.floor(Math.random() * (max + 1 - min) + min).toString());
    }
});

// Disconnect after 5 min of inactivity
player.on(AudioPlayerStatus.Playing, (): void => {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
});
player.on(AudioPlayerStatus.Idle, (): void => {
    player.stop();
    timeoutId = setTimeout(() => {
        connection.disconnect();
        timeoutId = null;
    }, 300000);
});

// Hourly water and posture check cronjob
const waterPostureCheckScheduledMessage = new cron.CronJob('00 00 * * * *', (): void => {
    const channel = client.channels.cache.get('899162908498468934');
    if (channel && channel instanceof TextChannel) {
        channel.send('<@&899160433548722176> Water Check. Posture Check.');
    }
    else {
        console.log('Water/Posture Check channel not found.');
    }
});
waterPostureCheckScheduledMessage.start();

// Daily Wordle reminder cronjob
const wordleScheduledMessage = new cron.CronJob('00 00 00 * * *', (): void => {
    const channel = client.channels.cache.get('933772784948101120');
    if (channel && channel instanceof TextChannel) {
        channel.send('Wordle time POGCRAZY');
    }
    else {
        console.log('Wordle channel not found.');
    }
});
wordleScheduledMessage.start();

//TODO: Add user created reminders/cronjobs

client.login(config.BOT_TOKEN);
client.once('ready', (): void => {
    console.log('Same5JokesBot online.');
    // Add emotes from server to emotes object
    emotes['sadge'] = client.emojis.cache.find((emoji: GuildEmoji) => emoji.name === 'Sadge');
});
