const Loading = (props) => {
  let cssClass = "ui active loader inline text";
  let loadingText = "Loading";
  if (props.msg) loadingText = props.msg;
  if (props.cssClass) cssClass += " " + props.cssClass;
  return (
    <div className={cssClass}>{loadingText}</div>
  )
}

const LoadingCubeGrid = (props) => (
  <div className="sk-cube-grid">
    <div className="sk-cube sk-cube1"></div>
    <div className="sk-cube sk-cube2"></div>
    <div className="sk-cube sk-cube3"></div>
    <div className="sk-cube sk-cube4"></div>
    <div className="sk-cube sk-cube5"></div>
    <div className="sk-cube sk-cube6"></div>
    <div className="sk-cube sk-cube7"></div>
    <div className="sk-cube sk-cube8"></div>
    <div className="sk-cube sk-cube9"></div>
  </div>
)

class ItemMediaContainer extends React.Component {

  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.initItemMediaContainer = this.initItemMediaContainer.bind(this);
    this.onGetFile = this.onGetFile.bind(this);
    this.getFile = this.getFile.bind(this);
    this.onGetEmbededFile = this.onGetEmbededFile.bind(this);
    this.getOptionalFileInfo = this.getOptionalFileInfo.bind(this);
    this.handleExternalEmbedUrl = this.handleExternalEmbedUrl.bind(this);
    this.showExternalLink = this.showExternalLink.bind(this);
    this.onImageLoadError = this.onImageLoadError.bind(this);
    this.onImageLoad = this.onImageLoad.bind(this);
  }

  componentDidMount() {
    this.initItemMediaContainer();
  }

  initItemMediaContainer(){
    let item;
    if (this.props.topic) item = this.props.topic;
    else if (this.props.comment) item = this.props.comment;
    else if (this.props.profile) item = this.props.profile;
    if (item.file_to_item_id || item.added <= 1498441955800){
      this.onGetFile();
    } else if (item.embed_url){
      this.onGetEmbededFile(item);
    }
  }

  onGetFile(){
    let fileToItemId;
    if (this.props.topic) fileToItemId = this.props.topic.file_to_item_id;
    else if (this.props.comment) fileToItemId = this.props.comment.file_to_item_id;
    else if (this.props.profile) fileToItemId = this.props.profile.file_to_item_id;
    if (fileToItemId){
      this.setState({file:true},function(){
        const query = fileHelpers.getFileToItemQuery(fileToItemId);
        Page.cmd('dbQuery',[query],function(res){
          if (res.length > 0){
            this.getFile(res[0].file_id);
          } else {
            console.log('no file to item');
          }
        }.bind(this));
      });
    } else {
      this.getFile();
    }
  }

  getFile(fileId){
    let query;
    if (!fileId) query = "SELECT * FROM file WHERE item_id='"+this.props.topic.topic_id+"'";
    else query = fileHelpers.getFileQuery(fileId);
    Page.cmd('dbQuery',[query],function(res){
      if (res.length > 0){
        const file = res[0];
        const mediaType = fileHelpers.determineFileMediaType(file.file_type);
        const config = store.getState().config;
        let directory = file.directory;
        if (!file.directory) directory = store.getState().config.cluster + "/data/users/"+file.user_id;
        const inner_path = "merged-"+config.merger_name+"/"+directory+"/"+file.file_name;
        this.getOptionalFileInfo(inner_path,mediaType,file.file_type);
      } else {
        console.log('no file');
      }
    }.bind(this));
  }

  onGetEmbededFile(item){
    const lastDot = item.embed_url.lastIndexOf('.');
    const fileType = item.embed_url.substring(lastDot + 1);
    const mediaType = fileHelpers.determineFileMediaType(fileType);
    let urlIsExternal = false;
    if (item.embed_url.indexOf('http:') > -1 || item.embed_url.indexOf('https:') > -1) urlIsExternal = true;
    if (urlIsExternal) this.handleExternalEmbedUrl(item.embed_url,mediaType,fileType);
    else this.getOptionalFileInfo(item.embed_url,mediaType,fileType);
  }

  getOptionalFileInfo(inner_path,mediaType,fileType){
    Page.cmd("optionalFileInfo", inner_path, function(res){
      let peers, piecesInfo;
      if (res) {
        peers = res.peer;
        piecesInfo = fileHelpers.getItemFilePiecesInfo(res);
      }
      this.setState({
        filePath:inner_path,
        fileType:fileType,
        mediaType:mediaType,
        peers:peers,
        piecesInfo:piecesInfo,
        loading:false
      },function(){
        const downloads = res && res.is_downloaded === 1 && res.is_downloading === 1;
        if (!res.uploaded || downloads){
          if (res.pieces === res.pieces_downloaded){
            this.setState({downloadState:'downloaded'});
          } else {
            const partialyDownloads = res.is_downloading === 1 || res.is_downloaded ===  1;
            const someData = res.pieces_downloaded > 0 || res.bytes_downloaded > 0;
            if (someData || partialyDownloads){
              this.setState({downloadState:'downloading'});
              this.downloadFile(res,inner_path);
            } else {
              this.setState({downloadState:'downloading'});
              this.downloadFile(res,inner_path);
            }
          }
        }
      });
    }.bind(this));
  }

  downloadFile(fileInfo,inner_path){
    Page.cmd("fileNeed", inner_path, function(res) {
      const th = this;
      Page.onRequest = function(cmd, message) {
        const clusterId = inner_path.split("/")[1];
        const filePath = inner_path.split(clusterId + "/")[1];
        let msgInfo, eventPath, fileChunk;
        if (message.event[0]) msgInfo = message.event[0];
        if (message.event[1]) eventPath = message.event[1];
        if (eventPath && eventPath.indexOf('|') > -1) {
            fileChunk = eventPath.split('|')[1];
            eventPath = eventPath.split('|')[0];
        }
        if (cmd == "setSiteInfo" && eventPath === filePath) {
          if (msgInfo === "file_failed"){
            th.updateFilePiecesInfo(fileChunk,msgInfo);
            th.setState({downloadState:'download failed'});
          } else {
            Page.cmd("optionalFileInfo",inner_path,function(res){
              const piecesInfo = fileHelpers.getItemFilePiecesInfo(res);
              th.setState({
                piecesInfo:piecesInfo
              },function(){
                clearInterval(this.checkDownloadDuration);
              });
            }.bind(th));
          }
        }
      }
    }.bind(this));
  }

  updateFilePiecesInfo(fileChunk,msgInfo){
    const fileChunkStart = parseInt(fileChunk.split('-')[0]);
    const fileChunkEnd = parseInt(fileChunk.split('-')[1]);
    const piecesInfo = this.state.piecesInfo.map((pi) => {
      if (pi.start === fileChunkStart || pi.end === fileChunkEnd) {
        if (msgInfo === 'file_failed'){
          return Object.assign({}, pi, {
            state:'failed'
          });
        }
      } else {
        return pi;
      }
    });
    this.setState({piecesInfo:piecesInfo});
  }

  handleExternalEmbedUrl(inner_path,mediaType,fileType){
    this.setState({
      filePath:inner_path,
      fileType:fileType,
      mediaType:mediaType,
      loading:false,
      external:true,
      show_external:false
    });
  }

  showExternalLink(){
    this.setState({show_external:true});
  }

  onImageLoadError(){
    this.setState({loaded:true,error:true});
  }

  onImageLoad(){
    this.setState({loaded:true});
  }

  render(){
    let mediaDisplay,
        peerDisplay,
        filePiecesDisplay,
        containerCssClass = "item-media-container";

    let mediaItemExternalTagLine;
    if (this.state.external){
      mediaItemExternalTagLine = this.props.topic.embed_url;
    }


    if (this.state.loading){
      mediaDisplay = <Loading cssClass={"centered"} msg={"Loading Item Media..."}/>;
    } else {
      if (!this.state.mediaType){
        mediaDisplay = (<img className="not-found" src="assets/img/404-not-found.png"/>);
      } else if (this.state.external && !this.state.show_external){
        mediaDisplay = (
          <div>
            <div onClick={this.showExternalLink} className="external-link-overlay">
              External!<br/>Load?
            </div>
            {mediaItemExternalTagLine}
          </div>
        );
      } else {
        if (this.state.external){
          peerDisplay = (
            <div className="item-media-peers-display red">
              external
            </div>
          );
        } else {
          peerDisplay = (
            <div className="item-media-peers-display">
              peers : {this.state.peers}
            </div>
          );
        }

        if (this.state.piecesInfo && this.state.piecesInfo.length > 0) {
          filePiecesDisplay = (
            <ItemFileInfoDownloadBar
              piecesInfo={this.state.piecesInfo}
              downloadState={this.state.downloadState}
            />
          );
          containerCssClass += " w-pieces ";
        }
        if (this.state.mediaType === 'image'){
          containerCssClass += " image";
          if (!this.state.loaded) containerCssClass += " image-loading ui segment";
          if (this.state.error){
            mediaDisplay = (<img className="not-found" src="assets/img/404-not-found.png"/>);
          } else {
            mediaDisplay = (
              <div>
                <img
                  onError={this.onImageLoadError}
                  onLoad={this.onImageLoad}
                  src={this.state.filePath}/>
                  {mediaItemExternalTagLine}
              </div>
            );
          }
        } else if (this.state.mediaType === 'video' || this.state.mediaType === 'audio'){
          mediaDisplay = (
            <div>
              <VideoPlayer
                filePath={this.state.filePath}
                fileType={this.state.fileType}
                mediaType={this.state.mediaType}
                comment={this.props.comment}>
              </VideoPlayer>
              {mediaItemExternalTagLine}
            </div>
          );
          containerCssClass += " video";
        }
      }
    }
    return (
      <div className={containerCssClass}>
        {mediaDisplay}
        {peerDisplay}
        {filePiecesDisplay}
      </div>
    )
  }
}

class ItemHtmlBodyRender extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.replaceMediaInContent = this.replaceMediaInContent.bind(this);
    this.onContentChunkClick = this.onContentChunkClick.bind(this);
  }

  componentDidMount() {
    this.setState({content:this.props.content,mediaItemIndex:1},function(){
        this.replaceMediaInContent();
    });
  }

  replaceMediaInContent(){

    let oTag, cTag, checkInner = false;
    if (this.state.content.indexOf('<figure') > -1){
      oTag = '<figure';
      cTag = '</figure>';
      checkInner = true;
    } else if (this.state.content.indexOf('<img') > -1){
      oTag = '<img';
      cTag = '>';
    }

    if (oTag){

      const removedMediaItemHtml = oTag + this.state.content.split(oTag)[1].split(cTag)[0] + cTag;
      const contentChunkBefore = this.state.content.split(removedMediaItemHtml)[0];
      const content = this.state.content.split(removedMediaItemHtml)[1];

      let hasInner = true;
      if (checkInner){
        if (removedMediaItemHtml.indexOf('<img') > -1) hasInner = true;
        else hasInner = false;
      }

      let contentChunks = [],
          removedMediaItems = [],
          mediaItemIndex = this.state.mediaItemIndex;
      if (hasInner === true){
        let removedMediaItem = {
            // html:removedMediaItemHtml,
            index:this.state.mediaItemIndex
        }
        removedMediaItems = [removedMediaItem];
        if (this.state.removedMediaItems) removedMediaItems = removedMediaItems.concat(this.state.removedMediaItems);
        const mediaContentUrl = 'http' + removedMediaItemHtml.split('"http')[1].split('"')[0];

        const replacementMediaContent = '<a class="toggle-media-item-link" style="cursor:pointer;" rel="'+this.state.mediaItemIndex+'">'+
                                          // + ' - ' +
                                          '(Warning: EXTERNAL Source, click to show) ' + mediaContentUrl +
                                        '</a>';

        removedMediaItem.html =
          '<div class="media-item-wrapper">' +
            '<a class="toggle-media-item-link" style="cursor:pointer;" rel="close-'+this.state.mediaItemIndex+'">'+
              // + ' - ' +
              '(Warning: EXTERNAL Source, click to show) ' + mediaContentUrl +
            '</a>' +
            '</hr>' +
            removedMediaItemHtml +
          '</div>';

        contentChunks = [contentChunkBefore,replacementMediaContent];
        if (this.state.contentChunks) contentChunks = contentChunks.concat(this.state.contentChunks);

        mediaItemIndex = this.state.mediaItemIndex += 1;
      } else {
        removedMediaItems = this.state.removedMediaItems;
        contentChunks = this.state.contentChunks;
      }

      this.setState({
        contentChunks:contentChunks,
        removedMediaItems:removedMediaItems,
        mediaItemIndex:mediaItemIndex,
        content:content
      },function(){
        this.replaceMediaInContent();
      });

    } else {

      let contentChunks = [];
      if (this.state.contentChunks) contentChunks = this.state.contentChunks;
      contentChunks = contentChunks.concat(this.state.content);
      this.setState({
        contentChunks:contentChunks,
        loading:false
      });

    }
  }

  onContentChunkClick(e){
    let rel, action;
    if (e.target.rel && e.target.rel.indexOf('close') > -1){
      rel = e.target.rel.split('-')[1];
      action = 'close';
    } else {
      rel = parseInt(e.target.rel);
      action = 'open';
    }

    if (action === "open"){
      let clickedMediaItemHtml;
      this.state.removedMediaItems.forEach(function(rmi,index){
        if (rel === rmi.index) clickedMediaItemHtml = rmi.html;
      });
      $('a[rel="'+rel+'"]').replaceWith(clickedMediaItemHtml);
    } else {
      $(e.target).attr('rel',rel);
      $(e.target).next('img').remove();
    }
  }

  render(){
    if (this.state.loading){
      return (
        <div className="ui segment">
          <Loading msg="loading content" cssClass="centered"/>
        </div>
      )
    } else {
      const contentChunksDisplay = this.state.contentChunks.map((cc,index) => (
        <article onClick={this.onContentChunkClick} key={index} dangerouslySetInnerHTML={{__html: cc}}></article>
      ));
      return (
        <article className="ui">
          {contentChunksDisplay}
        </article>
      )
    }
  }
}

class itemHtmlBodyExternalLinkOverlay extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  render(){
    return (
      <div class="external-link-overlay">External!<br/>Load?</div>
    )
  }
}

class ItemFileInfoDownloadBar extends React.Component {
  render(){
    let pieces, containerCssClass = "";
    if (this.props.piecesInfo.length > 0){
      pieces = this.props.piecesInfo.map((pi,i) => (
        <ItemFileInfoDownloadBarPiece
          key={i}
          piece={pi}
          piecesLength={this.props.piecesInfo.length}
        />
      ));
    } else {
      if (this.props.fileInfo && this.props.fileInfo.is_downloaded === 1){
        containerCssClass = "non-bfs-loaded";
      }
    }

    return (
      <div className={"item-file-piece-download-info-container " + containerCssClass}>
        {pieces}
        <span className="download-status">{this.props.downloadState}</span>
      </div>
    );
  }
}

class ItemFileInfoDownloadBarPiece extends React.Component {
  render(){
    const pieceWidth = 100 / this.props.piecesLength;
    let containerClass = "ui progress ";
    if (this.props.piece.state === 'complete') containerClass += " success";
    else if (this.props.piece.state === 'downloading') containerClass += " active";
    else if (this.props.piece.state === 'failed') containerClass += "error";

    return (
      <div style={{width:pieceWidth+'%'}} className={"piece " + this.props.piece.state}>
        <div className={containerClass}>
          <div className="bar">
            <div className="progress"></div>
          </div>
        </div>
      </div>
    );
  }
}

class ItemEditToolBar extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.getItemCurrentModeration = this.getItemCurrentModeration.bind(this);
    this.toggleTopicVisibility = this.toggleTopicVisibility.bind(this);
    this.toggleItemVisibility = this.toggleItemVisibility.bind(this);
    this.onCreateModeration = this.onCreateModeration.bind(this);
    this.createModeration = this.createModeration.bind(this);
    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    this.onDeleteTopic = this.onDeleteTopic.bind(this);
    this.deleteTopic = this.deleteTopic.bind(this);
  }

  componentDidMount() {
    this.getItemCurrentModeration();
  }

  getItemCurrentModeration(){
    let itemId;
    if (this.props.topic) itemId = this.props.topic.topic_id;
    else if (this.props.comment) itemId = this.props.comment.comment_id;
    const query = "SELECT * FROM moderation WHERE item_id='"+itemId+"' AND current=1";
    Page.cmd('dbQuery',[query],function(res){
      if (res.length > 0){
        this.setState({moderation:res[0],loading:false});
      } else {
        this.setState({loading:false});
      }
    }.bind(this));
  }

  toggleTopicVisibility(){
    let moderation = {
      channel_id:this.props.topic.channel_id,
      item_type:'topic',
      item_id:this.props.topic.topic_id,
      moderator_name:store.getState().user.user_name,
      topic_id:this.props.topic.topic_id,
      moderation_type:'visibility'
    };
    this.toggleItemVisibility(this.props.topic,moderation);
  }

  toggleItemVisibility(item,moderation){
    moderation.moderation_type = 'visibility';
    if (!this.state.moderation || this.state.moderation.visible === 1){
      moderation.visible = 0;
    } else {
      moderation.visible = 1;
    }
    moderation.current = 1;
    this.onCreateModeration(item,moderation);
  }

  onCreateModeration(item,moderation){
    const state = store.getState();
    if (this.state.moderation){
      const query = "SELECT * FROM json WHERE json.json_id='"+this.state.moderation.json_id+"'";
      Page.cmd('dbQuery',[query],function(res){
        const json = res[0];
        const inner_path = "merged-"+state.config.merger_name+
                     "/"+json.directory+
                     "/"+json.file_name;
        this.createModeration(inner_path,moderation);
      }.bind(this));
    } else {
      const inner_path = "merged-"+state.config.merger_name+
                   "/"+state.config.cluster+
                   "/data/users/"+state.site_info.auth_address+
                   "/data.json";
      this.createModeration(inner_path,moderation);
    }
  }

  createModeration(inner_path,moderation){
    Page.cmd('fileGet',{inner_path:inner_path},function(data){
      data = JSON.parse(data);
      if (data){
        if (!data.moderation){
          data.moderation = [];
          data.next_moderation_id = 1;
        }
      } else {
        data = {
          "moderation":[],
          "next_moderation_id":1
        }
      }

      if (this.state.moderation){
        const moderationIndex = data.moderation.findIndex((m) => m.moderation_id === this.state.moderation.moderation_id);
        data.moderation[moderationIndex].current = 0;
      }
      moderation.moderation_id = store.getState().site_info.auth_address+"mod"+data.next_moderation_id;
      data.moderation.push(moderation);
      data.next_moderation_id += 1;
      const json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          this.getItemCurrentModeration();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  handleDeleteItemClick(){
    jQuery('#'+this.props.topic.topic_id + "-delete-modal").modal('show');
  }

  onDeleteTopic(){
    const query = "SELECT * FROM json WHERE json_id='"+this.props.topic.json_id+"'";
    Page.cmd('dbQuery',[query],function(res){
      const inner_path = "merged-"+store.getState().config.merger_name+"/"+res[0].directory;
      this.deleteTopic(inner_path);
    }.bind(this));
  }

  deleteTopic(inner_path){
    Page.cmd('fileGet',{inner_path:inner_path + "/data.json"},function(data){
      data = JSON.parse(data);
      let fileToDeleteNames = [],
          fileToDeleteIDs = [],
          fileToItemToDeleteIDs = [];
      if (this.props.topic.file_id){
        fileToDeleteNames.push(this.props.topic.file_name);
        const fileIndex = data.file.findIndex((f) => f.file_id === this.props.topic.file_id);
        fileToDeleteIDs.push(data.file[fileIndex].file_id);
        const fileToItemIndex = data.file_to_item.findIndex((fti) => fti.file_to_item_id === this.props.topic.file_to_item_id);
        fileToItemToDeleteIDs.push(data.file_to_item[fileToItemIndex].file_to_item_id);
      }
      const query = commentHelpers.getCommentsQuery(this.props.topic.topic_id,store.getState().site_info.cert_user_id);
      Page.cmd('dbQuery',[query],function(res){
        let commentsToDeleteIDs = [];
        if (res.length > 0){
          const comments = res;
          comments.forEach(function(comment,index){
            commentsToDeleteIDs.push(comment.comment_id);
            if (comment.file_name){
              fileToDeleteNames.push(comment.file_name);
              const fileIndex = data.file.findIndex((f) => f.file_id === comment.file_id);
              fileToDeleteIDs.push(data.file[fileIndex].file_id);
              const fileToItemIndex = data.file_to_item.findIndex((fti) => fti.file_to_item_id === comment.file_to_item_id);
              fileToItemToDeleteIDs.push(data.file_to_item[fileToItemIndex].file_to_item_id);
            }
          });
        }
        if (fileToDeleteIDs.length > 0 || commentsToDeleteIDs.length > 0){
          this.deleteTopicRelatedItems(data,inner_path,commentsToDeleteIDs,fileToDeleteNames,fileToDeleteIDs,fileToItemToDeleteIDs);
        } else {
          this.finishDeleteTopic(data,inner_path);
        }
      }.bind(this));
    }.bind(this));
  }

  deleteTopicRelatedItems(data,inner_path,commentsToDeleteIDs,fileToDeleteNames,fileToDeleteIDs,fileToItemToDeleteIDs){
    if (fileToDeleteIDs && fileToDeleteIDs.length > 0){
      fileToDeleteIDs.forEach(function(ftd,index){
        const fileIndex = data.file.findIndex((f) => f.file_id === ftd);
        data.file.splice(fileIndex,1);
        const fileToItemIndex = data.file_to_item.findIndex((fti) => fti.file_to_item_id === fileToItemToDeleteIDs[index]);
        data.file_to_item.splice(fileToItemIndex,1);
      });
      this.setState({fileToDeleteNames:fileToDeleteNames,fileToDeleteIndex:0},function(){
        this.onDeleteTopicRelatedFiles(data,inner_path,commentsToDeleteIDs);
      });
    } else if (commentsToDeleteIDs.length > 0){
      commentsToDeleteIDs.forEach(function(ctd,index){
        const commentIndex = data.comment.findIndex((c) => c.comment_id === ctd);
        data.comment.splice(commentIndex, 1);
      });
      this.finishDeleteTopic(data,inner_path);
    }
  }

  onDeleteTopicRelatedFiles(data,inner_path,commentsToDeleteIDs){
    if (this.state.fileToDeleteNames.length === this.state.fileToDeleteIndex){
      this.deleteTopicRelatedItems(data,inner_path,commentsToDeleteIDs)
    } else {
      Page.cmd('fileDelete',{inner_path:inner_path + "/" + this.state.fileToDeleteNames[this.state.fileToDeleteIndex]},function(res){
        this.setState({fileToDeleteIndex:this.state.fileToDeleteIndex += 1},function(){
          this.onDeleteTopicRelatedFiles(data,inner_path,commentsToDeleteIDs)
        });
      }.bind(this));
    }
  }

  finishDeleteTopic(data,inner_path){
    const topicIndex = data.topic.findIndex((t) => t.topic_id === this.props.topic.topic_id);
    data.topic.splice(topicIndex,1);
    const json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
    Page.cmd("fileWrite", [inner_path + "/data.json", btoa(json_raw)], function(res) {
      Page.cmd("sitePublish",{"inner_path":inner_path + "/data.json"}, function(res) {
        if (store.getState().route.view === 'topic'){
          window.top.location.href = "index.html?v=channel+id="+this.props.topic.channel_id;
        } else {
          this.props.onDeleteTopic();
        }
      }.bind(this));
    }.bind(this));
  }

  render(){
    let itemEditToolBarDisplay;
    if (!this.state.loading){
      if (this.props.topic){
        const t = this.props.topic;
        let visibilityIconCssClass = "icon toggle on",
            visibilityIconText = "hide";

        if (this.state.moderation && this.state.moderation.current === 1 && this.state.moderation.visible === 0){
          visibilityIconCssClass = "icon toggle off";
          visibilityIconText = "show";
        }

        itemEditToolBarDisplay = (
          <div className="topic-edit-tool-bar">
            <a href={"index.html?v=user-admin+s=edit-topic+id="+t.topic_id}><i className="icon edit"></i> edit</a>
          </div>
        );

        /*<a onClick={this.toggleTopicVisibility}><i className={visibilityIconCssClass}></i> {visibilityIconText}</a>
        <a onClick={this.handleDeleteItemClick}><i className="icon trash"></i> delete</a>*/

      }
    }
    return (
      <div className="item-edit-tool-bar-container">
        {itemEditToolBarDisplay}
        <div className="ui basic mini modal confirm-delete-file-modal " id={this.props.topic.topic_id + "-delete-modal"}>
          <div className="ui icon header">
            <i className="trash icon"></i>
            Are You Sure?
          </div>
          <div className="content">
            <p>all peer , comment & vote information would be irreversibly removed!</p>
          </div>
          <div className="actions">
            <div className="ui red basic cancel inverted button">
              <i className="remove icon"></i>
              Cancel
            </div>
            <div className="ui green ok inverted button" onClick={this.onDeleteTopic}>
              <i className="checkmark icon"></i>
              Yes
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class VideoPlayer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
  }

  componentDidMount() {
    let itemId = "";
    if (this.props.topic) itemId = this.props.topic.topic_id;
    else if (this.props.comment) itemId = this.props.comment.comment_id;
    this.setState({itemId:itemId},function(){
      videojs('video-player' + itemId,{});
    });
  }

  render(){

    let fileType = this.props.fileType;
    let mediaType = this.props.mediaType;
    if (this.props.fileType === 'mpeg'){
        fileType = 'mp3';
        mediaType = 'audio';
    }
    return (
      <video
        id={"video-player"+this.state.itemId}
        className="video-js"
        controls={true}
        autoPlay={false}
        preload="auto">
          <source
            src={this.props.filePath}
            type={mediaType + '/' + fileType}
          />
      </video>
    )
  }
}

class ChannelSelectElement extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:true
    };
    this.getChannels = this.getChannels.bind(this);
  }

  componentDidMount() {
    this.getChannels();
  }

  getChannels(){
    const query = "SELECT * FROM channel WHERE channel_id IS NOT NULL";
    Page.cmd('dbQuery',[query],function(res){
      this.setState({channels:res,loading:false});
    }.bind(this))
  }

  render(){

    let channelId = this.props.channelId;
    if (!this.props.channelId) channelId = 0;

    let options;
    if (this.state.channels){
      options = this.state.channels.map((o,index) => {
        if (o.channel_id === channelId){
          return (
            <option selected="selected" key={index} value={o.channel_id}>{o.name}</option>
          )
        } else {
          return (
            <option key={index} value={o.channel_id}>{o.name}</option>
          )
        }
      });
    }

    return (
        <select
          className="ui fluid dropdown"
          autoComplete="off"
          defaultValue={channelId}
          disabled={this.props.disabled}
          onChange={this.props.onTopicChannelSelect}>
          <option disabled value="0">select channel</option>
          {options}
        </select>
    )
  }
}

class UserAvatarDisplay extends React.Component {
  constructor(props){
  	super(props);
    this.state = {
      loading:true
    };
    this.getUserAvatar = this.getUserAvatar.bind(this);
    this.setDefaultUserAvatarDisplay = this.setDefaultUserAvatarDisplay.bind(this);
    this.onImageLoadError = this.onImageLoadError.bind(this);
  }

  componentDidMount() {
    if (this.props.filePath){
      this.setState({filePath:this.props.filePath,loading:false});
    } else {
      this.getUserAvatar();
    }
  }

  getUserAvatar(){
    const query = userHelpers.getUserAvatarQuery(this.props.userId);
    Page.cmd('dbQuery',[query],function(res){
      if (res.length > 0){
        const file = res[0];
        if (file.cluster_id){
          const filePath = "merged-"+store.getState().config.merger_name+
                           "/"+file.cluster_id+
                           "/data/users/"+file.user_id+
                           "/"+file.file_name;
          this.setState({filePath:filePath,loading:false});
        } else {
          const query = "SELECT * FROM json WHERE json_id='"+file.json_id+"'";
          Page.cmd('dbQuery',[query],function(res){
            const json = res[0];
            const filePath = "merged-"+store.getState().config.merger_name+
                             "/"+json.directory+
                             "/"+file.file_name;
            this.setState({filePath:filePath,loading:false});
          }.bind(this));
        }
      } else {
        this.setDefaultUserAvatarDisplay();
      }
    }.bind(this));
  }

  setDefaultUserAvatarDisplay(){
    let userName;
    if (this.props.userName){
      userName = this.props.userName;
    } else {
      userName = store.getState().site_info.auth_address;
    }
    const initials = userName.substring(0,2);
    const bgColor = userHelpers.randomRgba(userName);
    this.setState({loading:false,initials:initials,bgColor:bgColor});
  }

  onImageLoadError(){
    this.setState({loading:true,filePath:''},function(){
      this.setDefaultUserAvatarDisplay();
    });
  }

  render(){
    let userAvatar;
    if (!this.state.loading){
     if (this.state.filePath){
       userAvatar = (
         <img
           onError={this.onImageLoadError}
           className="comment-avatar"
           src={this.state.filePath}/>
       );
     } else {
        let width = "28", height = "28";
        if (this.props.dimensions) {
          width = this.props.dimensions;
          height = this.props.dimensions;
        }
        userAvatar = (
          <div className="user-avatar initials" style={{width:width + "px",height:height + "px"}}>
            <span style={{background:this.state.bgColor}}>{this.state.initials}</span>
          </div>
        );
        // <canvas width={width} height={height} data-jdenticon-value={this.props.userId}></canvas>
      }
    }
    return (
      <div className="user-avatar-display-container">
        {userAvatar}
      </div>
    )
  }
}

class UserAvatarForm extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.onUserAvatarFileChange = this.onUserAvatarFileChange.bind(this);
    this.readFile = this.readFile.bind(this);
    this.onUploadUserAvatarFile = this.onUploadUserAvatarFile.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.createFile = this.createFile.bind(this);
    this.removeUserAvatar = this.removeUserAvatar.bind(this);
    this.deleteUserAvatar = this.deleteUserAvatar.bind(this);
  }

  onUserAvatarFileChange(e){
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

  onUploadUserAvatarFile(){
    const state = store.getState();
    const inner_path = "merged-"+state.config.merger_name+
                       "/"+state.config.cluster+
                       "/data/users/"+state.site_info.auth_address+
                       "/"+this.state.file.file_name;
    this.setState({file_inner_path:inner_path},function(){
      if (this.props.user.file_id){
        this.removeUserAvatar();
      } else {
        this.uploadFile(inner_path);
      }
    });
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
        this.createFile();
      }.bind(this));
      req.withCredentials = true
      req.open("POST", init_res.url)
      req.send(formdata)
    }.bind(this));
  }

  createFile(){

    const state = store.getState();
    const inner_path = "merged-"+state.config.merger_name+
                       "/"+state.config.cluster+
                       "/data/users/"+state.site_info.auth_address+
                       "/data.json";

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

      const auth_address = store.getState().site_info.auth_address;

      const file = {
        file_id:auth_address+"fl"+data.next_file_id,
        file_type:this.state.file.file_type,
        file_name:this.state.file.file_name,
        item_id:auth_address,
        item_type:'user',
        user_id:auth_address,
        added:Date.now()
      }

      data.file.push(file);
      data.next_file_id += 1;

      const file_to_item = {
        file_to_item_id:auth_address+"fti"+data.next_file_to_item_id,
        item_type:'user',
        item_id:auth_address,
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
          Page.cmd("wrapperNotification", ["done", "Avatar Created!", 5000]);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  removeUserAvatar(){
    const state = store.getState();
    const inner_path = "merged-"+state.config.merger_name+
                       "/"+this.props.user.cluster_id+
                       "/data/users/"+this.props.user.user_id+
                       "/data.json";
    Page.cmd('fileGet',{inner_path:inner_path},function(data){
      data = JSON.parse(data);
      const fIndex = data.file.findIndex((f) => f.file_id === this.props.user.file_id);
      const ftiIndex = data.file_to_item.findIndex((fti) => fti.file_to_item_id === this.props.user.file_to_item_id);
      data.file.splice(fIndex, 1);
      data.file_to_item.splice(ftiIndex, 1);
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          this.deleteUserAvatar()
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  deleteUserAvatar(){
    const state = store.getState();
    const inner_path = "merged-"+state.config.merger_name+
                       "/"+this.props.user.cluster_id+
                       "/data/users/"+this.props.user.user_id+
                       "/"+this.props.user.file_name;
    Page.cmd('fileDelete',{inner_path:inner_path},function(res){
      const query = userHelpers.getUserQuery(state.site_info.auth_address);
      Page.cmd('dbQuery',[query],function(res){
        const user = res[0];
        store.dispatch(setUser(user));
        if (this.state.file_inner_path) this.uploadFile(this.state.file_inner_path);
      }.bind(this));
    }.bind(this));
  }

  render(){
    let userAvatarDisplay;
    if (this.state.file){
      userAvatarDisplay = <img src={this.state.file.f.data}/>
    } else {
      let filePath;
      if (this.props.user.file_id){
        const state = store.getState();
        filePath = "merged-"+state.config.merger_name+"/"+this.props.user.cluster_id+"/data/users/"+this.props.user.user_id+"/"+this.props.user.file_name;
      }
      userAvatarDisplay = (
        <UserAvatarDisplay
          userId={this.props.user.user_id}
          userName={this.props.user.user_name}
          filePath={filePath}
          dimensions="100"
        />
      )
    }

    let uploadButtonDisplay;
    if (this.state.file){
      uploadButtonDisplay = (
        <button type="button" className="native-btn" onClick={this.onUploadUserAvatarFile}>
          <a>upload</a>
        </button>
      )
    }

    return (
      <div id="user-avatar-form-container">
        <div id="avatar-form-menu" className="ui compact segment lightgray">
          <a onClick={this.removeUserAvatar} className="item"><i className="ui icon remove"></i></a>
          <a className="item">
            <input type="file" accept="image/*" onChange={this.onUserAvatarFileChange}/>
            <i className="ui icon add"></i>
          </a>
        </div>
        {userAvatarDisplay}
        {uploadButtonDisplay}
      </div>
    )
  }
}
