const Discord = require('discord.js');
const BandoriApi = require('./node-dori');

module.exports = {
    Api: new BandoriApi({
        region: 'jp'
    }),
    sendCard(msg, cardArray) {
        var card = (cardArray.length > 1) ? cardArray.shift() : cardArray;
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
        var cardArray = [];
        var memberArray = [];
        event.getCards()
            .forEach(elem => {
                cardArray.push(`#${elem.id.toString().padStart(3, "0")} > ` + elem.toString());
            });
        event.characters
            .forEach(elem => {
                memberArray.push(emoji[elem])
            });
        const embed = new Discord.RichEmbed()
            .setAuthor(event.name, event.getIcon())
            .addField('Event Members', memberArray.join(' '), true)
            .addField('Event Type', caseFix(event.type), true)
            .addField('Event Reward Cards', `\`\`\`md\n${cardArray.join('\n')}\`\`\``)
            .setColor(event.getColor())
            .setImage(event.image);
        if (event.details.musics.length > 0) {
            var musicArray = [];
            event.getMusic()
                .forEach(elem => {
                    musicArray.push(`#${elem.id.toString().padStart(3, "0")} > ` + elem.toString());
                });
            embed.addField('Event Music', `\`\`\`md\n${musicArray.join('\n')}\`\`\``);
        };
        if (event.getState() == -1)
            embed.addField('Starts In', timeLeft(event.start));
        else if (event.getState() == 0)
            embed.addField('Ends In', timeLeft(event.end));
        msg.channel.send({ embed });
    }
};

function caseFix(str) {
    return str.replace(/\w\S*/g, txt => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function timeLeft(date) {
    let time;

    if (new Date() < date)
        time = new Date(date - new Date()).getTime();
    else if (new Date() > date)
        time = new Date(new Date() - date).getTime();

    let d = Math.floor(time / (1000 * 60 * 60 * 24));
    let h = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let m = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    let s = Math.floor((time % (1000 * 60)) / 1000);

    let str = '';

    let d_tag = (d == 1) ? 'day' : 'days';
    let h_tag = (h == 1) ? 'hour' : 'hours';
    let m_tag = (m == 1) ? 'minute' : 'minutes';
    let s_tag = (s == 1) ? 'second' : 'seconds';

    if (d != 0)
        str = str + `${d} ${d_tag} `;
    if (h != 0)
        str = str + `${h} ${h_tag} `;
    if (m != 0)
        str = str + `${m} ${m_tag} `;
    if (s != 0)
        str = str + `${s} ${s_tag}`;

    return str;
}

var emoji = { 
    "Toyama Kasumi": '<:kasumi:411101168635346945>',
    "Hanazono Tae": '<:tae:411101169478270978>',
    "Ushigome Rimi": '<:rimi:411101168987668501>',
    "Yamabuki Saaya": '<:saaya:411101169755226112>',
    "Ichigaya Arisa": '<:arisa:411101141229633536>',
    "Mitake Ran": '<:ran:411101168958439425>',
    "Aoba Moca": '<:moca:411101168291414019>',
    "Uehara Himari": '<:himari:411101167557410816>',
    "Udagawa Tomoe": '<:tomoe:411101169600167937>',
    "Hazawa Tsugumi": '<:tsugumi:411101169650368512>',
    "Tsurumaki Kokoro": '<:kokoro:406381351718354964>',
    "Seta Kaoru": '<:kaoru:411101168756981770>',
    "Kitazawa Hagumi": '<:hagumi:411101164004704268>',
    "Matsubara Kanon": '<:kanon:411101167624519680>',
    "Michelle": '<:misaki:411101168341745665>',
    "Maruyama Aya": '<:aya:411101160766832651>',
    "Hikawa Hina": '<:hina:411101167184248843>',
    "Shirasagi Chisato": '<:chisato:411101165191954432>',
    "Yamato Maya": '<:maya:411101168874422272>',
    "Wakamiya Eve": '<:eve:411101167058288640>',
    "Minato Yukina": '<:yukina:411101168903651328>',
    "Hikawa Sayo": '<:sayo:411101169331732480>',
    "Imai Lisa": '<:lisa:411101169134469120>',
    "Udagawa Ako": '<:ako:411101139983925248>',
    "Shirokane Rinko": '<:rinko:411101169260298250>'
}