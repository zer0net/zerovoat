class CommentsContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.toggleCommentFormDisplay = this.toggleCommentFormDisplay.bind(this);
  }

  componentDidMount() {
    store.dispatch(loadingComments(true));
    this.props.getComments();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.comments.loading === false){
      if (this.props.comments.items.length !== nextProps.comments.items.length){
        this.props.getComments();
      } else if (this.props.comments.sort_by !== nextProps.comments.sort_by){
        this.props.getComments();
      } else if (this.props.site_info && this.props.site_info.cert_user_id !== nextProps.site_info.cert_user_id){
        this.forceUpdate();
      }
    }
  }

  toggleCommentFormDisplay(){
    const showCommentForm = this.state.showCommentForm === true ? false : true;
    this.setState({showCommentForm:showCommentForm});
  }

  render(){
    const route = store.getState().route;
    let commentForm;
    if (route.view === 'topic') {
      if (this.state.showCommentForm){
        commentForm = (
          <div id="toggle-comment-form-container">
            <a id="toggle-comment-form" onClick={this.toggleCommentFormDisplay}>X</a>
            <CommentFormWrapper />
          </div>
        );
      } else {
        commentForm = (
          <a id="toggle-comment-form" onClick={this.toggleCommentFormDisplay}>
            <i className="comments outline icon"></i>
            Reply
          </a>
        );
      }
    }

    let commentListDisplay;
    if (this.props.comments.loading !== false) commentListDisplay = <DummyCommentList/>
    else commentListDisplay = <CommentList topic={this.props.topic} onGetComments={this.props.getComments} />;
    let commentListSortMenu;
    if (this.props.comments.items && this.props.comments.items.length > 0) commentListSortMenu = <CommentListSortMenu/>

    return (
      <div id="comments-container">
        {commentForm}
        {commentListSortMenu}
        {commentListDisplay}
      </div>
    )
  }
}

const mapStateToCommentsContainerProps = (state, props) => {
  const comments = state.comments;
  const site_info = state.site_info;
  let topic;
  if (state.topics && state.topics.items) topic = state.topics.items[0];
  return {
    comments,
    site_info,
    topic
  }
}

const mapDispatchToCommentsContainerProps = (dispatch) => {
  return {
    dispatch
  }
}

const mergeCommentsContainerProps = (stateProps, dispatchProps) => {
  function getComments(){
    store.dispatch(loadingComments(true));
    const route = store.getState().route;
    let topicId,userId;
    if (route.view === 'topic') topicId = route.id;
    else if (route.view === 'user-admin') {
      if (route.section === 'comments'){
        userId = store.getState().site_info.cert_user_id;
      } else if (route.section === 'edit-topic'){
        topicId = route.id;
      }
    }
    const query = commentHelpers.getCommentsQuery(topicId,userId,store.getState().comments.sort_by);
    Page.cmd('dbQuery',[query],function(res){
      store.dispatch(setComments(res));
      store.dispatch(loadingComments(false));
    });
  }
  return {
    ...stateProps,
    ...dispatchProps,
    getComments
  }
}

const CommentsWrapper = ReactRedux.connect(
  mapStateToCommentsContainerProps,
  mapDispatchToCommentsContainerProps,
  mergeCommentsContainerProps
)(CommentsContainer);

class CommentListSortMenu extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.sortCommentList = this.sortCommentList.bind(this);
  }

  componentDidMount() {
    const sortOptions = commentHelpers.getCommentSortOptions();
    this.setState({sort_options:sortOptions},function(){
      store.dispatch(setCommentSortOptions(sortOptions))
    });
  }

  sortCommentList(value){
    this.setState({sort_by:value},function(){
      store.dispatch(sortComments(value));
    });
  }

  render(){
    let commentSortOptionsDisplay;
    if (this.state.sort_options){
      let sortBy = this.state.sort_by;
      if (!sortBy) sortBy = this.state.sort_options[0].value;
      const options = this.state.sort_options.map((c,index) => (
        <a
          key={index}
          className={c.value === sortBy ? "item active" : "item"}
          onClick={() => this.sortCommentList(c.value)}>
          {c.label}
        </a>
      ));
      commentSortOptionsDisplay = (
        <div className="ui compact menu">
          <div className="item">
            sort by:
          </div>
          {options}
        </div>
      );
    }

    return (
      <div className="comment-sort-options-container">
        {commentSortOptionsDisplay}
      </div>
    )
  }
}

const DummyCommentList = (props) => {
  return (
    <div id="comment-list" className="ui list dummy-comment-list">
      <div className="ui active inverted dimmer">
        <div className="ui active loader"></div>
      </div>
      <DummyCommentListItem/>
      <DummyCommentListItem/>
      <DummyCommentListItem/>
    </div>
  )
}

const DummyCommentListItem = (props) => {
  const userId = store.getState().site_info.auth_address;
  const userAvatar = (<canvas width="28" height="28" data-jdenticon-value={userId}></canvas>);

  return (
    <div className="comment-list-item segment ui">
      <div className="comment-item-header blured">
        <div className="comment-item-votes">
          <div className="votes-display">
            <a className="arrow up"></a>
            <a className="arrow down"></a>
          </div>
        </div>
        <div className="comment-item-avatar">
          {userAvatar}
        </div>
        <div className="comment-item-header-top blured">
          <span><a>dummy user name</a></span>
        </div>
        <div className="comment-item-header-bottom blured">
          # points ● <span>some days ago</span>
        </div>
      </div>
      <div className="comment-item-body blured">comment body text</div>
      <div className="comment-item-user-menu blured">
        <a className="open-reply-form-btn"><i className="comments outline icon"></i> Reply</a>
        <a className="show-replies-btn"><i className="minus square icon"></i>Hide replies</a>
      </div>
    </div>
  )
}

const CommentList = (props) => {

  let commentsDisplay;
  if (store.getState().comments.items && store.getState().comments.items.length > 0){
    let comments;
    if (store.getState().route.view === 'user-admin'){
      comments = store.getState().comments.items.map((c,index) => (
        <CommentListItem
          key={index}
          comment={c}
          onGetComments={props.onGetComments}
        />
      ));
    } else {
      comments = store.getState().comments.items.filter((c) => c.comment_parent_id === '0').map((c,index) => (
        <CommentListItem
          key={index}
          comment={c}
          onGetComments={props.onGetComments}
        />
      ));
    }

    let commentCounter;
    if (store.getState().route.view === 'topic'){
      commentCounter = (
        <div className="topic-view-comment-counter">
          <h2>
            <span>{props.topic.comments_total - props.topic.hidden_comments_total} Comments</span>
          </h2>
        </div>
      );
    }
    commentsDisplay = (
      <div>
        {commentCounter}
        <div id="comment-list" className="ui list">
          {comments}
        </div>
      </div>
    );
  }
  return (
    <div id="comment-list-wrapper">
      {commentsDisplay}
    </div>
  );
}

class CommentListItem extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      show_comment_edit_form:false,
      show_reply_form:false,
      show_replies:true
    };
    this.hideCommentEditForm = this.hideCommentEditForm.bind(this);
    this.showCommentEditForm = this.showCommentEditForm.bind(this);
    this.showReplyForm = this.showReplyForm.bind(this);
    this.hideReplyForm = this.hideReplyForm.bind(this);
    this.showReplies = this.showReplies.bind(this);
    this.hideReplies = this.hideReplies.bind(this);
    this.onDeleteComment = this.onDeleteComment.bind(this);
  }

  componentDidMount() {
    const q = "SELECT * FROM user WHERE user_name='"+this.props.comment.user_id+"' AND screen_name IS NOT NULL";
    const self = this;
    Page.cmd('dbQuery',[q],function(res){
      let userName;
      if (res && res.length > 0){
        userName = res[0].screen_name;
      } else {
        userName = self.props.comment.user_id;
      }
      self.setState({userName:userName});
    });
  }

  showCommentEditForm(){
    this.setState({show_comment_edit_form:true});
  }

  hideCommentEditForm(){
    this.setState({show_comment_edit_form:false},function(){
      this.props.onGetComments();
    });
  }

  showReplyForm(){
    this.setState({show_reply_form:true});
  }

  hideReplyForm(){
    this.setState({show_reply_form:false});
  }

  showReplies(){
    this.setState({show_replies:true});
  }

  hideReplies(){
    this.setState({show_replies:false});
  }

  onDeleteComment(){
    const query = "SELECT * FROM json WHERE json_id='"+this.props.comment.json_id+"'";
    Page.cmd('dbQuery',[query],function(res){
      const inner_path = "merged-"+store.getState().config.merger_name+"/"+res[0].directory+"/"+res[0].file_name;
      this.deleteComment(inner_path);
    }.bind(this));
  }

  deleteComment(inner_path){
    Page.cmd('fileGet',{inner_path:inner_path},function(data){
      data = JSON.parse(data);
      const commentIndex = data.comment.findIndex((c) => c.comment_id === this.props.comment.comment_id);
      data.comment.splice(commentIndex,1);
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          Page.cmd("wrapperNotification", ["done", "Comment Deleted!", 5000]);
          store.dispatch(decrementTopicCommentCount());
          this.props.onGetComments();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  render(){

    const c = this.props.comment;
    if (c.added < 1481025974864) c.added = 1481025974864;
    let upVotes, downVotes;
    if (c.votes){
      upVotes = c.votes.up.length;
      downVotes = c.votes.down.length;
    } else {
      upVotes = c.up_votes;
      downVotes = c.down_votes;
    }

    const upDownVotesTotal = (
      <span>
        {upVotes - downVotes} points
        (<span className="up-votes">+{upVotes}</span>|<span className="down-votes">-{downVotes}</span>)
      </span>
    );

    let repliesContainer, replyToggleBtn;
    let replies = store.getState().comments.items.filter((c) => c.comment_parent_id === this.props.comment.comment_id);
    if (replies.length > 0){
      if (this.state.show_replies){
        replies = replies.map((r,index) => (
          <CommentListItem
            key={index}
            comment={r}
          />
        ));
        repliesContainer = (
          <div className="comment-item-replies-container">{replies}</div>
        );
        replyToggleBtn = (
          <a className="show-replies-btn" onClick={this.hideReplies}><i className="minus square icon"></i>Hide replies</a>
        );
      } else {
        replyToggleBtn = (
          <a className="show-replies-btn" onClick={this.showReplies}><i className="add square icon"></i>Show replies</a>
        )
      }
    }

    let formDisplay, showReplyFormBtn;
    if (this.state.show_reply_form){
      formDisplay = (
        <div className="reply-form-wrapper">
          <a className="close-reply-form-btn" onClick={() => this.hideReplyForm()}><i className="window close outline icon mid"></i></a>
          <CommentFormWrapper
            parent={c}
            hideReplyForm={this.hideReplyForm}
          />
        </div>
      );
    } else {
      showReplyFormBtn = (
        <a className="open-reply-form-btn" onClick={() => this.showReplyForm()}><i className="comments outline icon"></i> Reply</a>
      );
    }

    let editCommentBtn,
        deleteCommentBtn,
        commentBodyDisplay = (
          <div className="comment-item-body">
            <div dangerouslySetInnerHTML={{__html: c.body}}></div>
          </div>
        );

    if (c.user_id === store.getState().user.user_name){
      if (!this.state.show_comment_edit_form){
        editCommentBtn = <a className="show-comment-edit-form" onClick={() => this.showCommentEditForm()}><i className="icon edit"></i>Edit</a>
      } else {
        commentBodyDisplay = (
          <CommentListItemEditForm
            comment={c}
            hideCommentEditForm={this.hideCommentEditForm}
          />
        );
      }
    }

    let commentFileDisplay;
    if (c.file_to_item_id || c.file_id || c.embed_url){
      if (!this.state.show_comment_edit_form){
        commentFileDisplay = (
          <div className="comment-item-media-container">
            <ItemMediaContainer
              comment={c}
            />
          </div>
        )
      }
    }

    let userAvatarDisplay;
    if (this.state.userName){
      userAvatarDisplay = (
        <UserAvatarDisplay
          userId={c.comment_id.split('comment')[0]}
          userName={this.state.userName}
        />
      );
    }

    return (
      <div className="comment-list-item segment ui">
        <div className="comment-item-header">
          <CommentListItemVotesWrapper comment={c}/>
          <div className="comment-item-avatar">
            {userAvatarDisplay}
          </div>
          <div className="comment-item-header-top">
            <span><a>{this.state.userName}</a></span>
          </div>
          <div className="comment-item-header-bottom">
            {upDownVotesTotal} ● <span>{appHelpers.getTimeAgo(c.added)}</span>
          </div>
        </div>
        {commentBodyDisplay}
        {commentFileDisplay}
        <div className="comment-item-user-menu">
          {replyToggleBtn}
          {showReplyFormBtn}
          {editCommentBtn}
          {deleteCommentBtn}
        </div>
        {formDisplay}
        {repliesContainer}
      </div>
    )
  }
}

class CommentListItemEditForm extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      loading:false,
      text:this.props.comment.body
    };
    this.hideCommentEditForm = this.hideCommentEditForm.bind(this);
    this.updateCommentText = this.updateCommentText.bind(this);
    this.onCommentFileChange = this.onCommentFileChange.bind(this);
    this.readFile = this.readFile.bind(this);
    this.onRemoveCommentFile = this.onRemoveCommentFile.bind(this);
    this.removeCommentFile = this.removeCommentFile.bind(this);
    this.deleteCommentFile = this.deleteCommentFile.bind(this);
    this.onUpdateComment = this.onUpdateComment.bind(this);
    this.updateComment = this.updateComment.bind(this);
  }

  componentDidMount() {
    // jdenticon();
    const options = formHelpers.getEasyEditorOptions();
    new EasyEditor('#ckeditor'+this.props.comment.comment_id, options);
  }

  hideCommentEditForm(e){
    e.preventDefault();
    this.props.hideCommentEditForm();
  }

  updateCommentText(e){
    this.setState({text:e.target.value});
  }

  onCommentFileChange(e){
    const file = {
      f:e.target.files[0],
      file_name:fileHelpers.generateValidFileName(e.target.files[0].name),
      file_type:e.target.files[0].type.split('/')[1],
      file_size:e.target.files[0].size,
      media_type:e.target.files[0].type.split('/')[0],
      item_type:'comment'
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

  onUploadFile(inner_path){
    if (this.props.comment.file_id){
      this.onRemoveCommentFile(inner_path);
    } else {
      this.uploadFile(inner_path);
    }
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
        this.createFile(inner_path,this.props.comment);
      }.bind(this));
      req.withCredentials = true
      req.open("POST", init_res.url)
      req.send(formdata)
    }.bind(this));
  }

  createFile(inner_path,comment){

    Page.cmd('fileGet',{inner_path:inner_path + "/data.json"},function(data){

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
        item_id:comment.comment_id,
        item_type:'comment',
        user_id:store.getState().site_info.auth_address,
        added:Date.now()
      }

      data.file.push(file);
      data.next_file_id += 1;

      const file_to_item = {
        file_to_item_id:store.getState().site_info.auth_address+"fti"+data.next_file_to_item_id,
        item_type:'comment',
        item_id:comment.comment_id,
        file_id:file.file_id,
        cluster_id:store.getState().config.cluster,
        user_id:file.user_id,
        added:Date.now()
      }

      data.file_to_item.push(file_to_item);
      data.next_file_to_item_id += 1;

      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path  + "/data.json", btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path  + "/data.json"}, function(res) {
          this.updateComment(inner_path);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  onRemoveCommentFile(){
    this.setState({loading:true},function(){
      const query = "SELECT * FROM json WHERE json_id='"+this.props.comment.json_id+"'";
      Page.cmd('dbQuery',[query],function(res){
        const inner_path = "merged-"+store.getState().config.merger_name+"/"+res[0].directory;
        const file_name = this.props.comment.file_name;
        this.removeCommentFile(inner_path,file_name);
      }.bind(this));
    });
  }

  removeCommentFile(inner_path,file_name){

    Page.cmd('fileGet',{inner_path:inner_path + "/data.json"},function(data){
      data = JSON.parse(data);
      const fIndex = data.file.findIndex((f) => f.file_id === this.props.comment.file_id);
      const ftiIndex = data.file_to_item.findIndex((fti) => fti.file_to_item_id === this.props.comment.file_to_item_id);
      data.file.splice(fIndex, 1);
      data.file_to_item.splice(ftiIndex, 1);
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path + "/data.json", btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path + "/data.json"}, function(res) {
          this.deleteCommentFile(inner_path,file_name);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  deleteCommentFile(inner_path,file_name){
    Page.cmd('fileDelete',{inner_path:inner_path + "/" + file_name},function(res){
      if (this.state.updating){
        this.uploadFile(inner_path);
      } else {
        this.setState({file_deleted:true, loading:false});
      }
    }.bind(this));
  }

  onUpdateComment(e){
    e.preventDefault();
    const text = $('#ckeditor'+this.props.comment.comment_id)[0].defaultValue;
    this.setState({updating:true, loading:true,text:text},function(){
      const query = "SELECT * FROM json WHERE json.json_id='"+this.props.comment.json_id+"'";
      Page.cmd('dbQuery',[query],function(res){
        const json = res[0];
        const inner_path = "merged-"+store.getState().config.merger_name+"/"+json.directory;
        if (this.state.file){
          this.onUploadFile(inner_path);
        } else {
          this.updateComment(inner_path);
        }
      }.bind(this));
    });
  }

  updateComment(inner_path){
      Page.cmd('fileGet',{inner_path:inner_path + "/data.json"},function(data){
        data = JSON.parse(data);
        const commentIndex = data.comment.findIndex((c) => c.comment_id === this.props.comment.comment_id);
        data.comment[commentIndex].body = this.state.text;
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path + "/data.json", btoa(json_raw)], function(res) {
          Page.cmd("sitePublish",{"inner_path":inner_path + "/data.json"}, function(res) {
            Page.cmd("wrapperNotification", ["done", "Comment Updated!", 5000]);
            store.dispatch(updateComment(data.comment[commentIndex]));
            this.props.hideCommentEditForm();
          }.bind(this));
        }.bind(this));
      }.bind(this));
  }

  render(){
    let commentEditFormDisplay;
    if (this.state.loading){
      commentEditFormDisplay = (
        <div className="ui segment">
          <Loading msg="updating comment..." cssClass="centered"></Loading>
        </div>
      );
    } else {

      let commentEditFormFileDisplay;
      if (this.state.file){
        if (this.state.file.media_type === 'image'){
          commentEditFormFileDisplay = (
            <div className="ui segment item-file-display">
              <img src={this.state.file.f.data}/>
            </div>
          );
        } else if (this.state.file.media_type === 'video'){
          commentEditFormFileDisplay = (
            <div className="ui segment item-file-display">
              <VideoPlayer
                filePath={this.state.file.data_url}
                fileType={this.state.file.file_type}
                mediaType={this.state.file.media_type}
              />
            </div>
          )
        }
      } else if (this.props.comment.file_id && !this.state.file_deleted){
        commentEditFormFileDisplay = (
          <div className="comment-item-media-container">
            <div className="comment-file-menu">
              <button className="native-btn" type="button" onClick={this.onRemoveCommentFile}>
                <a><i className="icon trash"></i></a>
              </button>
            </div>
            <ItemMediaContainer
              comment={this.props.comment}
            />
          </div>
        )
      }

      let addFileButton;
      if (!this.state.file && this.state.file_deleted || !this.state.file && !this.props.comment.file_id) {
        addFileButton = (
          <span type="button" className="native-btn">
            <a>add file</a>
            <input type="file" onChange={this.onCommentFileChange}/>
          </span>
        );
      }

      let fileUploadProgressDisplay;
      if (this.state.fileProgress > 0 && this.state.fileProgress < 100){
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

      commentEditFormDisplay = (
        <form className="ui form comment-edit-form">
          <div className="field">
            <textarea
              id={"ckeditor" + this.props.comment.comment_id}
              rows="2"
              defaultValue={this.state.text}
              onChange={this.updateCommentText}>
            </textarea>
          </div>
          {commentEditFormFileDisplay}
          {fileUploadProgressDisplay}
          <div className="field">
            <div className="btn-container">
              <button type="button" className="native-btn" onClick={this.onUpdateComment}>
                <a>update</a>
              </button>
              {addFileButton}
              <button type="button" className="native-btn" onClick={this.hideCommentEditForm}>
                <a>cancel</a>
              </button>
            </div>
          </div>
        </form>
      );
    }

    return (
      <div className="comment-edit-form-display">
        {commentEditFormDisplay}
      </div>
    )
  }
}

class CommentListItemVotesContainer extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {};
    this.onUpVoteClick = this.onUpVoteClick.bind(this);
    this.onDownVoteClick = this.onDownVoteClick.bind(this);
  }

  componentDidMount() {
    this.props.getCommentVotes();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.site_info.cert_user_id !== this.props.site_info.cert_user_id){
      this.props.getCommentVotes();
    }
  }

  onUpVoteClick(){
    if (store.getState().site_info.cert_user_id){
      const voteType = voteHelpers.configVoteActionType(this.props.comment.votes.user_vote,'UP');
      this.props.onVoteComment(voteType);
    } else {
      Page.cmd("wrapperNotification", ["info", "Login to participate", 4000]);
    }
  }

  onDownVoteClick(){
    if (store.getState().site_info.cert_user_id){
      const voteType = voteHelpers.configVoteActionType(this.props.comment.votes.user_vote,'DOWN');
      this.props.onVoteComment(voteType);
    } else {
      Page.cmd("wrapperNotification", ["info", "Login to participate", 4000]);
    }
  }

  render(){
    let topicVotesDisplay;
    if (this.props.comment.loading_votes){
      topicVotesDisplay = <div className="ui mini loader active"></div>
    } else {
      let votesDisplayCssClass;
      if (this.props.comment.votes && this.props.comment.votes.user_vote){
        votesDisplayCssClass = this.props.comment.votes.user_vote.vote === 1 ? 'up-voted' : 'down-voted';
      }
      topicVotesDisplay = (
        <div className={"votes-display " + votesDisplayCssClass}>
          <a className="arrow up" onClick={this.onUpVoteClick}></a>
          <a className="arrow down" onClick={this.onDownVoteClick}></a>
        </div>
      )
    }

    return (
      <div className="comment-item-votes">
        {topicVotesDisplay}
      </div>
    );
  }
}

const mapStateToCommentListItemVotesContainer = (state, props) => {
  const site_info = state.site_info;
  const comment = props.comment;
  return {
    site_info,
    comment
  }
}

const mapDispatchToCommentListItemVotesContainer = (dispatch) => {
  return {
    dispatch
  }
}

const mergeCommentListItemVotesContainerProps = (stateProps, dispatch) => {

    function getCommentVotes(){
      const query = voteHelpers.getCommentVotesQuery(stateProps.comment.comment_id);
      Page.cmd('dbQuery',[query],function(res){
        const user = stateProps.site_info.cert_user_id;
        const votes = voteHelpers.renderItemVotes(res,user);
        store.dispatch(assignCommentVotes(votes,stateProps.comment.comment_id));
      });
    }

    function onVoteComment(voteType){
      store.dispatch(loadingCommentVotes(stateProps.comment.comment_id,true));
      const config = store.getState().config;
      if (voteType === 'CHANGE' || voteType === 'DELETE' ) {
        const query = "SELECT * FROM json WHERE json_id='" + stateProps.comment.votes.user_vote.json_id + "'";
        Page.cmd('dbQuery',[query],function(res){
          const inner_path = "merged-"+config.merger_name+"/"+res[0].directory+"/"+res[0].file_name;
          this.voteComment(voteType,inner_path);
        }.bind(this));
      } else {
        const auth_address = stateProps.site_info.auth_address;
        const inner_path = "merged-"+config.merger_name+"/"+config.cluster+"/data/users/"+auth_address+"/data.json";
        voteComment(voteType,inner_path);
      }
    }

    function voteComment(voteType,inner_path){
      Page.cmd('fileGet',{inner_path:inner_path},function(data){
        data = JSON.parse(data);
        if (data){
          if (!data.comment_vote){
            data.comment_vote = [];
            data.next_comment_vote_id = 1;
          }
        } else {
          data = {
            "comment_vote":[],
            "next_comment_vote_id":1
          }
        }
        data = voteHelpers.renderDataJsonOnTopicVote(data,stateProps.site_info,voteType,stateProps.comment.comment_id,stateProps.comment.votes.user_vote,'comment');
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
          Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
            Page.cmd("wrapperNotification", ["done", "Comment Voted!", 10000]);
            store.dispatch(loadingCommentVotes(stateProps.comment.comment_id,false));
            getCommentVotes();
          });
        });
      });
    }


  return {
    ...stateProps,
    ...dispatch,
    getCommentVotes,
    onVoteComment,
    voteComment
  }
}

const CommentListItemVotesWrapper = ReactRedux.connect(
  mapStateToCommentListItemVotesContainer,
  mapDispatchToCommentListItemVotesContainer,
  mergeCommentListItemVotesContainerProps
)(CommentListItemVotesContainer);

class CommentForm extends React.Component {

  constructor(props){
  	super(props);
  	this.state = {
      text:'',
      errors:[]
    };
    this.renderTextArea = this.renderTextArea.bind(this);
    this.updateCommentText = this.updateCommentText.bind(this);
    this.onCommentFileChange = this.onCommentFileChange.bind(this);
    this.readFile = this.readFile.bind(this);
    this.onPostComment = this.onPostComment.bind(this);
    this.postComment = this.postComment.bind(this);
    this.onUploadFile = this.onUploadFile.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.finishPostingComment = this.finishPostingComment.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user !== this.props.user){
      this.setState({loading:true},function(){
        this.setState({loading:false},function(){
          this.renderTextArea();
        });
      });
    }
  }

  componentDidMount() {
    this.renderTextArea();
  }

  renderTextArea(){
    if (store.getState().site_info.cert_user_id){
      let textAreaId = "ckeditor"
      if (this.props.parent) textAreaId = "ckeditor" + this.props.parent.comment_id;
      const options = formHelpers.getEasyEditorOptions();
      new EasyEditor('#'+textAreaId, options);
    }
  }

  certSelect(e){
    Page.selectUser();
    Page.onRequest = function(cmd, message) {
      if (cmd === "setSiteInfo"){
        if (message.address === store.getState().site_info.address) {
          store.dispatch(loadingUser(true));
          if (message.cert_user_id){
            store.dispatch(changeCert(message.auth_address,message.cert_user_id));
          } else if (!message.cert_user_id){
            store.dispatch(changeCert(message.auth_address,message.cert_user_id));
            store.dispatch(removeUser());
          }
        }
      }
    };
  }

  updateCommentText(e){
    this.setState({text:e.target.value});
  }

  onCommentFileChange(e){
    const file = {
      f:e.target.files[0],
      file_name:fileHelpers.generateValidFileName(e.target.files[0].name),
      file_type:e.target.files[0].type.split('/')[1],
      file_size:e.target.files[0].size,
      media_type:e.target.files[0].type.split('/')[0],
      item_type:'comment'
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

  onPostComment(event){
    event.preventDefault();
    let textAreaId = "ckeditor"
    if (this.props.parent) textAreaId = "ckeditor" + this.props.parent.comment_id;
    const text = $('#'+textAreaId)[0].defaultValue;
    this.setState({text:text},function(){
      const errors = formHelpers.validateCommentForm(this.state);
      this.setState({errors:errors},function(){
        if (this.state.errors.length === 0){
          this.setState({loading:true},function(){
            if (this.state.file) {
              this.onUploadFile();
            } else {
              this.postComment();
            }
          });
        }
      });
    });
  }

  postComment(){
    const state = store.getState();
    const inner_path = "merged-"+state.config.merger_name+"/"+state.config.cluster+"/data/users/"+state.site_info.auth_address+"/data.json";
    Page.cmd('fileGet',{inner_path:inner_path},function(data){
      data = JSON.parse(data);
      if (data){
        if (!data.comment){
          data.comment = [];
          data.next_comment_id = 1;
        }
      } else {
        data = {
          "comment":[],
          "next_comment_id":1
        }
      }

      const comment = {
        comment_id:state.site_info.auth_address + "comment" + data.next_comment_id,
        body:this.state.text,
        body_p:this.state.text.replace(/<\/?[^>]+(>|$)/g, ""),
        topic_id:this.props.topic.topic_id,
        user_id:state.site_info.cert_user_id,
        comment_parent_id: this.props.parent ? this.props.parent.comment_id : 0,
        added:Date.now()
      }
      data.comment.push(comment);
      data.next_comment_id += 1;
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
        Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
          Page.cmd("wrapperNotification", ["done", "Comment Posted!", 10000]);
          if (this.state.file){
            this.createFile(inner_path,comment);
          } else {
            this.finishPostingComment(comment);
          }
        }.bind(this));
      }.bind(this));
    }.bind(this));
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
        this.postComment();
      }.bind(this));
      req.withCredentials = true
      req.open("POST", init_res.url)
      req.send(formdata)
    }.bind(this));
  }

  createFile(inner_path,comment){

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
        item_id:comment.comment_id,
        item_type:'comment',
        user_id:store.getState().site_info.auth_address,
        added:Date.now()
      }

      data.file.push(file);
      data.next_file_id += 1;

      const file_to_item = {
        file_to_item_id:store.getState().site_info.auth_address+"fti"+data.next_file_to_item_id,
        item_type:'comment',
        item_id:comment.comment_id,
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
          Page.cmd("wrapperNotification", ["done", "Topic Created!", 5000]);
          this.finishPostingComment(comment);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  finishPostingComment(comment){
    let parent;
    if (this.props.parent) parent = this.props.parent;
    else parent = this.props.topic;
    store.dispatch(addComment(comment));
    store.dispatch(incrementTopicCommentCount());
    this.setState({
      text:'',
      file:'',
      loading:false,
      errors:[],
      fileProgress:''
    });
  }

  render(){
    let commentFormDisplay;
    if (this.state.loading){
      commentFormDisplay = <Loading cssClass="centered" msg="Posting Comment"/>
    } else {

      const certUserId = store.getState().site_info.cert_user_id;

      let userId, textAreaDisplay, fileDisplay, buttonsFieldDisplay;
      if (certUserId){
        userId = certUserId;
        let textAreaId = "ckeditor"
        if (this.props.parent) textAreaId = "ckeditor" + this.props.parent.comment_id;

        textAreaDisplay = (
          <div className="field">
            <textarea
              name={textAreaId}
              id={textAreaId}
              onChange={this.updateCommentText}
              placeholder={"comment as " + certUserId}
              rows="2"
              value={this.state.text}>
            </textarea>
          </div>
        );
        buttonsFieldDisplay = (
          <div className="field">
            <button type="button" className="native-btn" onClick={this.onPostComment}>
              <a>post comment</a>
            </button>
            <span type="button" className="native-btn">
              <a>add file</a>
              <input type="file" onChange={this.onCommentFileChange}/>
            </span>
          </div>
        );
      } else {
        userId = store.getState().site_info.auth_address;
        textAreaDisplay = (
          <div className="field">
            <textarea
              disabled="disabled"
              placeholder={"please login to participate"}
              rows="2">
            </textarea>
          </div>
        );
        buttonsFieldDisplay = (
          <div className="field">
            <button type="button" onClick={this.certSelect} className="native-btn">
              <a>Login</a>
            </button>
          </div>
        );
      }

      if (this.state.file){
        if (this.state.file.media_type === 'image'){
          fileDisplay = (
            <div className="ui segment item-file-display">
              <img src={this.state.file.f.data}/>
            </div>
          );
        } else if (this.state.file.media_type === 'video' || this.state.file.media_type === 'audio'){
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

      let fileUploadProgressDisplay;
      if (this.state.fileProgress > 0 && this.state.fileProgress < 100){

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

      let errorsDisplay;
      if (this.state.errors.length > 0){
        errorsDisplay = <p className="error">{this.state.errors[0].msg}</p>
      }

      const user = store.getState().user;
      let userName = user.user_name;
      if (!user.user_name){
        userName = store.getState().site_info.cert_user_id;
      }
      let userAvatar;
      if (store.getState().site_info.cert_user_id){
        userAvatar = (
          <UserAvatarDisplay
            userId={user.user_id}
            userName={userName}
          />
        );
      }

      commentFormDisplay = (
        <form className="comment-form ui form">
          <div className="comment-avatar">
            {userAvatar}
          </div>
          {textAreaDisplay}
          {fileDisplay}
          {fileUploadProgressDisplay}
          {errorsDisplay}
          {buttonsFieldDisplay}
        </form>
      );
    }

    return (
      <div className="comment-form-container ui segment">
        {commentFormDisplay}
      </div>
    )
  }

}

const mapStateToCommentFormProps = (state,props) => {
  const user = state.user;
  const route = state.route;
  const topic = state.topics.items.find((t) => t.topic_id === route.id);
  const parent = props.parent;
  const hideReplyForm = props.hideReplyForm;
  const comment = props.comment;
  return {
    user,
    topic,
    parent,
    hideReplyForm,
    comment
  }
}

const mapDispatchToCommentFormProps = (dispatch) => {
  return {
    dispatch
  }
}

const mergeCommentFormProps = (stateProps, dispatch) => {

  function getComment(){
    console.log(this.props.comment);
  }

  return {
    ...stateProps,
    ...dispatch,
    getComment
  }
}

const CommentFormWrapper = ReactRedux.connect(
  mapStateToCommentFormProps,
  mapDispatchToCommentFormProps,
  mergeCommentFormProps
)(CommentForm);
