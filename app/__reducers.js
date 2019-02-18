const reducer = Redux.combineReducers({
  server_info:serverInfoReducer,
  site_info:siteInfoReducer,
  config:siteConfigReducer,
  local_storage:localStorageReducer,
  feed:feedReducer,
  route:routeReducer,
  topics:topicReducer,
  channels:channelReducer,
  comments:commentReducer,
  user:userReducer,
  userCreated:userCreatedReducer,
  search:searchReducer
});

function serverInfoReducer(state = {}, action){
  if (action.type === 'SERVER_INFO'){
    return action.server_info;
  } else {
    return state;
  }
}

function siteInfoReducer(state = {}, action){
  switch (action.type) {
    case 'SITE_INFO':{
      return action.site_info;
    }
    case 'LOADING_USER':{
      const s = Object.assign({}, state, {
        loading:action.value
      });
      return s;
    }
    case 'CHANGE_CERT':{
      const s = Object.assign({}, state, {
        auth_address:action.auth_address,
        cert_user_id:action.cert_user_id
      });
      return s;
    }
    default:{
      return state;
    }
  }
}

function siteConfigReducer(state = {}, action){
  if (action.type === 'SITE_CONFIG'){
    return action.config;
  } else {
    return state;
  }
}

function localStorageReducer(state = {},action){
  if (action.type === 'LOCAL_STORAGE'){
    let state = {};
    if (action.local_storage) state = action.local_storage;
    return state;
  } else if (action.type === 'ZV_CERT_CREATED'){
    const s = Object.assign({}, state, {});
    s['zv_cert_created'] = true;
    return s;
  } else {
    return state;
  }
}

function feedReducer(state = {}, action){
  if (action.type === 'SET_FEED_LIST_FOLLOW'){
    return action.feed;
  }
  return state;
}

function routeReducer(state = {}, action){
  if (action.type === 'SET_ROUTE'){
    return action.route;
  } else {
    return state;
  }
}

function findTopicIndex(items,action){
  return items.findIndex((t) => t.topic_id === action.topic_id);
}

function topicReducer(state = {}, action){
  switch (action.type) {
    case 'LOADING_TOPIC_LIST':{
      const s = Object.assign({},state, {
        loading:action.value
      })
      return s;
    }
    case 'TOPICS_COUNT':{
      const s = Object.assign({}, state, {
        count:action.count
      })
      return s;
    }
    case 'SET_TOPICS':{
      const s = Object.assign({}, state, {
        items:action.items
      })
      return s;
    }
    case 'SET_TOPIC':{
      const s = Object.assign({}, state, {
        topic:action.topic
      })
      return s;
    }
    case 'SET_SORT_OPTIONS':{
      const s = Object.assign({}, state, {
        sort_options:action.sort_options
      });
      return s;
    }
    case 'SORT_TOPICS':{
       const s = Object.assign({},state,{
         sort_by:action.label
       });
       return s;
    }
    case 'ASSIGN_TOPIC_VOTES':{
      const topicIndex = findTopicIndex(state.items,action);
      const oldTopic = state.items[topicIndex];
      const newTopic = Object.assign({}, oldTopic, {
        votes:action.votes
      });
      const newItems = [
        ...state.items.slice(0,topicIndex),
        newTopic,
        ...state.items.slice(topicIndex + 1, state.items.length)
      ]
      const s = Object.assign({}, state, {
        items:newItems
      })
      return s;
    }
    case 'LOADING_TOPIC_VOTES':{
      const topicIndex = findTopicIndex(state.items,action);
      const oldTopic = state.items[topicIndex];
      const newTopic = Object.assign({}, oldTopic, {
        loading_votes:action.value
      });
      const newItems = [
        ...state.items.slice(0,topicIndex),
        newTopic,
        ...state.items.slice(topicIndex + 1, state.items.length)
      ]
      const s = Object.assign({}, state, {
        items:newItems
      })
      return s;
    }
    case 'ASSIGN_CURRENT_TOPIC_VOTES':{
      const oldTopic = state.topic
      const newTopic = Object.assign({}, oldTopic, {
        votes:action.votes
      });
      const s = Object.assign({}, state, {
        topic:newTopic
      });
      return s;
    }
    case 'INCREMENT_TOPIC_COMMENT_COUNT':{
      const oldTopic = state.items[0];
      const topicCommentCount = oldTopic.comments_total += 1;
      const newTopic = Object.assign({},oldTopic,{
        comments_total:topicCommentCount
      });
      const newItems = [
        ...state.items.slice(0,0),
        newTopic,
        ...state.items.slice(0 + 1, state.items.length)
      ]
      const s = Object.assign({}, state, {
        items:newItems
      })
      return s;
    }
    case 'DECREMENT_TOPIC_COMMENT_COUNT':{
      const oldTopic = state.items[0];
      const topicCommentCount = oldTopic.comments_total -= 1;
      const newTopic = Object.assign({},oldTopic,{
        comments_total:topicCommentCount
      });
      const newItems = [
        ...state.items.slice(0,0),
        newTopic,
        ...state.items.slice(0 + 1, state.items.length)
      ]
      const s = Object.assign({}, state, {
        items:newItems
      })
      return s;
    }
    default:{
      return state;
    }
  }
}

function channelReducer(state = {}, action){
  switch (action.type) {
    case 'SET_CHANNEL':{
      const s = Object.assign({}, state, {
        channel:action.channel
      })
      return s;
    }
    case 'SET_CHANNELS':{
      const s = Object.assign({}, state, {
        items:action.channels
      });
      return s;
    }
    case 'SET_CHANNEL_SORT_OPTIONS':{
      const s = Object.assign({}, state, {
        sort_options:action.sort_options
      })
      return s;
    }
    case 'SORT_CHANNELS':{
      const s = Object.assign({}, state, {
        sort_by:action.sort_by
      });
      return s;
    }
    default:{
      return state;
    }
  }
}

function findCommentIndex(comments,action){
  return comments.findIndex((c) => c.comment_id === action.comment_id);
}

function commentReducer(state = {}, action){
  switch (action.type) {
    case 'LOADING_COMMENTS':{
      const s = Object.assign({},state,{
        loading:action.value
      });
      return s;
    }
    case 'SET_TOPIC_COMMENTS':{
      const s = Object.assign({},state,{
        items:action.comments
      })
      return s;
    }
    case 'ASSIGN_COMMENT_VOTES':{
      const commentIndex = findCommentIndex(state.items,action);
      const oldComment = state.items[commentIndex];
      const newComment = Object.assign({}, oldComment, {
        votes:action.votes
      });
      const items = [
        ...state.items.slice(0,commentIndex),
        newComment,
        ...state.items.slice(commentIndex + 1, state.items.length)
      ];
      const s = Object.assign({},state,{
        items:items
      });
      return s;
    }
    case 'LOADING_COMMENT_VOTES':{
      const commentIndex = findCommentIndex(state.items,action);
      const oldComment = state.items[commentIndex];
      const newComment = Object.assign({}, oldComment, {
        loading_votes:action.value
      });
      const items = [
        ...state.items.slice(0,commentIndex),
        newComment,
        ...state.items.slice(commentIndex + 1, state.items.length)
      ];
      const s = Object.assign({},state,{
        items:items
      });
      return s;
    }
    case 'ADD_COMMENT':{
      const items = [
        ...state.items,
        action.comment
      ];
      const s = Object.assign({},state,{
        items:items
      })
      return s;
    }
    case 'UPDATE_COMMENT':{
      const commentIndex = findCommentIndex(state.items,action);
      const oldComment = state.items[commentIndex];
      const newComment = Object.assign({}, oldComment, {
        body:action.body
      });
      const items = [
        ...state.items.slice(0,commentIndex),
        newComment,
        ...state.items.slice(commentIndex + 1, state.items.length)
      ];
      const s = Object.assign({},state,{
        items:items
      });
      return s;
    }
    case 'SET_COMMENT_SORT_OPTIONS':{
      const s = Object.assign({}, state, {
        sort_options:action.sort_options
      });
      return s;
    }
    case 'SORT_COMMENTS':{
      const s = Object.assign({}, state, {
        sort_by:action.sort_by
      });
      return s;
    }
    default:{
      return state;
    }
  }
}

function userReducer(state = {},action){
  switch (action.type) {
    case 'SET_USER':{
      return action.user;
    }
    case 'REMOVE_USER':{
      const s = {};
      return s;
    }
    default:{
      return state;
    }
  }
}

function userCreatedReducer(state = {},action){
  switch (action.type) {
    case 'USER_CREATED':{
      return true;
    }
    default:{
      return false;
    }
  }
}

function searchReducer (state = {}, action){
  switch (action.type) {
    case 'SET_SEARCH_PHRASE':{
      return action.search_phrase;
    }
    default:{
      return false;
    }
  }
}

function setServerInfo(server_info){
  return {
    type:'SERVER_INFO',
    server_info:server_info
  }
}

function setSiteInfo(site_info){
  return {
    type:'SITE_INFO',
    site_info:site_info
  }
}

function setSiteConfig(config){
  return {
    type:'SITE_CONFIG',
    config:config
  }
}

function setLocalStorage(local_storage){
  return {
    type:'LOCAL_STORAGE',
    local_storage:local_storage
  }
}

function setFeedListFollow(feed){
  return {
    type:'SET_FEED_LIST_FOLLOW',
    feed:feed
  }
}

function zvCertCreated(value){
  return {
    type:'ZV_CERT_CREATED',
    value:value
  }
}

function setAppRoute(route){
  return {
    type:'SET_ROUTE',
    route:route
  }
}

function loadingUser(value){
  return {
    type:'LOADING_USER',
    value:value
  }
}

function loadingTopicList(value){
  return {
    type:'LOADING_TOPIC_LIST',
    value:value
  }
}

function setTopicsCount(count){
  return {
    type:'TOPICS_COUNT',
    count:count
  }
}

function setTopics(items){
  return {
    type:'SET_TOPICS',
    items:items
  }
}

function assignTopicVotes(votes,topicId){
  return {
    type:'ASSIGN_TOPIC_VOTES',
    votes:votes,
    topic_id:topicId
  }
}

function loadingTopicVotes(topicId,value){
  return {
    type:'LOADING_TOPIC_VOTES',
    topic_id:topicId,
    value:value
  }
}

function assignCurrentTopicVotes(votes,topicId){
  return {
    type:'ASSIGN_CURRENT_TOPIC_VOTES',
    votes:votes
  }
}

function incrementTopicCommentCount(){
  return {
    type:'INCREMENT_TOPIC_COMMENT_COUNT'
  }
}

function decrementTopicCommentCount(){
  return {
    type:'DECREMENT_TOPIC_COMMENT_COUNT'
  }
}

function setSortOptions(sort_options){
  return {
    type:'SET_SORT_OPTIONS',
    sort_options:sort_options
  }
}

function sortTopics(label){
  return {
    type:'SORT_TOPICS',
    label:label
  }
}

function setChannel(channel){
  return {
    type:'SET_CHANNEL',
    channel:channel
  }
}

function setTopic(topic){
  return {
    type:'SET_TOPIC',
    topic:topic
  }
}

function loadingComments(value){
  return {
    type:'LOADING_COMMENTS',
    value:value
  }
}

function setComments(comments){
  return {
    type:'SET_TOPIC_COMMENTS',
    comments:comments
  }
}

function assignCommentVotes(votes,commentId){
  return {
    type:'ASSIGN_COMMENT_VOTES',
    votes:votes,
    comment_id:commentId
  }
}

function loadingCommentVotes(commentId,value){
  return {
    type:'LOADING_COMMENT_VOTES',
    comment_id:commentId,
    value:value
  }
}

function addComment(comment){
  return {
    type:'ADD_COMMENT',
    comment:comment
  }
}

function updateComment(comment){
  return {
    type:'UPDATE_COMMENT',
    comment:comment
  }
}

function setCommentSortOptions(sortOptions){
  return {
    type:'SET_COMMENT_SORT_OPTIONS',
    sort_options:sortOptions
  }
}

function sortComments(value){
  return {
    type:'SORT_COMMENTS',
    sort_by:value
  }
}

function setUser(user){
  return {
    type:'SET_USER',
    user:user
  }
}

function removeUser(){
  return {
    type:'REMOVE_USER'
  }
}

function userCreated(){
  return {
    type:'USER_CREATED'
  }
}


function changeCert(authAddress,certUserId){
  return {
    type:'CHANGE_CERT',
    auth_address:authAddress,
    cert_user_id:certUserId
  }
}

function setChannels(channels){
  return {
    type:'SET_CHANNELS',
    channels:channels
  }
}

function setChannelSortOptions(sortOptions){
  return {
    type:'SET_CHANNEL_SORT_OPTIONS',
    sort_options:sortOptions
  }
}

function sortChannels(sortBy){
  return {
    type:'SORT_CHANNELS',
    sort_by:sortBy
  }
}

function setSearchPhrase(searchPhrase){
  return {
    type:'SET_SEARCH_PHRASE',
    search_phrase:searchPhrase
  }
}
