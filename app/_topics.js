class TopicsContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  componentDidMount() {
    this.props.countTopics();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.topics && this.props.topics.sort_by !== nextProps.topics.sort_by){
      this.props.countTopics(nextProps.topics.sort_by);
    } else if (!this.props.topics.sort_options){
      if (nextProps.topics.sort_options){
        this.props.countTopics();
      }
    } else {
      const route = store.getState().route;
      if (route.view === 'user-admin'){
        if (this.props.user.user_name && this.props.user.user_name !== nextProps.user.user_name){
          this.props.countTopics();
        }
      }
    }
    if (nextProps.search && nextProps.search !== this.props.search){
      this.props.countTopics(this.props.topics.sort_by,nextProps.search);
    }
  }

  render(){
    let topicContainerDisplay;
    if (this.props.topics.loading !== false) {
      topicContainerDisplay = <DummyTopicList />
    } else {
      topicContainerDisplay = (
        <div id="topics-wrapper">
          <TopicList
            onDeleteTopic={this.props.countTopics}
          />
          <TopicListNavigation/>
        </div>
      )
    }

    return (
      <div id="topics-container">
        {topicContainerDisplay}
      </div>
    )
  }
}

const mapStateToTopicsContainerProps = (state) => {
  const topics = state.topics;
  const user = state.user;
  const search = state.search;
  return {
    topics:topics,
    user:user,
    search:search
  }
};

const mapDispatchToTopicsContainerProps = (dispatch) => {
  return {
    dispatch
  }
}

const mergeTopicsContainerProps = (stateProps, dispatchProps) => {
  function countTopics(sortBy,searchPhrase){
    store.dispatch(loadingTopicList(true));
    if (store.getState().topics.sort_options){

      const route = store.getState().route;

      let channelId;
      if (route.view === 'channel') channelId = route.id;
      let userId;
      if (route.view === 'user-admin') userId = store.getState().site_info.cert_user_id;

      if (!searchPhrase){
        if (route.view === 'search'){
          searchPhrase = route.id;
        }
      }

      const query = topicHelpers.countTopicsQuery(channelId,userId,searchPhrase);

      Page.cmd('dbQuery',[query],function(res){
        const count = res[0]["count(*)"];
        store.dispatch(setTopicsCount(count));
        getTopics(sortBy,searchPhrase);
      });
    }
  };

  function getTopics(sortBy,searchPhrase){

    const config = store.getState().config;
    const route = store.getState().route;
    let channelId, userId, showHidden = false;

    if (route.view === 'channel' || route.view === 'user-admin' && route.section === 'edit-channel') {
      channelId = route.id;
    }

    if (route.view === 'user-admin' && route.section === 'topics') {
      userId = store.getState().site_info.cert_user_id;
    }

    if (route.view === 'user-admin') showHidden = true;

    let sort_by;
    if (!sortBy){
      sort_by = store.getState().topics.sort_options.find((so) => so.current === true);
    } else {
      sort_by = store.getState().topics.sort_options.find((so) => so.label === sortBy);
    }

    const query = topicHelpers.getTopicsQuery(config,sort_by,channelId,userId,route.page,showHidden,searchPhrase);
    Page.cmd('dbQuery',[query],function(res){
      store.dispatch(setTopics(res));
      store.dispatch(loadingTopicList(false));
    }.bind(this));
  }

  return {
    ...stateProps,
    ...dispatchProps,
    countTopics,
    getTopics
  }
}

const TopicsWrapper = ReactRedux.connect(
  mapStateToTopicsContainerProps,
  mapDispatchToTopicsContainerProps,
  mergeTopicsContainerProps
)(TopicsContainer)

const TopicList = (props) => {
  let topicsDisplay;
  if (store.getState().topics.items.length > 0){
    topicsDisplay = store.getState().topics.items.map((t,index) => (
      <TopicListItem
        key={index}
        topic={t}
        onDeleteTopic={props.onDeleteTopic}
      />
    ));
  } else {
    topicsDisplay = (
      <div className="ui segment lightgray">
        no topics yet, <a href={"index.html?v=user-admin+s=new-topic+id="+store.getState().route.id}>create a new topic!</a>
      </div>
    )
  }
  return (
    <div id="topic-list-display" className="ui list">
      {topicsDisplay}
    </div>
  )
};

class TopicListItem extends React.Component {
  constructor(props){
  	super(props);
    const topicId = store.getState().route.id;
    let followed = false
    if (store.getState().feed[topicId + " topic"]) followed = true;
  	this.state = {
      followed:followed
    };
    this.followTopic = this.followTopic.bind(this);
    this.unfollowTopic = this.unfollowTopic.bind(this);
    this.showTopicBody = this.showTopicBody.bind(this);
    this.hideTopicBody = this.hideTopicBody.bind(this);
  }

  followTopic(){
    let params;
    const topic = store.getState().topics.items[0];
    const query = followHelpers.generateFollowChannelQuery(topic);
    const feed = [query,params];
    const feedFollow = Object.assign({},store.getState().feed,{});
    feedFollow[topic.topic_id + " topic"] = feed;
    Page.cmd("feedFollow",[feedFollow]);
    Page.cmd('feedListFollow', [], function(feed){
      store.dispatch(setFeedListFollow(feed));
      this.setState({followed:true});
    }.bind(this));
  }

  unfollowTopic(){
    const feedFollow = Object.assign({},store.getState().feed,{});
    const topicId = store.getState().route.id
    delete feedFollow[topicId + " topic"];
    Page.cmd("feedFollow",[feedFollow]);
    Page.cmd('feedListFollow', [], function(feed){
      store.dispatch(setFeedListFollow(feed));
      this.setState({followed:false});
    }.bind(this));
  }

  showTopicBody(){
    this.setState({show_body:true});
  }

  hideTopicBody(){
    this.setState({show_body:false});
  }

  render(){
    const t = this.props.topic;
    if (t.added < 1481025974864) t.added = 1481025974864;
    const route = store.getState().route;
    let upDownVotesTotal;
    if (t.votes){
      upDownVotesTotal = (
        <span>(<span className="up-votes">+{t.votes.up.length}</span>|<span className="down-votes">-{t.votes.down.length}</span>)</span>
      )
    }

    let topicBodyDisplay,
        topicBodyContentToggleBtn;
    if (route.view !== 'topic'){
      if (t.body || t.file_id || t.file_to_item_id || t.embed_url || t.added <= 1498441955800){
        if (!this.state.show_body){
          topicBodyContentToggleBtn = <span><a onClick={this.showTopicBody}><i className="icon add square"></i></a></span>
        } else {
          topicBodyContentToggleBtn = <span><a onClick={this.hideTopicBody}><i className="icon minus square"></i></a></span>
          let topicBody;
          if (t.body){
            topicBody = (
              <div className="topic-view-body">
                <ItemHtmlBodyRender content={t.body}/>
              </div>
            )
          }
          let topicBodyMediaDisplay;
          if (t.file_id || t.file_to_item_id || t.embed_url || t.added <= 1498441955800){
            topicBodyMediaDisplay = (
              <div className="topic-view-media">
                <ItemMediaContainer
                  topic={t}
                />
              </div>
            )
          }
          topicBodyDisplay = (
            <div className="topic-list-item-body-container ui segment">
              {topicBodyMediaDisplay}
              {topicBody}
            </div>
          )
        }
      }
    }

    let topicEditToolbar;
    if (t.user_id === store.getState().site_info.cert_user_id){
      topicEditToolbar = (
        <ItemEditToolBar
          topic={t}
          onDeleteTopic={this.props.onDeleteTopic}
        />
      );
    }

    let topicFollowDisplay;
    if (route.view === 'topic'){
      let topicFollowBtn;
      if (!this.state.followed){
        topicFollowBtn = (
          <a onClick={this.followTopic}>
            <i className="icon feed"></i><span>follow</span>
          </a>
        )
      } else {
        topicFollowBtn = (
          <a onClick={this.unfollowTopic}>
            <i className="icon feed"></i><span>unfollow</span>
          </a>
        )
      }
      topicFollowDisplay = (
        <div id="topic-follow-container" className="ui compact segment">
          {topicFollowBtn}
        </div>
      )
    }

    let topicListItemImageDisplay,
        topicListItemBodyCssClass = "";
    if (t.file_id || t.file_to_item_id || t.embed_url || t.added <= 1498441955800){
      topicListItemImageDisplay = (
        <TopicListItemImageContainer
          topic={t}
        />
      );
      topicListItemBodyCssClass += " w-file";
    }

    let topicUserName = t.user_id;
    if (t.screen_name) topicUserName = t.screen_name;

    return (
      <div className="item ui segment topic-item">
        <TopicVotesWrapper
          topic={t}
        />
        <div className={"topic-item-body " + topicListItemBodyCssClass}>
          {topicListItemImageDisplay}
          <div className="topic-item-content">
            <div className="topic-item-header">
              <h3><a href={"index.html?v=topic+id="+t.topic_id}>{t.title}</a></h3>
              {topicEditToolbar}
              {topicFollowDisplay}
            </div>
            <div className="topic-item-info">
              {topicBodyContentToggleBtn}
              <span> submitted {appHelpers.getTimeAgo(t.added)} </span>
              <span> by <a>{topicUserName}</a> </span>
              <span> to <b><a href={"index.html?v=channel+id="+t.channel_id}>{t.name}</a></b></span>
              {upDownVotesTotal}
            </div>
            <div className="topic-item-comment-counter">
              <b><a href={"index.html?v=topic+id="+t.topic_id}>{t.comments_total - t.hidden_comments_total} comments</a></b>
            </div>
          </div>
          {topicBodyDisplay}
        </div>
      </div>
    )
  }
}

const DummyTopicList = (props) => (
  <div className="ui list">
    <div className="ui active inverted dimmer">
      <div className="ui active loader"></div>
    </div>
    <DummyTopic/><DummyTopic/><DummyTopic/><DummyTopic/><DummyTopic/><DummyTopic/>
    <DummyTopic/><DummyTopic/><DummyTopic/><DummyTopic/><DummyTopic/><DummyTopic/>
  </div>
)

const DummyTopic = (props) => (
  <div className="dummy-topic-item topic-item segment ui item">
    <div className="dummy-topic-votes">
      <div className="dummy-topic-votebar">
        <div className="votes-display">
          <a className="arrow up"></a>
          <span className="blured">#</span>
          <a className="arrow down"></a>
        </div>
      </div>
    </div>
    <div className="dummy-topic-body">
      <div className="dummy-topic-image"></div>
      <div className="dummy-topic-content">
        <div className="dummy-topic-header blured"><h3><a>Topic Item Title</a></h3></div>
        <div className="dummy-topic-line blured">
          submitted some time ago by <a>user@zv.anonymous</a> to <a>some zerovoat channel</a>
        </div>
        <div className="dummy-topic-line blured">
          <i className="icon comments"></i> # comments
        </div>
      </div>
    </div>
  </div>
);

class TopicVotesContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  componentDidMount() {
    this.props.getTopicVotes();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.site_info.cert_user_id !== this.props.site_info.cert_user_id){
      this.props.getTopicVotes();
    }
  }

  render(){

    let topicVotesDisplay,
        topicVotesCounter,
        topicVotesBar,
        topicVotesDisplayCssClass = "votes-display ui active inverted dimmer";
    if (this.props.topic.loading_votes === true){
      topicVotesDisplay = (
        <div className={topicVotesDisplayCssClass}>
          <div className="ui mini loader"></div>
        </div>
      );
    } else {
      const topicVotesPercentage = voteHelpers.generateTopicVotesBar(this.props.topic);
      topicVotesBar = (
        <div className="topic-votes-bar">
          <div className="topic-votes-up" style={{height:topicVotesPercentage.uvp+"%"}}></div>
          <div className="topic-votes-down" style={{height:topicVotesPercentage.dvp+"%"}}></div>
        </div>
      );

      if (this.props.topic.votes){
        topicVotesCounter = this.props.topic.votes.up.length - this.props.topic.votes.down.length;
        if (this.props.topic.votes.user_vote){
          if (this.props.topic.votes.user_vote.vote === 0) topicVotesDisplayCssClass += " down-voted";
          else if (this.props.topic.votes.user_vote.vote === 1) topicVotesDisplayCssClass += " up-voted";
        }
      } else {
        topicVotesCounter = this.props.topic.up_votes - this.props.topic.down_votes;
      }
      topicVotesDisplay = (
        <div className={topicVotesDisplayCssClass}>
          <a className="arrow up" onClick={this.props.onUpVoteClick}></a>
          <span>{topicVotesCounter}</span>
          <a className="arrow down" onClick={this.props.onDownVoteClick}></a>
        </div>
      );
    }

    return (
      <div className="topic-item-votes">
        {topicVotesDisplay}
        {topicVotesBar}
      </div>
    )
  }
}

const mapStateToTopicVotesContainerProps = (state,props) => {
  const site_info = state.site_info;
  const topic = state.topics.items.find((t) => t.topic_id === props.topic.topic_id);
  return {
    site_info,
    topic
  }
}

const mapDispatchToTopicVotesContainerProps = (dispatch) => {
  return {
    dispatch
  }
}

const mergeTopicVotesContainerProps = (stateProps, dispatch) => {

  function getTopicVotes(){
    const query = voteHelpers.getTopicVotesQuery(stateProps.topic.topic_id);
    Page.cmd('dbQuery',[query],function(res){
      const state = store.getState();
      const user = state.site_info.cert_user_id;
      const votes = voteHelpers.renderItemVotes(res,user);
      const route = state.route;
      store.dispatch(assignTopicVotes(votes,stateProps.topic.topic_id));
    });
  }

  function onUpVoteClick(){
    if (stateProps.site_info.cert_user_id){
      const voteType = voteHelpers.configVoteActionType(stateProps.topic.votes.user_vote,'UP');
      onVoteTopic(voteType);
    } else {
      Page.cmd("wrapperNotification", ["info", "Login to participate", 4000]);
    }
  }

  function onDownVoteClick(){
    if (stateProps.site_info.cert_user_id){
      const voteType = voteHelpers.configVoteActionType(stateProps.topic.votes.user_vote,'DOWN');
      onVoteTopic(voteType);
    } else {
      Page.cmd("wrapperNotification", ["info", "Login to participate", 4000]);
    }
  }

  function onVoteTopic(voteType){
    store.dispatch(loadingTopicVotes(stateProps.topic.topic_id,true));
    const config = store.getState().config;
    if (voteType === 'CHANGE' || voteType === 'DELETE' ) {
      const query = "SELECT * FROM json WHERE json_id='" + stateProps.topic.votes.user_vote.json_id + "'";
      Page.cmd('dbQuery',[query],function(res){
        const inner_path = "merged-"+config.merger_name+"/"+res[0].directory+"/"+res[0].file_name;
        voteTopic(voteType,inner_path);
      }.bind(this));
    } else {
      const auth_address = stateProps.site_info.auth_address;
      const inner_path = "merged-"+config.merger_name+"/"+config.cluster+"/data/users/"+auth_address+"/data.json";
      voteTopic(voteType,inner_path);
    }
  }

  function voteTopic(voteType,inner_path){
    Page.cmd('fileGet',{inner_path:inner_path},function(data){
      data = JSON.parse(data);
      if (data){
        if (!data.topic_vote){
          data.topic_vote = [];
          data.next_topic_vote_id = 1;
        }
      } else {
        data = {
          "topic_vote":[],
          "next_topic_vote_id":1
        }
      }
      data = voteHelpers.renderDataJsonOnTopicVote(data,stateProps.site_info,voteType,stateProps.topic.topic_id,stateProps.topic.votes.user_vote,'topic');
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          Page.cmd("wrapperNotification", ["done", "Topic Voted!", 4000]);
          store.dispatch(loadingTopicVotes(stateProps.topic.topic_id,false));
          getTopicVotes();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  return {
    ...stateProps,
    ...dispatch,
    getTopicVotes,
    onUpVoteClick,
    onDownVoteClick,
    onVoteTopic,
    voteTopic
  }
}

const TopicVotesWrapper = ReactRedux.connect(
  mapStateToTopicVotesContainerProps,
  mapDispatchToTopicVotesContainerProps,
  mergeTopicVotesContainerProps
)(TopicVotesContainer);

class TopicListItemImageContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      file:false,
      loading:true
    };
    this.onGetFile = this.onGetFile.bind(this);
    this.getFile = this.getFile.bind(this);
    this.onImageLoading = this.onImageLoading.bind(this);
    this.onImageLoadError = this.onImageLoadError.bind(this);
  }

  componentDidMount() {
    if (this.props.topic.file_to_item_id){
      this.onGetFile();
    } else {
      this.getFile();
    }
  }

  onGetFile(){
    this.setState({file:true},function(){
      const query = fileHelpers.getFileToItemQuery(this.props.topic.file_to_item_id);
      Page.cmd('dbQuery',[query],function(res){
        this.getFile(res[0].file_id);
      }.bind(this));
    });
  }

  getFile(fileId){
    let query;
    if (!fileId) {
      query = "SELECT * FROM file WHERE item_id='"+this.props.topic.topic_id+"'";
    } else {
      query = fileHelpers.getFileQuery(fileId);
    }
    Page.cmd('dbQuery',[query],function(res){
      if (res && res.length > 0){
        const file = res[0];
        const mediaType = fileHelpers.determineFileMediaType(file.file_type);
        let loading = true;
        if (mediaType === 'image') loading = false;
        let directory = file.directory;
        if (!file.directory) directory = store.getState().config.cluster + "/data/users/"+file.user_id;
        this.setState({
          file_path:"merged-"+store.getState().config.merger_name+"/"+directory+"/"+file.file_name,
          file:true,
          media_type:mediaType,
          loading:loading
        });
      }
    }.bind(this));
  }

  onImageLoading(){
    this.setState({loading:false})
  }

  onImageLoadError(){
    this.setState({error:true,loading:false})
  }

  render(){

    let imageDisplay,
        imageContainerCssClass = "topic-item-image-container ui segment";

    if (this.state.file){
      if (this.state.media_type === 'image'){
        imageContainerCssClass += " image-file";
        imageDisplay = (
          <img
            onLoad={this.onImageLoading}
            onError={this.onImageLoadError}
            src={this.state.file_path}
          />
        );
      } else if (this.state.media_type === 'video'){
        imageContainerCssClass += " video-file";
        imageDisplay = (<i className="file video outline icon big"></i>);
      } else if (this.state.media_type === 'audio'){
        imageContainerCssClass += " audio-file";
        imageDisplay = (<i className="file audio outline icon big"></i>);
      }
      if (this.state.error === true){
        imageDisplay = (<img src="assets/img/404-not-found.png"/>);
      }
    } else {
      if (this.props.topic.embed_url){
        imageContainerCssClass += " embeded-file";
        const embedUrl = this.props.topic.embed_url;
        const lastDot = embedUrl.lastIndexOf('.');
        const fileType = embedUrl.substring(lastDot + 1);
        const mediaType = fileHelpers.determineFileMediaType(fileType);
        if (mediaType === 'video'){
          imageContainerCssClass += " video-file";
          imageDisplay = (<i className="file video outline icon big"></i>);
        } else if (mediaType === 'audio'){
          imageDisplay = (<i className="file audio outline icon big"></i>);
        } else if (mediaType === 'image') {
          imageDisplay = (
            /*<img
              onLoad={this.onImageLoading}
              onError={this.onImageLoadError}
              src={embedUrl}
            />*/
            <span style={{"fontSize":"10px"}}>external</span>
          );
        } else if (!mediaType){
          imageDisplay = (<img src="assets/img/404-not-found.png"/>);
        }
      } else {
        imageContainerCssClass += " no-file"
      }
    }

    if (this.state.loading && this.state.file){
      imageContainerCssClass += " image-loading";
    }

    return (
      <div className={imageContainerCssClass}>
        <a href={"index.html?v=topic+id="+this.props.topic.topic_id}>
          {imageDisplay}
        </a>
      </div>
    )
  }
}

const TopicListNavigation = (props) => {

  const route = store.getState().route;
  const sortBy = store.getState().topics.sort_by;
  const urlPrefix = appHelpers.generateUrlPrefix(route,sortBy);

  let prevButtonHref, nextButtonHref;
  if (route.page && route.page !== 1) prevButtonHref = (
    <li className="native-btn">
    <a href={urlPrefix + (route.page - 1) }>
     {"<"} Newer
     </a>
     </li>
  );

  let pageNum;
  if (route.page) pageNum = route.page;
  else pageNum = 1;

  if (store.getState().topics.count > store.getState().config.listing.items_per_page * pageNum){
    let nextPageNumber;
    if (route.page) nextPageNumber = route.page + 1;
    else nextPageNumber = 2;
    nextButtonHref = (<li className="native-btn"><a href={urlPrefix + nextPageNumber}>Older {">"}</a></li>);
  }

  const topicListNavigationDisplay = <ul>{prevButtonHref}{nextButtonHref}</ul>;

  return (
    <div id="topic-list-navigation">
      {topicListNavigationDisplay}
    </div>
  )
}

class TopicView extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.getTopic = this.getTopic.bind(this);
  }

  componentDidMount() {
    this.getTopic();
  }

  getTopic(){
    const route = store.getState().route;
    const query = topicHelpers.getTopicQuery(route.id);
    Page.cmd('dbQuery',[query],function(res){
      store.dispatch(setTopics(res));
      this.setState({loading:false});
    }.bind(this));
  }

  render(){

    if (this.state.loading){
      return (
        <DummyTopicView/>
      )
    } else {

      const route = store.getState().route;
      const topic = store.getState().topics.items.find((t) => t.topic_id === route.id);
      if (!topic){
        return (
          <div className="view-container" id="topic-view">
            <div className="ui segment lightgray">
              <p>topic not found...</p>
            </div>
          </div>
        );
      } else {
        let topicBodyContent;
        if (topic.body){
          topicBodyContent = (
            <div className="topic-view-body">
              <ItemHtmlBodyRender content={topic.body}/>
            </div>
          );
        }
        let topicMediaContainer;
        if (topic.file_to_item_id || topic.file_id || topic.embed_url || topic.added <= 1498441955800){
          topicMediaContainer = (
            <div className="topic-view-media">
              <ItemMediaContainer
                topic={topic}
              />
            </div>
          );
        }

        let topicContentDisplay;
        if (topic.body || topic.file_id || topic.file_name || topic.embed_url){
          topicContentDisplay = (
            <div className="ui segment lightgray topic-content-display">
              {topicMediaContainer}
              {topicBodyContent}
            </div>
          );
        }

        return (
          <div className="view-container" id="topic-view">
            <div className="topic-view-header">
              <TopicListItem
                topic={topic}
              />
            </div>
            {topicContentDisplay}
            <CommentsWrapper topic={topic} />
          </div>
        );
      }
    }
  }
}

const DummyTopicView = (props) => (
  <div className="view-container" id="topic-view">
    <div className="ui active inverted dimmer">
      <div className="ui text loader">Loading Topic</div>
    </div>
    <div className="topic-view-header">
      <DummyTopic />
    </div>
    <div className="topic-view-body ui segment">
      <article className="ui segment blured">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
      </article>
    </div>
  </div>
)

class TopicForm extends React.Component {

  constructor(props){
  	super(props);

    let title = '', body = '', embed_url = '', channel_id = '';

    if (this.props.topic){
      title = this.props.topic.title;
      body = this.props.topic.body;
      embed_url = this.props.topic.embed_url;
      channel_id = this.props.topic.channel_id;
    } else {
      channel_id = store.getState().route.id
    }

    this.state = {
      title:title,
      body:body,
      embed_url:embed_url,
      channel_id:channel_id,
      errors:[],
      showEditor:true
    };

    this.onTopicTitleChange = this.onTopicTitleChange.bind(this);
    this.onTopicTitleBlur = this.onTopicTitleBlur.bind(this);
    this.onTopicChannelSelect = this.onTopicChannelSelect.bind(this);
    this.onTopicDescriptionChange = this.onTopicDescriptionChange.bind(this);
    this.toggleEditor = this.toggleEditor.bind(this);
    this.onTopicEmbedUrlChange = this.onTopicEmbedUrlChange.bind(this);
    this.onTopicEmbedUrlBlur = this.onTopicEmbedUrlBlur.bind(this);
    this.onTopicFileChange = this.onTopicFileChange.bind(this);
    this.readFile = this.readFile.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onCreateTopic = this.onCreateTopic.bind(this);
    this.onUploadFile = this.onUploadFile.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.createTopic = this.createTopic.bind(this);
    this.onUpdateTopic = this.onUpdateTopic.bind(this);
    this.updateTopic = this.updateTopic.bind(this);
    this.onRemoveTopicFile = this.onRemoveTopicFile.bind(this);
    this.removeTopicFile = this.removeTopicFile.bind(this);
    this.deleteTopicFile = this.deleteTopicFile.bind(this);
  }

  componentDidMount() {
    const options = formHelpers.getEasyEditorOptions();
    new EasyEditor('#body', options);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.channel && !this.props.channel){
      this.forceUpdate();
    }
  }

  onTopicTitleChange(e){
    this.setState({title:e.target.value},function(){
      this.validateForm();
    });
  }

  onTopicTitleBlur(){
    this.validateForm();
  }

  onTopicChannelSelect(e){
    this.setState({channel_id:e.target.value},function(){
      this.validateForm();
    });
  }

  onTopicDescriptionChange(e){
    this.setState({body:e.target.value},function(){
      this.validateForm();
    });
  }

  toggleEditor(){
    this.setState({showEditor:false});
  }

  onTopicEmbedUrlChange(e){
    this.setState({embed_url:e.target.value},function(){
      this.validateForm();
    });
  }

  onTopicEmbedUrlBlur(){
    this.validateForm();
  }

  onTopicFileChange(e){
    const file = {
      f:e.target.files[0],
      file_name:fileHelpers.generateValidFileName(e.target.files[0].name),
      file_type:e.target.files[0].type.split('/')[1],
      file_size:e.target.files[0].size,
      media_type:e.target.files[0].type.split('/')[0],
      item_type:'topic'
    };
    this.readFile(file,e.target.files[0]);
  }

  readFile(file,filesObject){
    const reader = new FileReader();
    const th = this;
    reader.onload = function(){
      file.f.data = reader.result;
      th.setState({file:file});
    };
    reader.readAsDataURL(filesObject);
  }

  validateForm(){
    const config = store.getState().config;
    const errors = formHelpers.validateTopicForm(this.state,config);
    this.setState({errors:errors});
  }

  onFormSubmit(event){
    event.preventDefault();
    const route = store.getState().route;
    if (route.section === 'new-topic') {
      this.onCreateTopic();
    } else if (route.section === 'edit-topic'){
      this.onUpdateTopic();
    }
  }

  onCreateTopic(){
    const body = $('#body')[0].defaultValue;
    this.setState({body:body},function(){
      const config = store.getState().config;
      const errors = formHelpers.validateTopicForm(this.state,config);
      this.setState({errors:errors},function(){
        if (this.state.errors.length === 0){
          this.setState({loading:true},function(){
            if (this.state.file) this.onUploadFile();
            else this.createTopic();
          });
        }
      });
    });
  }

  onUploadFile(){
    const state = store.getState();
    const inner_path = "merged-"+state.config.merger_name+
                       "/"+state.config.cluster+
                       "/data/users/"+state.site_info.auth_address+
                       "/"+this.state.file.file_name;
    this.uploadFile(inner_path);
  }

  uploadFile(inner_path){
    const file = this.state.file;
    Page.cmd("bigfileUploadInit", [inner_path, file.file_size], function(init_res){
      var formdata = new FormData()
      var req = new XMLHttpRequest()
      formdata.append(file.file_name,file.f);
      // upload event listener
      req.upload.addEventListener("progress", function(res){
        // update item progress
        this.setState({fileProgress:parseInt((res.loaded / res.total) * 100)});
      }.bind(this));
      // loaded event listener
      req.upload.addEventListener("loadend", function() {
        const section = store.getState().route.section;
        if (section === 'new-topic'){
          this.createTopic();
        } else if (section === 'edit-topic') {
          this.updateTopic();
        }
      }.bind(this));
      req.withCredentials = true
      req.open("POST", init_res.url)
      req.send(formdata)
    }.bind(this));
  }

  createTopic(){
    const inner_path = "merged-"+store.getState().config.merger_name+
                       "/"+store.getState().config.cluster+
                       "/data/users/"+store.getState().site_info.auth_address+
                       "/data.json";
    Page.cmd('fileGet',{inner_path:inner_path},function(data){

      data = JSON.parse(data);
      if (data){
        if (!data.topic){
          data.topic = [];
          data.next_topic_id = 1;
        }
      } else {
        data = {"topic":[],"next_topic_id":1}
      }

      const topic = {
        topic_id:store.getState().site_info.auth_address + "topic" + data.next_topic_id,
        channel_id:this.state.channel_id,
        user_id:store.getState().site_info.cert_user_id,
        title:this.state.title,
        body:this.state.body,
        embed_url:this.state.embed_url,
        type:'topic',
        added:Date.now()
      }

      topic.body_p = topic.body.replace(/<\/?[^>]+(>|$)/g, "");
      data.topic.push(topic);
      data.next_topic_id += 1;
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          Page.cmd("wrapperNotification", ["done", "Topic Created!", 5000]);
          if (this.state.file){
            this.createFile(inner_path,topic);
          } else {
            window.top.location.href = "index.html?v=topic+id="+topic.topic_id;
          }
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  createFile(inner_path,topic){
    Page.cmd('fileGet',{inner_path:inner_path},function(data){

      data = JSON.parse(data);
      if (data){
        if (!data.file){
          data.file = [];
          data.next_file_id = 1;
        }
        if (!data.file_to_item){
          data.file_to_item = [];
          data.next_file_to_item_id = 1;
        }
      } else {
        data = {
          "file":[],
          "next_file_id":1,
          "file_to_item":[],
          "next_file_to_item_id":1
        }
      }

      const file = {
        file_id:store.getState().site_info.auth_address+"fl"+data.next_file_id,
        file_type:this.state.file.file_type,
        file_name:this.state.file.file_name,
        item_id:topic.topic_id,
        item_type:'topic',
        user_id:store.getState().site_info.auth_address,
        added:Date.now()
      }

      data.file.push(file);
      data.next_file_id += 1;

      const file_to_item = {
        file_to_item_id:store.getState().site_info.auth_address+"fti"+data.next_file_to_item_id,
        item_type:'topic',
        item_id:topic.topic_id,
        file_id:file.file_id,
        cluster_id:store.getState().config.cluster,
        user_id:file.user_id,
        added:Date.now()
      }

      data.file_to_item.push(file_to_item);
      data.next_file_to_item_id += 1;

      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          Page.cmd("wrapperNotification", ["done", "File Created!", 5000]);
          window.top.location.href = "index.html?v=topic+id="+topic.topic_id;
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  onUpdateTopic(event){
    event.preventDefault();
    const body = $('#body')[0].defaultValue;
    this.setState({body:body},function(){
      this.setState({loading:true},function(){
        if (this.state.file){
          this.onUploadFile();
        } else {
          this.updateTopic();
        }
      });
    });
  }

  updateTopic(){
    const query = "SELECT * FROM json WHERE json.json_id='"+this.props.topic.json_id+"'";
    Page.cmd('dbQuery',[query],function(res){
      const inner_path = "merged-"+store.getState().config.merger_name+"/"+res[0].directory+"/"+res[0].file_name;
      Page.cmd('fileGet',{inner_path:inner_path},function(data){
        data = JSON.parse(data);
        const topicIndex = data.topic.findIndex((t) => t.topic_id === this.props.topic.topic_id);
        const topic = data.topic[topicIndex];
        topic.title = this.state.title;
        topic.body = this.state.body;
        topic.body_p = topic.body.replace(/<\/?[^>]+(>|$)/g, "");
        topic.embed_url = this.state.embed_url;
        data.topic.splice(topicIndex,1);
        data.topic.push(topic);
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
          Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
            Page.cmd("wrapperNotification", ["done", "Topic Updated!", 5000]);
            if (this.state.file){
              this.createFile(inner_path,topic);
            } else {
              window.top.location.href = "index.html?v=topic+id="+topic.topic_id;
            }
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  onRemoveTopicFile(){
    const query = "SELECT * FROM json WHERE json_id='"+this.props.topic.json_id+"'";
    Page.cmd('dbQuery',[query],function(res){
      const inner_path = "merged-"+store.getState().config.merger_name+"/"+res[0].directory;
      const file_name = this.props.topic.file_name;
      this.removeTopicFile(inner_path,file_name);
    }.bind(this));
  }

  removeTopicFile(inner_path,file_name){
    Page.cmd('fileGet',{inner_path:inner_path + "/data.json"},function(data){
      data = JSON.parse(data);
      const fIndex = data.file.findIndex((f) => f.file_id === this.props.topic.file_id);
      const ftiIndex = data.file_to_item.findIndex((fti) => fti.file_to_item_id === this.props.topic.file_to_item_id);
      data.file.splice(fIndex, 1);
      data.file_to_item.splice(ftiIndex, 1);
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path + "/data.json", btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path + "/data.json"}, function(res) {
          this.deleteTopicFile(inner_path,file_name);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  deleteTopicFile(inner_path,file_name){
    Page.cmd('fileDelete',{inner_path:inner_path + "/" + file_name},function(res){
      this.props.getTopic();
    }.bind(this));
  }

  render(){

    let titleError, channelIdError, textError, embedUrlError, fileError;
    let titleFieldCss = "",
        channelFieldCss = "",
        textFieldCss = "",
        embedUrlCss = "",
        fileFieldCss = "";
    if (this.state.errors){
      if (this.state.errors.find((e) => e.field === 'title')){
        const titleErrorObject = this.state.errors.find((e) => e.field === 'title');
        titleError = <span className="error-notice">{titleErrorObject.msg}</span>
        titleFieldCss = 'error';
      }
      if (this.state.errors.find((e) => e.field === 'channel_id')){
        const channelIdErrorObject = this.state.errors.find((e) => e.field === 'channel_id');
        channelIdError = <span className="error-notice">{channelIdErrorObject.msg}</span>;
        channelFieldCss = 'error';
      }
      if (this.state.errors.find((e) => e.field === 'embed_url')){
        const channelIdErrorObject = this.state.errors.find((e) => e.field === 'embed_url');
        embedUrlError = <span className="error-notice">{channelIdErrorObject.msg}</span>;
        embedUrlCss = 'error';
      }
    }

    let fileDisplay;
    if (this.state.file){
      if (this.state.file.media_type === 'image'){
        fileDisplay = (
          <div className="ui segment item-file-display">
            <img src={this.state.file.f.data}/>
          </div>
        );
      } else if (this.state.file.media_type === 'video' || this.state.file.media_type === 'audio'){
        fileDisplay = (
          <div className="ui segment item-file-display">
            <VideoPlayer
              filePath={this.state.file.f.data}
              fileType={this.state.file.file_type}
              mediaType={this.state.file.media_type}
            />
          </div>
        )
      }
    }

    let currentFileDisplay, fileInput;
    if (this.props.topic){
      if (this.props.topic.file_id){
        currentFileDisplay = (
          <div className="form-row ui segment">
            <div className="topic-file-menu">
              <button className="native-btn" type="button" onClick={this.onRemoveTopicFile}>
                <a><i className="icon trash"></i></a>
              </button>
            </div>
            <ItemMediaContainer
              topic={this.props.topic}
            />
          </div>
        );
      } else {
        fileInput = <input type="file" onChange={this.onTopicFileChange}/>
      }
    } else {
      fileInput = <input type="file" onChange={this.onTopicFileChange}/>
    }

    let textAreaDisplay;
    if (this.state.showEditor){
      textAreaDisplay = (
        <div className="editor-wrapper">
          <textarea
            name="body"
            id="body"
            onChange={this.onTopicDescriptionChange}
            defaultValue={this.state.body}>
          </textarea>
          <button onClick={this.toggleEditor} type="button" className="native-btn">
            <a>Can't see the Text Editor? click here</a>
          </button>
        </div>
      );
    } else {
      textAreaDisplay = (
        <textarea
          onChange={this.onTopicDescriptionChange}
          defaultValue={this.state.body}>
        </textarea>
      )
    }

    let channelName;
    if (store.getState().channels.channel) channelName = store.getState().channels.channel.name;

    let submitFormBtn, topicChannelInfoDisplay;
    const route = store.getState().route;
    if (route.section === 'new-topic'){
      submitFormBtn = (
        <button type="button" onClick={this.onCreateTopic} className="native-btn submit-btn">
          <a>create topic</a>
        </button>
      );
      topicChannelInfoDisplay = (
        <div className={"form-row field " + channelFieldCss}>
          <label>Create new Topic in Channel: {channelName}</label>
        </div>
      )

    } else if (route.section === 'edit-topic') {
      submitFormBtn = (
        <button type="button" onClick={this.onUpdateTopic} className="native-btn submit-btn">
          <a>update topic</a>
        </button>
      )
      topicChannelInfoDisplay = (
        <div className={"form-row field " + channelFieldCss}>
          <label>Edit your Topic in Channel: {channelName}</label>
        </div>
      )

    }

    let formBottomErrorDisplay;
    if (this.state.errors.length > 0){
      const errors = this.state.errors.map((e,index) => (
        <li key={index}>
          {e.field} - {e.msg}
        </li>
      ))
      formBottomErrorDisplay = (
        <ul id="topic-form-errors-display">
          {errors}
        </ul>
      );
    }

    let fileUploadProgressDisplay;
    if (this.state.fileProgress){
      let progressBarCssClass = "ui active progress",
          progressBarText = "upload file";
      if (this.state.fileProgress === 100) {
          progressBarCssClass += " success";
          progressBarText = "file uploaded!";
      }
      fileUploadProgressDisplay = (
        <div className={progressBarCssClass}>
          <div className="bar" style={{"width":this.state.fileProgress + "%"}}>
            <div className="progress"></div>
          </div>
          <div className="label">{progressBarText}</div>
        </div>
      )
    }

    let loadingDisplay;
    if (this.state.loading){
      let loadingText = 'creating topic'
      if (route.section === 'edit-topic') loadingText = 'updating topic'
      loadingDisplay = (
        <div className="ui active inverted dimmer">
          <div className="ui text loader">{loadingText}...</div>
        </div>
      )
    }

    return(
      <div id="topic-form-container" className="form-container">
        <form id="topic-form" className="ui segment form">
          {loadingDisplay}
          {topicChannelInfoDisplay}
          <div className={"form-row field " + titleFieldCss}>
            <label>Title</label>
            <input
              type="text"
              onBlur={this.onTopicTitleBlur}
              onChange={this.onTopicTitleChange}
              defaultValue={this.state.title}/>
            {titleError}
          </div>
          <div className={"form-row field " + textFieldCss}>
            <label>Text</label>
            {textAreaDisplay}
          </div>
          <hr/>
          <div className={"form-row field " + embedUrlCss}>
            <label>Embed URL from <a href="/12MVkvYGcRW6u2NYbpfwVad1oQeyG4s9Er">IFS</a></label>
            <input
              type="text"
              onBlur={this.onTopicEmbedUrlBlur}
              onChange={this.onTopicEmbedUrlChange}
              defaultValue={this.state.embed_url}/>
            {embedUrlError}
          </div>
          <div className={"form-row field " + fileFieldCss}>
            <label>File</label>
            {fileInput}
            {fileDisplay}
            {currentFileDisplay}
          </div>
          {fileUploadProgressDisplay}
          <div className="form-row field">
            {formBottomErrorDisplay}
            {submitFormBtn}
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToTopicFormProps = (state) => {
  const channel = state.channels.channel;
  return {
    channel
  }
}

const mapDispatchToTopicFormProps = (dispatch) => {
  return {
    dispatch
  }
}

const TopicFormWrapper = ReactRedux.connect(
  mapStateToTopicFormProps,
  mapDispatchToTopicFormProps
)(TopicForm)
