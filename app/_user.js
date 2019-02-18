class UserMenu extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  componentDidMount() {
    if (store.getState().site_info.cert_user_id !== store.getState().user.user_name){
      this.props.getUser();
    }
  }

  render(){
    const user = this.props.user;
    let userMenuDisplay;
    if (!user || user && !user.user_id){
      userMenuDisplay = (
        <Loading msg=" " cssClass="mini"/>
      )
    } else {
      if (this.props.site_info.cert_user_id){
          let userNameDisplay;
          if (user.screen_name) {
            userNameDisplay = user.screen_name;
          } else if (user.user_name) {
            userNameDisplay = user.user_name.split('@')[0];
          } else if (user.user_id){
            userNameDisplay = store.getState().site_info.cert_user_id;
          }
          userMenuDisplay = (
            <div id="user-menu-wrapper">
              <span><a href="index.html?v=user-admin+s=profile"><i className="user icon"></i> {userNameDisplay}</a></span>
              <span>|</span>
              <span><a onClick={() => this.props.certSelect()}>switch</a></span>
            </div>
          );
      } else {
        userMenuDisplay = (
          <div id="user-menu-wrapper">
            <span><a onClick={() => this.props.certSelect()}>Login</a> to participate</span>
          </div>
        )
      }
    }

    return (
      <div id="user-menu">
        {userMenuDisplay}
      </div>
    )
  }
}

const mapStateToUserMenuProps = (state) => {
  const site_info = state.site_info;
  const user = state.user;
  const feed = state.feed;
  return {
    site_info,
    user,
    feed
  }
}

const mapDispatchToUserMenuProps = (dispatch) => {
  return {
    dispatch
  }
}

const mergedUserMenuProps = (stateProps, dispatch) => {

  function getUser(){
    store.dispatch(loadingUser(true));
    const cert_user_id = store.getState().site_info.cert_user_id;
    if (cert_user_id){
      const auth_address = store.getState().site_info.auth_address;
      const query = userHelpers.getUserQuery(auth_address);
      const userCreated = store.getState().userCreated;
      Page.cmd('dbQuery',[query],function(res){
        if (res.length > 0){
          store.dispatch(setUser(res[0]));
          finishLoadingUser();
        } else {
          registerUser();
        }
      });
    } else {
      finishLoadingUser();
    }
  }

  function registerUser(){
    const config = store.getState().config;
    const inner_path = "merged-"+config.merger_name+"/"+config.cluster+"/data/users/"+stateProps.site_info.auth_address+"/data.json";
    Page.cmd('fileGet',{inner_path:inner_path,required:false},function(data){
      data = JSON.parse(data);
      if (data){
        if (!data.user){
          data.user = [];
          data.next_user_id = 1;
        }
      } else {
        data = {
          "user":[],
          "next_user_id":1
        }
      }
      const user = {
        user_id:stateProps.site_info.auth_address,
        user_name:stateProps.site_info.cert_user_id,
        added:Date.now()
      }
      data.user.push(user);
      data.next_user_id += 1;
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        console.log('file write - ' + res);
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          console.log('site publish - ' + res);
          Page.cmd("wrapperNotification", ["done", "User Registered!", 3000]);
          store.dispatch(userCreated(stateProps.site_info.cert_user_id));
          store.dispatch(setUser(user));
          finishLoadingUser();
        });
      });
    });
  }

  function finishLoadingUser(){
    store.dispatch(loadingUser(false));
  }

  function certSelect(){
    Page.selectUser();
    const self = this;
    Page.onRequest = function(cmd, message) {
      if (cmd === "setSiteInfo"){
        if (message.address === store.getState().site_info.address) {
          store.dispatch(loadingUser(true));
          if (message.cert_user_id){
            store.dispatch(changeCert(message.auth_address,message.cert_user_id));
            self.getUser();
          } else if (!message.cert_user_id){
            store.dispatch(changeCert(message.auth_address,message.cert_user_id));
            store.dispatch(removeUser());
            self.finishLoadingUser();
          }
        }
      }
    };
  }

  return {
    ...stateProps,
    ...dispatch,
    getUser,
    registerUser,
    finishLoadingUser,
    certSelect
  }
}

const UserMenuWrapper = ReactRedux.connect(
  mapStateToUserMenuProps,
  mapDispatchToUserMenuProps,
  mergedUserMenuProps
)(UserMenu);

class UserAdminView extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (this.props.user){
      if (this.props.user.user_id !== nextProps.user.user_id) this.forceUpdate();
    } else {
      if (nextProps.user) this.forceUpdate();
    }
  }
  render(){
    let userSectionDisplay;
    if (this.props.user) userSectionDisplay = <UserSectionContainer user={this.props.user} />;
    return (
      <div id="user-admin-view" className="view-container">
        {userSectionDisplay}
      </div>
    )
  }
}

const mapStateToUserAdminViewProps = (state) => {
  const user = state.user;
  return {
    user
  }
}

const mapDispatchToUserAdminViewProps = (dispatch) => {
  return {
    dispatch
  }
}

const UserAdminViewWrapper = ReactRedux.connect(
  mapStateToUserAdminViewProps,
  mapDispatchToUserAdminViewProps
)(UserAdminView);

const UserSectionContainer = (props) => {
  let userSectionDisplay;
  if (props.user.user_id){
    const section = store.getState().route.section;
    if (section === 'profile') userSectionDisplay = <UserProfileSection user={props.user} />
    else if (section === 'channels') userSectionDisplay = <UserChannelsSection/>;
    else if (section === 'topics') userSectionDisplay = <UserTopicsSection />;
    else if (section === 'comments') userSectionDisplay = <UserCommentsSection />;
    else if (section === 'new-topic') userSectionDisplay = <UserNewTopicSection />;
    else if (section === 'edit-topic') userSectionDisplay = <UserEditTopicSection />;
    else if (section === 'new-channel') userSectionDisplay = <UserNewChannelSection />;
    else if (section === 'edit-channel') userSectionDisplay = <UserEditChannelSection />;
  }
  return (
    <div id="user-section-container">
      {userSectionDisplay}
    </div>
  )
}

class UserProfileSection extends React.Component {

  constructor(props){
  	super(props);
    const user = this.props.user;
  	this.state = {
      screen_name:user.screen_name || '',
      about:user.about || '',
      showEditor:true
    };

    this.onUserProfileScreenNameChange = this.onUserProfileScreenNameChange.bind(this);
    this.onUserProfileAboutChange = this.onUserProfileAboutChange.bind(this);
    this.toggleEditor = this.toggleEditor.bind(this);
    this.onUpdateUserProfile = this.onUpdateUserProfile.bind(this);
    this.updateUserProfile = this.updateUserProfile.bind(this);
  }

  componentDidMount() {

    const options = formHelpers.getEasyEditorOptions();
    new EasyEditor('#ckeditor1', options);
    this.setState({loading:false});

  }

  onUserProfileScreenNameChange(e){
    this.setState({screen_name:e.target.value});
  }

  onUserProfileAboutChange(about){
    this.setState({about:about});
  }

  toggleEditor(){
    this.setState({showEditor:false});
  }

  onUpdateUserProfile(){
    const about = $('#ckeditor1')[0].defaultValue;
    this.setState({loading:true,about:about},function(){
      const query = "SELECT * FROM json WHERE json_id='"+store.getState().user.json_id+"'";
      Page.cmd('dbQuery',[query],function(res){
        const json = res[0];
        const inner_path = "merged-"+store.getState().config.merger_name+"/"+json.directory+"/"+json.file_name;
        this.updateUserProfile(inner_path);
      }.bind(this));
    });
  }

  updateUserProfile(inner_path){
    Page.cmd('fileGet',{inner_path:inner_path},function(data){
      data = JSON.parse(data);
      const uIndex = data.user.findIndex((u) => u.user_id === store.getState().user.user_id);
      data.user[uIndex].screen_name = this.state.screen_name;
      data.user[uIndex].about = this.state.about;
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          Page.cmd("wrapperNotification", ["done", "Profile Updated!", 5000]);
          this.setState({loading:false});
          store.dispatch(setUser(data.user[uIndex]));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  render(){

    let loadingDisplay;
    if (this.state.loading){
      loadingDisplay = (
        <div className="ui active inverted dimmer">
          <div className="ui text loader"></div>
        </div>
      )
    }

    let textAreaDisplay;
    if (this.state.showEditor){
      textAreaDisplay = (
        <div className="editor-wrapper">
          <textarea defaultValue={this.state.about} name="ckeditor1" id="ckeditor1"></textarea>
          <button onClick={this.toggleEditor} type="button" className="native-btn">
            <a>Can't see the Text Editor? click here</a>
          </button>
        </div>
      );
    } else {
      textAreaDisplay = (
        <textarea
          onChange={this.onUserProfileAboutChange}
          defaultValue={this.state.about}>
        </textarea>
      )
    }

    return(
      <div id="user-profile-section" className="user-admin-section">
        <form id="user-profile-form" className="ui lightgray form segment">
          {loadingDisplay}
          <div className="field">
            <label className="label">Profile Name (Optional)</label>
            <input defaultValue={this.state.screen_name} type="text" onChange={this.onUserProfileScreenNameChange} />
          </div>
          <div className="field">
            <label className="label">About</label>
            {textAreaDisplay}
          </div>
          <div className="field">
            <button className="native-btn" type="button" onClick={this.onUpdateUserProfile}>
              <a>Update Profile</a>
            </button>
          </div>
        </form>
      </div>
    );
  }
}

class UserChannelsSection extends React.Component {
  render(){
    return (
      <div id="user-channels-section" className="user-admin-section">
        <ChannelsListWrapper/>
      </div>
    )
  }
}

class UserNewChannelSection extends React.Component {
  render(){
    return (
      <div id="user-new-channel-section" className="user-admin-section">
        <ChannelForm/>
      </div>
    )
  }
}

class UserEditChannelSection extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.getChannelEditTabs = this.getChannelEditTabs.bind(this);
    this.getChannel = this.getChannel.bind(this);
  }

  componentDidMount() {
    this.getChannelEditTabs();
  }

  getChannelEditTabs(){
    const tabs = channelHelpers.getChannelEditTabs();
    this.setState({tabs:tabs,current_tab:0},function(){
      this.getChannel();
    });
  }

  getChannel(){
    const query = "SELECT * FROM channel WHERE channel_id='"+store.getState().route.id+"'";
    Page.cmd('dbQuery',[query],function(res){
      this.setState({channel:res[0]});
    }.bind(this));
  }

  onTabClick(value){
    this.setState({current_tab:value});
  }

  render(){
    let userEditChannelSectionDisplay;
    if (!this.state.channel){
      userEditChannelSectionDisplay = (
        <div className="ui segment lightgray">
          <Loading cssClass="centered" msg="Loading Channel..." />
        </div>
      )
    } else {

      const channel = this.state.channel;
      const tabMenu = this.state.tabs.map((t,index) => (
        <a
          key={index}
          className={this.state.current_tab === index ? "item active" : "item"}
          onClick={() => this.onTabClick(index)}>
          {t.label}
        </a>
      ));

      const tabs = this.state.tabs.map((t,index) => {
        const tabCssClass = "ui bottom attached tab segment";
        let tabContent;
        if (index === 0) tabContent = <ChannelForm channel={channel}/>
        else if (index === 1) tabContent = <ChannelModeratorsContainer channel={channel}/>
        else if (index === 2) tabContent = <ChannelLayoutEditorContainer channel={channel}/>
        return (
          <div
            key={index}
            className={index === this.state.current_tab ? tabCssClass + " active" : tabCssClass}>
            {tabContent}
          </div>
        )
      });

      userEditChannelSectionDisplay = (
        <div className="user-edit-channel-wrapper">
          <div className="ui top attached tabular menu">
            {tabMenu}
          </div>
          <div id="channel-edit-tabs-container">
            {tabs}
          </div>
        </div>
      )
    }
    return (
      <div id="user-edit-channel-section" className="user-admin-section">
        {userEditChannelSectionDisplay}
      </div>
    )
  }
}

class UserTopicsSection extends React.Component {
  render(){
    return (
      <div id="user-channels-section" className="user-admin-section">
        <TopicsWrapper />
      </div>
    )
  }
}

class UserNewTopicSection extends React.Component {
  render(){
    return (
      <div className="user-section-container" id="user-new-topic-section">
        <TopicFormWrapper/>
      </div>
    )
  }
}

class UserEditTopicSection extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:true,
      current_tab:1
    };
    this.getTopic = this.getTopic.bind(this);
    this.handleTabItemClick = this.handleTabItemClick.bind(this);
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

  handleTabItemClick(num){
    this.setState({current_tab:num})
  }

  render(){
    let topicDisplay;
    if (this.state.loading){
      topicDisplay = (
        <Loading msg="loading topic.." />
      )
    } else {
      const topic = store.getState().topics.items[0];
      topicDisplay = (
        <TopicForm
          topic={topic}
          getTopic={this.getTopic}
        />
      )
    }
    return(
      <div id="user-edit-topic-section" className="user-admin-section">
        {topicDisplay}
      </div>
    );
  }
}

class UserCommentsSection extends React.Component {
  render(){
    const userId = store.getState().site_info.cert_user_id;
    return (
      <div id="user-comments-section" className="user-admin-section">
        <CommentsWrapper userId={userId} />
      </div>
    )
  }
}
