app.factory('Item', ['File',
	function(File) {
		var Item = {};

		// determine item type id
		Item.determineItemTypeId = function(item){
	        var isComment = false;
	        var isTopic = false;
	        for (var i in item){
	          if (i === 'comment_id') isComment = true;
	          if (i === 'topic_id') isTopic = true;
	        }
	        if (isComment){
	          item.item_type = 'comment';
	          item.item_id = 'comment_id';
	        } else if (isTopic){
	          item.item_type = 'topic';
	          item.item_id = 'topic_id';
	        } else {
	          item.item_type = 'channel';
	          item.item_id = 'channel_id';
	        }
	        return item;
		};

		// generate topic list sorting
		Item.generateListSorting = function(url){
			var sort = {};
			// default sort options
			var sortVal = url.split('&')[0].split('sort=')[1];
			if (sortVal){
				sort.orderBy = sortVal
				if (sortVal === '-votes_sum'){
					sort.val = 'v.diff desc, t.topic_id';
				} else {
					sort.val = '-added';
				}
			} else {
				sort.val = '-added';
				sort.orderBy = '-added';
			}
			return sort;
		};

		// generate topic list paging
		Item.generateListPaging = function(url){
			var paging = {};
			// items per page
			paging.itemsPerPage = 20;
			// current page
			var currentPage = url.split('&')[0].split('page=')[1];				
			if (currentPage){ paging.currentPage = currentPage.split('+')[0]; } 
			else { paging.currentPage = 1; }			
			// next page
			paging.nextPage = parseInt(paging.currentPage) + 1;
			return paging;
		};

		// generate topic count query
		Item.generateTopicCountQuery = function(view,user,channel){
			var q = "SELECT count(*) FROM topic WHERE topic_id NOT NULL";
			if (view !== 'main'){
				if (channel) { 
					q += " AND channel_id='"+channel.channel_id+"'"; 
				}
				if (user) { 
					q += " AND user_id='"+user.user_id+"'"; 
				}
			}
			var query = [q];
			return query;
		};

		// genearte topic list query
		Item.generateTopicListQuery = function(paging,sort,view,user,channel){
			var q = "SELECT t.*, fti.*, c.name, u.user_id as userId";
			q += ", (SELECT count(*) FROM comment WHERE comment.topic_id=t.topic_id) as comments_total";
			q += ", (SELECT count(*) FROM moderation WHERE moderation.topic_id=t.topic_id AND moderation.item_type='comment' AND moderation.current=1 AND moderation.visible=0) as hidden_comments_total";
			q += " FROM topic t";
			q += " LEFT JOIN file_to_item AS fti ON fti.item_id=t.topic_id AND fti.item_type='topic'"
			q += " LEFT JOIN channel AS c ON c.channel_id=t.channel_id";
			q += " LEFT JOIN user AS u ON u.user_name=t.user_id"
			if (sort.val === 'v.diff desc, t.topic_id'){
				q += " JOIN ( SELECT topic_id, sum(case when vote = 1 then 1 else 0 end) - sum(case when vote = 0 then 1 else 0 end) diff FROM topic_vote GROUP BY topic_id ) v on t.topic_id = v.topic_id";
			}
			q += " WHERE t.topic_id NOT NULL"
			if (view !== 'main'){
				if (channel) { 
					q += " AND t.channel_id='"+channel.channel_id+"'"; 
				}
				if (user && view === 'user-admin') { 
					q += " AND t.user_id='"+user.user_name+"'"; 
				}
			}
			q += " GROUP BY t.topic_id"
			if (sort.val === '-added'){ q += " ORDER BY -t.added"; } 
			else { q += " ORDER BY " + sort.val; }
			q += " LIMIT " + paging.itemsPerPage;
			q += " OFFSET " + paging.itemsPerPage * (paging.currentPage - 1);
			var query = [q];
			return query;
		};

		// generate topic query
		Item.generateTopicQuery = function(absUrl){
			var topic_id = absUrl.split('?')[1].split('&')[0].split('topic_id=')[1];
			if (topic_id.indexOf('+') > -1){ topic_id = topic_id.split('+')[0]; }
			var q = "SELECT t.*, fti.*, c.name, u.user_id as userId";
			q += ", (SELECT count(*) FROM comment WHERE comment.topic_id=t.topic_id) as comments_total";
			q += ", (SELECT count(*) FROM moderation WHERE moderation.topic_id=t.topic_id AND moderation.item_type='comment' AND moderation.current=1 AND moderation.visible=0) as hidden_comments_total";
			q += " FROM topic t";
			q += " LEFT JOIN file_to_item AS fti ON fti.item_id=t.topic_id AND fti.item_type='topic'";
			q += " LEFT JOIN channel AS c ON c.channel_id=t.channel_id";
			q += " LEFT JOIN user AS u ON u.user_name=t.user_id";
			q += " WHERE t.topic_id='"+topic_id+"'";
			q += " GROUP BY t.topic_id"
			var query = [q];
			return query;
		};

		// render topic list
		Item.renderTopicList = function(topics,address,section,site_files,config,sites){
			topics.forEach(function(topic,index){
				console.log(topic);
				/*topic = File.getFileMediaType(topic,topic.file_type,address,section);
				if (topic.image || topic.image){
					topic.site_file = File.getSiteFileRecord(topic,topic.userId,site_files,config,sites);
				}*/
			});
			return topics;
		};

		// count topics with image
		Item.countTopicsWithImages = function(topics){
			var imgTotal = 0;
			topics.forEach(function(topic,index){
				if (topic.site_file){
					imgTotal += 1;
				}
			});
			return imgTotal;
		};

		return Item;
	}
]);