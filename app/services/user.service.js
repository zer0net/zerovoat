app.factory('User', [
	function() {
		
		var User = {};

		User.findUserContentJsonDirectory = function(jsons,userId){
			var path;
			jsons.forEach(function(json,index){
				if (json.directory.split('/')[3] === userId){
					path = json.directory;
				}
			});
			return path;
		}

		// generate user query
		User.generateUserQuery = function(userId){
			var q = "SELECT u.*";
			q+= ", (SELECT count(*) FROM channel WHERE channel.user_id=u.user_name) as channels_total";
			q+= ", (SELECT count(*) FROM topic WHERE topic.user_id=u.user_name) as topics_total";
			q+= ", (SELECT count(*) FROM comment WHERE comment.user_id=u.user_name) as comments_total";
			q += " FROM user u";
			q += " WHERE user_id='"+userId+"'";
			var query = [q];
			return query;
		};

		// generate random strings
		User.generateRandomString = function(numLength){
			function randomString(length, chars) {
			    var result = '';
			    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
			    return result;
			}
			var rString = randomString(numLength, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
			return rString;
		};

		// GRK
		User.grk = function(config){
			// var randomKey = config.versions.a + config.versions.b + config.versions.c + config.versions.d + config.versions.f;
			var randomKey = '5JweXMd84uqUXZmBb8v4YSPxPLD4HS98jQba1s3L2KQRYdA9jwB';
			return randomKey;
		};		

		return User;
	}
]);