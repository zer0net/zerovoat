app.factory('Notification', [
	function() {
		var Notification = {};
		
		// create topic vote notification
		Notification.createTopicVoteNotification = function(t_vote,topic){
			var notification ={
				user_id:t_vote.user_id,
				item_type:'vote',
				item_id:t_vote.vote_id,
				t_user_id:topic.user_id,
				t_item_type:'topic',
				t_item_id:topic.topic_id,
				topic_id:topic.topic_id,
				topic_title:topic.title,
			}

			if (t_vote.vote === 1){
				notification.item_type = 'up vote';
			} else if (t_vote.vote === 0){
				notification.item_type = 'down vote';
			}
			return notification;
		};

		Notification.createCommentVoteNotification = function(c_vote,comment,topic){
			var notification ={
				user_id:c_vote.user_id,
				item_type:'vote',
				item_id:c_vote.vote_id,
				t_user_id:comment.user_id,
				t_item_type:'comment',
				t_item_id:comment.comment_id,
				topic_id:topic.topic_id,
				topic_title:topic.title,
			}
			if (c_vote.vote === 1){
				notification.item_type = 'up vote';
			} else if (c_vote.vote === 0){
				notification.item_type = 'down vote';
			}
			return notification;
		};

		Notification.createCommentOnTopicNotification = function(comment,topic){
			var notification ={
				user_id:comment.user_id,
				item_type:'comment',
				item_id:comment.comment_id,
				t_user_id:topic.user_id,
				t_item_type:'topic',
				t_item_id:topic.topic_id,
				topic_id:topic.topic_id,
				topic_title:topic.title,
			}
			return notification;
		};

		Notification.createReplyOnCommentNotification = function(reply,comment,topic){
			var notification ={
				user_id:reply.user_id,
				item_type:'reply',
				item_id:reply.comment_id,
				t_user_id:comment.user_id,
				t_item_type:'comment',
				t_item_id:comment.comment_id,
				topic_id:topic.topic_id,
				topic_title:topic.title,
			}
			return notification;
		};

		Notification.generateUserNotificationsQuery = function(userId){
			var q = "SELECT * FROM notification n";
			q+= " LEFT JOIN notification_read nr ON n.notification_id=nr.notification_id ";
			q+= " WHERE t_user_id='"+userId+"'";
			q+= " AND n.notification_id NOT NULL";
			q+= " ORDER BY -n.added";
			var query = [q];
			return query;
		};

		Notification.renderUserNotifications = function(notifications){
			notifications.forEach(function(notification,index){
				notification.link = 'index.html?view:topic+topic_id='+notification.topic_id;
				if (notification.t_item_type !== 'topic' && notification.t_item_id){
					notification.link += '+comment='+notification.t_item_id;
				}
				notification.link += '+rn_id='+notification.notification_id;
			});
			return notifications;
		};

		Notification.onReadNotification = function(notifications,notification_id){
			var a = true;
			notifications.forEach(function(notification,index){
				if (notification.notification_id === notification_id){
					a = false;
				}
			});
			return a;
		};

		return Notification;
	}
]);