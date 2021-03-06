const Discord = require("discord.js");
const fs = require("graceful-fs");
const ytdl = require("ytdl-core"),
    ytpl = require("ytpl"),
    ytsearch = require("yt-search"),
    { Util } = require("discord.js");
const config = require("../static/config.json"); 
const cosmetic = require("../static/cosmetic.json");

module.exports.run = async (client, message, args) => {

  if (!message.member.roles.cache.find(role => config["dj_role"] === role.name)) return message.channel.send(client.msg["rejcted_dj"].replace("[ROLE_DJ]", config["dj_role"]));
  if (!message.member.voice.channel) return message.channel.send(client.msg["music_channel_undefined"])
 
  
  var url = "https://www.youtube.com/playlist?list=PLwXxYQlATbq2eOmzkyfsKY3RKroixzLox"
  const playlist = await ytpl(url.split("list=")[1])
  const videos = playlist.items;
  message.channel.send(client.msg["music_playlist_success"].replace("[PLAYLIST_TITLE]", `${playlist.title} (${videos.length})`))
  for (const video of videos) await queueSong(video, message, message.member.voice.channel, client)
}



module.exports.config = {
  name: "guiltygear",
  aliases: ["ggxrd"],
  use: "guiltygear",
  description: "Plays <@!431907704190009344>'s custom Guilty Gear playlist which consists of the same song but for forty minutes because he thinks its different. " + cosmetic.emotes["emoji_bigfake"],
  state : "gamma",
  page: -1
};



//Async - Music
async function queueSong(video, message, voiceChannel, client) {



    const serverQueue = client.queue.get(message.guild.id)
    let thumbnail = ""
    if (video.player_response) thumbnail = (video.player_response.videoDetails.thumbnail.thumbnails).slice(-1)[0]["url"];
    if (video.thumbnail) thumbnail = video.thumbnail;
    const song = {
        id: video.id || video.video_id,
        title: Util.escapeMarkdown(video.title),
        url: "https://www.youtube.com/watch?v=" + (video.id || video.video_url),
        thumbnail: thumbnail
    }
    if (!serverQueue) {
        const queueConstruct = {
            textChannel: message.channel,
            voiceChannel,
            connection: null,
            songs: [song],
            volume: 50, 
            playing: true
        }
        try {
            const connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            client.queue.set(message.guild.id, queueConstruct)
            playSong(message.guild, queueConstruct.songs[0], message, client)
        } catch (e) {
            console.log(e)
            message.channel.send(client.msg["music_rejected"])
            return queue.delete(message.guild.id)
        }
    } else serverQueue.songs.push(song);
    return;
}
async function playSong(guild, song, message, client) {



    const serverQueue = client.queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        client.queue.delete(guild.id);
        return;
    }
    serverQueue.connection.play(ytdl(song.id))
        .once('finish', reason => {
            serverQueue.songs.shift();
            playSong(guild, serverQueue.songs[0], message, client)
        })
        .on("error", console.error)
        .setVolumeLogarithmic(serverQueue.volume / 250)
    serverQueue.textChannel.send(client.msg["music_video_resolved"].replace("[SONG_TITLE]", song.title))
}
const ytsr = (url) => new Promise((resolve, reject) => ytsearch(url, (err, r) => err ? reject(err) : resolve(r)))