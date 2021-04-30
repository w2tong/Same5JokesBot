const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

const verbs = ["Walking", "Washing", "Eating"];
const nouns = ["dog", "dishes", "dinner"];
const translations = ["Prance forward", "Shashay left", "Boogie down", "Shimmy right"];

function RandomRange(max)
{
    return Math.floor(Math.random() * max);
}

function WhereIsAndy()
{
    var verb = verbs[RandomRange(verbs.length)];
    var noun = nouns[RandomRange(nouns.length)];
    return verb + " his " + noun + ".";
}

function Translate()
{
    return translations[RandomRange(translations.length)];
}

client.on("message", function(message) { 
    if (message.author.bot) return;
    var command = message.content.toLowerCase();
    if (command.includes("where is andy?") || command.includes("where is andy") || command.includes("wheres andy") || command.includes("where's is andy"))
    {
        message.reply(WhereIsAndy());
    }
    else if (command.includes("translate"))
    {
        message.reply(Translate() + "!");
    }
    else if (command.includes("bazinga") || command.includes("zimbabwe"))
    {
        message.reply("Bazinga!");
    }
    else if (command.includes("im hungry") || command.includes("i'm hungry"))
    {
        message.reply("Then go eat.");
    }
    else if (command.includes("other side"))
    {
        message.reply("The other what?");
    }
    else if (command.includes("take it back"))
    {
        message.reply("now y'all.");
    }
    else if (command.includes("no shot"))
    {
        message.reply("shot.");
    }
    else if (command.includes("pam"))
    {
        message.reply("PAM!");
    }
});      

client.login(config.BOT_TOKEN);
console.log("Same5JokesBot online");