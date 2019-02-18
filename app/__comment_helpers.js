window.commentHelpers = (function(){

  function getCommentsQuery(topicId,userId,sortBy){
    let q = "SELECT c.*, fti.*, f.*";
    q += ", (SELECT count(*) FROM comment_vote WHERE comment_vote.comment_id=c.comment_id AND comment_vote.vote=0) as down_votes"
    q += ", (SELECT count(*) FROM comment_vote WHERE comment_vote.comment_id=c.comment_id AND comment_vote.vote=1) as up_votes"
    q += " FROM comment c";
    q += " LEFT JOIN file_to_item AS fti ON fti.item_id=c.comment_id AND fti.item_type='comment' ";
    q += " LEFT JOIN file AS f ON f.item_id=c.comment_id";
    q += " WHERE c.comment_id IS NOT NULL"
    if (topicId) q += " AND c.topic_id='"+topicId+"'";
    if (userId) q += " AND c.user_id='"+userId+"'";
    if (sortBy) q += " ORDER BY "+sortBy;
    else q+= " ORDER BY -c.added";
    return q;
  }

  function getCommentSortOptions(){
    const sort_options = [
      {
        label:'new',
        value:'-c.added'
      },{
        label:'old',
        value:'c.added'
      },{
        label:'top',
        value:'-up_votes'
      },{
        label:'bottom',
        value:'-down_votes'
      }
    ];
    return sort_options;
  }

  return {
    getCommentsQuery,
    getCommentSortOptions
  }
}());
