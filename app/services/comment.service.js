app.factory('Comment', ['File',
	function(File) {
		var Comment = {};

		Comment.generateTopicCommentsQuery = function(topicId){
			var q = "SELECT c.*, fti.* ";
			q+= " FROM comment c";
			q+= " LEFT JOIN file_to_item AS fti ON fti.item_id=c.comment_id AND fti.item_type='comment' ";	
			// q+= " LEFT JOIN user AS u ON u.user_name=c.user_id";
			q+= " WHERE c.topic_id='"+topicId+"'";
			q+= " AND c.comment_parent_id='0'";
			q+= " ORDER BY -c.added";
			var query = [q];
			return query;
		};

		// generate comments query
		Comment.generateUserCommentsQuery = function(userId){
			var q = "SELECT c.*, fti.* ";
			q+= ", (SELECT title FROM topic WHERE topic.topic_id=c.topic_id) as topic_title";
			q+= " FROM comment c";
			q+= " LEFT JOIN file_to_item AS fti ON fti.item_id=c.comment_id AND fti.item_type='comment' ";	
			// q+= " LEFT JOIN user AS u ON u.user_name=c.user_id";
			q+= " WHERE c.user_id='"+userId+"'";
			q+= " ORDER BY -c.added";
			var query = [q];
			return query;
		};

		// render comment
		Comment.renderComments = function(comments,address,section,site_files,config,sites){
			comments.forEach(function(comment,index){
				comment = File.getFileMediaType(comment,comment.file_type,address,section);
				if (comment.image || comment.video){
					comment.site_file = File.getSiteFileRecord(comment,comment.userId,site_files,config,sites);
				}
			});
			return comments;
		}

		// generate comment replys query
		Comment.genereateCommentReplysQuery = function(commentId){
			var q = "SELECT c.*, fti.*";
			q+= " FROM comment c";
			q+= " LEFT JOIN file_to_item AS fti ON fti.item_id=c.comment_id AND fti.item_type='comment' ";	
			// q+= " LEFT JOIN user AS u ON u.user_name=c.user_id"					
			q+= " WHERE c.comment_parent_id='"+commentId+"'";
			q+= " ORDER BY -c.added";
			var query = [q];
			return query;
		};

		return Comment;
	}
]);