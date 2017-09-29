app.factory('Follow', [
	function() {
		var Follow = {};

		Follow.generateFollowNewTopicsQuery = function(){
			var q = "SELECT title AS title, body, added AS date_added, 'topic' AS type,";
			q += " 'index.html?view:topic+topic_id=' || topic.topic_id AS url FROM topic LEFT JOIN json AS topic_creator_json ON (topic_creator_json.json_id = topic.json_id) WHERE parent_topic_uri IS NULL";
			return q;
		};

		Follow.generateFollowChannelQuery = function(channel){
			var q = "SELECT title AS title, body, added AS date_added, 'topic' AS type,";
			q += " 'index.html?view:topic+topic_id=' || topic.topic_id AS url FROM topic LEFT JOIN json AS topic_creator_json ON (topic_creator_json.json_id = topic.json_id)"
			q += " WHERE topic.channel_id='"+channel.channel_id+"'";
			return q;
		};

		Follow.generateFollowTopicCommentsQuery = function(topic){
			var q = "SELECT topic.title AS title, comment.body AS body, comment.added AS date_added, 'comment' AS type,";
			q += " 'index.html?view:topic+topic_id=' || topic.topic_id AS url";
			q += " FROM topic";
			q += " LEFT JOIN comment ON (comment.topic_id = topic.topic_id)";
			q += " WHERE topic.topic_id='"+topic.topic_id+"'";
			return q;
		};

		return Follow;
	}
]);