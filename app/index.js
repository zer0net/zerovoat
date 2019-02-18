const { Provider, connect } = ReactRedux;
const store = Redux.createStore(reducer);

class App extends React.Component {

  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.initApp = this.initApp.bind(this);
    this.checkMergerPermissions = this.checkMergerPermissions.bind(this);
    this.getMergerSites = this.getMergerSites.bind(this);
    this.addMergerSites = this.addMergerSites.bind(this);
    this.createCertificate = this.createCertificate.bind(this);
    this.certSelect = this.certSelect.bind(this);
    this.finishLoadingApp = this.finishLoadingApp.bind(this);
  }

  componentDidMount() {
    this.initApp();
  }

  initApp(){
    Page.cmd('serverInfo', {}, function(server_info) {
      store.dispatch(setServerInfo(server_info));
      Page.cmd('siteInfo',{},function(site_info){
        store.dispatch(setSiteInfo(site_info));
        Page.cmd('wrapperGetLocalStorage',[],function(local_storage){
          store.dispatch(setLocalStorage(local_storage));
          Page.cmd('feedListFollow', [], function(feed){
            store.dispatch(setFeedListFollow(feed));
            Page.cmd('fileGet',{'inner_path':'data/config.json'},function(config){
              config = JSON.parse(config);
              store.dispatch(setSiteConfig(config));
              this.checkMergerPermissions();
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  checkMergerPermissions() {
    const state = store.getState();
    if (state.site_info.settings.permissions.indexOf('Merger:'+state.config.merger_name) > -1){
      this.getMergerSites();
    } else {
      Page.cmd('wrapperPermissionAdd', 'Merger:'+state.config.merger_name, function(res) {
        this.getMergerSites();
      }.bind(this));
    }
  }

  getMergerSites(){
    Page.cmd("mergerSiteList", {query_site_info: true}, function(res) {
      const state = store.getState();
      const missingSiteList = appHelpers.generateMissingSiteList(res,state.config.clusters);
      if (missingSiteList.length > 0){
        this.addMergerSites(missingSiteList);
      } else {
        this.routeApp();
      }
    }.bind(this));
  }

  addMergerSites(missingSiteList){
    Page.cmd("mergerSiteAdd",{"addresses":missingSiteList},function(data){
      Page.cmd("wrapperNotification", ["info", "if this is a fresh ZeroNet install, please wait for a few minutes until ZeroNet installs all the relevant plugins, before you register", 20000]);
      Page.cmd("wrapperNotification", ["info", "refresh this site to view new content", 10000]);
    }.bind(this));
  }

  routeApp(){
    const route = appHelpers.generateAppRoute(window.location.search);
    store.dispatch(setAppRoute(route));
    if (!store.getState().local_storage.zv_cert_created){
      if (store.getState().site_info.cert_user_id && store.getState().site_info.cert_user_id.split('@')[1] === "zv.anonymous"){
        // console.log('zv anonymous cert created');
      } else {
        this.createCertificate();
      }
    }
    this.finishLoadingApp();
  }

  createCertificate(){
    if (!name) name = appHelpers.generateRandomString(13);
    const certname = "zv.anonymous";
    const genkey = "5JLwSwpk8mN7FmgC8zAAdXHiHyky928UAh3vDJpNWVetsjTxyLV";
    const genid =  bitcoin.ECPair.fromWIF(genkey);
    const cert = bitcoin.message.sign(genid, (store.getState().site_info.auth_address + "#web/") + name.slice(0,13)).toString("base64");
    const self = this;
    Page.cmd("certAdd", [certname, "web", name, cert], function(res){
      const local_storage = store.getState().local_storage;
      local_storage['zv_cert_created'] = true;
      Page.cmd("wrapperSetLocalStorage",local_storage);
      self.certSelect();
    }.bind(this));
  }

  certSelect(){
    Page.selectUser();
    Page.onRequest = function(cmd, message) {
      if (cmd === "setSiteInfo" && message.address === store.getState().site_info.address) {
        store.dispatch(loadingUser(true));
        store.dispatch(changeCert(message.auth_address,message.cert_user_id));
        // getUser();
      }
    };
  }

  finishLoadingApp(){
    const th = this;
    th.setState({loading:false});
  }

  render(){

    let templateDisplay;
    if (this.state.loading){
      templateDisplay = (
        <div id="main-site-loader" className="ui segment">
          <p></p>
          <p></p>
          <p></p>
          <div className="ui active dimmer">
            <LoadingCubeGrid/>
            <b>Loading Zite</b>
          </div>
        </div>
      )
    } else {
      templateDisplay = (
        <Template loading={this.state.loading} />
      )
    }

    return (
      <Provider store={store}>
        {templateDisplay}
      </Provider>
    )
  }
}

ReactDOM.render(<App />,document.getElementById('app'));
