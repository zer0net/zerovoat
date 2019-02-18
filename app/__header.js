class Header extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.onTopicChannelSelect = this.onTopicChannelSelect.bind(this);
    this.followNewTopics = this.followNewTopics.bind(this);
    this.unfollowNewTopics = this.unfollowNewTopics.bind(this);
  }

  componentDidMount() {  
    if (store.getState().feed['New topics']){
      this.setState({followed:true});
    }
  }

  onTopicChannelSelect(e){
    window.top.location.href = "index.html?v=channel+id="+e.target.value;
  }

  followNewTopics(){
    let params;
    const query = followHelpers.generateFollowNewTopicsQuery();
    const feed = [query,params];
    const feedFollow = Object.assign({},store.getState().feed,{});
    feedFollow['New topics'] = feed;
    Page.cmd("feedFollow",[feedFollow]);
    Page.cmd('feedListFollow', [], function(feed){
      store.dispatch(setFeedListFollow(feed));
      this.setState({followed:true});
    }.bind(this));
  }

  unfollowNewTopics(){
    const feedFollow = Object.assign({},store.getState().feed,{});
    delete feedFollow['New topics'];
    Page.cmd("feedFollow",[feedFollow]);
    Page.cmd('feedListFollow', [], function(feed){
      store.dispatch(setFeedListFollow(feed));
      this.setState({followed:false});
    }.bind(this));
  }

  render(){
    const topLinks = channelHelpers.getTopLinksMenu().map((tl,index) => (
      <li key={index}>
        <a href={tl.href}> - {tl.title}</a>
      </li>
    ));

    const route = store.getState().route;
    let channelInfoDisplay, channelId;
    if (route.view === 'channel' || 
        route.view === 'topic' || 
        route.view === 'user-admin' && route.section === 'edit-channel' ||
        route.view === 'user-admin' && route.section === 'new-topic' ||
        route.view === 'user-admin' && route.section === 'edit-topic' || route.id){
        channelId = route.id;
        channelInfoDisplay = <ChannelInfoDisplay/>;
    }

    const topLinksContainer = (
      <ul className="menu">
        {topLinks}
        <li><a href="index.html?v=channels"> - All Channels</a></li>
      </ul>
    );

    let followFeedDisplay;
    if (!this.state.followed){
      followFeedDisplay = (
        <span className="follow-header">
          <a onClick={this.followNewTopics}><i className="icon feed"></i>follow</a>
        </span>
      )
    } else {
      followFeedDisplay = (
        <span className="follow-header">
          <a onClick={this.unfollowNewTopics}><i className="icon feed"></i>unfollow</a>
        </span>
      )
    }

    return (
      <header id="site-header">
        <div id="top-header" className="ui grid">
          <div id="top-header-left" className="column eight wide computer sixteen wide tablet">
            <ChannelSelectContainerWrapper
              onTopicChannelSelect={this.onTopicChannelSelect}
            />
            {topLinksContainer}
          </div>
          <div id="top-header-right" className="column eight wide computer sixteen wide tablet">
            <UserMenuWrapper preview={this.props.preview} />
          </div>
        </div>
        <div id="main-header" className="ui grid">
          <div id="logo-container" className="column five wide computer">
            <h1><span id="logo"></span><a href="index.html">ZeroVoat</a>{followFeedDisplay}</h1>
          </div>
          <div id="header-channel-container" className="column five wide computer">
            {channelInfoDisplay}
            <HeaderSearchContainer/>
          </div>
          <div id="header-sort-options-container" className="column six wide computer">
            <SortOptionsContainer/>
          </div>
        </div>
      </header>
    )
  }
}

class ChannelInfoDisplay extends React.Component {
  constructor(props){
  	super(props);
    let followed = false;
    if (store.getState().route.view === 'channel'){
      let channelId = store.getState().route.id;
      if (store.getState().feed[channelId + " channel"]) followed = true;
    }
  	this.state = {
      loading:true,
      followed:followed
    };
    this.onGetChannelInfo = this.onGetChannelInfo.bind(this);
    this.getChannelInfo = this.getChannelInfo.bind(this);
    this.followChannel = this.followChannel.bind(this);
    this.unfollowChannel = this.unfollowChannel.bind(this);
  }

  componentDidMount() {
    this.onGetChannelInfo();
  }

  onGetChannelInfo(){
    const route = store.getState().route;
    if (route.view === 'topic' || 
      route.view === 'user-admin' && route.section === 'edit-topic'){
      const query = channelHelpers.getChannelByTopicIdQuery(route.id);
      this.getChannelInfo(query);
    } else if (route.view === 'channel' || 
      route.view === 'user-admin' && route.section === 'edit-channel' ||
      route.view === 'user-admin' && route.section === 'new-topic' && route.id){
      const query = channelHelpers.getChannelByIdQuery(route.id);
      this.getChannelInfo(query);
    }
  }

  getChannelInfo(query){
    Page.cmd('dbQuery',[query],function(res){
      store.dispatch(setChannel(res[0]));
      if (store.getState().route.view === 'topic'){
        let followed = false;
        let channelId = store.getState().channels.channel.channel_id;
        if (store.getState().feed[channelId + " channel"]) followed = true;
        this.setState({followed:followed});
      }
      this.setState({loading:false});
    }.bind(this));
  }

  followChannel(){
    let params;
    const channel = store.getState().channels.channel;
    const query = followHelpers.generateFollowChannelQuery(channel);
    const feed = [query,params];
    const feedFollow = Object.assign({},store.getState().feed,{});
    feedFollow[channel.channel_id + " channel"] = feed;
    Page.cmd("feedFollow",[feedFollow]);
    Page.cmd('feedListFollow', [], function(feed){
      store.dispatch(setFeedListFollow(feed));
      this.setState({followed:true});
    }.bind(this));
  }

  unfollowChannel(){
    const feedFollow = Object.assign({},store.getState().feed,{});
    const channelId = store.getState().channels.channel.channel_id;
    delete feedFollow[channelId + " channel"];
    Page.cmd("feedFollow",[feedFollow]);
    Page.cmd('feedListFollow', [], function(feed){
      store.dispatch(setFeedListFollow(feed));
      this.setState({followed:false});
    }.bind(this));
  }

  render(){
    const route = store.getState().route;
    let channelInfoDisplay, followFeedDisplay;
    if (!this.state.loading){

      const channel = store.getState().channels.channel;
      channelInfoDisplay = (
        <h3><a href={"index.html?v=channel+id="+channel.channel_id}>{channel.name}</a></h3>
      );

      if (!this.state.followed){
        followFeedDisplay = <span><a onClick={this.followChannel}><i className="icon feed"></i>follow</a></span>
      } else {
        followFeedDisplay = <span><a onClick={this.unfollowChannel}><i className="icon feed"></i>unfollow</a></span>
      }
    }



    return (
      <div id="channel-info-display-container">
        {channelInfoDisplay}
        {followFeedDisplay}
      </div>
    );
  }
}

const SortOptionsContainer = (props) => {
  const route = store.getState().route;
  let sortOptionsContainer;
  if (route.view === 'main' || route.view === 'channel' || route.view === 'search' || route.section === 'topics') sortOptionsContainer = <TopicListSortOptionsWrapper/>;
  else if (route.view === 'channels' || route.section === 'channels') sortOptionsContainer = <ChannelListSortOptions />;
  return (
    <div id="sort-options-container">
      {sortOptionsContainer}
    </div>
  )
}

class TopicListSortOptions extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.initTopicListSortOptions = this.initTopicListSortOptions.bind(this);
    this.onSortTopicList = this.onSortTopicList.bind(this);
    this.onAnonymousNewTopicClick = this.onAnonymousNewTopicClick.bind(this);
  }

  componentDidMount() {
    this.initTopicListSortOptions();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.site_info.cert_user_id !== nextProps.site_info.cert_user_id){
      this.forceUpdate();
    }
  }

  initTopicListSortOptions(){
    const route = store.getState().route;
    const sort_options = topicHelpers.getTopicSortOptions(route.sort_by);
    store.dispatch(setSortOptions(sort_options));
    if (route.sort_by){store.dispatch(sortTopics(route.sort_by));}
    this.setState({loading:false});
  }

  onSortTopicList(label){
    store.dispatch(sortTopics(label));
  }

  onAnonymousNewTopicClick(){
    Page.cmd("wrapperNotification", ["info", "Please login to participate", 5000]);
  }

  rebuildDb(){

  }

  render(){

    let topicListSortOptionsDisplay;
    if (this.state.loading){
      topicListSortOptionsDisplay = (<Loading msg=" " cssClass=" mini centered"/>);
    } else {
      const sortOptions = store.getState().topics.sort_options.map((so,index) => (
        <li key={index} className="item native-btn transparent">
          <a onClick={() => this.onSortTopicList(so.label)}>{so.label}</a>
        </li>
      ));
      const route = store.getState().route;
      let newTopicBtn;
      if (route.id){
        if (this.props.site_info.cert_user_id){
          newTopicBtn = (
            <li className="item native-btn">
              <a href={"index.html?v=user-admin+s=new-topic+id="+route.id}>New Topic</a>
            </li>
          );
        } else {
          newTopicBtn = (
            <li className="item native-btn">
              <a onClick={this.onAnonymousNewTopicClick}>New Topic</a>
            </li>
          );
        }
      }
      topicListSortOptionsDisplay = (
        <ul className="menu">
          {sortOptions}
          {newTopicBtn}
        </ul>
      );
    }

    return (
      <div id="topic-list-sort-options">
        {topicListSortOptionsDisplay}
      </div>
    );
  }
}

const mapStateToTopicListSortOptionsProps = (state) => {
  const site_info = state.site_info;
  return {
    site_info
  }
}

const mapDispatchToTopicListSortOptionsProps = (dispatch) => {
  return {
    dispatch
  }
}

const TopicListSortOptionsWrapper = ReactRedux.connect(
  mapStateToTopicListSortOptionsProps,
  mapDispatchToTopicListSortOptionsProps
)(TopicListSortOptions);

class ChannelListSortOptions extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.initChannelsSortOptions = this.initChannelsSortOptions.bind(this);
    this.onSortOptionChange = this.onSortOptionChange.bind(this);
  }

  componentDidMount() {
    this.initChannelsSortOptions();
  }

  initChannelsSortOptions(){
    const sort_options = channelHelpers.getChannelSortOptions();
    store.dispatch(setChannelSortOptions(sort_options));
    store.dispatch(sortChannels(sort_options[0].label));
    this.setState({loading:false});
  }

  onSortOptionChange(e){
    store.dispatch(sortChannels(e.target.value));
  }

  render(){
    let channelsSortOptionsDisplay;
    if (!this.state.loading){
      const sortBy = store.getState().channels.sort_options.find((so) => so.current === true);
      const sortOptions = store.getState().channels.sort_options.map((so,index) => (
        <option key={index} value={so.label}>{so.label}</option>
      ));
      channelsSortOptionsDisplay = (
        <form className="ui form">
          <div className="inline field">
            <label>
              Sort Channels:
            </label>
            <select
              className="ui fluid dropdown"
              onChange={this.onSortOptionChange}
              defaultValue={sortBy.label}>
              {sortOptions}
            </select>
          </div>
        </form>
      )
    }
    return (
      <div id="channel-list-sort-options">
        {channelsSortOptionsDisplay}
      </div>
    )
  }
}

class ChannelSelectContainer extends React.Component {

  constructor(props){
  	super(props);
    this.state = {
      loading:true
    }
  }

  componentDidMount() {
    const route = store.getState().route;
    if (route.view === 'main' || route.view === 'user-admin' || route.view === 'search'){
      this.setState({loading:false})
    }
  }

  componentWillReceiveProps(nextProps) {

    if (!this.props.channels.channel && nextProps.channels.channel){
      this.forceUpdate();
      this.setState({channel_id:nextProps.channels.channel.channel_id,loading:false})
    }
  }

  render(){
    let selectDisplay;
    if (!this.state.loading){
      selectDisplay = (
        <ChannelSelectElement
          onTopicChannelSelect={this.props.onTopicChannelSelect}
          channelId={this.state.channel_id}
        />
      );
    }
    return (
      <form id="select-channel-form" name="header-channel-select" className="ui form">
        <div className="field">
          {selectDisplay}
        </div>
      </form>
    )
  }
}

const mapStateToChannelSelectContainerProps = (state) => {
  const channels = state.channels;
  return {
    channels
  }
}

const mapDispatchToChannelSelectContainerProps = (dispatch) => {
  return {
    dispatch
  }
}

const ChannelSelectContainerWrapper = ReactRedux.connect(
  mapStateToChannelSelectContainerProps,
  mapDispatchToChannelSelectContainerProps
)(ChannelSelectContainer);

class HeaderSearchContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      text:''
    };
    this.onSearchTextChange = this.onSearchTextChange.bind(this);
    this.onSearchButtonClick = this.onSearchButtonClick.bind(this);
  }

  componentDidMount() {
    const route = store.getState().route;
    if (route.view === 'search'){
      this.setState({text:route.id});
    }
  }

  onSearchTextChange(e){
    this.setState({text:e.target.value});
  }

  onSearchButtonClick(){
    window.top.location.href = "index.html?v=search+id="+this.state.text;
  }

  render(){
    return (
      <div id="header-search-container">
        <input type="text" placeholder="search topics..." value={this.state.text} onChange={this.onSearchTextChange}/>
        <button type="button" className="native-btn" onClick={this.onSearchButtonClick}>
          <a href={this.state.link}><i className="search icon"></i></a>
        </button>
      </div>
    )
  }
}
