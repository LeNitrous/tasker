const Discord = require('discord.js');
const BandoriApi = require('node-dori');

module.exports = {
    Api: new BandoriApi({
        region: 'jp'
    }),

    sendCard(msg, cardArray, locale) {
        var card = (cardArray.length > 1) ? cardArray.shift() : cardArray;
        var maxLevel, skill_header, skill_info, skill_title;
        card.locale = locale;
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
                skill_header = caseFix(card.locale.skill.type);
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
            .setThumbnail(card.locale.image.normal_icon)
            .setColor(card.getColor())
            .addField("Skill Type", skill_header, true)
            .addField("Max Power", card.parameterMax.total + 
                (card.parameterStoryBonus[0] + card.parameterStoryBonus[1]) * 3 + 
                card.parameterTrainBonus * 3, true)
            .addField(skill_title, skill_info);
        if (cardArray.length > 0) {
            var listCards = [];
            cardArray.forEach(elem => {
                listCards.push(`#${elem.id.toString().padStart(3, "0")} > ` + elem.toString());
            });
            listCards.length = 5;
            embed.addField('Similar Cards', `\`\`\`md\n${listCards.join('\n')}\`\`\``);
        }
        msg.send({ embed });
    },


    sendCardArt(msg, cardArray, state) {
        var card = (cardArray.length > 1) ? cardArray.shift() : cardArray;
        const embed = new Discord.RichEmbed()
            .setAuthor(card.toString(), card.getIcon())
            .setImage(card.image[state])
            .setColor(card.getColor());
        msg.send({ embed });
    },

    sendMusic(msg, musicArray) {
        var music = musicArray.shift();
        var color = (bandColors.hasOwnProperty(music.band)) ? bandColors[music.band] : [233, 30, 99];
        const embed = new Discord.RichEmbed()
            .setAuthor(music.toString())
            .setThumbnail(music.jacket)
            .setColor()
            .setDescription(
            `\n• Arranger: ${music.arranger}` +
            `\n• Composer: ${music.composer}` +
            `\n• Lyricist: ${music.lyricist}`
            )
            .addField('Difficulties',
            `★${music.difficulty.easy.level} EASY` +
            `\n★${music.difficulty.normal.level} NORMAL` +
            `\n★${music.difficulty.hard.level} HARD` +
            `\n★${music.difficulty.expert.level} EXPERT` +
            `\n\n(${music.type}) [Listen](${music.bgm})`);
        if (musicArray.length > 0) {
            var listMusic = [];
            musicArray.forEach(elem => {
                listMusic.push(`#${elem.id.toString().padStart(3, "0")} > ` + elem.toString());
            });
            listMusic.length = 5;
            embed.addField('Similar Music', `\`\`\`md\n${listMusic.join('\n')}\`\`\``);
        }
        msg.send({ embed });
    },

    sendSearch(msg, array) {
        var list = [];
        array.forEach(elem => {
            list.push(`#${elem.id.toString().padStart(3, "0")} > ` + elem.toString());
        });
        found = list.length;
        list = list.join('\n');
        msg.send(`Found **${found}** occurences`);
        if (list.length > 1950) {
            var result = Discord.Util.splitMessage(list);
            result.forEach(block => {
                msg.send(block, {code: 'md'});
            });
        }
        else
            msg.send(list, {code: 'md'});
    },
    
    sendEvent(msg, event, cardArray, musicArray, locale) {
        var stringCard = [];
        var stringMusic = [];
        var stringMember = [];
        var event_title;
        event.locale = locale;
        if (event.locale)
            event_title = event.locale.name;
        else
            event_title = event.name;
        cardArray
            .forEach(elem => {
                stringCard.push(`#${elem.id.toString().padStart(3, "0")} > ` + elem.toString());
            });
        event.characters
            .forEach(elem => {
                stringMember.push(emoji[elem])
            });
        const embed = new Discord.RichEmbed()
            .setAuthor(event_title, event.getIcon(),
                `https://bandori.party/events/${event.id}`)
            .addField('Event Members', stringMember.join(' '), true)
            .addField('Event Type', caseFix(event.type), true)
            .addField('Event Reward Cards', `\`\`\`md\n${stringCard.join('\n')}\`\`\``)
            .setColor(event.getColor())
            .setImage(event.image);
        if (musicArray.length > 0) {
            musicArray.forEach(elem => {
                stringMusic.push(`#${elem.id.toString().padStart(3, "0")} > ` + elem.toString());
            })
            embed.addField('Event Music', `\`\`\`md\n${stringMusic.join('\n')}\`\`\``);
        };
        if (event.getState() == -1)
            embed.addField('Starts In', timeLeft(event.start));
        else if (event.getState() == 0)
            embed.addField('Ends In', timeLeft(event.end));
        msg.send({ embed });
    },

    sendKoma(msg, koma) {
        const embed = new Discord.RichEmbed()
            .setAuthor(`#${koma.id} ${koma.title}`)
            .setColor([233, 30, 99])
            .setImage(koma.image);
        msg.send({ embed });
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

var bandColors = {
    "Poppin'Party": [255, 59, 114],
    "Afterglow": [229, 51, 67],
    "ハロー、ハッピーワールド！": [255, 192, 42],
    "Pastel＊Palettes": [42, 246, 177],
    "Roselia": [59, 73, 255],
}