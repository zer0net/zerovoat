window.channelHelpers = (function(){

  function getChannelSortOptions(){
    let sort_options = [
      {
        label:'number of topics',
        value:'topics_count',
        dir:'DESC'
      },{
        label:'last activity',
        value:'last_topic_date',
        dir:'DESC'
      },{
        label:'A - Z',
        value:'name',
        dir:'DESC'
      },{
        label:'newest',
        value:'added',
        dir:'DESC'
      },{
        label:'oldest',
        value:'added',
        dir:'ASC'
      }
    ];
    sort_options[0].current = true;
    return sort_options;
  }

  function getLatestChannels(){
    let q = "SELECT * FROM channel AS c WHERE c.channel_id NOT NULL ORDER BY -c.added LIMIT 5";
    return q;
  }

  function getTopLinksMenu(){
    const links = [{
      title:'Test Channel',
      href:'index.html?v=channel+id=1R67TfYzNkCnh89EFfGmXn5LMb4hXaMRQ3'
    },{
      title:'Suggestions',
      href:'index.html?v=channel+id=1C1gnFcVv9J9kUjF4odDMRYcEWVPJbbqFp4'
    },{
      title:'中文频道',
      href:'index.html?v=channel+id=17vKbxL13KnzGATstqawXSG2oiQygmdkcX1'
    },{
      title:'Russian',
      href:'index.html?v=channel+id=1PniNzyi8fygvwyBaLpA9oBDVWZ5fXuJUw1'
    },{
      title:'Wallpapers',
      href:'index.html?v=channel+id=1DpPY5S6HpxsK6CQGWKZbKh9gVo1LnXze11'
    }];
    return links;
  }

  function getChannelsQuery(userId){
    let q = "SELECT c.*";
    q += ", (SELECT count(*) FROM topic WHERE topic.channel_id=c.channel_id) as topics_count";
    q += ", (SELECT max(added) FROM topic WHERE topic.channel_id=c.channel_id) as last_topic_date";
    q += " FROM channel c"
    q += " WHERE c.channel_id IS NOT NULL"
    if (userId) q += " AND c.user_id='"+userId+"'";
    return q;
  }

  function getChannelByIdQuery(channelId){
    let q = "SELECT c.*";
    q += ", (SELECT count(*) FROM topic WHERE topic.channel_id=c.channel_id) as topics_count";
    q += " FROM channel c";
    q += " WHERE c.channel_id='"+channelId+"'";
    return q;
  }

  function getChannelByTopicIdQuery(topicId){
    let q = "SELECT c.*, t.*";
    q += ", (SELECT count(*) FROM topic WHERE topic.channel_id=c.channel_id) as topics_count";
    q += " FROM channel c";
    q += " LEFT JOIN topic AS t ON t.channel_id=c.channel_id";
    q += " WHERE t.topic_id='"+topicId+"'";
    return q;
  }

  function sortChannels(channels,sortBy){
    let cArray = [].concat(store.getState().channels.items);
    if (sortBy.dir === 'DESC') cArray = cArray.sort((a,b) =>  b[sortBy.value] - a[sortBy.value]);
    else if (sortBy.dir === 'ASC') cArray = cArray.sort((a,b) => a[sortBy.value] - b[sortBy.value]);
    if (sortBy.label === 'A - Z') {
        cArray = cArray.sort(function(a, b) {
            const textA = a.name.toUpperCase();
            const textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
    }
    return cArray;
  }

  function getChannelEditTabs(){
    const tabs = [{
      label:'channel'
    },{
      label:'moderators'
    },{
      label:'layout'
    }];
    return tabs;
  }

  return {
    getChannelSortOptions,
    getLatestChannels,
    getTopLinksMenu,
    getChannelsQuery,
    getChannelByIdQuery,
    getChannelByTopicIdQuery,
    sortChannels,
    getChannelEditTabs
  }
}())
