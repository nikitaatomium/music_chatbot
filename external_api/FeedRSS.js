'use strict'

const Parser = require('rss-parser');
const html_converter = require('html2plaintext');

const parser = new Parser();

const genres_link = {};
genres_link.pop = 'http://www.music-news.com/rss/Us/news?includeCover=true/';
genres_link.oldies = 'http://www.allbutforgottenoldies.net/rss-feeds/allbutforgottenoldies.xml';
genres_link.indie = 'https://consequenceofsound.net/feed/';
genres_link.electronic = 'http://www.itsoundsfuture.com/feed/';
genres_link.metal = 'http://www.metalstorm.net/rss/news.xml';

const genre_notification = {};
genre_notification.pop = ["All"];
genre_notification.electronic = ["Bass", "House", "Techno", "Trace", "Other", "All"];
genre_notification.hip_hop = ["Soundcloud rap", "Classic hip hop", "All"];
genre_notification.rock = ["Indie", "Metal", "All"];

const platforms = ["Spotify", "Apple music", "SoundCloud", "Youtube", "All"];

module.exports = {

    LoadRSS: async function (genre, start, number) {
        
        var feed = await parser.parseURL(genres_link[genre]);

        var response = [];
        var finish = false;

        for (var i = start; i < start + number; i++) {
            var one_feed;

            try {
                one_feed = '' + feed.items[i].title + '\r\n\r\n';
                one_feed += '' + html_converter(feed.items[i].content) + '\r\n';

                response.push(one_feed);
            } catch (ex) {
                one_feed = 'Sorry, there is no more news in this category. Please try again later.';

                response.push(one_feed);
                finish = true;
                break;
            }
        }

        return { response: response, finish: finish };
    },

    genres: genres_link,
    genre_notification: genre_notification,
    platforms: platforms

};
