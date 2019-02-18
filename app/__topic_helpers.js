window.topicHelpers = (function(){

  function countTopicsQuery(channelId,userId,searchPhrase){
    let q = "SELECT count(*) FROM topic WHERE topic_id NOT NULL";
    if (channelId) q += " AND channel_id='"+channelId+"'";
    if (userId) q += " AND user_id='"+userId+"'";
    if (searchPhrase) q += " AND title LIKE '%"+searchPhrase+"%'";
    return q;
  }

  function getTopicSortOptions(sortBy){
    let sort_options = [{
      label:'new',
      value:'-added'
    },{
      label:'top',
      value:'v.diff desc, t.topic_id'
    }];
    if (!sortBy) {
      sort_options[0].current = true;
    }
    else {
      const sortByIndex = sort_options.findIndex((so) => so.label === sortBy);
      sort_options[sortByIndex].current = true;
    }
    return sort_options;
  }

  function defaultTopicQuery(sortBy){
    let q = "SELECT t.*, fti.*, f.*, c.name, u.user_id as userId";
    q += ", (SELECT count(*) FROM comment WHERE comment.topic_id=t.topic_id) as comments_total";
    q += ", (SELECT count(*) FROM moderation WHERE moderation.topic_id=t.topic_id AND moderation.item_type='comment' AND moderation.current=1 AND moderation.visible=0) as hidden_comments_total";
    q += ", (SELECT count(*) FROM topic_vote WHERE topic_vote.topic_id=t.topic_id AND topic_vote.vote=0) as down_votes"
    q += ", (SELECT count(*) FROM topic_vote WHERE topic_vote.topic_id=t.topic_id AND topic_vote.vote=1) as up_votes"
    q += " FROM topic t";
    q += " LEFT JOIN file_to_item AS fti ON fti.item_id=t.topic_id AND fti.item_type='topic'";
    q += " LEFT JOIN file AS f ON f.item_id=t.topic_id";
    q += " LEFT JOIN channel AS c ON c.channel_id=t.channel_id";
    q += " LEFT JOIN user AS u ON u.user_name=t.user_id";
    q += " LEFT JOIN moderation AS m ON m.topic_id=t.topic_id AND m.current=1"
    if (sortBy === 'v.diff desc, t.topic_id'){
      q += " JOIN ( SELECT topic_id, sum(case when vote = 1 then 1 else 0 end) - sum(case when vote = 0 then 1 else 0 end) diff FROM topic_vote GROUP BY topic_id ) v on t.topic_id = v.topic_id";
    }
    return q;
  }

  function getTopicsQuery(config,sortBy,channelId,userId,page,showHidden,searchPhrase){
    let q = this.defaultTopicQuery(sortBy);
    if (sortBy && sortBy.value === 'v.diff desc, t.topic_id'){
      q += " JOIN ( SELECT topic_id, sum(case when vote = 1 then 1 else 0 end) - sum(case when vote = 0 then 1 else 0 end) diff FROM topic_vote GROUP BY topic_id ) v on t.topic_id = v.topic_id";
    }
    q += " WHERE t.topic_id NOT NULL"
    if (!showHidden) q += " AND m.visible IS NOT 0";
    if (channelId) q += " AND t.channel_id='"+channelId+"'";
    if (userId) q += " AND t.user_id='"+userId+"'";
    /*if (user && view === 'user-admin') {
        q += " AND t.user_id='"+user.user_name+"'";
    }*/
    if (searchPhrase) q += " AND t.title LIKE '%"+searchPhrase+"%'";
    q += " GROUP BY t.topic_id";
    if (sortBy){
      if (sortBy.value === '-added'){ q += " ORDER BY -t.added";}
      else { q += " ORDER BY " + sortBy.value; }
    }
    q += " LIMIT 20";
    if (page) q += " OFFSET " + (config.listing.items_per_page * (page - 1));
    return q;
  }

  function getTopicQuery(topicId){
    let q = this.defaultTopicQuery();
    q += " WHERE t.topic_id='"+topicId+"'";
    return q;
  }

  return {
    countTopicsQuery,
    getTopicSortOptions,
    defaultTopicQuery,
    getTopicsQuery,
    getTopicQuery
  }

}());
