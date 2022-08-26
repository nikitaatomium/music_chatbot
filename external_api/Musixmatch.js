const request = require('request');

const api_key = "put_api_key_here";
const api_search = "http://api.musixmatch.com/ws/1.1/track.search?";
const api_lyrics = "http://api.musixmatch.com/ws/1.1/track.lyrics.get?";

function doRequestSearch(artist, track) {
    return new Promise(function (resolve, reject) {
        request(api_search + "apikey=" + api_key + "&q_artist=" + artist + "&q_track=" + track + "&page_size=1", function (error, response, body) {
            if (error) {
                reject(error);
            }

            if (response && response.statusCode == 200) {
                try {
                    var json_res = JSON.parse(body);
                    resolve(json_res.message.body.track_list[0].track.track_id);
                } catch (ex) {
                    reject(new Error("No track found"));
                }
            } else {
                reject(new Error("Something went wrong"));
            }
        });
    });
}

function doRequestLyric(track_id) {
    return new Promise(function (resolve, reject) {
        request(api_lyrics + "apikey=" + api_key + "&track_id=" + track_id, function (error, response, body) {
            if (error) {
                reject(error);
            }

            if (response && response.statusCode == 200) {
                try {
                    var json = JSON.parse(body);
                    resolve(json.message.body.lyrics.lyrics_body);
                } catch (ex) {
                    reject(new Error("No Lyric found"));
                }
            } else {
                reject(new Error("Something went wrong"));
            }
        });
    });
}

module.exports = {

    FindLyric: async function (artist, track) {

        try {
            var TrackID = await doRequestSearch(artist, track);
            return await doRequestLyric(TrackID);
        } catch (ex) {
            throw ex;
        } 
    }
};