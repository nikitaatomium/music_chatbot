const express = require('express');
const apiai = require('apiai');
const router = express.Router();

const FeedRSS = require('../external_api/FeedRSS');
const Musixmatch = require('../external_api/Musixmatch');
const Platforms = require('../external_api/Platforms');
const Database = require('../database/database');
const Utility = require('../utility/utility');

router.post('/webhook', async function(req, res){

    var result = {

        fulfillmentText: "",
        fulfillmentMessages: [],
        source: "example.com",
        payload: {},
        outputContexts: [],
        followupEventInput: {}

    }

    const sessionId = req.body.sessionId;
    const dialog_result = req.body.queryResult;
    const action = dialog_result.action;
    const params = dialog_result.parameters;
    const contexts = dialog_result.outputContexts;
    const completed = dialog_result.allRequiredParamsPresent;

    var from = req.body.originalDetectIntentRequest;
	console.log(action);

    switch (action) {

        case 'input.welcome':

            result.fulfillmentMessages.push({
                card: {
                    subtitle: "Hey there, I'm a music bot that can help you to get latest news and access exclusive music releases. :)"
                }
            });
            result.fulfillmentMessages.push({
                card: {
                    subtitle: "I'm easy to use. You'll see some options in a moment, just make a selection and we'll get started."
                }
            });

            result.fulfillmentMessages.push({
                card: {
                    subtitle: "Here are the things I can help you with today.",
                    buttons: [
                        {
                            text: "Music trends"
                        },
                        {
                            text: "Find Lyrics"
                        }
                    ]
                }
            });

            result.fulfillmentMessages.push({
                card: {
                    subtitle: "Otherwise, you can receive music recommendations about your favourite genres!",
                    buttons: [
                        {
                            text: "Enable Recommendations"
                        }
                    ]
                }
            });

            result.fulfillmentMessages.push({
                    "text": {
                        "text": [
                            "Hey there, I'm a music bot that can help you to get latest news and access exclusive music releases. :)"
                        ]
                    },
                    "platform": "FACEBOOK"
                },
                {
                    "text": {
                        "text": [
                            "I'm easy to use. You'll see some options in a moment, just make a selection and we'll get started."
                        ]
                    },
                    "platform": "FACEBOOK"
                },
                {
                    "text": {
                        "text": [
                            "Here are the things I can help you with today."
                        ]
                    },
                    "platform": "FACEBOOK"
                },
                {
                    "quickReplies": {
                        "title": "Otherwise, you can receive music recommendations about your favourite genres!",
                        "quickReplies": [
                            "Recommendations",
                            "Music trends",
                            "Find Lyrics"
                        ]
                    },
                    "platform": "FACEBOOK"

                });
            break;

        case 'input.unknown':
            result.fulfillmentMessages.push({
                card: {
                    subtitle: "I'm not sure about that, but let me show you what I can do!",
                    buttons: [
                        {
                            text: "Discover artists"
                        },
                        {
                            text: "Music News"
                        },
                        {
                            text: "Find Lyrics"
                        }
                    ]
                }
            });

            result.fulfillmentMessages.push({
                "quickReplies": {
                    "title": "I'm not sure about that, but let me show you what I can do!",
                    "quickReplies": [
                        "Discover artists",
                        "Music News",
                        "Find Lyrics"
                    ]
                },
                "platform": "FACEBOOK"
            });
            break;

        case 'action.news_genre':

            if (!(params.Genre in FeedRSS.genres)) {
                result.fulfillmentMessages.push({
                    card: {
                        subtitle: "Right now we don't have this genre!"
                    }
                });

                result.fulfillmentMessages.push({
                    "text": {
                        "text": [
                            "Right now we don't have this genre!"
                        ]
                    },
                    "platform": "FACEBOOK"
                });

                break;
            }
			
            if (req.users.has(sessionId)) {
                var user =  req.users.get(sessionId);
				user.currentNews = 1;
                req.users.set(sessionId, user);
            } else {
				var user = {};
				user.currentNews = 1;
                req.users.set(sessionId, user);
            }

            var feed_parsed = await FeedRSS.LoadRSS(params.Genre, 0, 1);
            var length = feed_parsed.response.length;

            for (var i = 0; i < length; i++) {

                if (i < length - 1) {
                    result.fulfillmentMessages.push({
                        card: {
                            subtitle: feed_parsed.response[i]
                        }
                    });

                    result.fulfillmentMessages.push({
                        "text": {
                            "text": [
                                feed_parsed.response[i]
                            ]
                        },
                        "platform": "FACEBOOK"
                    });
                } else {
                    if (completed) {
                        result.fulfillmentMessages.push({
                            card: {
                                subtitle: feed_parsed.response[i],
                                buttons: [
                                    {
                                        text: "Load more 1 " + params.Genre.replace(/_/g, ' ')
                                    }
                                ]
                            }
                        });

                        result.fulfillmentMessages.push({
                            "quickReplies": {
                                "title": feed_parsed.response[i],
                                "quickReplies": [
                                    "Load more 1 " + params.Genre.replace(/_/g, ' ')
                                ]
                            },
                            "platform": "FACEBOOK"
                        });
                    } else {
                        result.fulfillmentMessages.push({
                            card: {
                                subtitle: feed_parsed.response[i]
                            }
                        });

                        result.fulfillmentMessages.push({
                            "text": {
                                "text": [
                                    feed_parsed.response[i]
                                ]
                            },
                            "platform": "FACEBOOK"
                        });
                    }
                }
            }

            break;
        case 'action.feed_list':
            result.fulfillmentMessages.push({
                card: {
                    subtitle: 'Here are some topics I know about ;)',
                    buttons: []
                }
            });

            result.fulfillmentMessages.push({
                "quickReplies": {
                    "title": "Here are some topics I know about ;)",
                    "quickReplies": []
                },
                "platform": "FACEBOOK"
            });

            Object.keys(FeedRSS.genres).forEach((value) => {
                result.fulfillmentMessages[0].card.buttons.push({
                    text: value.replace(/_/g, ' ')
                });

                result.fulfillmentMessages[1].quickReplies.quickReplies.push(value.replace(/_/g, ' '));
            });
            break;
        case 'action.load_more_feed':
            if (completed) {
                var value;
				var user;
				
                if (req.users.has(sessionId)) {
					console.log("has id");
					user = req.users.get(sessionId);
					value = user.currentNews;
                } else {
					console.log("no id");
					user = {};
					value = 0;
					user.currentNews = value;
                }

                var feed_parsed = await FeedRSS.LoadRSS(params.Genre, value, params.number);

                var length = feed_parsed.response.length;

                for (var i = 0; i < length; i++) {

                    if (i < length - 1) {
                        result.fulfillmentMessages.push({
                            card: {
                                subtitle: feed_parsed.response[i],
                            }
                        });

                        result.fulfillmentMessages.push({
                            "text": {
                                "text": [
                                    feed_parsed.response[i]
                                ]
                            },
                            "platform": "FACEBOOK"
                        });
                    } else {
                        if (!feed_parsed.finish) { 
                            result.fulfillmentMessages.push({
                                card: {
                                    subtitle: feed_parsed.response[i],
                                    buttons: [{ text: "Load more " + params.number + " feed of " + params.Genre.replace(/_/g, ' ') }]
                                }
                            });

                            result.fulfillmentMessages.push({
                                "quickReplies": {
                                    "title": feed_parsed.response[i],
                                    "quickReplies": [
                                        "Load more " + params.number + " feed of " + params.Genre.replace(/_/g, ' ')
                                    ]
                                },
                                "platform": "FACEBOOK"
                            });
                        } else {
                            result.fulfillmentMessages.push({
                                card: {
                                    subtitle: feed_parsed.response[i],
                                }
                            });

                            result.fulfillmentMessages.push({
                                "text": {
                                    "text": [
                                        feed_parsed.response[i]
                                    ]
                                },
                                "platform": "FACEBOOK"
                            });
                        }
                    }
                }

				user.currentNews += params.number;
                req.users.set(sessionId, user);
            }
            break;
        case 'action.find_lyrics':
            if (completed) {
                try {
                    var lyric = await Musixmatch.FindLyric(params.artist, params.track);
                    result.fulfillmentMessages.push({
                        card: {
                            subtitle: lyric,
                            buttons: [
                                {
                                    text: 'Search for another song'
                                }
                            ]
                        }
                    });

                    result.fulfillmentMessages.push({
                        "quickReplies": {
                            "title": lyric,
                            "quickReplies": [
                                'Search for another song'
                            ]
                        },
                        "platform": "FACEBOOK"
                    });
                } catch (ex) {
                    console.log(ex);
                    result.fulfillmentMessages.push({
                        card: {
                            subtitle: "Sorry I can't find this song. Please try again.",
                            buttons: [
                                {
                                    text: 'Search for another song'
                                }
                            ]
                        }
                    });

                    result.fulfillmentMessages.push({
                        "quickReplies": {
                            "title": "Sorry I can't find this song. Please try again.",
                            "quickReplies": [
                                'Search for another song'
                            ]
                        },
                        "platform": "FACEBOOK"
                    });
                }
            }
            break;

        /*case 'action.receive_notifications':
            if (completed) {
                result.fulfillmentMessages.push({
                    "quickReplies": {
                        "title": "Please choose your preferred genre",
                        "quickReplies": []
                    }
                });

                result.fulfillmentMessages.push({
                    "quickReplies": {
                        "title": "Please choose your preferred genre",
                        "quickReplies": []
                    },
                    "platform": "FACEBOOK"
                });

                Object.keys(FeedRSS.genre_notification).forEach((key) => {
                    result.fulfillmentMessages[0].quickReplies.quickReplies.push(key.replace("_", " "));
                    result.fulfillmentMessages[1].quickReplies.quickReplies.push(key.replace("_", " "));
                });
            }
            break;

        case 'action.receive_notifications.genre':
            if (completed) {
                const genre = ("" + params.genre).replace(" ", "_").toLowerCase();

                result.fulfillmentMessages.push({
                    "quickReplies": {
                        "title": "Please choose your preferred subgenre",
                        "quickReplies": FeedRSS.genre_notification[genre]
                    }
                });

                result.fulfillmentMessages.push({
                    "quickReplies": {
                        "title": "Please choose your preferred subgenre",
                        "quickReplies": FeedRSS.genre_notification[genre]
                    },
                    "platform": "FACEBOOK"
                });
            }
            break;

        case 'action.receive_notifications.genre.subgenre':
            if (completed) {
                const subgenre = params.subgenre;

                result.fulfillmentMessages.push({
                    "quickReplies": {
                        "title": "Got it! What is your favourite music streaming platform?",
                        "quickReplies": FeedRSS.platforms
                    }
                });

                result.fulfillmentMessages.push({
                    "quickReplies": {
                        "title": "Got it! What is your favourite music streaming platform?",
                        "quickReplies": FeedRSS.platforms
                    },
                    "platform": "FACEBOOK"
                });

                console.log(result.fulfillmentMessages[0]);
            }
            break;

        case 'action.receive_notifications.genre.subgenre.platform':
            if (completed) {
                var index = contexts.length - 1;
                const genre = ("" + contexts[index].parameters.genre).replace(" ", "_").toLowerCase();
                const subgenre = contexts[index].parameters.subgenre;
                const platform = params.platform;
                console.log("Genre => " + genre);
                console.log("Subgenre => " + subgenre);

                if (FeedRSS.genre_notification[genre].indexOf("" + subgenre) == -1)
                   subgenre = "All";

                var added;
				
				added = await Database.AddUser(Utility.GetUserId(from.payload.data, from.source), genre, subgenre, platform, '', from.source);

				if(added == true) {
				result.fulfillmentMessages.push({
							card: {
								subtitle: "Thanks! I will start discovering new music for you based on your preferred genre and as soon as I have something interesting and exclusive, I will message you."
							}
						});

						result.fulfillmentMessages.push({
							"text": {
								"text": [
									"Thanks! I will start discovering new music for you based on your preferred genre and as soon as I have something interesting and exclusive, I will message you."
								]
							},
							"platform": "FACEBOOK"
						});

				} else {
				result.fulfillmentMessages.push({
							card: {
								subtitle: "I see you are already subscribed here!"
							}
						});

						result.fulfillmentMessages.push({
							"text": {
								"text": [
								   "I see you are already subscribed here!"
								]
							},
							"platform": "FACEBOOK"
						});
				}

                console.log("Genre => " + genre + " | Subgenre => " + subgenre + " | Platform => " + platform + " | Source = " + from.source);

                contexts.forEach((context) => {
                    context.lifespanCount = 0;
                    result.outputContexts.push(context);
                });
            }
            break;*/
			
		case 'action.following_artist':

			var userId = Utility.GetUserId(from.payload.data, from.source);
			var source = from.source;
			var nameArtist = params.nameArtist.split(" ")[0];
			
			if(!userId || !nameArtist) {
				result.fulfillmentMessages.push({
					card: {
						subtitle: "Not sure about that, try again!"
					}
				});
				
				result.fulfillmentMessages.push({
					"text": {
						"text": [
							"Not sure about that, try again!"						
						]
					},
					"platform": "FACEBOOK"
				});				
				
				break;
			}
			
			var isFollowing = null;
			
			try {
				isFollowing = await Database.CheckUserFollow(userId, nameArtist, source);
			} catch(ex) {
				if(ex.message == 'USER_NOT_EXISTS') {
					console.log('NEW USER');
					added = await Database.AddUser(userId, '', source);
					if(added == true) {
						isFollowing = await Database.CheckUserFollow(userId, nameArtist, source);
					}
				}
			}
			
			if(isFollowing != null) {
				result.fulfillmentMessages.push({
					card: {
						subtitle: Utility.BuildString("Do you really want to {0} {1}?", isFollowing? "Follow" : "Unfollow", nameArtist),
					buttons: [
							{
								text: "Yes"
							},
							{
								text: "No"
							}
						]
					}
				});

				result.fulfillmentMessages.push({
					"quickReplies": {
						"title": [
						   Utility.BuildString("Do you really want to {0} {1}?", isFollowing? "Follow" : "Unfollow", nameArtist)
						],
								"quickReplies": [
							"Yes",
							"No"
						]
					},
					"platform": "FACEBOOK"
				});
			} else {
				result.fulfillmentMessages.push({
					card: {
						subtitle: "Not sure about that, try again!"
					}
				});
				
				result.fulfillmentMessages.push({
					"text": {
						"text": [
							"Not sure about that, try again!"						
						]
					},
					"platform": "FACEBOOK"
				});		
			}

			break;
			
		case 'action.following_artist_confirm':
			var userId = Utility.GetUserId(from.payload.data, from.source);
			var source = from.source;
			var nameArtist = contexts[contexts.length - 1].parameters.nameArtist;
			var resultFollow = params.result == 'Yes' ? true : false;
			var actionCompleted = false;

			if(!resultFollow)  
			{
				result.fulfillmentMessages.push({
					card: {
						subtitle: "Alright Ok!"
					}
				});
				
				result.fulfillmentMessages.push({
					"text": {
						"text": [
							"Alright Ok!"						
						]
					},
					"platform": "FACEBOOK"
				});	
			}
			else
			{
				try {
					var action_follow = await Database.CheckUserFollow(userId, nameArtist, source);
					actionCompleted = await Database.FollowArtist(userId, source, nameArtist, action_follow);
	
					result.fulfillmentMessages.push({
						card: {
							subtitle: Utility.BuildString("Now you {0} {1}!", action_follow ? "Follow" : "Unfollow", nameArtist)
						}
					});
					
					result.fulfillmentMessages.push({
						"text": {
							"text": [
								Utility.BuildString("Now you {0} {1}!", action_follow ? "Follow" : "Unfollow", nameArtist)
							]
						},
						"platform": "FACEBOOK"
					});
                    
                    if(action_follow) {
                        
                        var user = await Database.GetUserDetail(nameArtist);

                        user.source = source;
                        
                        console.log(user)
                        
                        user.id = userId;

                        Platforms.SendAudio(user.song_url, user.message, user);
                    }
					
				} catch(e) {
                
                console.log(e);
					result.fulfillmentMessages.push({
						card: {
							subtitle: "Something went wrong while Following/Unfollowing " + nameArtist
						}
					});
					
					result.fulfillmentMessages.push({
						"text": {
							"text": [
								"Something went wrong while Following/Unfollowing " + nameArtist
							]
						},
						"platform": "FACEBOOK"
					});	
				}	
			}
			
			break;

    }

    res.json(result);
    res.end();
});

async function BroadcastMessage(postId) {
	if(!postId) return;
	
	try {
		var objectResult = await Database.GetBroadcastMessageObject(postId);
		
		for(let i = 0; i < objectResult.users.length; i++) {
			var user = objectResult.users[i];
			console.log(user);
			if(user.id != null && user.id != "") {
				Platforms.SendMessage(objectResult.message, user.source, user.id);
			}
		}
		
		return { completed: true, errorMessage: '' };
	} catch(ex) {
		console.log(ex);
		return { completed: false, errorMessage: ex };
	}
}

async function BroadcastEvent(postId) {
	if(!postId) return;
	
	try {
		var objectResult = await Database.GetBroadcastEventObject(postId);
		console.log(objectResult);
		for(let i = 0; i < objectResult.users.length; i++) {
			var user = objectResult.users[i];
			console.log(user);
			if(user.id != null && user.id != "") {
				Platforms.SendMessage(objectResult.fullMessage, user.source, user.id);
			}
		}
		
		return { completed: true, errorMessage: '' };
	} catch(ex) {
		console.log(ex);
		return { completed: false, errorMessage: ex };
	}
}

async function BroadcastSocial(postId) {
	if(!postId) return;
	
	try {
		console.log("Getting socials");
		var objectResult = await Database.GetBroadcastSocialObject(postId);
		console.log(objectResult);
		for(let i = 0; i < objectResult.users.length; i++) {
			var user = objectResult.users[i];
			console.log(user);
			if(user.id != null && user.id != "") {
				Platforms.SendCarousel(objectResult, user.source, user.id);
			}
		}
		
		return { completed: true, errorMessage: '' };
	} catch(ex) {
		console.log(ex);
		return { completed: false, errorMessage: ex };
	}
}

async function BroadcastAudio(postId) {
	console.log("out");
	if(!postId) return;
	console.log("in");
	try {
		console.log("BROADCASTING AUDIO");
		var objectResult = await Database.GetBroadcastAudioObject(postId);
		console.log(objectResult);
		//Platforms.BroadcastAudioObject(objectResult.audioLink, objectResult.fullMessage,objectResult.users);
		for(let i = 0; i < objectResult.users.length; i++) {
			var user = objectResult.users[i];
			console.log(user);
			if(user.id != null && user.id != "") {
				Platforms.SendAudio(objectResult.song_url, objectResult.fullMessage, user);
			}
		}
		return { completed: true, errorMessage: '' };
	} catch(ex) {
		console.log(ex);
		return { completed: false, errorMessage: ex };
	}
}

async function GetPostType(postId) {
	if(!postId) return "";
	
	try {
		const type = await Database.GetPostTypeObject(postId);
		console.log(type);
		return type;
	} catch(ex) {
		console.log("Error in GetPostType: " + ex);
		return "";
	}
}

router.post('/broadcast', async function (req, res) {
	var completed = {};
	const postId = req.body.id;
	console.log("ID " + postId);
	console.log("ID2 : " + req.body["id"]);
	const postType = await GetPostType(postId);
	console.log("broadcast/ : " + postId + " | Action : " + postType);
	
	switch(postType) {
		case 'Broadcast To My Fans':
			completed = await BroadcastMessage(postId);
			break;
		case 'Promote event':
			completed = await BroadcastEvent(postId);
			break;
		case 'Share New Song':
			completed = await BroadcastAudio(postId);
			break;
		case 'Follow/listen reminder':
			completed = await BroadcastSocial(postId);
			break;
		default:
			console.log("Error : action not found for post id : " + postId);
			completed = { completed: false, errorMessage: "Action not found" };
			break;
	}

	res.json(completed);
	res.end();
});

router.get('/webhook-facebook', (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "123456"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

module.exports = router;
