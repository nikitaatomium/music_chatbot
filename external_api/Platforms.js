var http = require('http');
var fs = require('fs');
const { TelegramClient } = require('messaging-api-telegram');
const clientTelegram = TelegramClient.connect('put_telegram_api_key_here');

const { MessengerClient } = require('messaging-api-messenger');
const clientMessenger = MessengerClient.connect("put_messenger_api_key_here");
	
	
var self = module.exports = {
	
	SendToTelegram : function (message, id) {
		try {
			clientTelegram.sendMessage(id, message, {
				disable_web_page_preview: true,
				disable_notification: true,
			});
			console.log("Sent message to " + id);
		} catch(ex) {
			console.log("Error sending message to " + id + " : " + ex);
		}
	},

	SendToFacebook : async function (message, id) {
		try {
			clientMessenger.sendText(id, message).then(() => {
				console.log("Sent message to " + id);
			});
		} catch(ex) {
			console.log("Error sending message to " + id + " : " + ex);
		}
	},
	
	SendCarouselToFacebook : async function (message, elements, id) {
		try {
			var completed = false;
			var curr = 0;
			do {
				var buttons = [];
				for(var i = curr; i < curr + 3; i++) {
					if(i >= elements.length) {
						completed = true;
						break;
					}
					
					buttons.push(elements[i]);
				}
				
				if(buttons.length > 0) {
					await clientMessenger.sendButtonTemplate(
					  id, curr == 0? message : '...', buttons
					);
				}
				
				curr+=3;
			} while(!completed);
		} catch(ex) {
			console.log("Error sending message to " + id + " : " + ex);
		}
	},
	
	SendButtonsToTelegram : function (message, buttons, id) {
		try {
			var btns =  {
				"inline_keyboard": [
					
				]
			};
			
			for(var i = 0; i < buttons.length; i++) {
				var btnArray = new Array();
				btnArray.push(buttons[i]);
				
				btns.inline_keyboard.push(btnArray);
			}
			
			clientTelegram.sendMessage(id, message, {
				reply_markup: btns,
				disable_web_page_preview: true,
				disable_notification: true,
			});
			
			console.log("Sent message to " + id);
		} catch(ex) {
			console.log("Error sending message to " + id + " : " + ex);
		}
	},

	SendLinkAudioToTelegram : function (link, id) {
		try {
			clientTelegram.sendAudio(id, link, {
			  caption: 'Audio',
			  disable_notification: true,
			});
			console.log("Sent audio to " + id);
		} catch(ex) {
			console.log("Error sending audio to " + id + " : " + ex);
		}
	},

	SendAttachmentAudioToFacebook : async function (attachment, id) {
		try {
			clientMessenger.sendAudio(id, { attachment_id: attachment });
		} catch(ex) {
			console.log("Error sending audio to " + id + " : " + ex);
		}
	},
	
	SendLinkAudioToFacebook : async function (audioLink, id) {
		try {
			clientMessenger.sendAudio(id, audioLink);
			console.log("Sent audio to " + id);
		} catch(ex) {
			console.log("Error sending audio to " + id + " : " + ex);
		}
	},
	
	UploadAudioFacebook : async function (buffer) {
		try {
			return await clientMessenger.uploadAttachment('audio', buffer, {
			  is_reusable: true,
			  filename: 'New_Song.mp3',
			});
		} catch(ex) {
			console.log("Error uploading audio : " + ex);
		}
	},

	SendMessage: function(message, source, id) {
		switch(source) {
			case 'facebook':
				self.SendToFacebook(message, id);
				break;
			case 'telegram':
				self.SendToTelegram(message, id);
				break;
		}
	},
	
	SendCarousel: function(object, source, id) {
		switch(source) {
			case 'facebook':
				self.SendCarouselToFacebook(object.messageList[0], object.buttons, id);
				break;
			case 'telegram':
				self.SendButtonsToTelegram(object.messageList[0], object.inline_keyboard, id);
				break;
		}
	},

	SendMessages: function(messages, source, id) {
		for(let i = 0; i < messages.length; i++) {
			switch(source) {
				case 'facebook':
					self.SendToFacebook(messages[i], id);
					break;
				case 'telegram':
					self.SendToTelegram(messages[i], id);
					break;
			}
		}
	},
	
	SendAudio: function(audioLink, message, user) {
		switch(user.source) {
			case 'facebook':
				self.SendToFacebook(message, user.id);
				self.SendLinkAudioToFacebook(audioLink, user.id);
				break;
			case 'telegram':
				self.SendToTelegram(message, user.id);
				self.SendLinkAudioToTelegram(audioLink, user.id);
				break;
		}
	}
};