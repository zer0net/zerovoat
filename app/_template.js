class Template extends React.Component {

  constructor(props){
  	super(props);
  	this.state = {};
    this.updateDimensions = this.updateDimensions.bind(this);
  }

  componentWillMount(){
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount(){
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions(){
    const device = appHelpers.getDeviceWidth(window.innerWidth);
    this.setState({device:device});
  }

  render(){
    if (this.state.loading){
      return (
        <div className="ui segment" id="main-site-loader">
          <div className="ui active dimmer">
            <div className="ui text loader">Loading</div>
          </div>
          <p></p>
        </div>
      )
    } else {

      const route = store.getState().route;
      let viewContainerDisplay = (
        <div className="column twelve wide computer sixteen wide tablet">
          <ViewContainer preview={this.props.preview}/>
        </div>
      );
      let sidebarContainerDisplay = (
        <div className="column four wide computer sixteen wide tablet">
          <SideBar preview={this.props.preview}/>
        </div>
      );
      if (route.view === 'user-admin' || !this.props.preview){
        if (route.section === 'edit-channel' || route.section === 'new-channel'){
          viewContainerDisplay = (
            <div className="column sixteen wide computer sixteen wide tablet">
              <ViewContainer />
            </div>
          );
          sidebarContainerDisplay = '';
        }
      }


      let mainContentDisplay;
      if (this.state.device === "large" || this.state.device === "mid"){
        mainContentDisplay = (
          <section id="main-content" className="ui container grid">
            {viewContainerDisplay}
            {sidebarContainerDisplay}
          </section>
        );
      } else if (this.state.device === "tablet" || this.state.device === "mobile"){
        mainContentDisplay = (
          <section id="main-content" className="ui container grid">
            {sidebarContainerDisplay}
            {viewContainerDisplay}
          </section>
        );
      }
      return (
        <main>
          <Header preview={this.props.preview}/>
          {mainContentDisplay}
        </main>
      )
    }
  }
}

class ViewContainer extends React.Component {
  render(){
    const route = store.getState().route;
    let viewDisplay;
    if (route.view === 'main' || route.view === 'channel' || route.view === 'search' || this.props.preview) viewDisplay = <MainView />;
    else if (route.view === 'topic') viewDisplay = <TopicView />;
    else if (route.view === 'channels') viewDisplay = <ChannelsView />;
    else if (route.view === 'user-admin') viewDisplay = <UserAdminViewWrapper />;
    return (
      <section id="content" className="ui segment">
        {viewDisplay}
      </section>
    )
  }
}

const MainView = (props) => {
  return (
    <div id="main-view" className="view-container">
      <TopicsWrapper />
    </div>
  );
}

const ChannelsView = (props) => (
  <div className="view-container" id="channels-view">
    <ChannelsListWrapper/>
  </div>
)
