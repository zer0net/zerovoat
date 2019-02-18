class SideBar extends React.Component {
  render(){
    const route = store.getState().route;
    let sideBarDisplay;
    if (route.view === 'main' || route.view === 'search' || this.props.preview) sideBarDisplay = <MainSideBar/>;
    else if (route.view === 'topic' || route.view === 'channel') sideBarDisplay = <TopicSideBarWrapper/>;
    else if (route.view === 'channels') sideBarDisplay = <ChannelsSideBarWrapper/>;
    else if (route.view === 'user-admin') sideBarDisplay = <UserAdminSideBarWrapper/>;
    return (
      <aside id="sidebar" className="ui segment">
        {sideBarDisplay}
      </aside>
    )
  }
}

class MainSideBar extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.getLatestChannels = this.getLatestChannels.bind(this);
  }

  componentDidMount() {
    this.getLatestChannels();
  }

  getLatestChannels(){
    const query = channelHelpers.getLatestChannels();
    Page.cmd('dbQuery',[query],function(res){
      this.setState({channels:res});
    }.bind(this));
  }

  render(){
    let channels;
    if (this.state.channels){
      channels = this.state.channels.map((c,index) => (
        <li key={index} className="native-btn item">
          <a href={"index.html?v=channel+id=" + c.channel_id}>
            {c.name}
          </a>
        </li>
      ));
    }
    return (
      <div className="sidebar-view" id="main-sidebar">
        <ul className="ui list">
          <li className="native-btn item">
            <a href="index.html?v=channels">All Channels</a>
          </li>
          {channels}
        </ul>
      </div>
    )
  }
}

const TopicSideBar = (props) => {
  let channelDisplay;
  if (props.channels && props.channels.channel){
    const channel = props.channels.channel;
    channelDisplay = (
      <div className="channel-display">
        <h3><a href={"index.html?v=channel+id="+channel.channel_id}>{channel.name}</a></h3>
        <p>Number of topics: {channel.topics_count}</p>
        <div className="channel-description ui segment">
          {channel.description}
        </div>
        <p>chanOp: {channel.user_id}</p>
      </div>
    );
  }
  return (
    <div className="sidebar-view" id="topic-sidebar">
      {channelDisplay}
    </div>
  )
}

const mapStateToTopicSideBarProps = (state) => {
  const channels = state.channels;
  return {
    channels
  }
}

const mapDispatchToTopicSideBarProps = (dispatch) => {
  return {
    dispatch
  }
}

const TopicSideBarWrapper = ReactRedux.connect(
  mapStateToTopicSideBarProps,
  mapDispatchToTopicSideBarProps
)(TopicSideBar);

class ChannelsSideBar extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.onAnonymousNewChannelClick = this.onAnonymousNewChannelClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.site_info.cert_user_id !== nextProps.site_info.cert_user_id){
      this.forceUpdate();
    }
  }

  onAnonymousNewChannelClick(){
    Page.cmd("wrapperNotification", ["info", "Please login to participate", 5000]);
  }

  render(){
    let newChannelBtn;
    if (this.props.site_info.cert_user_id){
      newChannelBtn = (
        <div className="native-btn">
          <a href="index.html?v=user-admin+s=new-channel">New Channel</a>
        </div>
      );
    } else {
      newChannelBtn = (
        <div className="native-btn">
          <a onClick={this.onAnonymousNewChannelClick}>New Channel</a>
        </div>
      )
    }
    return (
      <div id="channels-sidebar">
        {newChannelBtn}
      </div>
    )
  }
}

const mapStateToChannelsSideBarProps = (state) => {
  const site_info = state.site_info;
  return {
    site_info
  }
}

const mapDispatchToChannelsSideBarProps = (dispatch) => {
  return {
    dispatch
  }
}

const ChannelsSideBarWrapper = ReactRedux.connect(
  mapStateToChannelsSideBarProps,
  mapDispatchToChannelsSideBarProps
)(ChannelsSideBar)

class UserAdminSideBar extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.user.user_id){
      if (nextProps.user.user_id) {
        this.setState({loading:true},function(){
          this.forceUpdate();
          this.setState({loading:false});
        });
      }
    } else {
      if (this.props.user.user_id !== nextProps.user.user_id || this.props.user.file_id !== nextProps.user.file_id){
        this.setState({loading:true},function(){
          this.forceUpdate();
          this.setState({loading:false});
        });
      }
    }
  }

  render(){
    let userAdminSideBarDisplay;
    if (!this.state.loading){
      const user = this.props.user;
      if (user && user.user_id){
        userAdminSideBarDisplay = (
          <div className="user-sidebar-wrapper">
            <div className="ui segment" id="user-details">
              <UserAvatarForm user={user} />
              <div id="user-details-header">
                <span>{user.user_name.split('@')[0]}</span>
                <span>@</span>
                <span>{user.user_name.split('@')[1]}</span>
              </div>
              <div id="user-details-info">
                <p>registered {appHelpers.getTimeAgo(user.added)}</p>
                <p><a href="index.html?v=user-admin+s=profile">Profile</a></p>
                <p><a href="index.html?v=user-admin+s=channels">{user.channels_total} Channels</a></p>
                <p><a href="index.html?v=user-admin+s=topics">{user.topics_total} Topics</a></p>
                <p><a href="index.html?v=user-admin+s=comments">{user.comments_total} Comments</a></p>
              </div>
            </div>
          </div>
        );
      } else {
        userAdminSideBarDisplay = (
          <div className="ui segment lightgray">
            <Loading cssClass=" centered" msg="Loading User Details..."/>
          </div>
        )
      }
    }
    return (
      <div id="user-admin-sidebar">
        {userAdminSideBarDisplay}
      </div>
    );
  }
}

const mapStateToUserAdminSideBarProps = (state) => {
  const user = state.user;
  return {
    user
  }
}

const mapDispatchToUserAdminSideBarProps = (dispatch) => {
  return {
    dispatch
  }
}

const UserAdminSideBarWrapper = ReactRedux.connect(
  mapStateToUserAdminSideBarProps,
  mapDispatchToUserAdminSideBarProps
)(UserAdminSideBar)
