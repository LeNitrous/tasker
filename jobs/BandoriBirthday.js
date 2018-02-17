module.exports = {
    name: "BandoriBirthday",
    time: "00 00 00 * * *",
    timezone: "Asia/Tokyo",
    task: (Bot) => {
        var settings = require("../data/guilds.json");
        var birthday = require("../data/BandoriBirthday.json")
            .filter(item => isToday(parseInt(elem.date))).shift();
        if (!birthday) return;
        settings.forEach(item => {
            if (elem.bandori.birthdayChannel) {
                Kokoro
                    .guilds.find("id", item.guild)
                    .channels.find("id", item.bandori.birthdayChannel)
                    .send(birthday.message,
                        {files: [
                            {attachment: birthday.image, name: "image.jpg"}
                        ]});
            }
        });
    }
}

function isToday(date) {
    var today = new Date();
    var target = new Date(date);
    if (today.getMonth() == target.getMonth() && today.getDate() == target.getDate())
        return true;
    else
        return false;
}