
function GetFacebookId(obj) {
	try {
		return obj.sender.id;
	} catch(e) {
		return obj.callback_query.sender.id;
	}
}

function GetTelegramId(obj) {
	try {
		return obj.message.chat.id;
	} catch(e) {
		return obj.callback_query.message.chat.id;
	}
}

function GetViberId(obj) {
	try {
		
	} catch(e) {
		
	}
}

module.exports = {
	
	GetUserId: function(obj, source) {
		var id;
		
		console.log(source);
		switch(source) {
			
			case 'facebook':
				id = GetFacebookId(obj);
				break;
			case 'telegram':
				id = GetTelegramId(obj);
				break;
			case 'viber':
				id = GetViberId(obj);
				break;
		}
		
		console.log(id);
		return id;
		
	}, 
	
	BuildString: function(input, ...args) {

		for(var i = 0; i < args.length; i++) {
			input = input.replace("{" + i + "}", args[i]);
		}
		
		return input;
		
	}
	
};
