window.voteHelpers = (function(){

  function getTopicVotesQuery(topicId){
    let q = "SELECT * FROM topic_vote WHERE topic_vote.topic_id='"+topicId+"'";
    return q;
  }

  function getCommentVotesQuery(commentId){
    let q = "SELECT * FROM comment_vote WHERE comment_vote.comment_id='"+commentId+"'";
    return q;
  }

  function renderItemVotes(res,user){
    let votes = {
      up:res.filter((v) => v.vote === 1),
      down:res.filter((v) => v.vote === 0),
      user_vote:res.find((v) => v.user_id === user)
    }
    return votes;
  }

  function configVoteActionType(userVote,type){
    let vtype;
    if (type === 'UP'){
      if (userVote){
        if (userVote.vote === 1) vtype = 'DELETE';
        else if (userVote.vote === 0) vtype = 'CHANGE';
      } else {
        vtype = 'UP';
      }
    } else if (type === 'DOWN'){
      if (userVote){
        if (userVote.vote === 1) vtype = 'CHANGE';
        else if (userVote.vote === 0) vtype = 'DELETE';
      } else {
        vtype = 'DOWN';
      }
    }
    return vtype;
  }

  function renderDataJsonOnTopicVote(data,siteInfo,voteType,itemId,userVote,itemType){
    let voteIndex;
    if (userVote) voteIndex = data[itemType + '_vote'].findIndex((v) => v[itemType + '_vote_id'] === userVote[itemType + '_vote_id']);
    if (voteType === 'UP' || voteType === 'DOWN'){
      const vote = voteType === 'UP' ? 1 : 0;
      const item_vote = {
        user_id:siteInfo.cert_user_id,
        vote: vote,
        added: Date.now()
      }
      item_vote[itemType + '_vote_id'] = siteInfo.auth_address+"vt"+data['next_' + itemType + '_vote_id'];
      item_vote[itemType + '_id'] = itemId;
      data[itemType + '_vote'].push(item_vote);
      data['next_' + itemType + '_vote_id'] += 1;
    } else if (voteType === 'CHANGE') {
      data[itemType + '_vote'][voteIndex].vote = data[itemType + '_vote'][voteIndex].vote === 1 ? 0 : 1;
    } else if (voteType === 'DELETE') {
      data[itemType + '_vote'].splice(voteIndex,1);
    }
    return data;
  }

  function generateTopicVotesBar(topic){
    let votesBar = {}
    if (topic.votes){
      votesBar.total = topic.votes.up.length + topic.votes.down.length;
      votesBar.uvp = (topic.votes.up.length / votesBar.total) * 100;
      votesBar.dvp = (topic.votes.down.length / votesBar.total) * 100;
    } else {
      votesBar.total = topic.up_votes + topic.down_votes;
      votesBar.uvp = (topic.up_votes / votesBar.total) * 100;
      votesBar.dvp = (topic.down_votes / votesBar.total) * 100;
    }
    return votesBar;
  }

  return {
    getTopicVotesQuery,
    getCommentVotesQuery,
    renderItemVotes,
    configVoteActionType,
    renderDataJsonOnTopicVote,
    generateTopicVotesBar
  }
}());
