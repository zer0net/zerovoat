class ChannelsList extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  componentDidMount(){
    this.props.getAllChannels();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.channels.sort_options && !this.props.channels.items){
      this.props.getAllChannels();
    } else if (this.props.user && this.props.user.user_name !== nextProps.user.user_name){
      this.props.getAllChannels();
    }
  }

  render(){
    let channelListDisplay;
    if (this.props.channels && this.props.channels.items && this.props.channels.items.length > 0){
      const sortOptionLabel = store.getState().channels.sort_by;
      const sortBy = store.getState().channels.sort_options.find((so) => so.label === sortOptionLabel);
      const cArray = channelHelpers.sortChannels(store.getState().channels.items,sortBy);
      const channels = cArray.map((c,index) => (
        <ChannelListItem channel={c} key={index}/>
      ));
      channelListDisplay = (<div className="ui list">{channels}</div>);
    } else {
      channelListDisplay = (
        <div className="ui segment lightgray">
          no channels yet, <a href="index.html?v=user-admin+s=new-channel">create a new channel!</a>
        </div>
      )
    }
    return (
      <div id="channels-list">
        {channelListDisplay}
      </div>
    )
  }
}

const mapStateToChannelsListProps = (state) => {
  const channels = state.channels;
  const user = state.user;
  return {
    channels,
    user
  }
}

const mapDispatchToChanenlsListProps = (dispatch) => {
  return {
    dispatch
  }
}

const mergeChannelsListProps = (stateProps, dispatch) => {
  function getAllChannels(){
    const route = store.getState().route;
    let userId;
    if (route.view === 'user-admin' && route.section === 'channels'){
      userId = store.getState().site_info.cert_user_id;
    }
    const query = channelHelpers.getChannelsQuery(userId);
    Page.cmd('dbQuery',[query],function(res){
      store.dispatch(setChannels(res));
    }.bind(this));
  }
  return {
    ...stateProps,
    ...dispatch,
    getAllChannels
  }
}

const ChannelsListWrapper = ReactRedux.connect(
  mapStateToChannelsListProps,
  mapDispatchToChanenlsListProps,
  mergeChannelsListProps
)(ChannelsList)

class ChannelListItem extends React.Component {
  render(){
    const c = this.props.channel;
    let editChannelBtn;
    if (store.getState().route.view === 'user-admin' && c.user_id === store.getState().site_info.cert_user_id){
      editChannelBtn = (
        <a className="edit-btn" href={"index.html?v=user-admin+s=edit-channel+id=" + c.channel_id}>
          <i className="icon edit"></i> Edit Channel
        </a>
      )
    }
    return (
      <div className="ui segment item">
        <div className="channel-item-header">
          <h3><a href={"index.html?v=channel+id=" + c.channel_id}>{c.name}</a></h3>
          <span className="topic-counter">[{c.topics_count}]</span>
          {editChannelBtn}
          <a className="arrow-btn" href={"index.html?v=channel+id=" + c.channel_id}>
            <i className="icon arrow right"></i>
          </a>
        </div>
        <div className="channel-item-content">
          <div className="ui segment">
            <p>{c.description}</p>
            <hr/>
            <span><b>chanOp:</b> {c.user_id}</span>
          </div>
        </div>
        <div className="channel-item-footer">
          <span className="channel-item-last-activity"><b>last activity: {appHelpers.getTimeAgo(c.last_topic_date)}</b></span>
          <span className="channel-item-created">created: {appHelpers.getTimeAgo(c.added)}</span>
        </div>
      </div>
    )
  }
}

class ChannelModeratorsContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      moderators:[]
    };
    this.getModerators = this.getModerators.bind(this);
    this.addModerator = this.addModerator.bind(this);
  }

  componentDidMount() {
    this.getModerators();
  }

  getModerators(){
    const channelId = this.props.channel.channel_id;
    const query = "SELECT * FROM moderator WHERE channel_id='"+channelId+"' AND user_name IS NOT NULL";
    Page.cmd('dbQuery',[query],function(res){
      this.setState({moderators:res});
    }.bind(this));
  }

  addModerator(moderator){
    this.setState({
      moderators:[
        ...this.state.moderators,
        moderator
      ]
    });
  }

  render(){
    const moderators = this.state.moderators.map((mod,index) => (
      <li key={index}>{mod.user_name}</li>
    ));
    return (
      <div id="channel-moderators-container">
        <ModeratorForm addModerator={this.addModerator}/>
        <ul>{moderators}</ul>
      </div>
    )
  }
}

class ChannelLayoutEditorContainer extends React.Component {
  render(){
    let channelLayoutEditorDisplay;
    if (!store.getState().site_info.settings.own){
      channelLayoutEditorDisplay = (
        <Loading cssClass="centered" msg="Under Construction"></Loading>
      );
    } else {
      channelLayoutEditorDisplay = (
        <div className="wrapper">
          <p>editor form tabs</p>
          <PreviewTemplateWrapper/>
        </div>
      )
    }
    return(
      <div id="channel-layout-editor" className="ui segment lightgray">
        {channelLayoutEditorDisplay}
      </div>
    );
  }
}

class PreviewTemplateWrapper extends React.Component {
  render(){
    return (
      <Template preview={true}/>
    )
  }
}

class ChannelTopicsContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {loading:true};
    this.initChannelTopics = this.initChannelTopics.bind(this);
  }

  componentDidMount() {
    this.initChannelTopics();
  }

  initChannelTopics(){
    const route = store.getState().route;
    const sort_options = topicHelpers.getTopicSortOptions(route.sort_by);
    store.dispatch(setSortOptions(sort_options));
    this.setState({loading:false});
  }

  render(){
    let channelTopicsDisplay;
    if (this.state.loading){
      channelTopicsDisplay = <Loading msg={"loading channel topics"}/>
    } else {
      channelTopicsDisplay = <TopicsWrapper/>
    }
    return (
      <div id="channel-topics-container">
        {channelTopicsDisplay}
      </div>
    )
  }
}

class ChannelForm extends React.Component {
  constructor(props){
  	super(props);
    let name = '', description = '';
    if (this.props.channel){
      name = this.props.channel.name;
      description = this.props.channel.description;
    }
    this.state = {
      name:name,
      description:description,
      errors:[]
    };
    this.onChannelNameChange = this.onChannelNameChange.bind(this);
    this.onChannelNameBlur = this.onChannelNameBlur.bind(this);
    this.onChannelDescriptionChange = this.onChannelDescriptionChange.bind(this);
    this.onChannelDescriptionBlur = this.onChannelDescriptionBlur.bind(this);
    this.onCreateChannel = this.onCreateChannel.bind(this);
    this.createChannel = this.createChannel.bind(this);
    this.onUpdateChannel = this.onUpdateChannel.bind(this);
    this.updateChannel = this.updateChannel.bind(this);
  }

  onChannelNameChange(e){
    this.setState({name:e.target.value});
    this.validateForm();
  }

  onChannelNameBlur(){
    this.validateForm();
  }

  onChannelDescriptionChange(e){
    this.setState({description:e.target.value});
    this.validateForm();
  }

  onChannelDescriptionBlur(){
    this.validateForm();
  }

  validateForm(){
    const errors = formHelpers.validateChannelForm(this.state);
    this.setState({errors:errors});
  }

  onUpdateChannel(e){
    const query = "SELECT * FROM json WHERE json_id='"+this.props.channel.json_id+"'";
    Page.cmd('dbQuery',[query],function(res){
      const inner_path = "merged-"+store.getState().config.merger_name+"/"+res[0].directory+"/data.json";
      this.updateChannel(inner_path);
    }.bind(this));
  }

  updateChannel(inner_path){
    Page.cmd('fileGet',{inner_path:inner_path},function(data){
      data = JSON.parse(data);
      const channelIndex = data.channel.findIndex((c) => c.channel_id === this.props.channel.channel_id);
      const channel = data.channel[channelIndex];
      channel.name = this.state.name;
      channel.description = this.state.description;
      chanenl.edited = Date.now();
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        console.log(res)
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          console.log(res);
          Page.cmd("wrapperNotification", ["done", "Channel Edited!", 10000]);
          window.top.location.href = "index.html?v=user-admin+s=channels";
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  onCreateChannel(e){
    this.setState({loading:true},function(){
      const inner_path = "merged-"+store.getState().config.merger_name+
                         "/"+store.getState().config.cluster+
                         "/data/users/"+store.getState().site_info.auth_address+
                         "/data.json";
      this.createChannel(inner_path);
    });
  }

  createChannel(inner_path){
    Page.cmd('fileGet',{inner_path:inner_path},function(data){
      data = JSON.parse(data);
      if (data){
        if (!data.channel){
          data.channel = [];
          data.next_channel_id = 1;
        }
      } else {
        data = {
          "channel":[],
          "next_channel_id":1
        }
      }

      const channel = {
        "channel_id":store.getState().site_info.auth_address+"ch"+data.next_channel_id,
        "name":this.state.name,
        "description":this.state.description,
        "user_id":store.getState().site_info.cert_user_id,
        "added":Date.now()
      }

      data.channel.push(channel);
      data.next_channel_id += 1;

      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        console.log(res)
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          console.log(res);
          Page.cmd("wrapperNotification", ["done", "Channel Edited!", 10000]);
          window.top.location.href = "index.html?v=user-admin+s=channels";
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  render(){

    let nameError, nameFieldCss = "";
    if (this.state.errors){
      if (this.state.errors.find((e) => e.field === 'name')){
        const nameErrorObject = this.state.errors.find((e) => e.field === 'name');
        nameError = <span className="error-notice">{nameErrorObject.msg}</span>
        nameFieldCss = 'error';
      }
    }

    let formSubmitButton;
    if (!this.state.loading && this.state.errors.length === 0){
      if (this.props.channel === 'edit'){
        formSubmitButton = (
          <button className="native-btn submit-btn" type="button" onClick={() => this.onUpdateChannel()}>
            <a>Update Channel</a>
          </button>
        );
      } else {
        formSubmitButton = (
          <button className="native-btn submit-btn" type="button" onClick={() => this.onCreateChannel()}>
            <a>Create Channel</a>
          </button>
        );
      }
    }

    let loadingDisplay;
    if (this.state.loading){
      loadingDisplay = (
        <div className="ui active inverted dimmer">
          <div className="ui text loader"></div>
        </div>
      )
    }

    return (
      <div id="channel-form-container" className="form-container">
        <form id="channel-form" className="ui segment lightgray form">
          {loadingDisplay}
          <div className={"form-row ui field " + nameFieldCss}>
            <label>Name</label>
            <input
              type="text"
              onBlur={this.onChannelNameBlur}
              onChange={this.onChannelNameChange}
              defaultValue={this.state.name}/>
            {nameError}
          </div>
          <div className="form-row ui field">
            <label>Description</label>
            <textarea
              onBlur={this.onChannelDescriptionBlur}
              onChange={this.onChannelDescriptionChange}
              defaultValue={this.state.description}>
            </textarea>
          </div>
          {formSubmitButton}
        </form>
      </div>
    )
  }
}

class ModeratorForm extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      user:''
    };
    this.initModeratorForm = this.initModeratorForm.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.onUserSelectChange = this.onUserSelectChange.bind(this);
    this.addChannelModerator = this.addChannelModerator.bind(this);
  }

  componentDidMount() {
    this.initModeratorForm();
  }

  initModeratorForm(){
    const query = "SELECT * FROM moderator WHERE channel_id='"+store.getState().route.id+"'";
    Page.cmd('dbQuery',[query],function(res){
      this.getUsers();
    }.bind(this));
  }

  getUsers(){
    const query = "SELECT * FROM user WHERE added IS NOT NULL AND user_name IS NOT NULL ORDER BY user_name";
    Page.cmd('dbQuery',[query],function(res){
      this.setState({users:res});
    }.bind(this));
  }

  onUserSelectChange(e){
    this.setState({user:e.target.value});
  }

  addChannelModerator(e){
    e.preventDefault();
    const state = store.getState();
    const inner_path = "merged-"+state.config.merger_name+"/"+state.config.cluster+"/data/users/"+state.site_info.auth_address+"/data.json";
    Page.cmd('fileGet',{inner_path:inner_path},function(data){
      data = JSON.parse(data);
      if (data){
        if (!data.moderator){
          data.moderator = [];
          data.next_moderator_id = 1;
        }
      } else {
        data = {
          "moderator":[],
          "next_moderator_id":1
        }
      }
      const user = this.state.users.find((u) => u.user_name === this.state.user);
      const moderator = {
        moderator_id:state.site_info.auth_address+"_moderator_"+data.next_moderator_id,
        user_id:user.user_id,
        user_name:user.user_name,
        channel_id:store.getState().channels.channel.channel_id,
        added:Date.now()
      }
      data.moderator.push(moderator);
      data.next_moderator_id += 1;
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        console.log(res)
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          console.log(res);
          Page.cmd("wrapperNotification", ["done", "Moderator Added!", 10000]);
          this.props.addModerator(moderator);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  render(){
    let userSelectInput;
    if (this.state.users){
      const users = this.state.users.map((user,index) => (
        <option key={index} value={user.user_name}>{user.user_name}</option>
      ));
      userSelectInput = (
        <select
          className="ui fluid dropdown"
          onChange={this.onUserSelectChange}
          defaultValue={this.state.user}>
          {users}
        </select>
      );
    }
    return(
      <div id="moderator-form-container" className="form-container">
        <form id="moderator-form" className="ui form segment lightgray">
          <div className="ui field">
            {userSelectInput}
          </div>
          <button className="native-btn">
            <a onClick={this.addChannelModerator}>Add Moderator</a>
          </button>
        </form>
      </div>
    )
  }
}
