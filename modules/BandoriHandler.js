const Discord = require('discord.js');
const BandoriApi = require('./node-dori');

module.exports = {
    Api: new BandoriApi({
        region: 'jp',
        locale: true
    }),
    sendCard(msg, cardArray) {
        var card = cardArray.shift();
        card.locale = card.getLocale();
        var maxLevel, skill_header, skill_info, skill_title;
        if (card.rarity < 3)
            maxLevel = card.maxLevel
        else
            maxLevel = card.maxLevelTrained;
        if (card.locale) {
            if (card.locale.side_skill.type != null && card.locale.side_skill.details != null) {
                skill_header = `${caseFix(card.locale.skill.type)} + ${caseFix(card.locale.side_skill.type)}`;
                skill_info = `${card.locale.skill.details} ${card.locale.side_skill.details}`;
            }
            else {
                skill_header = card.locale.skill.type;
                skill_info = card.locale.skill.details;
            };
            if (card.locale.skill.name != null)
                skill_title = card.locale.skill.name;
            else
                skill_title = card.skill.name;
        }
        else {
            skill_title = card.skill.name;
            skill_header = 'Unknown';
            skill_info =  card.skill.details[0];
        };
        const embed = new Discord.RichEmbed()
            .setAuthor(card.toString(), card.getIcon(),
                `https://bandori.party/cards/${card.locale.id}`)
            .setThumbnail(card.locale.icon)
            .setColor(card.getColor())
            .addField("Skill Type", skill_header, true)
            .addField("Max Power", card.parameters[maxLevel].total + 
                (card.parameterStoryBonus[0] + card.parameterStoryBonus[1]) * 3 + 
                card.parameterTrainBonus * 3, true)
            .addField(skill_title, skill_info);
        if (cardArray.length > 0) {
            var listCards = [];
            cardArray.forEach(elem => {
                listCards.push(`#${elem.id.toString().padStart(3, "0")} > ` + elem.toString());
            });
            listCards.length = 5;
            embed.addField('\u200b', `\`\`\`md\n${listCards.join('\n')}\`\`\``);
        }
        msg.channel.send({ embed });
    },
    sendEvent(msg, event) {

    }
};

function caseFix(str) {
    return str.replace(/\w\S*/g, txt => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}