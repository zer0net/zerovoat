'use strict';

window.appHelpers = function () {

  function generateMissingSiteList(sites, clusters) {
    var sl = [];
    clusters.forEach(function (cl, index) {
      var clusterExists = false;
      for (var i in sites) {
        if (cl.cluster_id === sites[i].address) clusterExists = true;
      }
      if (!clusterExists) sl.push(cl.cluster_id);
    });
    return sl;
  }

  function generateAppRoute(string) {
    var path = void 0;
    if (string.indexOf('&wrapper') > -1) path = string.split('&wrapper')[0];else if (string.indexOf('?wrapper') > -1) path = string.split('?wrapper')[0];
    var route = {};
    if (!path) {
      route.view = 'main';
    } else {
      route.view = path.split('v=')[1].split('+')[0];
      if (path.indexOf('+id=') > -1) route.id = path.split('+id=')[1].split('+')[0];
      if (path.indexOf('+sb=') > -1) route.sort_by = path.split('+sb=')[1].split('+')[0];
      if (path.indexOf('+p=') > -1) route.page = parseInt(path.split('+p=')[1].split('+')[0]);
      if (path.indexOf('+s=') > -1) route.section = path.split('+s=')[1].split('+')[0];
    }
    return route;
  }

  function getTimeAgo(datetime) {
    var a = timeago().format(datetime);
    return a;
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  function generateUrlPrefix(route, sortBy) {
    var urlPrefix = "index.html?v=" + route.view;
    if (route.id) {
      urlPrefix += "+id=" + route.id;
    }
    if (sortBy) {
      urlPrefix += "+sb=" + sortBy;
    } else if (route.sort_by) {
      urlPrefix += "+sb=" + route.sort_by;
    } else {
      urlPrefix += "+sb=new";
    }
    urlPrefix += "+p=";
    return urlPrefix;
  }

  function getDeviceWidth(width) {
    var device = void 0;
    if (width > 1200) {
      device = "large";
    } else if (width < 1200 && width >= 992) {
      device = "mid";
    } else if (width < 992 && width >= 768) {
      device = "tablet";
    } else if (width < 768) {
      device = "mobile";
    }
    return device;
  }

  function generateRandomString(numLength) {
    function randomString(length, chars) {
      var result = '';
      for (var i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }return result;
    }
    var rString = randomString(numLength, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    return rString;
  };

  function grk(config) {
    var randomKey = '5JweXMd84uqUXZmBb8v4YSPxPLD4HS98jQba1s3L2KQRYdA9jwB';
    return randomKey;
  };

  return {
    generateMissingSiteList: generateMissingSiteList,
    generateAppRoute: generateAppRoute,
    getTimeAgo: getTimeAgo,
    getRandomInt: getRandomInt,
    generateUrlPrefix: generateUrlPrefix,
    getDeviceWidth: getDeviceWidth,
    generateRandomString: generateRandomString,
    grk: grk
  };
}();
'use strict';

window.channelHelpers = function () {

  function getChannelSortOptions() {
    var sort_options = [{
      label: 'number of topics',
      value: 'topics_count',
      dir: 'DESC'
    }, {
      label: 'last activity',
      value: 'last_topic_date',
      dir: 'DESC'
    }, {
      label: 'A - Z',
      value: 'name',
      dir: 'DESC'
    }, {
      label: 'newest',
      value: 'added',
      dir: 'DESC'
    }, {
      label: 'oldest',
      value: 'added',
      dir: 'ASC'
    }];
    sort_options[0].current = true;
    return sort_options;
  }

  function getLatestChannels() {
    var q = "SELECT * FROM channel AS c WHERE c.channel_id NOT NULL ORDER BY -c.added LIMIT 5";
    return q;
  }

  function getTopLinksMenu() {
    var links = [{
      title: 'Test Channel',
      href: 'index.html?v=channel+id=1R67TfYzNkCnh89EFfGmXn5LMb4hXaMRQ3'
    }, {
      title: 'Suggestions',
      href: 'index.html?v=channel+id=1C1gnFcVv9J9kUjF4odDMRYcEWVPJbbqFp4'
    }, {
      title: '中文频道',
      href: 'index.html?v=channel+id=17vKbxL13KnzGATstqawXSG2oiQygmdkcX1'
    }, {
      title: 'Russian',
      href: 'index.html?v=channel+id=1PniNzyi8fygvwyBaLpA9oBDVWZ5fXuJUw1'
    }, {
      title: 'Wallpapers',
      href: 'index.html?v=channel+id=1DpPY5S6HpxsK6CQGWKZbKh9gVo1LnXze11'
    }];
    return links;
  }

  function getChannelsQuery(userId) {
    var q = "SELECT c.*";
    q += ", (SELECT count(*) FROM topic WHERE topic.channel_id=c.channel_id) as topics_count";
    q += ", (SELECT max(added) FROM topic WHERE topic.channel_id=c.channel_id) as last_topic_date";
    q += " FROM channel c";
    q += " WHERE c.channel_id IS NOT NULL";
    if (userId) q += " AND c.user_id='" + userId + "'";
    return q;
  }

  function getChannelByIdQuery(channelId) {
    var q = "SELECT c.*";
    q += ", (SELECT count(*) FROM topic WHERE topic.channel_id=c.channel_id) as topics_count";
    q += " FROM channel c";
    q += " WHERE c.channel_id='" + channelId + "'";
    return q;
  }

  function getChannelByTopicIdQuery(topicId) {
    var q = "SELECT c.*, t.*";
    q += ", (SELECT count(*) FROM topic WHERE topic.channel_id=c.channel_id) as topics_count";
    q += " FROM channel c";
    q += " LEFT JOIN topic AS t ON t.channel_id=c.channel_id";
    q += " WHERE t.topic_id='" + topicId + "'";
    return q;
  }

  function sortChannels(channels, sortBy) {
    var cArray = [].concat(store.getState().channels.items);
    if (sortBy.dir === 'DESC') cArray = cArray.sort(function (a, b) {
      return b[sortBy.value] - a[sortBy.value];
    });else if (sortBy.dir === 'ASC') cArray = cArray.sort(function (a, b) {
      return a[sortBy.value] - b[sortBy.value];
    });
    if (sortBy.label === 'A - Z') {
      cArray = cArray.sort(function (a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
    }
    return cArray;
  }

  function getChannelEditTabs() {
    var tabs = [{
      label: 'channel'
    }, {
      label: 'moderators'
    }, {
      label: 'layout'
    }];
    return tabs;
  }

  return {
    getChannelSortOptions: getChannelSortOptions,
    getLatestChannels: getLatestChannels,
    getTopLinksMenu: getTopLinksMenu,
    getChannelsQuery: getChannelsQuery,
    getChannelByIdQuery: getChannelByIdQuery,
    getChannelByTopicIdQuery: getChannelByTopicIdQuery,
    sortChannels: sortChannels,
    getChannelEditTabs: getChannelEditTabs
  };
}();
"use strict";

window.commentHelpers = function () {

  function getCommentsQuery(topicId, userId, sortBy) {
    var q = "SELECT c.*, fti.*, f.*";
    q += ", (SELECT count(*) FROM comment_vote WHERE comment_vote.comment_id=c.comment_id AND comment_vote.vote=0) as down_votes";
    q += ", (SELECT count(*) FROM comment_vote WHERE comment_vote.comment_id=c.comment_id AND comment_vote.vote=1) as up_votes";
    q += " FROM comment c";
    q += " LEFT JOIN file_to_item AS fti ON fti.item_id=c.comment_id AND fti.item_type='comment' ";
    q += " LEFT JOIN file AS f ON f.item_id=c.comment_id";
    q += " WHERE c.comment_id IS NOT NULL";
    if (topicId) q += " AND c.topic_id='" + topicId + "'";
    if (userId) q += " AND c.user_id='" + userId + "'";
    if (sortBy) q += " ORDER BY " + sortBy;else q += " ORDER BY -c.added";
    return q;
  }

  function getCommentSortOptions() {
    var sort_options = [{
      label: 'new',
      value: '-c.added'
    }, {
      label: 'old',
      value: 'c.added'
    }, {
      label: 'top',
      value: '-up_votes'
    }, {
      label: 'bottom',
      value: '-down_votes'
    }];
    return sort_options;
  }

  return {
    getCommentsQuery: getCommentsQuery,
    getCommentSortOptions: getCommentSortOptions
  };
}();
"use strict";

window.fileHelpers = function () {

  function getFileToItemQuery(fileToItemId) {
    var q = "SELECT * FROM file_to_item AS fti WHERE fti.file_to_item_id='" + fileToItemId + "'";
    return q;
  }

  function getFileQuery(fileId) {
    var q = "SELECT f.*, j.* ";
    q += "FROM file f ";
    q += "LEFT JOIN json AS j ON f.json_id=j.json_id ";
    q += "WHERE f.file_id='" + fileId + "'";
    return q;
  }

  function determineFileMediaType(fileType) {
    var mt = void 0;
    if (fileType === 'jpg' || fileType === 'png' || fileType === 'jpeg' || fileType === 'gif') {
      mt = 'image';
    } else if (fileType === 'avi' || fileType === 'mpeg' || fileType === 'webm' || fileType === 'ogg' || fileType === 'mp4') {
      mt = 'video';
    } else if (fileType === 'mp3' || fileType === 'wav') {
      mt = 'audio';
    }
    return mt;
  }

  function generateValidFileName(fileName) {
    var fname = fileName.replace(/[^\x20-\x7E]+/g, this.generateRandomChar()).replace(/ /g, '_').replace(/[&\/\\#,+()$~%'":*?!<>|{}\[\]]/g, this.generateRandomChar());
    return fname;
  }

  function generateRandomChar() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 1; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }return text;
  }

  function getItemFilePiecesInfo(res) {
    var pieceStandardSize = 1048576;
    var pieceInfo = [];
    for (var i = 0; i < res.pieces; i++) {
      var piece = {};
      piece.index = i;
      piece.start = piece.index * pieceStandardSize;
      piece.end = (piece.index + 1) * pieceStandardSize;
      if (i < res.pieces_downloaded) {
        piece.state = 'complete';
      } else if (i === res.pieces_downloaded) {
        piece.state = 'downloading';
      }
      pieceInfo.push(piece);
    }
    return pieceInfo;
  }

  return {
    getFileToItemQuery: getFileToItemQuery,
    getFileQuery: getFileQuery,
    determineFileMediaType: determineFileMediaType,
    generateValidFileName: generateValidFileName,
    generateRandomChar: generateRandomChar,
    getItemFilePiecesInfo: getItemFilePiecesInfo
  };
}();
"use strict";

window.followHelpers = function () {

	function generateFollowNewTopicsQuery() {
		var q = "SELECT title AS title, body_p AS body, added AS date_added, 'topic' AS type,";
		q += " 'index.html?v=topic+id=' || topic.topic_id AS url FROM topic LEFT JOIN json AS topic_creator_json ON (topic_creator_json.json_id = topic.json_id) WHERE parent_topic_uri IS NULL";
		return q;
	};

	function generateFollowChannelQuery(channel) {
		var q = "SELECT title AS title, body_p AS body, added AS date_added, 'topic' AS type,";
		q += " 'index.html?v=topic+id=' || topic.topic_id AS url FROM topic LEFT JOIN json AS topic_creator_json ON (topic_creator_json.json_id = topic.json_id)";
		q += " WHERE topic.channel_id='" + channel.channel_id + "'";
		return q;
	};

	function generateFollowTopicCommentsQuery(topic) {
		var q = "SELECT topic.title AS title, comment.body AS body, comment.added AS date_added, 'comment' AS type,";
		q += " 'index.html?v=topic+id=' || topic.topic_id AS url";
		q += " FROM topic";
		q += " LEFT JOIN comment ON (comment.topic_id = topic.topic_id)";
		q += " WHERE topic.topic_id='" + topic.topic_id + "'";
		return q;
	};

	return {
		generateFollowNewTopicsQuery: generateFollowNewTopicsQuery,
		generateFollowChannelQuery: generateFollowChannelQuery,
		generateFollowTopicCommentsQuery: generateFollowTopicCommentsQuery
	};
}();
'use strict';

window.formHelpers = function () {

  function validateTopicForm(state, config) {
    var errors = [];
    if (!state.title) {
      var error = {
        field: 'title',
        msg: 'title is required'
      };
      errors.push(error);
    }
    if (state.channel_id === "0" || !state.channel_id) {
      var _error = {
        field: 'channel_id',
        msg: 'channel is required'
      };
      errors.push(_error);
    }
    if (state.embed_url && !state.embed_url.startsWith('merged-' + config.merger_name)) {
      var _error2 = {
        field: 'embed_url',
        msg: 'embed url must start with "merged-' + config.merger_name + '"'
      };
      errors.push(_error2);
    }
    return errors;
  }

  function validateChannelForm(state) {
    var errors = [];
    if (!state.name) {
      var error = {
        field: 'name',
        msg: 'name is required'
      };
      errors.push(error);
    }
    return errors;
  }

  function validateCommentForm(state) {
    var errors = [];
    if (!state.text && !state.file) {
      var error = {
        msg: "can't post empty comment!"
      };
      errors.push(error);
    }
    return errors;
  }

  function getEasyEditorOptions() {
    var options = {
      buttons: ['bold', 'italic', 'h2', 'h3', 'h4', 'alignleft', 'aligncenter', 'alignright', 'quote', 'code', 'x'],
      buttonsHtml: {
        'bold': '<i class="icon bold"></i>',
        'italic': '<i class="icon italic"></i>',
        'link': '<i class="icon link"></i>',
        'align-left': '<i class="icon align left"></i>',
        'align-center': '<i class="icon align center"></i>',
        'align-right': '<i class="icon align right"></i>',
        'quote': '<i class="icon quote left"></i>',
        'code': '<i class="icon code"></i>',
        'remove-formatting': '<i class="icon remove"></i>'
      },
      css: {
        minHeight: '300px',
        maxHeight: '400px'
      }
    };
    return options;
  }

  return {
    validateTopicForm: validateTopicForm,
    validateChannelForm: validateChannelForm,
    validateCommentForm: validateCommentForm,
    getEasyEditorOptions: getEasyEditorOptions
  };
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Header = function (_React$Component) {
  _inherits(Header, _React$Component);

  function Header(props) {
    _classCallCheck(this, Header);

    var _this = _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).call(this, props));

    _this.state = {};
    _this.onTopicChannelSelect = _this.onTopicChannelSelect.bind(_this);
    _this.followNewTopics = _this.followNewTopics.bind(_this);
    _this.unfollowNewTopics = _this.unfollowNewTopics.bind(_this);
    return _this;
  }

  _createClass(Header, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (store.getState().feed['New topics']) {
        this.setState({ followed: true });
      }
    }
  }, {
    key: 'onTopicChannelSelect',
    value: function onTopicChannelSelect(e) {
      window.top.location.href = "index.html?v=channel+id=" + e.target.value;
    }
  }, {
    key: 'followNewTopics',
    value: function followNewTopics() {
      var params = void 0;
      var query = followHelpers.generateFollowNewTopicsQuery();
      var feed = [query, params];
      var feedFollow = Object.assign({}, store.getState().feed, {});
      feedFollow['New topics'] = feed;
      Page.cmd("feedFollow", [feedFollow]);
      Page.cmd('feedListFollow', [], function (feed) {
        store.dispatch(setFeedListFollow(feed));
        this.setState({ followed: true });
      }.bind(this));
    }
  }, {
    key: 'unfollowNewTopics',
    value: function unfollowNewTopics() {
      var feedFollow = Object.assign({}, store.getState().feed, {});
      delete feedFollow['New topics'];
      Page.cmd("feedFollow", [feedFollow]);
      Page.cmd('feedListFollow', [], function (feed) {
        store.dispatch(setFeedListFollow(feed));
        this.setState({ followed: false });
      }.bind(this));
    }
  }, {
    key: 'render',
    value: function render() {
      var topLinks = channelHelpers.getTopLinksMenu().map(function (tl, index) {
        return React.createElement(
          'li',
          { key: index },
          React.createElement(
            'a',
            { href: tl.href },
            ' - ',
            tl.title
          )
        );
      });

      var route = store.getState().route;
      var channelInfoDisplay = void 0,
          channelId = void 0;
      if (route.view === 'channel' || route.view === 'topic' || route.view === 'user-admin' && route.section === 'edit-channel' || route.view === 'user-admin' && route.section === 'new-topic' || route.view === 'user-admin' && route.section === 'edit-topic' || route.id) {
        channelId = route.id;
        channelInfoDisplay = React.createElement(ChannelInfoDisplay, null);
      }

      var topLinksContainer = React.createElement(
        'ul',
        { className: 'menu' },
        topLinks,
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: 'index.html?v=channels' },
            ' - All Channels'
          )
        )
      );

      var followFeedDisplay = void 0;
      if (!this.state.followed) {
        followFeedDisplay = React.createElement(
          'span',
          { className: 'follow-header' },
          React.createElement(
            'a',
            { onClick: this.followNewTopics },
            React.createElement('i', { className: 'icon feed' }),
            'follow'
          )
        );
      } else {
        followFeedDisplay = React.createElement(
          'span',
          { className: 'follow-header' },
          React.createElement(
            'a',
            { onClick: this.unfollowNewTopics },
            React.createElement('i', { className: 'icon feed' }),
            'unfollow'
          )
        );
      }

      return React.createElement(
        'header',
        { id: 'site-header' },
        React.createElement(
          'div',
          { id: 'top-header', className: 'ui grid' },
          React.createElement(
            'div',
            { id: 'top-header-left', className: 'column eight wide computer sixteen wide tablet' },
            React.createElement(ChannelSelectContainerWrapper, {
              onTopicChannelSelect: this.onTopicChannelSelect
            }),
            topLinksContainer
          ),
          React.createElement(
            'div',
            { id: 'top-header-right', className: 'column eight wide computer sixteen wide tablet' },
            React.createElement(UserMenuWrapper, { preview: this.props.preview })
          )
        ),
        React.createElement(
          'div',
          { id: 'main-header', className: 'ui grid' },
          React.createElement(
            'div',
            { id: 'logo-container', className: 'column five wide computer' },
            React.createElement(
              'h1',
              null,
              React.createElement('span', { id: 'logo' }),
              React.createElement(
                'a',
                { href: 'index.html' },
                'ZeroVoat'
              ),
              followFeedDisplay
            )
          ),
          React.createElement(
            'div',
            { id: 'header-channel-container', className: 'column five wide computer' },
            channelInfoDisplay,
            React.createElement(HeaderSearchContainer, null)
          ),
          React.createElement(
            'div',
            { id: 'header-sort-options-container', className: 'column six wide computer' },
            React.createElement(SortOptionsContainer, null)
          )
        )
      );
    }
  }]);

  return Header;
}(React.Component);

var ChannelInfoDisplay = function (_React$Component2) {
  _inherits(ChannelInfoDisplay, _React$Component2);

  function ChannelInfoDisplay(props) {
    _classCallCheck(this, ChannelInfoDisplay);

    var _this2 = _possibleConstructorReturn(this, (ChannelInfoDisplay.__proto__ || Object.getPrototypeOf(ChannelInfoDisplay)).call(this, props));

    var followed = false;
    if (store.getState().route.view === 'channel') {
      var channelId = store.getState().route.id;
      if (store.getState().feed[channelId + " channel"]) followed = true;
    }
    _this2.state = {
      loading: true,
      followed: followed
    };
    _this2.onGetChannelInfo = _this2.onGetChannelInfo.bind(_this2);
    _this2.getChannelInfo = _this2.getChannelInfo.bind(_this2);
    _this2.followChannel = _this2.followChannel.bind(_this2);
    _this2.unfollowChannel = _this2.unfollowChannel.bind(_this2);
    return _this2;
  }

  _createClass(ChannelInfoDisplay, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.onGetChannelInfo();
    }
  }, {
    key: 'onGetChannelInfo',
    value: function onGetChannelInfo() {
      var route = store.getState().route;
      if (route.view === 'topic' || route.view === 'user-admin' && route.section === 'edit-topic') {
        var query = channelHelpers.getChannelByTopicIdQuery(route.id);
        this.getChannelInfo(query);
      } else if (route.view === 'channel' || route.view === 'user-admin' && route.section === 'edit-channel' || route.view === 'user-admin' && route.section === 'new-topic' && route.id) {
        var _query = channelHelpers.getChannelByIdQuery(route.id);
        this.getChannelInfo(_query);
      }
    }
  }, {
    key: 'getChannelInfo',
    value: function getChannelInfo(query) {
      Page.cmd('dbQuery', [query], function (res) {
        store.dispatch(setChannel(res[0]));
        if (store.getState().route.view === 'topic') {
          var followed = false;
          var channelId = store.getState().channels.channel.channel_id;
          if (store.getState().feed[channelId + " channel"]) followed = true;
          this.setState({ followed: followed });
        }
        this.setState({ loading: false });
      }.bind(this));
    }
  }, {
    key: 'followChannel',
    value: function followChannel() {
      var params = void 0;
      var channel = store.getState().channels.channel;
      var query = followHelpers.generateFollowChannelQuery(channel);
      var feed = [query, params];
      var feedFollow = Object.assign({}, store.getState().feed, {});
      feedFollow[channel.channel_id + " channel"] = feed;
      Page.cmd("feedFollow", [feedFollow]);
      Page.cmd('feedListFollow', [], function (feed) {
        store.dispatch(setFeedListFollow(feed));
        this.setState({ followed: true });
      }.bind(this));
    }
  }, {
    key: 'unfollowChannel',
    value: function unfollowChannel() {
      var feedFollow = Object.assign({}, store.getState().feed, {});
      var channelId = store.getState().channels.channel.channel_id;
      delete feedFollow[channelId + " channel"];
      Page.cmd("feedFollow", [feedFollow]);
      Page.cmd('feedListFollow', [], function (feed) {
        store.dispatch(setFeedListFollow(feed));
        this.setState({ followed: false });
      }.bind(this));
    }
  }, {
    key: 'render',
    value: function render() {
      var route = store.getState().route;
      var channelInfoDisplay = void 0,
          followFeedDisplay = void 0;
      if (!this.state.loading) {

        var channel = store.getState().channels.channel;
        channelInfoDisplay = React.createElement(
          'h3',
          null,
          React.createElement(
            'a',
            { href: "index.html?v=channel+id=" + channel.channel_id },
            channel.name
          )
        );

        if (!this.state.followed) {
          followFeedDisplay = React.createElement(
            'span',
            null,
            React.createElement(
              'a',
              { onClick: this.followChannel },
              React.createElement('i', { className: 'icon feed' }),
              'follow'
            )
          );
        } else {
          followFeedDisplay = React.createElement(
            'span',
            null,
            React.createElement(
              'a',
              { onClick: this.unfollowChannel },
              React.createElement('i', { className: 'icon feed' }),
              'unfollow'
            )
          );
        }
      }

      return React.createElement(
        'div',
        { id: 'channel-info-display-container' },
        channelInfoDisplay,
        followFeedDisplay
      );
    }
  }]);

  return ChannelInfoDisplay;
}(React.Component);

var SortOptionsContainer = function SortOptionsContainer(props) {
  var route = store.getState().route;
  var sortOptionsContainer = void 0;
  if (route.view === 'main' || route.view === 'channel' || route.view === 'search' || route.section === 'topics') sortOptionsContainer = React.createElement(TopicListSortOptionsWrapper, null);else if (route.view === 'channels' || route.section === 'channels') sortOptionsContainer = React.createElement(ChannelListSortOptions, null);
  return React.createElement(
    'div',
    { id: 'sort-options-container' },
    sortOptionsContainer
  );
};

var TopicListSortOptions = function (_React$Component3) {
  _inherits(TopicListSortOptions, _React$Component3);

  function TopicListSortOptions(props) {
    _classCallCheck(this, TopicListSortOptions);

    var _this3 = _possibleConstructorReturn(this, (TopicListSortOptions.__proto__ || Object.getPrototypeOf(TopicListSortOptions)).call(this, props));

    _this3.state = {
      loading: true
    };
    _this3.initTopicListSortOptions = _this3.initTopicListSortOptions.bind(_this3);
    _this3.onSortTopicList = _this3.onSortTopicList.bind(_this3);
    _this3.onAnonymousNewTopicClick = _this3.onAnonymousNewTopicClick.bind(_this3);
    return _this3;
  }

  _createClass(TopicListSortOptions, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.initTopicListSortOptions();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.site_info.cert_user_id !== nextProps.site_info.cert_user_id) {
        this.forceUpdate();
      }
    }
  }, {
    key: 'initTopicListSortOptions',
    value: function initTopicListSortOptions() {
      var route = store.getState().route;
      var sort_options = topicHelpers.getTopicSortOptions(route.sort_by);
      store.dispatch(setSortOptions(sort_options));
      if (route.sort_by) {
        store.dispatch(sortTopics(route.sort_by));
      }
      this.setState({ loading: false });
    }
  }, {
    key: 'onSortTopicList',
    value: function onSortTopicList(label) {
      store.dispatch(sortTopics(label));
    }
  }, {
    key: 'onAnonymousNewTopicClick',
    value: function onAnonymousNewTopicClick() {
      Page.cmd("wrapperNotification", ["info", "Please login to participate", 5000]);
    }
  }, {
    key: 'rebuildDb',
    value: function rebuildDb() {}
  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      var topicListSortOptionsDisplay = void 0;
      if (this.state.loading) {
        topicListSortOptionsDisplay = React.createElement(Loading, { msg: ' ', cssClass: ' mini centered' });
      } else {
        var sortOptions = store.getState().topics.sort_options.map(function (so, index) {
          return React.createElement(
            'li',
            { key: index, className: 'item native-btn transparent' },
            React.createElement(
              'a',
              { onClick: function onClick() {
                  return _this4.onSortTopicList(so.label);
                } },
              so.label
            )
          );
        });
        var route = store.getState().route;
        var newTopicBtn = void 0;
        if (route.id) {
          if (this.props.site_info.cert_user_id) {
            newTopicBtn = React.createElement(
              'li',
              { className: 'item native-btn' },
              React.createElement(
                'a',
                { href: "index.html?v=user-admin+s=new-topic+id=" + route.id },
                'New Topic'
              )
            );
          } else {
            newTopicBtn = React.createElement(
              'li',
              { className: 'item native-btn' },
              React.createElement(
                'a',
                { onClick: this.onAnonymousNewTopicClick },
                'New Topic'
              )
            );
          }
        }
        topicListSortOptionsDisplay = React.createElement(
          'ul',
          { className: 'menu' },
          sortOptions,
          newTopicBtn
        );
      }

      return React.createElement(
        'div',
        { id: 'topic-list-sort-options' },
        topicListSortOptionsDisplay
      );
    }
  }]);

  return TopicListSortOptions;
}(React.Component);

var mapStateToTopicListSortOptionsProps = function mapStateToTopicListSortOptionsProps(state) {
  var site_info = state.site_info;
  return {
    site_info: site_info
  };
};

var mapDispatchToTopicListSortOptionsProps = function mapDispatchToTopicListSortOptionsProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var TopicListSortOptionsWrapper = ReactRedux.connect(mapStateToTopicListSortOptionsProps, mapDispatchToTopicListSortOptionsProps)(TopicListSortOptions);

var ChannelListSortOptions = function (_React$Component4) {
  _inherits(ChannelListSortOptions, _React$Component4);

  function ChannelListSortOptions(props) {
    _classCallCheck(this, ChannelListSortOptions);

    var _this5 = _possibleConstructorReturn(this, (ChannelListSortOptions.__proto__ || Object.getPrototypeOf(ChannelListSortOptions)).call(this, props));

    _this5.state = {
      loading: true
    };
    _this5.initChannelsSortOptions = _this5.initChannelsSortOptions.bind(_this5);
    _this5.onSortOptionChange = _this5.onSortOptionChange.bind(_this5);
    return _this5;
  }

  _createClass(ChannelListSortOptions, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.initChannelsSortOptions();
    }
  }, {
    key: 'initChannelsSortOptions',
    value: function initChannelsSortOptions() {
      var sort_options = channelHelpers.getChannelSortOptions();
      store.dispatch(setChannelSortOptions(sort_options));
      store.dispatch(sortChannels(sort_options[0].label));
      this.setState({ loading: false });
    }
  }, {
    key: 'onSortOptionChange',
    value: function onSortOptionChange(e) {
      store.dispatch(sortChannels(e.target.value));
    }
  }, {
    key: 'render',
    value: function render() {
      var channelsSortOptionsDisplay = void 0;
      if (!this.state.loading) {
        var sortBy = store.getState().channels.sort_options.find(function (so) {
          return so.current === true;
        });
        var sortOptions = store.getState().channels.sort_options.map(function (so, index) {
          return React.createElement(
            'option',
            { key: index, value: so.label },
            so.label
          );
        });
        channelsSortOptionsDisplay = React.createElement(
          'form',
          { className: 'ui form' },
          React.createElement(
            'div',
            { className: 'inline field' },
            React.createElement(
              'label',
              null,
              'Sort Channels:'
            ),
            React.createElement(
              'select',
              {
                className: 'ui fluid dropdown',
                onChange: this.onSortOptionChange,
                defaultValue: sortBy.label },
              sortOptions
            )
          )
        );
      }
      return React.createElement(
        'div',
        { id: 'channel-list-sort-options' },
        channelsSortOptionsDisplay
      );
    }
  }]);

  return ChannelListSortOptions;
}(React.Component);

var ChannelSelectContainer = function (_React$Component5) {
  _inherits(ChannelSelectContainer, _React$Component5);

  function ChannelSelectContainer(props) {
    _classCallCheck(this, ChannelSelectContainer);

    var _this6 = _possibleConstructorReturn(this, (ChannelSelectContainer.__proto__ || Object.getPrototypeOf(ChannelSelectContainer)).call(this, props));

    _this6.state = {
      loading: true
    };
    return _this6;
  }

  _createClass(ChannelSelectContainer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var route = store.getState().route;
      if (route.view === 'main' || route.view === 'user-admin' || route.view === 'search') {
        this.setState({ loading: false });
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {

      if (!this.props.channels.channel && nextProps.channels.channel) {
        this.forceUpdate();
        this.setState({ channel_id: nextProps.channels.channel.channel_id, loading: false });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var selectDisplay = void 0;
      if (!this.state.loading) {
        selectDisplay = React.createElement(ChannelSelectElement, {
          onTopicChannelSelect: this.props.onTopicChannelSelect,
          channelId: this.state.channel_id
        });
      }
      return React.createElement(
        'form',
        { id: 'select-channel-form', name: 'header-channel-select', className: 'ui form' },
        React.createElement(
          'div',
          { className: 'field' },
          selectDisplay
        )
      );
    }
  }]);

  return ChannelSelectContainer;
}(React.Component);

var mapStateToChannelSelectContainerProps = function mapStateToChannelSelectContainerProps(state) {
  var channels = state.channels;
  return {
    channels: channels
  };
};

var mapDispatchToChannelSelectContainerProps = function mapDispatchToChannelSelectContainerProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var ChannelSelectContainerWrapper = ReactRedux.connect(mapStateToChannelSelectContainerProps, mapDispatchToChannelSelectContainerProps)(ChannelSelectContainer);

var HeaderSearchContainer = function (_React$Component6) {
  _inherits(HeaderSearchContainer, _React$Component6);

  function HeaderSearchContainer(props) {
    _classCallCheck(this, HeaderSearchContainer);

    var _this7 = _possibleConstructorReturn(this, (HeaderSearchContainer.__proto__ || Object.getPrototypeOf(HeaderSearchContainer)).call(this, props));

    _this7.state = {
      text: ''
    };
    _this7.onSearchTextChange = _this7.onSearchTextChange.bind(_this7);
    _this7.onSearchButtonClick = _this7.onSearchButtonClick.bind(_this7);
    return _this7;
  }

  _createClass(HeaderSearchContainer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var route = store.getState().route;
      if (route.view === 'search') {
        this.setState({ text: route.id });
      }
    }
  }, {
    key: 'onSearchTextChange',
    value: function onSearchTextChange(e) {
      this.setState({ text: e.target.value });
    }
  }, {
    key: 'onSearchButtonClick',
    value: function onSearchButtonClick() {
      window.top.location.href = "index.html?v=search+id=" + this.state.text;
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { id: 'header-search-container' },
        React.createElement('input', { type: 'text', placeholder: 'search topics...', value: this.state.text, onChange: this.onSearchTextChange }),
        React.createElement(
          'button',
          { type: 'button', className: 'native-btn', onClick: this.onSearchButtonClick },
          React.createElement(
            'a',
            { href: this.state.link },
            React.createElement('i', { className: 'search icon' })
          )
        )
      );
    }
  }]);

  return HeaderSearchContainer;
}(React.Component);
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Loading = function Loading(props) {
  var cssClass = "ui active loader inline text";
  var loadingText = "Loading";
  if (props.msg) loadingText = props.msg;
  if (props.cssClass) cssClass += " " + props.cssClass;
  return React.createElement(
    "div",
    { className: cssClass },
    loadingText
  );
};

var LoadingCubeGrid = function LoadingCubeGrid(props) {
  return React.createElement(
    "div",
    { className: "sk-cube-grid" },
    React.createElement("div", { className: "sk-cube sk-cube1" }),
    React.createElement("div", { className: "sk-cube sk-cube2" }),
    React.createElement("div", { className: "sk-cube sk-cube3" }),
    React.createElement("div", { className: "sk-cube sk-cube4" }),
    React.createElement("div", { className: "sk-cube sk-cube5" }),
    React.createElement("div", { className: "sk-cube sk-cube6" }),
    React.createElement("div", { className: "sk-cube sk-cube7" }),
    React.createElement("div", { className: "sk-cube sk-cube8" }),
    React.createElement("div", { className: "sk-cube sk-cube9" })
  );
};

var ItemMediaContainer = function (_React$Component) {
  _inherits(ItemMediaContainer, _React$Component);

  function ItemMediaContainer(props) {
    _classCallCheck(this, ItemMediaContainer);

    var _this = _possibleConstructorReturn(this, (ItemMediaContainer.__proto__ || Object.getPrototypeOf(ItemMediaContainer)).call(this, props));

    _this.state = {
      loading: true
    };
    _this.initItemMediaContainer = _this.initItemMediaContainer.bind(_this);
    _this.onGetFile = _this.onGetFile.bind(_this);
    _this.getFile = _this.getFile.bind(_this);
    _this.onGetEmbededFile = _this.onGetEmbededFile.bind(_this);
    _this.getOptionalFileInfo = _this.getOptionalFileInfo.bind(_this);
    _this.handleExternalEmbedUrl = _this.handleExternalEmbedUrl.bind(_this);
    _this.showExternalLink = _this.showExternalLink.bind(_this);
    _this.onImageLoadError = _this.onImageLoadError.bind(_this);
    _this.onImageLoad = _this.onImageLoad.bind(_this);
    return _this;
  }

  _createClass(ItemMediaContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.initItemMediaContainer();
    }
  }, {
    key: "initItemMediaContainer",
    value: function initItemMediaContainer() {
      var item = void 0;
      if (this.props.topic) item = this.props.topic;else if (this.props.comment) item = this.props.comment;else if (this.props.profile) item = this.props.profile;
      if (item.file_to_item_id || item.added <= 1498441955800) {
        this.onGetFile();
      } else if (item.embed_url) {
        this.onGetEmbededFile(item);
      }
    }
  }, {
    key: "onGetFile",
    value: function onGetFile() {
      var fileToItemId = void 0;
      if (this.props.topic) fileToItemId = this.props.topic.file_to_item_id;else if (this.props.comment) fileToItemId = this.props.comment.file_to_item_id;else if (this.props.profile) fileToItemId = this.props.profile.file_to_item_id;
      if (fileToItemId) {
        this.setState({ file: true }, function () {
          var query = fileHelpers.getFileToItemQuery(fileToItemId);
          Page.cmd('dbQuery', [query], function (res) {
            if (res.length > 0) {
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
  }, {
    key: "getFile",
    value: function getFile(fileId) {
      var query = void 0;
      if (!fileId) query = "SELECT * FROM file WHERE item_id='" + this.props.topic.topic_id + "'";else query = fileHelpers.getFileQuery(fileId);
      Page.cmd('dbQuery', [query], function (res) {
        if (res.length > 0) {
          var file = res[0];
          var mediaType = fileHelpers.determineFileMediaType(file.file_type);
          var config = store.getState().config;
          var directory = file.directory;
          if (!file.directory) directory = store.getState().config.cluster + "/data/users/" + file.user_id;
          var inner_path = "merged-" + config.merger_name + "/" + directory + "/" + file.file_name;
          this.getOptionalFileInfo(inner_path, mediaType, file.file_type);
        } else {
          console.log('no file');
        }
      }.bind(this));
    }
  }, {
    key: "onGetEmbededFile",
    value: function onGetEmbededFile(item) {
      var lastDot = item.embed_url.lastIndexOf('.');
      var fileType = item.embed_url.substring(lastDot + 1);
      var mediaType = fileHelpers.determineFileMediaType(fileType);
      var urlIsExternal = false;
      if (item.embed_url.indexOf('http:') > -1 || item.embed_url.indexOf('https:') > -1) urlIsExternal = true;
      if (urlIsExternal) this.handleExternalEmbedUrl(item.embed_url, mediaType, fileType);else this.getOptionalFileInfo(item.embed_url, mediaType, fileType);
    }
  }, {
    key: "getOptionalFileInfo",
    value: function getOptionalFileInfo(inner_path, mediaType, fileType) {
      Page.cmd("optionalFileInfo", inner_path, function (res) {
        var peers = void 0,
            piecesInfo = void 0;
        if (res) {
          peers = res.peer;
          piecesInfo = fileHelpers.getItemFilePiecesInfo(res);
        }
        this.setState({
          filePath: inner_path,
          fileType: fileType,
          mediaType: mediaType,
          peers: peers,
          piecesInfo: piecesInfo,
          loading: false
        }, function () {
          var downloads = res && res.is_downloaded === 1 && res.is_downloading === 1;
          if (!res.uploaded || downloads) {
            if (res.pieces === res.pieces_downloaded) {
              this.setState({ downloadState: 'downloaded' });
            } else {
              var partialyDownloads = res.is_downloading === 1 || res.is_downloaded === 1;
              var someData = res.pieces_downloaded > 0 || res.bytes_downloaded > 0;
              if (someData || partialyDownloads) {
                this.setState({ downloadState: 'downloading' });
                this.downloadFile(res, inner_path);
              } else {
                this.setState({ downloadState: 'downloading' });
                this.downloadFile(res, inner_path);
              }
            }
          }
        });
      }.bind(this));
    }
  }, {
    key: "downloadFile",
    value: function downloadFile(fileInfo, inner_path) {
      Page.cmd("fileNeed", inner_path, function (res) {
        var th = this;
        Page.onRequest = function (cmd, message) {
          var clusterId = inner_path.split("/")[1];
          var filePath = inner_path.split(clusterId + "/")[1];
          var msgInfo = void 0,
              eventPath = void 0,
              fileChunk = void 0;
          if (message.event[0]) msgInfo = message.event[0];
          if (message.event[1]) eventPath = message.event[1];
          if (eventPath && eventPath.indexOf('|') > -1) {
            fileChunk = eventPath.split('|')[1];
            eventPath = eventPath.split('|')[0];
          }
          if (cmd == "setSiteInfo" && eventPath === filePath) {
            if (msgInfo === "file_failed") {
              th.updateFilePiecesInfo(fileChunk, msgInfo);
              th.setState({ downloadState: 'download failed' });
            } else {
              Page.cmd("optionalFileInfo", inner_path, function (res) {
                var piecesInfo = fileHelpers.getItemFilePiecesInfo(res);
                th.setState({
                  piecesInfo: piecesInfo
                }, function () {
                  clearInterval(this.checkDownloadDuration);
                });
              }.bind(th));
            }
          }
        };
      }.bind(this));
    }
  }, {
    key: "updateFilePiecesInfo",
    value: function updateFilePiecesInfo(fileChunk, msgInfo) {
      var fileChunkStart = parseInt(fileChunk.split('-')[0]);
      var fileChunkEnd = parseInt(fileChunk.split('-')[1]);
      var piecesInfo = this.state.piecesInfo.map(function (pi) {
        if (pi.start === fileChunkStart || pi.end === fileChunkEnd) {
          if (msgInfo === 'file_failed') {
            return Object.assign({}, pi, {
              state: 'failed'
            });
          }
        } else {
          return pi;
        }
      });
      this.setState({ piecesInfo: piecesInfo });
    }
  }, {
    key: "handleExternalEmbedUrl",
    value: function handleExternalEmbedUrl(inner_path, mediaType, fileType) {
      this.setState({
        filePath: inner_path,
        fileType: fileType,
        mediaType: mediaType,
        loading: false,
        external: true,
        show_external: false
      });
    }
  }, {
    key: "showExternalLink",
    value: function showExternalLink() {
      this.setState({ show_external: true });
    }
  }, {
    key: "onImageLoadError",
    value: function onImageLoadError() {
      this.setState({ loaded: true, error: true });
    }
  }, {
    key: "onImageLoad",
    value: function onImageLoad() {
      this.setState({ loaded: true });
    }
  }, {
    key: "render",
    value: function render() {
      var mediaDisplay = void 0,
          peerDisplay = void 0,
          filePiecesDisplay = void 0,
          containerCssClass = "item-media-container";

      var mediaItemExternalTagLine = void 0;
      if (this.state.external) {
        mediaItemExternalTagLine = this.props.topic.embed_url;
      }

      if (this.state.loading) {
        mediaDisplay = React.createElement(Loading, { cssClass: "centered", msg: "Loading Item Media..." });
      } else {
        if (!this.state.mediaType) {
          mediaDisplay = React.createElement("img", { className: "not-found", src: "assets/img/404-not-found.png" });
        } else if (this.state.external && !this.state.show_external) {
          mediaDisplay = React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              { onClick: this.showExternalLink, className: "external-link-overlay" },
              "External!",
              React.createElement("br", null),
              "Load?"
            ),
            mediaItemExternalTagLine
          );
        } else {
          if (this.state.external) {
            peerDisplay = React.createElement(
              "div",
              { className: "item-media-peers-display red" },
              "external"
            );
          } else {
            peerDisplay = React.createElement(
              "div",
              { className: "item-media-peers-display" },
              "peers : ",
              this.state.peers
            );
          }

          if (this.state.piecesInfo && this.state.piecesInfo.length > 0) {
            filePiecesDisplay = React.createElement(ItemFileInfoDownloadBar, {
              piecesInfo: this.state.piecesInfo,
              downloadState: this.state.downloadState
            });
            containerCssClass += " w-pieces ";
          }
          if (this.state.mediaType === 'image') {
            containerCssClass += " image";
            if (!this.state.loaded) containerCssClass += " image-loading ui segment";
            if (this.state.error) {
              mediaDisplay = React.createElement("img", { className: "not-found", src: "assets/img/404-not-found.png" });
            } else {
              mediaDisplay = React.createElement(
                "div",
                null,
                React.createElement("img", {
                  onError: this.onImageLoadError,
                  onLoad: this.onImageLoad,
                  src: this.state.filePath }),
                mediaItemExternalTagLine
              );
            }
          } else if (this.state.mediaType === 'video' || this.state.mediaType === 'audio') {
            mediaDisplay = React.createElement(
              "div",
              null,
              React.createElement(VideoPlayer, {
                filePath: this.state.filePath,
                fileType: this.state.fileType,
                mediaType: this.state.mediaType,
                comment: this.props.comment }),
              mediaItemExternalTagLine
            );
            containerCssClass += " video";
          }
        }
      }
      return React.createElement(
        "div",
        { className: containerCssClass },
        mediaDisplay,
        peerDisplay,
        filePiecesDisplay
      );
    }
  }]);

  return ItemMediaContainer;
}(React.Component);

var ItemHtmlBodyRender = function (_React$Component2) {
  _inherits(ItemHtmlBodyRender, _React$Component2);

  function ItemHtmlBodyRender(props) {
    _classCallCheck(this, ItemHtmlBodyRender);

    var _this2 = _possibleConstructorReturn(this, (ItemHtmlBodyRender.__proto__ || Object.getPrototypeOf(ItemHtmlBodyRender)).call(this, props));

    _this2.state = {
      loading: true
    };
    _this2.replaceMediaInContent = _this2.replaceMediaInContent.bind(_this2);
    _this2.onContentChunkClick = _this2.onContentChunkClick.bind(_this2);
    return _this2;
  }

  _createClass(ItemHtmlBodyRender, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.setState({ content: this.props.content, mediaItemIndex: 1 }, function () {
        this.replaceMediaInContent();
      });
    }
  }, {
    key: "replaceMediaInContent",
    value: function replaceMediaInContent() {

      var oTag = void 0,
          cTag = void 0,
          checkInner = false;
      if (this.state.content.indexOf('<figure') > -1) {
        oTag = '<figure';
        cTag = '</figure>';
        checkInner = true;
      } else if (this.state.content.indexOf('<img') > -1) {
        oTag = '<img';
        cTag = '>';
      }

      if (oTag) {

        var removedMediaItemHtml = oTag + this.state.content.split(oTag)[1].split(cTag)[0] + cTag;
        var contentChunkBefore = this.state.content.split(removedMediaItemHtml)[0];
        var content = this.state.content.split(removedMediaItemHtml)[1];

        var hasInner = true;
        if (checkInner) {
          if (removedMediaItemHtml.indexOf('<img') > -1) hasInner = true;else hasInner = false;
        }

        var contentChunks = [],
            removedMediaItems = [],
            mediaItemIndex = this.state.mediaItemIndex;
        if (hasInner === true) {
          var removedMediaItem = {
            // html:removedMediaItemHtml,
            index: this.state.mediaItemIndex
          };
          removedMediaItems = [removedMediaItem];
          if (this.state.removedMediaItems) removedMediaItems = removedMediaItems.concat(this.state.removedMediaItems);
          var mediaContentUrl = 'http' + removedMediaItemHtml.split('"http')[1].split('"')[0];

          var replacementMediaContent = '<a class="toggle-media-item-link" style="cursor:pointer;" rel="' + this.state.mediaItemIndex + '">' +
          // + ' - ' +
          '(Warning: EXTERNAL Source, click to show) ' + mediaContentUrl + '</a>';

          removedMediaItem.html = '<div class="media-item-wrapper">' + '<a class="toggle-media-item-link" style="cursor:pointer;" rel="close-' + this.state.mediaItemIndex + '">' +
          // + ' - ' +
          '(Warning: EXTERNAL Source, click to show) ' + mediaContentUrl + '</a>' + '</hr>' + removedMediaItemHtml + '</div>';

          contentChunks = [contentChunkBefore, replacementMediaContent];
          if (this.state.contentChunks) contentChunks = contentChunks.concat(this.state.contentChunks);

          mediaItemIndex = this.state.mediaItemIndex += 1;
        } else {
          removedMediaItems = this.state.removedMediaItems;
          contentChunks = this.state.contentChunks;
        }

        this.setState({
          contentChunks: contentChunks,
          removedMediaItems: removedMediaItems,
          mediaItemIndex: mediaItemIndex,
          content: content
        }, function () {
          this.replaceMediaInContent();
        });
      } else {

        var _contentChunks = [];
        if (this.state.contentChunks) _contentChunks = this.state.contentChunks;
        _contentChunks = _contentChunks.concat(this.state.content);
        this.setState({
          contentChunks: _contentChunks,
          loading: false
        });
      }
    }
  }, {
    key: "onContentChunkClick",
    value: function onContentChunkClick(e) {
      var rel = void 0,
          action = void 0;
      if (e.target.rel && e.target.rel.indexOf('close') > -1) {
        rel = e.target.rel.split('-')[1];
        action = 'close';
      } else {
        rel = parseInt(e.target.rel);
        action = 'open';
      }

      if (action === "open") {
        var clickedMediaItemHtml = void 0;
        this.state.removedMediaItems.forEach(function (rmi, index) {
          if (rel === rmi.index) clickedMediaItemHtml = rmi.html;
        });
        $('a[rel="' + rel + '"]').replaceWith(clickedMediaItemHtml);
      } else {
        $(e.target).attr('rel', rel);
        $(e.target).next('img').remove();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      if (this.state.loading) {
        return React.createElement(
          "div",
          { className: "ui segment" },
          React.createElement(Loading, { msg: "loading content", cssClass: "centered" })
        );
      } else {
        var contentChunksDisplay = this.state.contentChunks.map(function (cc, index) {
          return React.createElement("article", { onClick: _this3.onContentChunkClick, key: index, dangerouslySetInnerHTML: { __html: cc } });
        });
        return React.createElement(
          "article",
          { className: "ui" },
          contentChunksDisplay
        );
      }
    }
  }]);

  return ItemHtmlBodyRender;
}(React.Component);

var itemHtmlBodyExternalLinkOverlay = function (_React$Component3) {
  _inherits(itemHtmlBodyExternalLinkOverlay, _React$Component3);

  function itemHtmlBodyExternalLinkOverlay(props) {
    _classCallCheck(this, itemHtmlBodyExternalLinkOverlay);

    var _this4 = _possibleConstructorReturn(this, (itemHtmlBodyExternalLinkOverlay.__proto__ || Object.getPrototypeOf(itemHtmlBodyExternalLinkOverlay)).call(this, props));

    _this4.state = {};
    return _this4;
  }

  _createClass(itemHtmlBodyExternalLinkOverlay, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { "class": "external-link-overlay" },
        "External!",
        React.createElement("br", null),
        "Load?"
      );
    }
  }]);

  return itemHtmlBodyExternalLinkOverlay;
}(React.Component);

var ItemFileInfoDownloadBar = function (_React$Component4) {
  _inherits(ItemFileInfoDownloadBar, _React$Component4);

  function ItemFileInfoDownloadBar() {
    _classCallCheck(this, ItemFileInfoDownloadBar);

    return _possibleConstructorReturn(this, (ItemFileInfoDownloadBar.__proto__ || Object.getPrototypeOf(ItemFileInfoDownloadBar)).apply(this, arguments));
  }

  _createClass(ItemFileInfoDownloadBar, [{
    key: "render",
    value: function render() {
      var _this6 = this;

      var pieces = void 0,
          containerCssClass = "";
      if (this.props.piecesInfo.length > 0) {
        pieces = this.props.piecesInfo.map(function (pi, i) {
          return React.createElement(ItemFileInfoDownloadBarPiece, {
            key: i,
            piece: pi,
            piecesLength: _this6.props.piecesInfo.length
          });
        });
      } else {
        if (this.props.fileInfo && this.props.fileInfo.is_downloaded === 1) {
          containerCssClass = "non-bfs-loaded";
        }
      }

      return React.createElement(
        "div",
        { className: "item-file-piece-download-info-container " + containerCssClass },
        pieces,
        React.createElement(
          "span",
          { className: "download-status" },
          this.props.downloadState
        )
      );
    }
  }]);

  return ItemFileInfoDownloadBar;
}(React.Component);

var ItemFileInfoDownloadBarPiece = function (_React$Component5) {
  _inherits(ItemFileInfoDownloadBarPiece, _React$Component5);

  function ItemFileInfoDownloadBarPiece() {
    _classCallCheck(this, ItemFileInfoDownloadBarPiece);

    return _possibleConstructorReturn(this, (ItemFileInfoDownloadBarPiece.__proto__ || Object.getPrototypeOf(ItemFileInfoDownloadBarPiece)).apply(this, arguments));
  }

  _createClass(ItemFileInfoDownloadBarPiece, [{
    key: "render",
    value: function render() {
      var pieceWidth = 100 / this.props.piecesLength;
      var containerClass = "ui progress ";
      if (this.props.piece.state === 'complete') containerClass += " success";else if (this.props.piece.state === 'downloading') containerClass += " active";else if (this.props.piece.state === 'failed') containerClass += "error";

      return React.createElement(
        "div",
        { style: { width: pieceWidth + '%' }, className: "piece " + this.props.piece.state },
        React.createElement(
          "div",
          { className: containerClass },
          React.createElement(
            "div",
            { className: "bar" },
            React.createElement("div", { className: "progress" })
          )
        )
      );
    }
  }]);

  return ItemFileInfoDownloadBarPiece;
}(React.Component);

var ItemEditToolBar = function (_React$Component6) {
  _inherits(ItemEditToolBar, _React$Component6);

  function ItemEditToolBar(props) {
    _classCallCheck(this, ItemEditToolBar);

    var _this8 = _possibleConstructorReturn(this, (ItemEditToolBar.__proto__ || Object.getPrototypeOf(ItemEditToolBar)).call(this, props));

    _this8.state = {
      loading: true
    };
    _this8.getItemCurrentModeration = _this8.getItemCurrentModeration.bind(_this8);
    _this8.toggleTopicVisibility = _this8.toggleTopicVisibility.bind(_this8);
    _this8.toggleItemVisibility = _this8.toggleItemVisibility.bind(_this8);
    _this8.onCreateModeration = _this8.onCreateModeration.bind(_this8);
    _this8.createModeration = _this8.createModeration.bind(_this8);
    _this8.handleDeleteItemClick = _this8.handleDeleteItemClick.bind(_this8);
    _this8.onDeleteTopic = _this8.onDeleteTopic.bind(_this8);
    _this8.deleteTopic = _this8.deleteTopic.bind(_this8);
    return _this8;
  }

  _createClass(ItemEditToolBar, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.getItemCurrentModeration();
    }
  }, {
    key: "getItemCurrentModeration",
    value: function getItemCurrentModeration() {
      var itemId = void 0;
      if (this.props.topic) itemId = this.props.topic.topic_id;else if (this.props.comment) itemId = this.props.comment.comment_id;
      var query = "SELECT * FROM moderation WHERE item_id='" + itemId + "' AND current=1";
      Page.cmd('dbQuery', [query], function (res) {
        if (res.length > 0) {
          this.setState({ moderation: res[0], loading: false });
        } else {
          this.setState({ loading: false });
        }
      }.bind(this));
    }
  }, {
    key: "toggleTopicVisibility",
    value: function toggleTopicVisibility() {
      var moderation = {
        channel_id: this.props.topic.channel_id,
        item_type: 'topic',
        item_id: this.props.topic.topic_id,
        moderator_name: store.getState().user.user_name,
        topic_id: this.props.topic.topic_id,
        moderation_type: 'visibility'
      };
      this.toggleItemVisibility(this.props.topic, moderation);
    }
  }, {
    key: "toggleItemVisibility",
    value: function toggleItemVisibility(item, moderation) {
      moderation.moderation_type = 'visibility';
      if (!this.state.moderation || this.state.moderation.visible === 1) {
        moderation.visible = 0;
      } else {
        moderation.visible = 1;
      }
      moderation.current = 1;
      this.onCreateModeration(item, moderation);
    }
  }, {
    key: "onCreateModeration",
    value: function onCreateModeration(item, moderation) {
      var state = store.getState();
      if (this.state.moderation) {
        var query = "SELECT * FROM json WHERE json.json_id='" + this.state.moderation.json_id + "'";
        Page.cmd('dbQuery', [query], function (res) {
          var json = res[0];
          var inner_path = "merged-" + state.config.merger_name + "/" + json.directory + "/" + json.file_name;
          this.createModeration(inner_path, moderation);
        }.bind(this));
      } else {
        var inner_path = "merged-" + state.config.merger_name + "/" + state.config.cluster + "/data/users/" + state.site_info.auth_address + "/data.json";
        this.createModeration(inner_path, moderation);
      }
    }
  }, {
    key: "createModeration",
    value: function createModeration(inner_path, moderation) {
      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
        var _this9 = this;

        data = JSON.parse(data);
        if (data) {
          if (!data.moderation) {
            data.moderation = [];
            data.next_moderation_id = 1;
          }
        } else {
          data = {
            "moderation": [],
            "next_moderation_id": 1
          };
        }

        if (this.state.moderation) {
          var moderationIndex = data.moderation.findIndex(function (m) {
            return m.moderation_id === _this9.state.moderation.moderation_id;
          });
          data.moderation[moderationIndex].current = 0;
        }
        moderation.moderation_id = store.getState().site_info.auth_address + "mod" + data.next_moderation_id;
        data.moderation.push(moderation);
        data.next_moderation_id += 1;
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            this.getItemCurrentModeration();
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "handleDeleteItemClick",
    value: function handleDeleteItemClick() {
      jQuery('#' + this.props.topic.topic_id + "-delete-modal").modal('show');
    }
  }, {
    key: "onDeleteTopic",
    value: function onDeleteTopic() {
      var query = "SELECT * FROM json WHERE json_id='" + this.props.topic.json_id + "'";
      Page.cmd('dbQuery', [query], function (res) {
        var inner_path = "merged-" + store.getState().config.merger_name + "/" + res[0].directory;
        this.deleteTopic(inner_path);
      }.bind(this));
    }
  }, {
    key: "deleteTopic",
    value: function deleteTopic(inner_path) {
      Page.cmd('fileGet', { inner_path: inner_path + "/data.json" }, function (data) {
        var _this10 = this;

        data = JSON.parse(data);
        var fileToDeleteNames = [],
            fileToDeleteIDs = [],
            fileToItemToDeleteIDs = [];
        if (this.props.topic.file_id) {
          fileToDeleteNames.push(this.props.topic.file_name);
          var fileIndex = data.file.findIndex(function (f) {
            return f.file_id === _this10.props.topic.file_id;
          });
          fileToDeleteIDs.push(data.file[fileIndex].file_id);
          var fileToItemIndex = data.file_to_item.findIndex(function (fti) {
            return fti.file_to_item_id === _this10.props.topic.file_to_item_id;
          });
          fileToItemToDeleteIDs.push(data.file_to_item[fileToItemIndex].file_to_item_id);
        }
        var query = commentHelpers.getCommentsQuery(this.props.topic.topic_id, store.getState().site_info.cert_user_id);
        Page.cmd('dbQuery', [query], function (res) {
          var commentsToDeleteIDs = [];
          if (res.length > 0) {
            var comments = res;
            comments.forEach(function (comment, index) {
              commentsToDeleteIDs.push(comment.comment_id);
              if (comment.file_name) {
                fileToDeleteNames.push(comment.file_name);
                var _fileIndex = data.file.findIndex(function (f) {
                  return f.file_id === comment.file_id;
                });
                fileToDeleteIDs.push(data.file[_fileIndex].file_id);
                var _fileToItemIndex = data.file_to_item.findIndex(function (fti) {
                  return fti.file_to_item_id === comment.file_to_item_id;
                });
                fileToItemToDeleteIDs.push(data.file_to_item[_fileToItemIndex].file_to_item_id);
              }
            });
          }
          if (fileToDeleteIDs.length > 0 || commentsToDeleteIDs.length > 0) {
            this.deleteTopicRelatedItems(data, inner_path, commentsToDeleteIDs, fileToDeleteNames, fileToDeleteIDs, fileToItemToDeleteIDs);
          } else {
            this.finishDeleteTopic(data, inner_path);
          }
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "deleteTopicRelatedItems",
    value: function deleteTopicRelatedItems(data, inner_path, commentsToDeleteIDs, fileToDeleteNames, fileToDeleteIDs, fileToItemToDeleteIDs) {
      if (fileToDeleteIDs && fileToDeleteIDs.length > 0) {
        fileToDeleteIDs.forEach(function (ftd, index) {
          var fileIndex = data.file.findIndex(function (f) {
            return f.file_id === ftd;
          });
          data.file.splice(fileIndex, 1);
          var fileToItemIndex = data.file_to_item.findIndex(function (fti) {
            return fti.file_to_item_id === fileToItemToDeleteIDs[index];
          });
          data.file_to_item.splice(fileToItemIndex, 1);
        });
        this.setState({ fileToDeleteNames: fileToDeleteNames, fileToDeleteIndex: 0 }, function () {
          this.onDeleteTopicRelatedFiles(data, inner_path, commentsToDeleteIDs);
        });
      } else if (commentsToDeleteIDs.length > 0) {
        commentsToDeleteIDs.forEach(function (ctd, index) {
          var commentIndex = data.comment.findIndex(function (c) {
            return c.comment_id === ctd;
          });
          data.comment.splice(commentIndex, 1);
        });
        this.finishDeleteTopic(data, inner_path);
      }
    }
  }, {
    key: "onDeleteTopicRelatedFiles",
    value: function onDeleteTopicRelatedFiles(data, inner_path, commentsToDeleteIDs) {
      if (this.state.fileToDeleteNames.length === this.state.fileToDeleteIndex) {
        this.deleteTopicRelatedItems(data, inner_path, commentsToDeleteIDs);
      } else {
        Page.cmd('fileDelete', { inner_path: inner_path + "/" + this.state.fileToDeleteNames[this.state.fileToDeleteIndex] }, function (res) {
          this.setState({ fileToDeleteIndex: this.state.fileToDeleteIndex += 1 }, function () {
            this.onDeleteTopicRelatedFiles(data, inner_path, commentsToDeleteIDs);
          });
        }.bind(this));
      }
    }
  }, {
    key: "finishDeleteTopic",
    value: function finishDeleteTopic(data, inner_path) {
      var _this11 = this;

      var topicIndex = data.topic.findIndex(function (t) {
        return t.topic_id === _this11.props.topic.topic_id;
      });
      data.topic.splice(topicIndex, 1);
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path + "/data.json", btoa(json_raw)], function (res) {
        Page.cmd("sitePublish", { "inner_path": inner_path + "/data.json" }, function (res) {
          if (store.getState().route.view === 'topic') {
            window.top.location.href = "index.html?v=channel+id=" + this.props.topic.channel_id;
          } else {
            this.props.onDeleteTopic();
          }
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {
      var itemEditToolBarDisplay = void 0;
      if (!this.state.loading) {
        if (this.props.topic) {
          var t = this.props.topic;
          var visibilityIconCssClass = "icon toggle on",
              visibilityIconText = "hide";

          if (this.state.moderation && this.state.moderation.current === 1 && this.state.moderation.visible === 0) {
            visibilityIconCssClass = "icon toggle off";
            visibilityIconText = "show";
          }

          itemEditToolBarDisplay = React.createElement(
            "div",
            { className: "topic-edit-tool-bar" },
            React.createElement(
              "a",
              { href: "index.html?v=user-admin+s=edit-topic+id=" + t.topic_id },
              React.createElement("i", { className: "icon edit" }),
              " edit"
            )
          );

          /*<a onClick={this.toggleTopicVisibility}><i className={visibilityIconCssClass}></i> {visibilityIconText}</a>
          <a onClick={this.handleDeleteItemClick}><i className="icon trash"></i> delete</a>*/
        }
      }
      return React.createElement(
        "div",
        { className: "item-edit-tool-bar-container" },
        itemEditToolBarDisplay,
        React.createElement(
          "div",
          { className: "ui basic mini modal confirm-delete-file-modal ", id: this.props.topic.topic_id + "-delete-modal" },
          React.createElement(
            "div",
            { className: "ui icon header" },
            React.createElement("i", { className: "trash icon" }),
            "Are You Sure?"
          ),
          React.createElement(
            "div",
            { className: "content" },
            React.createElement(
              "p",
              null,
              "all peer , comment & vote information would be irreversibly removed!"
            )
          ),
          React.createElement(
            "div",
            { className: "actions" },
            React.createElement(
              "div",
              { className: "ui red basic cancel inverted button" },
              React.createElement("i", { className: "remove icon" }),
              "Cancel"
            ),
            React.createElement(
              "div",
              { className: "ui green ok inverted button", onClick: this.onDeleteTopic },
              React.createElement("i", { className: "checkmark icon" }),
              "Yes"
            )
          )
        )
      );
    }
  }]);

  return ItemEditToolBar;
}(React.Component);

var VideoPlayer = function (_React$Component7) {
  _inherits(VideoPlayer, _React$Component7);

  function VideoPlayer(props) {
    _classCallCheck(this, VideoPlayer);

    var _this12 = _possibleConstructorReturn(this, (VideoPlayer.__proto__ || Object.getPrototypeOf(VideoPlayer)).call(this, props));

    _this12.state = {};
    return _this12;
  }

  _createClass(VideoPlayer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var itemId = "";
      if (this.props.topic) itemId = this.props.topic.topic_id;else if (this.props.comment) itemId = this.props.comment.comment_id;
      this.setState({ itemId: itemId }, function () {
        videojs('video-player' + itemId, {});
      });
    }
  }, {
    key: "render",
    value: function render() {

      var fileType = this.props.fileType;
      var mediaType = this.props.mediaType;
      if (this.props.fileType === 'mpeg') {
        fileType = 'mp3';
        mediaType = 'audio';
      }
      return React.createElement(
        "video",
        {
          id: "video-player" + this.state.itemId,
          className: "video-js",
          controls: true,
          autoPlay: false,
          preload: "auto" },
        React.createElement("source", {
          src: this.props.filePath,
          type: mediaType + '/' + fileType
        })
      );
    }
  }]);

  return VideoPlayer;
}(React.Component);

var ChannelSelectElement = function (_React$Component8) {
  _inherits(ChannelSelectElement, _React$Component8);

  function ChannelSelectElement(props) {
    _classCallCheck(this, ChannelSelectElement);

    var _this13 = _possibleConstructorReturn(this, (ChannelSelectElement.__proto__ || Object.getPrototypeOf(ChannelSelectElement)).call(this, props));

    _this13.state = {
      loading: true
    };
    _this13.getChannels = _this13.getChannels.bind(_this13);
    return _this13;
  }

  _createClass(ChannelSelectElement, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.getChannels();
    }
  }, {
    key: "getChannels",
    value: function getChannels() {
      var query = "SELECT * FROM channel WHERE channel_id IS NOT NULL";
      Page.cmd('dbQuery', [query], function (res) {
        this.setState({ channels: res, loading: false });
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {

      var channelId = this.props.channelId;
      if (!this.props.channelId) channelId = 0;

      var options = void 0;
      if (this.state.channels) {
        options = this.state.channels.map(function (o, index) {
          if (o.channel_id === channelId) {
            return React.createElement(
              "option",
              { selected: "selected", key: index, value: o.channel_id },
              o.name
            );
          } else {
            return React.createElement(
              "option",
              { key: index, value: o.channel_id },
              o.name
            );
          }
        });
      }

      return React.createElement(
        "select",
        {
          className: "ui fluid dropdown",
          autoComplete: "off",
          defaultValue: channelId,
          disabled: this.props.disabled,
          onChange: this.props.onTopicChannelSelect },
        React.createElement(
          "option",
          { disabled: true, value: "0" },
          "select channel"
        ),
        options
      );
    }
  }]);

  return ChannelSelectElement;
}(React.Component);

var UserAvatarDisplay = function (_React$Component9) {
  _inherits(UserAvatarDisplay, _React$Component9);

  function UserAvatarDisplay(props) {
    _classCallCheck(this, UserAvatarDisplay);

    var _this14 = _possibleConstructorReturn(this, (UserAvatarDisplay.__proto__ || Object.getPrototypeOf(UserAvatarDisplay)).call(this, props));

    _this14.state = {
      loading: true
    };
    _this14.getUserAvatar = _this14.getUserAvatar.bind(_this14);
    _this14.setDefaultUserAvatarDisplay = _this14.setDefaultUserAvatarDisplay.bind(_this14);
    _this14.onImageLoadError = _this14.onImageLoadError.bind(_this14);
    return _this14;
  }

  _createClass(UserAvatarDisplay, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (this.props.filePath) {
        this.setState({ filePath: this.props.filePath, loading: false });
      } else {
        this.getUserAvatar();
      }
    }
  }, {
    key: "getUserAvatar",
    value: function getUserAvatar() {
      var query = userHelpers.getUserAvatarQuery(this.props.userId);
      Page.cmd('dbQuery', [query], function (res) {
        if (res.length > 0) {
          var file = res[0];
          if (file.cluster_id) {
            var filePath = "merged-" + store.getState().config.merger_name + "/" + file.cluster_id + "/data/users/" + file.user_id + "/" + file.file_name;
            this.setState({ filePath: filePath, loading: false });
          } else {
            var _query = "SELECT * FROM json WHERE json_id='" + file.json_id + "'";
            Page.cmd('dbQuery', [_query], function (res) {
              var json = res[0];
              var filePath = "merged-" + store.getState().config.merger_name + "/" + json.directory + "/" + file.file_name;
              this.setState({ filePath: filePath, loading: false });
            }.bind(this));
          }
        } else {
          this.setDefaultUserAvatarDisplay();
        }
      }.bind(this));
    }
  }, {
    key: "setDefaultUserAvatarDisplay",
    value: function setDefaultUserAvatarDisplay() {
      var userName = void 0;
      if (this.props.userName) {
        userName = this.props.userName;
      } else {
        userName = store.getState().site_info.auth_address;
      }
      var initials = userName.substring(0, 2);
      var bgColor = userHelpers.randomRgba(userName);
      this.setState({ loading: false, initials: initials, bgColor: bgColor });
    }
  }, {
    key: "onImageLoadError",
    value: function onImageLoadError() {
      this.setState({ loading: true, filePath: '' }, function () {
        this.setDefaultUserAvatarDisplay();
      });
    }
  }, {
    key: "render",
    value: function render() {
      var userAvatar = void 0;
      if (!this.state.loading) {
        if (this.state.filePath) {
          userAvatar = React.createElement("img", {
            onError: this.onImageLoadError,
            className: "comment-avatar",
            src: this.state.filePath });
        } else {
          var width = "28",
              height = "28";
          if (this.props.dimensions) {
            width = this.props.dimensions;
            height = this.props.dimensions;
          }
          userAvatar = React.createElement(
            "div",
            { className: "user-avatar initials", style: { width: width + "px", height: height + "px" } },
            React.createElement(
              "span",
              { style: { background: this.state.bgColor } },
              this.state.initials
            )
          );
          // <canvas width={width} height={height} data-jdenticon-value={this.props.userId}></canvas>
        }
      }
      return React.createElement(
        "div",
        { className: "user-avatar-display-container" },
        userAvatar
      );
    }
  }]);

  return UserAvatarDisplay;
}(React.Component);

var UserAvatarForm = function (_React$Component10) {
  _inherits(UserAvatarForm, _React$Component10);

  function UserAvatarForm(props) {
    _classCallCheck(this, UserAvatarForm);

    var _this15 = _possibleConstructorReturn(this, (UserAvatarForm.__proto__ || Object.getPrototypeOf(UserAvatarForm)).call(this, props));

    _this15.state = {};
    _this15.onUserAvatarFileChange = _this15.onUserAvatarFileChange.bind(_this15);
    _this15.readFile = _this15.readFile.bind(_this15);
    _this15.onUploadUserAvatarFile = _this15.onUploadUserAvatarFile.bind(_this15);
    _this15.uploadFile = _this15.uploadFile.bind(_this15);
    _this15.createFile = _this15.createFile.bind(_this15);
    _this15.removeUserAvatar = _this15.removeUserAvatar.bind(_this15);
    _this15.deleteUserAvatar = _this15.deleteUserAvatar.bind(_this15);
    return _this15;
  }

  _createClass(UserAvatarForm, [{
    key: "onUserAvatarFileChange",
    value: function onUserAvatarFileChange(e) {
      var file = {
        f: e.target.files[0],
        file_name: fileHelpers.generateValidFileName(e.target.files[0].name),
        file_type: e.target.files[0].type.split('/')[1],
        file_size: e.target.files[0].size,
        media_type: e.target.files[0].type.split('/')[0],
        item_type: 'topic'
      };
      this.readFile(file, e.target.files[0]);
    }
  }, {
    key: "readFile",
    value: function readFile(file, filesObject) {
      var reader = new FileReader();
      var th = this;
      reader.onload = function () {
        file.f.data = reader.result;
        th.setState({ file: file });
      };
      reader.readAsDataURL(filesObject);
    }
  }, {
    key: "onUploadUserAvatarFile",
    value: function onUploadUserAvatarFile() {
      var state = store.getState();
      var inner_path = "merged-" + state.config.merger_name + "/" + state.config.cluster + "/data/users/" + state.site_info.auth_address + "/" + this.state.file.file_name;
      this.setState({ file_inner_path: inner_path }, function () {
        if (this.props.user.file_id) {
          this.removeUserAvatar();
        } else {
          this.uploadFile(inner_path);
        }
      });
    }
  }, {
    key: "uploadFile",
    value: function uploadFile(inner_path) {
      var file = this.state.file;
      Page.cmd("bigfileUploadInit", [inner_path, file.file_size], function (init_res) {
        var formdata = new FormData();
        var req = new XMLHttpRequest();
        formdata.append(file.file_name, file.f);
        // upload event listener
        req.upload.addEventListener("progress", function (res) {
          // update item progress
          this.setState({ fileProgress: parseInt(res.loaded / res.total * 100) });
        }.bind(this));
        // loaded event listener
        req.upload.addEventListener("loadend", function () {
          this.createFile();
        }.bind(this));
        req.withCredentials = true;
        req.open("POST", init_res.url);
        req.send(formdata);
      }.bind(this));
    }
  }, {
    key: "createFile",
    value: function createFile() {

      var state = store.getState();
      var inner_path = "merged-" + state.config.merger_name + "/" + state.config.cluster + "/data/users/" + state.site_info.auth_address + "/data.json";

      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {

        data = JSON.parse(data);
        if (data) {
          if (!data.file) {
            data.file = [];
            data.next_file_id = 1;
          }
          if (!data.file_to_item) {
            data.file_to_item = [];
            data.next_file_to_item_id = 1;
          }
        } else {
          data = {
            "file": [],
            "next_file_id": 1,
            "file_to_item": [],
            "next_file_to_item_id": 1
          };
        }

        var auth_address = store.getState().site_info.auth_address;

        var file = {
          file_id: auth_address + "fl" + data.next_file_id,
          file_type: this.state.file.file_type,
          file_name: this.state.file.file_name,
          item_id: auth_address,
          item_type: 'user',
          user_id: auth_address,
          added: Date.now()
        };

        data.file.push(file);
        data.next_file_id += 1;

        var file_to_item = {
          file_to_item_id: auth_address + "fti" + data.next_file_to_item_id,
          item_type: 'user',
          item_id: auth_address,
          file_id: file.file_id,
          cluster_id: store.getState().config.cluster,
          user_id: file.user_id,
          added: Date.now()
        };

        data.file_to_item.push(file_to_item);
        data.next_file_to_item_id += 1;

        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            Page.cmd("wrapperNotification", ["done", "Avatar Created!", 5000]);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "removeUserAvatar",
    value: function removeUserAvatar() {
      var state = store.getState();
      var inner_path = "merged-" + state.config.merger_name + "/" + this.props.user.cluster_id + "/data/users/" + this.props.user.user_id + "/data.json";
      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
        var _this16 = this;

        data = JSON.parse(data);
        var fIndex = data.file.findIndex(function (f) {
          return f.file_id === _this16.props.user.file_id;
        });
        var ftiIndex = data.file_to_item.findIndex(function (fti) {
          return fti.file_to_item_id === _this16.props.user.file_to_item_id;
        });
        data.file.splice(fIndex, 1);
        data.file_to_item.splice(ftiIndex, 1);
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            this.deleteUserAvatar();
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "deleteUserAvatar",
    value: function deleteUserAvatar() {
      var state = store.getState();
      var inner_path = "merged-" + state.config.merger_name + "/" + this.props.user.cluster_id + "/data/users/" + this.props.user.user_id + "/" + this.props.user.file_name;
      Page.cmd('fileDelete', { inner_path: inner_path }, function (res) {
        var query = userHelpers.getUserQuery(state.site_info.auth_address);
        Page.cmd('dbQuery', [query], function (res) {
          var user = res[0];
          store.dispatch(setUser(user));
          if (this.state.file_inner_path) this.uploadFile(this.state.file_inner_path);
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {
      var userAvatarDisplay = void 0;
      if (this.state.file) {
        userAvatarDisplay = React.createElement("img", { src: this.state.file.f.data });
      } else {
        var filePath = void 0;
        if (this.props.user.file_id) {
          var state = store.getState();
          filePath = "merged-" + state.config.merger_name + "/" + this.props.user.cluster_id + "/data/users/" + this.props.user.user_id + "/" + this.props.user.file_name;
        }
        userAvatarDisplay = React.createElement(UserAvatarDisplay, {
          userId: this.props.user.user_id,
          userName: this.props.user.user_name,
          filePath: filePath,
          dimensions: "100"
        });
      }

      var uploadButtonDisplay = void 0;
      if (this.state.file) {
        uploadButtonDisplay = React.createElement(
          "button",
          { type: "button", className: "native-btn", onClick: this.onUploadUserAvatarFile },
          React.createElement(
            "a",
            null,
            "upload"
          )
        );
      }

      return React.createElement(
        "div",
        { id: "user-avatar-form-container" },
        React.createElement(
          "div",
          { id: "avatar-form-menu", className: "ui compact segment lightgray" },
          React.createElement(
            "a",
            { onClick: this.removeUserAvatar, className: "item" },
            React.createElement("i", { className: "ui icon remove" })
          ),
          React.createElement(
            "a",
            { className: "item" },
            React.createElement("input", { type: "file", accept: "image/*", onChange: this.onUserAvatarFileChange }),
            React.createElement("i", { className: "ui icon add" })
          )
        ),
        userAvatarDisplay,
        uploadButtonDisplay
      );
    }
  }]);

  return UserAvatarForm;
}(React.Component);
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var reducer = Redux.combineReducers({
  server_info: serverInfoReducer,
  site_info: siteInfoReducer,
  config: siteConfigReducer,
  local_storage: localStorageReducer,
  feed: feedReducer,
  route: routeReducer,
  topics: topicReducer,
  channels: channelReducer,
  comments: commentReducer,
  user: userReducer,
  userCreated: userCreatedReducer,
  search: searchReducer
});

function serverInfoReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  if (action.type === 'SERVER_INFO') {
    return action.server_info;
  } else {
    return state;
  }
}

function siteInfoReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case 'SITE_INFO':
      {
        return action.site_info;
      }
    case 'LOADING_USER':
      {
        var s = Object.assign({}, state, {
          loading: action.value
        });
        return s;
      }
    case 'CHANGE_CERT':
      {
        var _s = Object.assign({}, state, {
          auth_address: action.auth_address,
          cert_user_id: action.cert_user_id
        });
        return _s;
      }
    default:
      {
        return state;
      }
  }
}

function siteConfigReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  if (action.type === 'SITE_CONFIG') {
    return action.config;
  } else {
    return state;
  }
}

function localStorageReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  if (action.type === 'LOCAL_STORAGE') {
    var _state = {};
    if (action.local_storage) _state = action.local_storage;
    return _state;
  } else if (action.type === 'ZV_CERT_CREATED') {
    var s = Object.assign({}, state, {});
    s['zv_cert_created'] = true;
    return s;
  } else {
    return state;
  }
}

function feedReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  if (action.type === 'SET_FEED_LIST_FOLLOW') {
    return action.feed;
  }
  return state;
}

function routeReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  if (action.type === 'SET_ROUTE') {
    return action.route;
  } else {
    return state;
  }
}

function findTopicIndex(items, action) {
  return items.findIndex(function (t) {
    return t.topic_id === action.topic_id;
  });
}

function topicReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case 'LOADING_TOPIC_LIST':
      {
        var s = Object.assign({}, state, {
          loading: action.value
        });
        return s;
      }
    case 'TOPICS_COUNT':
      {
        var _s2 = Object.assign({}, state, {
          count: action.count
        });
        return _s2;
      }
    case 'SET_TOPICS':
      {
        var _s3 = Object.assign({}, state, {
          items: action.items
        });
        return _s3;
      }
    case 'SET_TOPIC':
      {
        var _s4 = Object.assign({}, state, {
          topic: action.topic
        });
        return _s4;
      }
    case 'SET_SORT_OPTIONS':
      {
        var _s5 = Object.assign({}, state, {
          sort_options: action.sort_options
        });
        return _s5;
      }
    case 'SORT_TOPICS':
      {
        var _s6 = Object.assign({}, state, {
          sort_by: action.label
        });
        return _s6;
      }
    case 'ASSIGN_TOPIC_VOTES':
      {
        var topicIndex = findTopicIndex(state.items, action);
        var oldTopic = state.items[topicIndex];
        var newTopic = Object.assign({}, oldTopic, {
          votes: action.votes
        });
        var newItems = [].concat(_toConsumableArray(state.items.slice(0, topicIndex)), [newTopic], _toConsumableArray(state.items.slice(topicIndex + 1, state.items.length)));
        var _s7 = Object.assign({}, state, {
          items: newItems
        });
        return _s7;
      }
    case 'LOADING_TOPIC_VOTES':
      {
        var _topicIndex = findTopicIndex(state.items, action);
        var _oldTopic = state.items[_topicIndex];
        var _newTopic = Object.assign({}, _oldTopic, {
          loading_votes: action.value
        });
        var _newItems = [].concat(_toConsumableArray(state.items.slice(0, _topicIndex)), [_newTopic], _toConsumableArray(state.items.slice(_topicIndex + 1, state.items.length)));
        var _s8 = Object.assign({}, state, {
          items: _newItems
        });
        return _s8;
      }
    case 'ASSIGN_CURRENT_TOPIC_VOTES':
      {
        var _oldTopic2 = state.topic;
        var _newTopic2 = Object.assign({}, _oldTopic2, {
          votes: action.votes
        });
        var _s9 = Object.assign({}, state, {
          topic: _newTopic2
        });
        return _s9;
      }
    case 'INCREMENT_TOPIC_COMMENT_COUNT':
      {
        var _oldTopic3 = state.items[0];
        var topicCommentCount = _oldTopic3.comments_total += 1;
        var _newTopic3 = Object.assign({}, _oldTopic3, {
          comments_total: topicCommentCount
        });
        var _newItems2 = [].concat(_toConsumableArray(state.items.slice(0, 0)), [_newTopic3], _toConsumableArray(state.items.slice(0 + 1, state.items.length)));
        var _s10 = Object.assign({}, state, {
          items: _newItems2
        });
        return _s10;
      }
    case 'DECREMENT_TOPIC_COMMENT_COUNT':
      {
        var _oldTopic4 = state.items[0];
        var _topicCommentCount = _oldTopic4.comments_total -= 1;
        var _newTopic4 = Object.assign({}, _oldTopic4, {
          comments_total: _topicCommentCount
        });
        var _newItems3 = [].concat(_toConsumableArray(state.items.slice(0, 0)), [_newTopic4], _toConsumableArray(state.items.slice(0 + 1, state.items.length)));
        var _s11 = Object.assign({}, state, {
          items: _newItems3
        });
        return _s11;
      }
    default:
      {
        return state;
      }
  }
}

function channelReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case 'SET_CHANNEL':
      {
        var s = Object.assign({}, state, {
          channel: action.channel
        });
        return s;
      }
    case 'SET_CHANNELS':
      {
        var _s12 = Object.assign({}, state, {
          items: action.channels
        });
        return _s12;
      }
    case 'SET_CHANNEL_SORT_OPTIONS':
      {
        var _s13 = Object.assign({}, state, {
          sort_options: action.sort_options
        });
        return _s13;
      }
    case 'SORT_CHANNELS':
      {
        var _s14 = Object.assign({}, state, {
          sort_by: action.sort_by
        });
        return _s14;
      }
    default:
      {
        return state;
      }
  }
}

function findCommentIndex(comments, action) {
  return comments.findIndex(function (c) {
    return c.comment_id === action.comment_id;
  });
}

function commentReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case 'LOADING_COMMENTS':
      {
        var s = Object.assign({}, state, {
          loading: action.value
        });
        return s;
      }
    case 'SET_TOPIC_COMMENTS':
      {
        var _s15 = Object.assign({}, state, {
          items: action.comments
        });
        return _s15;
      }
    case 'ASSIGN_COMMENT_VOTES':
      {
        var commentIndex = findCommentIndex(state.items, action);
        var oldComment = state.items[commentIndex];
        var newComment = Object.assign({}, oldComment, {
          votes: action.votes
        });
        var items = [].concat(_toConsumableArray(state.items.slice(0, commentIndex)), [newComment], _toConsumableArray(state.items.slice(commentIndex + 1, state.items.length)));
        var _s16 = Object.assign({}, state, {
          items: items
        });
        return _s16;
      }
    case 'LOADING_COMMENT_VOTES':
      {
        var _commentIndex = findCommentIndex(state.items, action);
        var _oldComment = state.items[_commentIndex];
        var _newComment = Object.assign({}, _oldComment, {
          loading_votes: action.value
        });
        var _items = [].concat(_toConsumableArray(state.items.slice(0, _commentIndex)), [_newComment], _toConsumableArray(state.items.slice(_commentIndex + 1, state.items.length)));
        var _s17 = Object.assign({}, state, {
          items: _items
        });
        return _s17;
      }
    case 'ADD_COMMENT':
      {
        var _items2 = [].concat(_toConsumableArray(state.items), [action.comment]);
        var _s18 = Object.assign({}, state, {
          items: _items2
        });
        return _s18;
      }
    case 'UPDATE_COMMENT':
      {
        var _commentIndex2 = findCommentIndex(state.items, action);
        var _oldComment2 = state.items[_commentIndex2];
        var _newComment2 = Object.assign({}, _oldComment2, {
          body: action.body
        });
        var _items3 = [].concat(_toConsumableArray(state.items.slice(0, _commentIndex2)), [_newComment2], _toConsumableArray(state.items.slice(_commentIndex2 + 1, state.items.length)));
        var _s19 = Object.assign({}, state, {
          items: _items3
        });
        return _s19;
      }
    case 'SET_COMMENT_SORT_OPTIONS':
      {
        var _s20 = Object.assign({}, state, {
          sort_options: action.sort_options
        });
        return _s20;
      }
    case 'SORT_COMMENTS':
      {
        var _s21 = Object.assign({}, state, {
          sort_by: action.sort_by
        });
        return _s21;
      }
    default:
      {
        return state;
      }
  }
}

function userReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case 'SET_USER':
      {
        return action.user;
      }
    case 'REMOVE_USER':
      {
        var s = {};
        return s;
      }
    default:
      {
        return state;
      }
  }
}

function userCreatedReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case 'USER_CREATED':
      {
        return true;
      }
    default:
      {
        return false;
      }
  }
}

function searchReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments[1];

  switch (action.type) {
    case 'SET_SEARCH_PHRASE':
      {
        return action.search_phrase;
      }
    default:
      {
        return false;
      }
  }
}

function setServerInfo(server_info) {
  return {
    type: 'SERVER_INFO',
    server_info: server_info
  };
}

function setSiteInfo(site_info) {
  return {
    type: 'SITE_INFO',
    site_info: site_info
  };
}

function setSiteConfig(config) {
  return {
    type: 'SITE_CONFIG',
    config: config
  };
}

function setLocalStorage(local_storage) {
  return {
    type: 'LOCAL_STORAGE',
    local_storage: local_storage
  };
}

function setFeedListFollow(feed) {
  return {
    type: 'SET_FEED_LIST_FOLLOW',
    feed: feed
  };
}

function zvCertCreated(value) {
  return {
    type: 'ZV_CERT_CREATED',
    value: value
  };
}

function setAppRoute(route) {
  return {
    type: 'SET_ROUTE',
    route: route
  };
}

function loadingUser(value) {
  return {
    type: 'LOADING_USER',
    value: value
  };
}

function loadingTopicList(value) {
  return {
    type: 'LOADING_TOPIC_LIST',
    value: value
  };
}

function setTopicsCount(count) {
  return {
    type: 'TOPICS_COUNT',
    count: count
  };
}

function setTopics(items) {
  return {
    type: 'SET_TOPICS',
    items: items
  };
}

function assignTopicVotes(votes, topicId) {
  return {
    type: 'ASSIGN_TOPIC_VOTES',
    votes: votes,
    topic_id: topicId
  };
}

function loadingTopicVotes(topicId, value) {
  return {
    type: 'LOADING_TOPIC_VOTES',
    topic_id: topicId,
    value: value
  };
}

function assignCurrentTopicVotes(votes, topicId) {
  return {
    type: 'ASSIGN_CURRENT_TOPIC_VOTES',
    votes: votes
  };
}

function incrementTopicCommentCount() {
  return {
    type: 'INCREMENT_TOPIC_COMMENT_COUNT'
  };
}

function decrementTopicCommentCount() {
  return {
    type: 'DECREMENT_TOPIC_COMMENT_COUNT'
  };
}

function setSortOptions(sort_options) {
  return {
    type: 'SET_SORT_OPTIONS',
    sort_options: sort_options
  };
}

function sortTopics(label) {
  return {
    type: 'SORT_TOPICS',
    label: label
  };
}

function setChannel(channel) {
  return {
    type: 'SET_CHANNEL',
    channel: channel
  };
}

function setTopic(topic) {
  return {
    type: 'SET_TOPIC',
    topic: topic
  };
}

function loadingComments(value) {
  return {
    type: 'LOADING_COMMENTS',
    value: value
  };
}

function setComments(comments) {
  return {
    type: 'SET_TOPIC_COMMENTS',
    comments: comments
  };
}

function assignCommentVotes(votes, commentId) {
  return {
    type: 'ASSIGN_COMMENT_VOTES',
    votes: votes,
    comment_id: commentId
  };
}

function loadingCommentVotes(commentId, value) {
  return {
    type: 'LOADING_COMMENT_VOTES',
    comment_id: commentId,
    value: value
  };
}

function addComment(comment) {
  return {
    type: 'ADD_COMMENT',
    comment: comment
  };
}

function updateComment(comment) {
  return {
    type: 'UPDATE_COMMENT',
    comment: comment
  };
}

function setCommentSortOptions(sortOptions) {
  return {
    type: 'SET_COMMENT_SORT_OPTIONS',
    sort_options: sortOptions
  };
}

function sortComments(value) {
  return {
    type: 'SORT_COMMENTS',
    sort_by: value
  };
}

function setUser(user) {
  return {
    type: 'SET_USER',
    user: user
  };
}

function removeUser() {
  return {
    type: 'REMOVE_USER'
  };
}

function userCreated() {
  return {
    type: 'USER_CREATED'
  };
}

function changeCert(authAddress, certUserId) {
  return {
    type: 'CHANGE_CERT',
    auth_address: authAddress,
    cert_user_id: certUserId
  };
}

function setChannels(channels) {
  return {
    type: 'SET_CHANNELS',
    channels: channels
  };
}

function setChannelSortOptions(sortOptions) {
  return {
    type: 'SET_CHANNEL_SORT_OPTIONS',
    sort_options: sortOptions
  };
}

function sortChannels(sortBy) {
  return {
    type: 'SORT_CHANNELS',
    sort_by: sortBy
  };
}

function setSearchPhrase(searchPhrase) {
  return {
    type: 'SET_SEARCH_PHRASE',
    search_phrase: searchPhrase
  };
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SideBar = function (_React$Component) {
  _inherits(SideBar, _React$Component);

  function SideBar() {
    _classCallCheck(this, SideBar);

    return _possibleConstructorReturn(this, (SideBar.__proto__ || Object.getPrototypeOf(SideBar)).apply(this, arguments));
  }

  _createClass(SideBar, [{
    key: 'render',
    value: function render() {
      var route = store.getState().route;
      var sideBarDisplay = void 0;
      if (route.view === 'main' || route.view === 'search' || this.props.preview) sideBarDisplay = React.createElement(MainSideBar, null);else if (route.view === 'topic' || route.view === 'channel') sideBarDisplay = React.createElement(TopicSideBarWrapper, null);else if (route.view === 'channels') sideBarDisplay = React.createElement(ChannelsSideBarWrapper, null);else if (route.view === 'user-admin') sideBarDisplay = React.createElement(UserAdminSideBarWrapper, null);
      return React.createElement(
        'aside',
        { id: 'sidebar', className: 'ui segment' },
        sideBarDisplay
      );
    }
  }]);

  return SideBar;
}(React.Component);

var MainSideBar = function (_React$Component2) {
  _inherits(MainSideBar, _React$Component2);

  function MainSideBar(props) {
    _classCallCheck(this, MainSideBar);

    var _this2 = _possibleConstructorReturn(this, (MainSideBar.__proto__ || Object.getPrototypeOf(MainSideBar)).call(this, props));

    _this2.state = {};
    _this2.getLatestChannels = _this2.getLatestChannels.bind(_this2);
    return _this2;
  }

  _createClass(MainSideBar, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.getLatestChannels();
    }
  }, {
    key: 'getLatestChannels',
    value: function getLatestChannels() {
      var query = channelHelpers.getLatestChannels();
      Page.cmd('dbQuery', [query], function (res) {
        this.setState({ channels: res });
      }.bind(this));
    }
  }, {
    key: 'render',
    value: function render() {
      var channels = void 0;
      if (this.state.channels) {
        channels = this.state.channels.map(function (c, index) {
          return React.createElement(
            'li',
            { key: index, className: 'native-btn item' },
            React.createElement(
              'a',
              { href: "index.html?v=channel+id=" + c.channel_id },
              c.name
            )
          );
        });
      }
      return React.createElement(
        'div',
        { className: 'sidebar-view', id: 'main-sidebar' },
        React.createElement(
          'ul',
          { className: 'ui list' },
          React.createElement(
            'li',
            { className: 'native-btn item' },
            React.createElement(
              'a',
              { href: 'index.html?v=channels' },
              'All Channels'
            )
          ),
          channels
        )
      );
    }
  }]);

  return MainSideBar;
}(React.Component);

var TopicSideBar = function TopicSideBar(props) {
  var channelDisplay = void 0;
  if (props.channels && props.channels.channel) {
    var channel = props.channels.channel;
    channelDisplay = React.createElement(
      'div',
      { className: 'channel-display' },
      React.createElement(
        'h3',
        null,
        React.createElement(
          'a',
          { href: "index.html?v=channel+id=" + channel.channel_id },
          channel.name
        )
      ),
      React.createElement(
        'p',
        null,
        'Number of topics: ',
        channel.topics_count
      ),
      React.createElement(
        'div',
        { className: 'channel-description ui segment' },
        channel.description
      ),
      React.createElement(
        'p',
        null,
        'chanOp: ',
        channel.user_id
      )
    );
  }
  return React.createElement(
    'div',
    { className: 'sidebar-view', id: 'topic-sidebar' },
    channelDisplay
  );
};

var mapStateToTopicSideBarProps = function mapStateToTopicSideBarProps(state) {
  var channels = state.channels;
  return {
    channels: channels
  };
};

var mapDispatchToTopicSideBarProps = function mapDispatchToTopicSideBarProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var TopicSideBarWrapper = ReactRedux.connect(mapStateToTopicSideBarProps, mapDispatchToTopicSideBarProps)(TopicSideBar);

var ChannelsSideBar = function (_React$Component3) {
  _inherits(ChannelsSideBar, _React$Component3);

  function ChannelsSideBar(props) {
    _classCallCheck(this, ChannelsSideBar);

    var _this3 = _possibleConstructorReturn(this, (ChannelsSideBar.__proto__ || Object.getPrototypeOf(ChannelsSideBar)).call(this, props));

    _this3.state = {};
    _this3.onAnonymousNewChannelClick = _this3.onAnonymousNewChannelClick.bind(_this3);
    return _this3;
  }

  _createClass(ChannelsSideBar, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.site_info.cert_user_id !== nextProps.site_info.cert_user_id) {
        this.forceUpdate();
      }
    }
  }, {
    key: 'onAnonymousNewChannelClick',
    value: function onAnonymousNewChannelClick() {
      Page.cmd("wrapperNotification", ["info", "Please login to participate", 5000]);
    }
  }, {
    key: 'render',
    value: function render() {
      var newChannelBtn = void 0;
      if (this.props.site_info.cert_user_id) {
        newChannelBtn = React.createElement(
          'div',
          { className: 'native-btn' },
          React.createElement(
            'a',
            { href: 'index.html?v=user-admin+s=new-channel' },
            'New Channel'
          )
        );
      } else {
        newChannelBtn = React.createElement(
          'div',
          { className: 'native-btn' },
          React.createElement(
            'a',
            { onClick: this.onAnonymousNewChannelClick },
            'New Channel'
          )
        );
      }
      return React.createElement(
        'div',
        { id: 'channels-sidebar' },
        newChannelBtn
      );
    }
  }]);

  return ChannelsSideBar;
}(React.Component);

var mapStateToChannelsSideBarProps = function mapStateToChannelsSideBarProps(state) {
  var site_info = state.site_info;
  return {
    site_info: site_info
  };
};

var mapDispatchToChannelsSideBarProps = function mapDispatchToChannelsSideBarProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var ChannelsSideBarWrapper = ReactRedux.connect(mapStateToChannelsSideBarProps, mapDispatchToChannelsSideBarProps)(ChannelsSideBar);

var UserAdminSideBar = function (_React$Component4) {
  _inherits(UserAdminSideBar, _React$Component4);

  function UserAdminSideBar(props) {
    _classCallCheck(this, UserAdminSideBar);

    var _this4 = _possibleConstructorReturn(this, (UserAdminSideBar.__proto__ || Object.getPrototypeOf(UserAdminSideBar)).call(this, props));

    _this4.state = {
      loading: false
    };
    return _this4;
  }

  _createClass(UserAdminSideBar, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (!this.props.user.user_id) {
        if (nextProps.user.user_id) {
          this.setState({ loading: true }, function () {
            this.forceUpdate();
            this.setState({ loading: false });
          });
        }
      } else {
        if (this.props.user.user_id !== nextProps.user.user_id || this.props.user.file_id !== nextProps.user.file_id) {
          this.setState({ loading: true }, function () {
            this.forceUpdate();
            this.setState({ loading: false });
          });
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var userAdminSideBarDisplay = void 0;
      if (!this.state.loading) {
        var user = this.props.user;
        if (user && user.user_id) {
          userAdminSideBarDisplay = React.createElement(
            'div',
            { className: 'user-sidebar-wrapper' },
            React.createElement(
              'div',
              { className: 'ui segment', id: 'user-details' },
              React.createElement(UserAvatarForm, { user: user }),
              React.createElement(
                'div',
                { id: 'user-details-header' },
                React.createElement(
                  'span',
                  null,
                  user.user_name.split('@')[0]
                ),
                React.createElement(
                  'span',
                  null,
                  '@'
                ),
                React.createElement(
                  'span',
                  null,
                  user.user_name.split('@')[1]
                )
              ),
              React.createElement(
                'div',
                { id: 'user-details-info' },
                React.createElement(
                  'p',
                  null,
                  'registered ',
                  appHelpers.getTimeAgo(user.added)
                ),
                React.createElement(
                  'p',
                  null,
                  React.createElement(
                    'a',
                    { href: 'index.html?v=user-admin+s=profile' },
                    'Profile'
                  )
                ),
                React.createElement(
                  'p',
                  null,
                  React.createElement(
                    'a',
                    { href: 'index.html?v=user-admin+s=channels' },
                    user.channels_total,
                    ' Channels'
                  )
                ),
                React.createElement(
                  'p',
                  null,
                  React.createElement(
                    'a',
                    { href: 'index.html?v=user-admin+s=topics' },
                    user.topics_total,
                    ' Topics'
                  )
                ),
                React.createElement(
                  'p',
                  null,
                  React.createElement(
                    'a',
                    { href: 'index.html?v=user-admin+s=comments' },
                    user.comments_total,
                    ' Comments'
                  )
                )
              )
            )
          );
        } else {
          userAdminSideBarDisplay = React.createElement(
            'div',
            { className: 'ui segment lightgray' },
            React.createElement(Loading, { cssClass: ' centered', msg: 'Loading User Details...' })
          );
        }
      }
      return React.createElement(
        'div',
        { id: 'user-admin-sidebar' },
        userAdminSideBarDisplay
      );
    }
  }]);

  return UserAdminSideBar;
}(React.Component);

var mapStateToUserAdminSideBarProps = function mapStateToUserAdminSideBarProps(state) {
  var user = state.user;
  return {
    user: user
  };
};

var mapDispatchToUserAdminSideBarProps = function mapDispatchToUserAdminSideBarProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var UserAdminSideBarWrapper = ReactRedux.connect(mapStateToUserAdminSideBarProps, mapDispatchToUserAdminSideBarProps)(UserAdminSideBar);
"use strict";

window.topicHelpers = function () {

  function countTopicsQuery(channelId, userId, searchPhrase) {
    var q = "SELECT count(*) FROM topic WHERE topic_id NOT NULL";
    if (channelId) q += " AND channel_id='" + channelId + "'";
    if (userId) q += " AND user_id='" + userId + "'";
    if (searchPhrase) q += " AND title LIKE '%" + searchPhrase + "%'";
    return q;
  }

  function getTopicSortOptions(sortBy) {
    var sort_options = [{
      label: 'new',
      value: '-added'
    }, {
      label: 'top',
      value: 'v.diff desc, t.topic_id'
    }];
    if (!sortBy) {
      sort_options[0].current = true;
    } else {
      var sortByIndex = sort_options.findIndex(function (so) {
        return so.label === sortBy;
      });
      sort_options[sortByIndex].current = true;
    }
    return sort_options;
  }

  function defaultTopicQuery(sortBy) {
    var q = "SELECT t.*, fti.*, f.*, c.name, u.user_id as userId";
    q += ", (SELECT count(*) FROM comment WHERE comment.topic_id=t.topic_id) as comments_total";
    q += ", (SELECT count(*) FROM moderation WHERE moderation.topic_id=t.topic_id AND moderation.item_type='comment' AND moderation.current=1 AND moderation.visible=0) as hidden_comments_total";
    q += ", (SELECT count(*) FROM topic_vote WHERE topic_vote.topic_id=t.topic_id AND topic_vote.vote=0) as down_votes";
    q += ", (SELECT count(*) FROM topic_vote WHERE topic_vote.topic_id=t.topic_id AND topic_vote.vote=1) as up_votes";
    q += " FROM topic t";
    q += " LEFT JOIN file_to_item AS fti ON fti.item_id=t.topic_id AND fti.item_type='topic'";
    q += " LEFT JOIN file AS f ON f.item_id=t.topic_id";
    q += " LEFT JOIN channel AS c ON c.channel_id=t.channel_id";
    q += " LEFT JOIN user AS u ON u.user_name=t.user_id";
    q += " LEFT JOIN moderation AS m ON m.topic_id=t.topic_id AND m.current=1";
    if (sortBy === 'v.diff desc, t.topic_id') {
      q += " JOIN ( SELECT topic_id, sum(case when vote = 1 then 1 else 0 end) - sum(case when vote = 0 then 1 else 0 end) diff FROM topic_vote GROUP BY topic_id ) v on t.topic_id = v.topic_id";
    }
    return q;
  }

  function getTopicsQuery(config, sortBy, channelId, userId, page, showHidden, searchPhrase) {
    var q = this.defaultTopicQuery(sortBy);
    if (sortBy && sortBy.value === 'v.diff desc, t.topic_id') {
      q += " JOIN ( SELECT topic_id, sum(case when vote = 1 then 1 else 0 end) - sum(case when vote = 0 then 1 else 0 end) diff FROM topic_vote GROUP BY topic_id ) v on t.topic_id = v.topic_id";
    }
    q += " WHERE t.topic_id NOT NULL";
    if (!showHidden) q += " AND m.visible IS NOT 0";
    if (channelId) q += " AND t.channel_id='" + channelId + "'";
    if (userId) q += " AND t.user_id='" + userId + "'";
    /*if (user && view === 'user-admin') {
        q += " AND t.user_id='"+user.user_name+"'";
    }*/
    if (searchPhrase) q += " AND t.title LIKE '%" + searchPhrase + "%'";
    q += " GROUP BY t.topic_id";
    if (sortBy) {
      if (sortBy.value === '-added') {
        q += " ORDER BY -t.added";
      } else {
        q += " ORDER BY " + sortBy.value;
      }
    }
    q += " LIMIT 20";
    if (page) q += " OFFSET " + config.listing.items_per_page * (page - 1);
    return q;
  }

  function getTopicQuery(topicId) {
    var q = this.defaultTopicQuery();
    q += " WHERE t.topic_id='" + topicId + "'";
    return q;
  }

  return {
    countTopicsQuery: countTopicsQuery,
    getTopicSortOptions: getTopicSortOptions,
    defaultTopicQuery: defaultTopicQuery,
    getTopicsQuery: getTopicsQuery,
    getTopicQuery: getTopicQuery
  };
}();
"use strict";

window.userHelpers = function () {

  function getUserQuery(userId) {
    var q = "SELECT u.*, f.*, fti.*";
    q += ", (SELECT count(*) FROM channel WHERE channel.user_id=u.user_name) as channels_total";
    q += ", (SELECT count(*) FROM topic WHERE topic.user_id=u.user_name) as topics_total";
    q += ", (SELECT count(*) FROM comment WHERE comment.user_id=u.user_name) as comments_total";
    q += " FROM user u";
    q += " LEFT JOIN file AS f ON f.item_id=u.user_id AND f.item_type='user'";
    q += " LEFT JOIN file_to_item AS fti ON fti.item_id=u.user_id";
    q += " WHERE u.user_id='" + userId + "'";
    return q;
  }

  function getUserAvatarQuery(userId) {
    var q = "SELECT f.*, fti.*";
    q += " FROM file f";
    q += " LEFT JOIN file_to_item AS fti ON fti.item_id=f.item_id ";
    q += " WHERE f.item_id='" + userId + "'";
    return q;
  }

  function randomRgba(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = hash >> i * 8 & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }

  function hashCode(str) {
    // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  function intToRGB(i) {
    var c = (i & 0x00FFFFFF).toString(16).toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
  }

  return {
    getUserQuery: getUserQuery,
    getUserAvatarQuery: getUserAvatarQuery,
    randomRgba: randomRgba,
    hashCode: hashCode,
    intToRGB: intToRGB
  };
}();
"use strict";

window.voteHelpers = function () {

  function getTopicVotesQuery(topicId) {
    var q = "SELECT * FROM topic_vote WHERE topic_vote.topic_id='" + topicId + "'";
    return q;
  }

  function getCommentVotesQuery(commentId) {
    var q = "SELECT * FROM comment_vote WHERE comment_vote.comment_id='" + commentId + "'";
    return q;
  }

  function renderItemVotes(res, user) {
    var votes = {
      up: res.filter(function (v) {
        return v.vote === 1;
      }),
      down: res.filter(function (v) {
        return v.vote === 0;
      }),
      user_vote: res.find(function (v) {
        return v.user_id === user;
      })
    };
    return votes;
  }

  function configVoteActionType(userVote, type) {
    var vtype = void 0;
    if (type === 'UP') {
      if (userVote) {
        if (userVote.vote === 1) vtype = 'DELETE';else if (userVote.vote === 0) vtype = 'CHANGE';
      } else {
        vtype = 'UP';
      }
    } else if (type === 'DOWN') {
      if (userVote) {
        if (userVote.vote === 1) vtype = 'CHANGE';else if (userVote.vote === 0) vtype = 'DELETE';
      } else {
        vtype = 'DOWN';
      }
    }
    return vtype;
  }

  function renderDataJsonOnTopicVote(data, siteInfo, voteType, itemId, userVote, itemType) {
    var voteIndex = void 0;
    if (userVote) voteIndex = data[itemType + '_vote'].findIndex(function (v) {
      return v[itemType + '_vote_id'] === userVote[itemType + '_vote_id'];
    });
    if (voteType === 'UP' || voteType === 'DOWN') {
      var vote = voteType === 'UP' ? 1 : 0;
      var item_vote = {
        user_id: siteInfo.cert_user_id,
        vote: vote,
        added: Date.now()
      };
      item_vote[itemType + '_vote_id'] = siteInfo.auth_address + "vt" + data['next_' + itemType + '_vote_id'];
      item_vote[itemType + '_id'] = itemId;
      data[itemType + '_vote'].push(item_vote);
      data['next_' + itemType + '_vote_id'] += 1;
    } else if (voteType === 'CHANGE') {
      data[itemType + '_vote'][voteIndex].vote = data[itemType + '_vote'][voteIndex].vote === 1 ? 0 : 1;
    } else if (voteType === 'DELETE') {
      data[itemType + '_vote'].splice(voteIndex, 1);
    }
    return data;
  }

  function generateTopicVotesBar(topic) {
    var votesBar = {};
    if (topic.votes) {
      votesBar.total = topic.votes.up.length + topic.votes.down.length;
      votesBar.uvp = topic.votes.up.length / votesBar.total * 100;
      votesBar.dvp = topic.votes.down.length / votesBar.total * 100;
    } else {
      votesBar.total = topic.up_votes + topic.down_votes;
      votesBar.uvp = topic.up_votes / votesBar.total * 100;
      votesBar.dvp = topic.down_votes / votesBar.total * 100;
    }
    return votesBar;
  }

  return {
    getTopicVotesQuery: getTopicVotesQuery,
    getCommentVotesQuery: getCommentVotesQuery,
    renderItemVotes: renderItemVotes,
    configVoteActionType: configVoteActionType,
    renderDataJsonOnTopicVote: renderDataJsonOnTopicVote,
    generateTopicVotesBar: generateTopicVotesBar
  };
}();
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChannelsList = function (_React$Component) {
  _inherits(ChannelsList, _React$Component);

  function ChannelsList(props) {
    _classCallCheck(this, ChannelsList);

    var _this = _possibleConstructorReturn(this, (ChannelsList.__proto__ || Object.getPrototypeOf(ChannelsList)).call(this, props));

    _this.state = {};
    return _this;
  }

  _createClass(ChannelsList, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.props.getAllChannels();
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.channels.sort_options && !this.props.channels.items) {
        this.props.getAllChannels();
      } else if (this.props.user && this.props.user.user_name !== nextProps.user.user_name) {
        this.props.getAllChannels();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var channelListDisplay = void 0;
      if (this.props.channels && this.props.channels.items && this.props.channels.items.length > 0) {
        var sortOptionLabel = store.getState().channels.sort_by;
        var sortBy = store.getState().channels.sort_options.find(function (so) {
          return so.label === sortOptionLabel;
        });
        var cArray = channelHelpers.sortChannels(store.getState().channels.items, sortBy);
        var channels = cArray.map(function (c, index) {
          return React.createElement(ChannelListItem, { channel: c, key: index });
        });
        channelListDisplay = React.createElement(
          "div",
          { className: "ui list" },
          channels
        );
      } else {
        channelListDisplay = React.createElement(
          "div",
          { className: "ui segment lightgray" },
          "no channels yet, ",
          React.createElement(
            "a",
            { href: "index.html?v=user-admin+s=new-channel" },
            "create a new channel!"
          )
        );
      }
      return React.createElement(
        "div",
        { id: "channels-list" },
        channelListDisplay
      );
    }
  }]);

  return ChannelsList;
}(React.Component);

var mapStateToChannelsListProps = function mapStateToChannelsListProps(state) {
  var channels = state.channels;
  var user = state.user;
  return {
    channels: channels,
    user: user
  };
};

var mapDispatchToChanenlsListProps = function mapDispatchToChanenlsListProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var mergeChannelsListProps = function mergeChannelsListProps(stateProps, dispatch) {
  function getAllChannels() {
    var route = store.getState().route;
    var userId = void 0;
    if (route.view === 'user-admin' && route.section === 'channels') {
      userId = store.getState().site_info.cert_user_id;
    }
    var query = channelHelpers.getChannelsQuery(userId);
    Page.cmd('dbQuery', [query], function (res) {
      store.dispatch(setChannels(res));
    }.bind(this));
  }
  return _extends({}, stateProps, dispatch, {
    getAllChannels: getAllChannels
  });
};

var ChannelsListWrapper = ReactRedux.connect(mapStateToChannelsListProps, mapDispatchToChanenlsListProps, mergeChannelsListProps)(ChannelsList);

var ChannelListItem = function (_React$Component2) {
  _inherits(ChannelListItem, _React$Component2);

  function ChannelListItem() {
    _classCallCheck(this, ChannelListItem);

    return _possibleConstructorReturn(this, (ChannelListItem.__proto__ || Object.getPrototypeOf(ChannelListItem)).apply(this, arguments));
  }

  _createClass(ChannelListItem, [{
    key: "render",
    value: function render() {
      var c = this.props.channel;
      var editChannelBtn = void 0;
      if (store.getState().route.view === 'user-admin' && c.user_id === store.getState().site_info.cert_user_id) {
        editChannelBtn = React.createElement(
          "a",
          { className: "edit-btn", href: "index.html?v=user-admin+s=edit-channel+id=" + c.channel_id },
          React.createElement("i", { className: "icon edit" }),
          " Edit Channel"
        );
      }
      return React.createElement(
        "div",
        { className: "ui segment item" },
        React.createElement(
          "div",
          { className: "channel-item-header" },
          React.createElement(
            "h3",
            null,
            React.createElement(
              "a",
              { href: "index.html?v=channel+id=" + c.channel_id },
              c.name
            )
          ),
          React.createElement(
            "span",
            { className: "topic-counter" },
            "[",
            c.topics_count,
            "]"
          ),
          editChannelBtn,
          React.createElement(
            "a",
            { className: "arrow-btn", href: "index.html?v=channel+id=" + c.channel_id },
            React.createElement("i", { className: "icon arrow right" })
          )
        ),
        React.createElement(
          "div",
          { className: "channel-item-content" },
          React.createElement(
            "div",
            { className: "ui segment" },
            React.createElement(
              "p",
              null,
              c.description
            ),
            React.createElement("hr", null),
            React.createElement(
              "span",
              null,
              React.createElement(
                "b",
                null,
                "chanOp:"
              ),
              " ",
              c.user_id
            )
          )
        ),
        React.createElement(
          "div",
          { className: "channel-item-footer" },
          React.createElement(
            "span",
            { className: "channel-item-last-activity" },
            React.createElement(
              "b",
              null,
              "last activity: ",
              appHelpers.getTimeAgo(c.last_topic_date)
            )
          ),
          React.createElement(
            "span",
            { className: "channel-item-created" },
            "created: ",
            appHelpers.getTimeAgo(c.added)
          )
        )
      );
    }
  }]);

  return ChannelListItem;
}(React.Component);

var ChannelModeratorsContainer = function (_React$Component3) {
  _inherits(ChannelModeratorsContainer, _React$Component3);

  function ChannelModeratorsContainer(props) {
    _classCallCheck(this, ChannelModeratorsContainer);

    var _this3 = _possibleConstructorReturn(this, (ChannelModeratorsContainer.__proto__ || Object.getPrototypeOf(ChannelModeratorsContainer)).call(this, props));

    _this3.state = {
      moderators: []
    };
    _this3.getModerators = _this3.getModerators.bind(_this3);
    _this3.addModerator = _this3.addModerator.bind(_this3);
    return _this3;
  }

  _createClass(ChannelModeratorsContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.getModerators();
    }
  }, {
    key: "getModerators",
    value: function getModerators() {
      var channelId = this.props.channel.channel_id;
      var query = "SELECT * FROM moderator WHERE channel_id='" + channelId + "' AND user_name IS NOT NULL";
      Page.cmd('dbQuery', [query], function (res) {
        this.setState({ moderators: res });
      }.bind(this));
    }
  }, {
    key: "addModerator",
    value: function addModerator(moderator) {
      this.setState({
        moderators: [].concat(_toConsumableArray(this.state.moderators), [moderator])
      });
    }
  }, {
    key: "render",
    value: function render() {
      var moderators = this.state.moderators.map(function (mod, index) {
        return React.createElement(
          "li",
          { key: index },
          mod.user_name
        );
      });
      return React.createElement(
        "div",
        { id: "channel-moderators-container" },
        React.createElement(ModeratorForm, { addModerator: this.addModerator }),
        React.createElement(
          "ul",
          null,
          moderators
        )
      );
    }
  }]);

  return ChannelModeratorsContainer;
}(React.Component);

var ChannelLayoutEditorContainer = function (_React$Component4) {
  _inherits(ChannelLayoutEditorContainer, _React$Component4);

  function ChannelLayoutEditorContainer() {
    _classCallCheck(this, ChannelLayoutEditorContainer);

    return _possibleConstructorReturn(this, (ChannelLayoutEditorContainer.__proto__ || Object.getPrototypeOf(ChannelLayoutEditorContainer)).apply(this, arguments));
  }

  _createClass(ChannelLayoutEditorContainer, [{
    key: "render",
    value: function render() {
      var channelLayoutEditorDisplay = void 0;
      if (!store.getState().site_info.settings.own) {
        channelLayoutEditorDisplay = React.createElement(Loading, { cssClass: "centered", msg: "Under Construction" });
      } else {
        channelLayoutEditorDisplay = React.createElement(
          "div",
          { className: "wrapper" },
          React.createElement(
            "p",
            null,
            "editor form tabs"
          ),
          React.createElement(PreviewTemplateWrapper, null)
        );
      }
      return React.createElement(
        "div",
        { id: "channel-layout-editor", className: "ui segment lightgray" },
        channelLayoutEditorDisplay
      );
    }
  }]);

  return ChannelLayoutEditorContainer;
}(React.Component);

var PreviewTemplateWrapper = function (_React$Component5) {
  _inherits(PreviewTemplateWrapper, _React$Component5);

  function PreviewTemplateWrapper() {
    _classCallCheck(this, PreviewTemplateWrapper);

    return _possibleConstructorReturn(this, (PreviewTemplateWrapper.__proto__ || Object.getPrototypeOf(PreviewTemplateWrapper)).apply(this, arguments));
  }

  _createClass(PreviewTemplateWrapper, [{
    key: "render",
    value: function render() {
      return React.createElement(Template, { preview: true });
    }
  }]);

  return PreviewTemplateWrapper;
}(React.Component);

var ChannelTopicsContainer = function (_React$Component6) {
  _inherits(ChannelTopicsContainer, _React$Component6);

  function ChannelTopicsContainer(props) {
    _classCallCheck(this, ChannelTopicsContainer);

    var _this6 = _possibleConstructorReturn(this, (ChannelTopicsContainer.__proto__ || Object.getPrototypeOf(ChannelTopicsContainer)).call(this, props));

    _this6.state = { loading: true };
    _this6.initChannelTopics = _this6.initChannelTopics.bind(_this6);
    return _this6;
  }

  _createClass(ChannelTopicsContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.initChannelTopics();
    }
  }, {
    key: "initChannelTopics",
    value: function initChannelTopics() {
      var route = store.getState().route;
      var sort_options = topicHelpers.getTopicSortOptions(route.sort_by);
      store.dispatch(setSortOptions(sort_options));
      this.setState({ loading: false });
    }
  }, {
    key: "render",
    value: function render() {
      var channelTopicsDisplay = void 0;
      if (this.state.loading) {
        channelTopicsDisplay = React.createElement(Loading, { msg: "loading channel topics" });
      } else {
        channelTopicsDisplay = React.createElement(TopicsWrapper, null);
      }
      return React.createElement(
        "div",
        { id: "channel-topics-container" },
        channelTopicsDisplay
      );
    }
  }]);

  return ChannelTopicsContainer;
}(React.Component);

var ChannelForm = function (_React$Component7) {
  _inherits(ChannelForm, _React$Component7);

  function ChannelForm(props) {
    _classCallCheck(this, ChannelForm);

    var _this7 = _possibleConstructorReturn(this, (ChannelForm.__proto__ || Object.getPrototypeOf(ChannelForm)).call(this, props));

    var name = '',
        description = '';
    if (_this7.props.channel) {
      name = _this7.props.channel.name;
      description = _this7.props.channel.description;
    }
    _this7.state = {
      name: name,
      description: description,
      errors: []
    };
    _this7.onChannelNameChange = _this7.onChannelNameChange.bind(_this7);
    _this7.onChannelNameBlur = _this7.onChannelNameBlur.bind(_this7);
    _this7.onChannelDescriptionChange = _this7.onChannelDescriptionChange.bind(_this7);
    _this7.onChannelDescriptionBlur = _this7.onChannelDescriptionBlur.bind(_this7);
    _this7.onCreateChannel = _this7.onCreateChannel.bind(_this7);
    _this7.createChannel = _this7.createChannel.bind(_this7);
    _this7.onUpdateChannel = _this7.onUpdateChannel.bind(_this7);
    _this7.updateChannel = _this7.updateChannel.bind(_this7);
    return _this7;
  }

  _createClass(ChannelForm, [{
    key: "onChannelNameChange",
    value: function onChannelNameChange(e) {
      this.setState({ name: e.target.value });
      this.validateForm();
    }
  }, {
    key: "onChannelNameBlur",
    value: function onChannelNameBlur() {
      this.validateForm();
    }
  }, {
    key: "onChannelDescriptionChange",
    value: function onChannelDescriptionChange(e) {
      this.setState({ description: e.target.value });
      this.validateForm();
    }
  }, {
    key: "onChannelDescriptionBlur",
    value: function onChannelDescriptionBlur() {
      this.validateForm();
    }
  }, {
    key: "validateForm",
    value: function validateForm() {
      var errors = formHelpers.validateChannelForm(this.state);
      this.setState({ errors: errors });
    }
  }, {
    key: "onUpdateChannel",
    value: function onUpdateChannel(e) {
      var query = "SELECT * FROM json WHERE json_id='" + this.props.channel.json_id + "'";
      Page.cmd('dbQuery', [query], function (res) {
        var inner_path = "merged-" + store.getState().config.merger_name + "/" + res[0].directory + "/data.json";
        this.updateChannel(inner_path);
      }.bind(this));
    }
  }, {
    key: "updateChannel",
    value: function updateChannel(inner_path) {
      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
        var _this8 = this;

        data = JSON.parse(data);
        var channelIndex = data.channel.findIndex(function (c) {
          return c.channel_id === _this8.props.channel.channel_id;
        });
        var channel = data.channel[channelIndex];
        channel.name = this.state.name;
        channel.description = this.state.description;
        chanenl.edited = Date.now();
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          console.log(res);
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            console.log(res);
            Page.cmd("wrapperNotification", ["done", "Channel Edited!", 10000]);
            window.top.location.href = "index.html?v=user-admin+s=channels";
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "onCreateChannel",
    value: function onCreateChannel(e) {
      this.setState({ loading: true }, function () {
        var inner_path = "merged-" + store.getState().config.merger_name + "/" + store.getState().config.cluster + "/data/users/" + store.getState().site_info.auth_address + "/data.json";
        this.createChannel(inner_path);
      });
    }
  }, {
    key: "createChannel",
    value: function createChannel(inner_path) {
      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
        data = JSON.parse(data);
        if (data) {
          if (!data.channel) {
            data.channel = [];
            data.next_channel_id = 1;
          }
        } else {
          data = {
            "channel": [],
            "next_channel_id": 1
          };
        }

        var channel = {
          "channel_id": store.getState().site_info.auth_address + "ch" + data.next_channel_id,
          "name": this.state.name,
          "description": this.state.description,
          "user_id": store.getState().site_info.cert_user_id,
          "added": Date.now()
        };

        data.channel.push(channel);
        data.next_channel_id += 1;

        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          console.log(res);
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            console.log(res);
            Page.cmd("wrapperNotification", ["done", "Channel Edited!", 10000]);
            window.top.location.href = "index.html?v=user-admin+s=channels";
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {
      var _this9 = this;

      var nameError = void 0,
          nameFieldCss = "";
      if (this.state.errors) {
        if (this.state.errors.find(function (e) {
          return e.field === 'name';
        })) {
          var nameErrorObject = this.state.errors.find(function (e) {
            return e.field === 'name';
          });
          nameError = React.createElement(
            "span",
            { className: "error-notice" },
            nameErrorObject.msg
          );
          nameFieldCss = 'error';
        }
      }

      var formSubmitButton = void 0;
      if (!this.state.loading && this.state.errors.length === 0) {
        if (this.props.channel === 'edit') {
          formSubmitButton = React.createElement(
            "button",
            { className: "native-btn submit-btn", type: "button", onClick: function onClick() {
                return _this9.onUpdateChannel();
              } },
            React.createElement(
              "a",
              null,
              "Update Channel"
            )
          );
        } else {
          formSubmitButton = React.createElement(
            "button",
            { className: "native-btn submit-btn", type: "button", onClick: function onClick() {
                return _this9.onCreateChannel();
              } },
            React.createElement(
              "a",
              null,
              "Create Channel"
            )
          );
        }
      }

      var loadingDisplay = void 0;
      if (this.state.loading) {
        loadingDisplay = React.createElement(
          "div",
          { className: "ui active inverted dimmer" },
          React.createElement("div", { className: "ui text loader" })
        );
      }

      return React.createElement(
        "div",
        { id: "channel-form-container", className: "form-container" },
        React.createElement(
          "form",
          { id: "channel-form", className: "ui segment lightgray form" },
          loadingDisplay,
          React.createElement(
            "div",
            { className: "form-row ui field " + nameFieldCss },
            React.createElement(
              "label",
              null,
              "Name"
            ),
            React.createElement("input", {
              type: "text",
              onBlur: this.onChannelNameBlur,
              onChange: this.onChannelNameChange,
              defaultValue: this.state.name }),
            nameError
          ),
          React.createElement(
            "div",
            { className: "form-row ui field" },
            React.createElement(
              "label",
              null,
              "Description"
            ),
            React.createElement("textarea", {
              onBlur: this.onChannelDescriptionBlur,
              onChange: this.onChannelDescriptionChange,
              defaultValue: this.state.description })
          ),
          formSubmitButton
        )
      );
    }
  }]);

  return ChannelForm;
}(React.Component);

var ModeratorForm = function (_React$Component8) {
  _inherits(ModeratorForm, _React$Component8);

  function ModeratorForm(props) {
    _classCallCheck(this, ModeratorForm);

    var _this10 = _possibleConstructorReturn(this, (ModeratorForm.__proto__ || Object.getPrototypeOf(ModeratorForm)).call(this, props));

    _this10.state = {
      user: ''
    };
    _this10.initModeratorForm = _this10.initModeratorForm.bind(_this10);
    _this10.getUsers = _this10.getUsers.bind(_this10);
    _this10.onUserSelectChange = _this10.onUserSelectChange.bind(_this10);
    _this10.addChannelModerator = _this10.addChannelModerator.bind(_this10);
    return _this10;
  }

  _createClass(ModeratorForm, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.initModeratorForm();
    }
  }, {
    key: "initModeratorForm",
    value: function initModeratorForm() {
      var query = "SELECT * FROM moderator WHERE channel_id='" + store.getState().route.id + "'";
      Page.cmd('dbQuery', [query], function (res) {
        this.getUsers();
      }.bind(this));
    }
  }, {
    key: "getUsers",
    value: function getUsers() {
      var query = "SELECT * FROM user WHERE added IS NOT NULL AND user_name IS NOT NULL ORDER BY user_name";
      Page.cmd('dbQuery', [query], function (res) {
        this.setState({ users: res });
      }.bind(this));
    }
  }, {
    key: "onUserSelectChange",
    value: function onUserSelectChange(e) {
      this.setState({ user: e.target.value });
    }
  }, {
    key: "addChannelModerator",
    value: function addChannelModerator(e) {
      e.preventDefault();
      var state = store.getState();
      var inner_path = "merged-" + state.config.merger_name + "/" + state.config.cluster + "/data/users/" + state.site_info.auth_address + "/data.json";
      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
        var _this11 = this;

        data = JSON.parse(data);
        if (data) {
          if (!data.moderator) {
            data.moderator = [];
            data.next_moderator_id = 1;
          }
        } else {
          data = {
            "moderator": [],
            "next_moderator_id": 1
          };
        }
        var user = this.state.users.find(function (u) {
          return u.user_name === _this11.state.user;
        });
        var moderator = {
          moderator_id: state.site_info.auth_address + "_moderator_" + data.next_moderator_id,
          user_id: user.user_id,
          user_name: user.user_name,
          channel_id: store.getState().channels.channel.channel_id,
          added: Date.now()
        };
        data.moderator.push(moderator);
        data.next_moderator_id += 1;
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          console.log(res);
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            console.log(res);
            Page.cmd("wrapperNotification", ["done", "Moderator Added!", 10000]);
            this.props.addModerator(moderator);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {
      var userSelectInput = void 0;
      if (this.state.users) {
        var users = this.state.users.map(function (user, index) {
          return React.createElement(
            "option",
            { key: index, value: user.user_name },
            user.user_name
          );
        });
        userSelectInput = React.createElement(
          "select",
          {
            className: "ui fluid dropdown",
            onChange: this.onUserSelectChange,
            defaultValue: this.state.user },
          users
        );
      }
      return React.createElement(
        "div",
        { id: "moderator-form-container", className: "form-container" },
        React.createElement(
          "form",
          { id: "moderator-form", className: "ui form segment lightgray" },
          React.createElement(
            "div",
            { className: "ui field" },
            userSelectInput
          ),
          React.createElement(
            "button",
            { className: "native-btn" },
            React.createElement(
              "a",
              { onClick: this.addChannelModerator },
              "Add Moderator"
            )
          )
        )
      );
    }
  }]);

  return ModeratorForm;
}(React.Component);
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CommentsContainer = function (_React$Component) {
  _inherits(CommentsContainer, _React$Component);

  function CommentsContainer(props) {
    _classCallCheck(this, CommentsContainer);

    var _this = _possibleConstructorReturn(this, (CommentsContainer.__proto__ || Object.getPrototypeOf(CommentsContainer)).call(this, props));

    _this.state = {};
    _this.toggleCommentFormDisplay = _this.toggleCommentFormDisplay.bind(_this);
    return _this;
  }

  _createClass(CommentsContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      store.dispatch(loadingComments(true));
      this.props.getComments();
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.comments.loading === false) {
        if (this.props.comments.items.length !== nextProps.comments.items.length) {
          this.props.getComments();
        } else if (this.props.comments.sort_by !== nextProps.comments.sort_by) {
          this.props.getComments();
        } else if (this.props.site_info && this.props.site_info.cert_user_id !== nextProps.site_info.cert_user_id) {
          this.forceUpdate();
        }
      }
    }
  }, {
    key: "toggleCommentFormDisplay",
    value: function toggleCommentFormDisplay() {
      var showCommentForm = this.state.showCommentForm === true ? false : true;
      this.setState({ showCommentForm: showCommentForm });
    }
  }, {
    key: "render",
    value: function render() {
      var route = store.getState().route;
      var commentForm = void 0;
      if (route.view === 'topic') {
        if (this.state.showCommentForm) {
          commentForm = React.createElement(
            "div",
            { id: "toggle-comment-form-container" },
            React.createElement(
              "a",
              { id: "toggle-comment-form", onClick: this.toggleCommentFormDisplay },
              "X"
            ),
            React.createElement(CommentFormWrapper, null)
          );
        } else {
          commentForm = React.createElement(
            "a",
            { id: "toggle-comment-form", onClick: this.toggleCommentFormDisplay },
            React.createElement("i", { className: "comments outline icon" }),
            "Reply"
          );
        }
      }

      var commentListDisplay = void 0;
      if (this.props.comments.loading !== false) commentListDisplay = React.createElement(DummyCommentList, null);else commentListDisplay = React.createElement(CommentList, { topic: this.props.topic, onGetComments: this.props.getComments });
      var commentListSortMenu = void 0;
      if (this.props.comments.items && this.props.comments.items.length > 0) commentListSortMenu = React.createElement(CommentListSortMenu, null);

      return React.createElement(
        "div",
        { id: "comments-container" },
        commentForm,
        commentListSortMenu,
        commentListDisplay
      );
    }
  }]);

  return CommentsContainer;
}(React.Component);

var mapStateToCommentsContainerProps = function mapStateToCommentsContainerProps(state, props) {
  var comments = state.comments;
  var site_info = state.site_info;
  var topic = void 0;
  if (state.topics && state.topics.items) topic = state.topics.items[0];
  return {
    comments: comments,
    site_info: site_info,
    topic: topic
  };
};

var mapDispatchToCommentsContainerProps = function mapDispatchToCommentsContainerProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var mergeCommentsContainerProps = function mergeCommentsContainerProps(stateProps, dispatchProps) {
  function getComments() {
    store.dispatch(loadingComments(true));
    var route = store.getState().route;
    var topicId = void 0,
        userId = void 0;
    if (route.view === 'topic') topicId = route.id;else if (route.view === 'user-admin') {
      if (route.section === 'comments') {
        userId = store.getState().site_info.cert_user_id;
      } else if (route.section === 'edit-topic') {
        topicId = route.id;
      }
    }
    var query = commentHelpers.getCommentsQuery(topicId, userId, store.getState().comments.sort_by);
    Page.cmd('dbQuery', [query], function (res) {
      store.dispatch(setComments(res));
      store.dispatch(loadingComments(false));
    });
  }
  return _extends({}, stateProps, dispatchProps, {
    getComments: getComments
  });
};

var CommentsWrapper = ReactRedux.connect(mapStateToCommentsContainerProps, mapDispatchToCommentsContainerProps, mergeCommentsContainerProps)(CommentsContainer);

var CommentListSortMenu = function (_React$Component2) {
  _inherits(CommentListSortMenu, _React$Component2);

  function CommentListSortMenu(props) {
    _classCallCheck(this, CommentListSortMenu);

    var _this2 = _possibleConstructorReturn(this, (CommentListSortMenu.__proto__ || Object.getPrototypeOf(CommentListSortMenu)).call(this, props));

    _this2.state = {};
    _this2.sortCommentList = _this2.sortCommentList.bind(_this2);
    return _this2;
  }

  _createClass(CommentListSortMenu, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var sortOptions = commentHelpers.getCommentSortOptions();
      this.setState({ sort_options: sortOptions }, function () {
        store.dispatch(setCommentSortOptions(sortOptions));
      });
    }
  }, {
    key: "sortCommentList",
    value: function sortCommentList(value) {
      this.setState({ sort_by: value }, function () {
        store.dispatch(sortComments(value));
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var commentSortOptionsDisplay = void 0;
      if (this.state.sort_options) {
        var sortBy = this.state.sort_by;
        if (!sortBy) sortBy = this.state.sort_options[0].value;
        var options = this.state.sort_options.map(function (c, index) {
          return React.createElement(
            "a",
            {
              key: index,
              className: c.value === sortBy ? "item active" : "item",
              onClick: function onClick() {
                return _this3.sortCommentList(c.value);
              } },
            c.label
          );
        });
        commentSortOptionsDisplay = React.createElement(
          "div",
          { className: "ui compact menu" },
          React.createElement(
            "div",
            { className: "item" },
            "sort by:"
          ),
          options
        );
      }

      return React.createElement(
        "div",
        { className: "comment-sort-options-container" },
        commentSortOptionsDisplay
      );
    }
  }]);

  return CommentListSortMenu;
}(React.Component);

var DummyCommentList = function DummyCommentList(props) {
  return React.createElement(
    "div",
    { id: "comment-list", className: "ui list dummy-comment-list" },
    React.createElement(
      "div",
      { className: "ui active inverted dimmer" },
      React.createElement("div", { className: "ui active loader" })
    ),
    React.createElement(DummyCommentListItem, null),
    React.createElement(DummyCommentListItem, null),
    React.createElement(DummyCommentListItem, null)
  );
};

var DummyCommentListItem = function DummyCommentListItem(props) {
  var userId = store.getState().site_info.auth_address;
  var userAvatar = React.createElement("canvas", { width: "28", height: "28", "data-jdenticon-value": userId });

  return React.createElement(
    "div",
    { className: "comment-list-item segment ui" },
    React.createElement(
      "div",
      { className: "comment-item-header blured" },
      React.createElement(
        "div",
        { className: "comment-item-votes" },
        React.createElement(
          "div",
          { className: "votes-display" },
          React.createElement("a", { className: "arrow up" }),
          React.createElement("a", { className: "arrow down" })
        )
      ),
      React.createElement(
        "div",
        { className: "comment-item-avatar" },
        userAvatar
      ),
      React.createElement(
        "div",
        { className: "comment-item-header-top blured" },
        React.createElement(
          "span",
          null,
          React.createElement(
            "a",
            null,
            "dummy user name"
          )
        )
      ),
      React.createElement(
        "div",
        { className: "comment-item-header-bottom blured" },
        "# points \u25CF ",
        React.createElement(
          "span",
          null,
          "some days ago"
        )
      )
    ),
    React.createElement(
      "div",
      { className: "comment-item-body blured" },
      "comment body text"
    ),
    React.createElement(
      "div",
      { className: "comment-item-user-menu blured" },
      React.createElement(
        "a",
        { className: "open-reply-form-btn" },
        React.createElement("i", { className: "comments outline icon" }),
        " Reply"
      ),
      React.createElement(
        "a",
        { className: "show-replies-btn" },
        React.createElement("i", { className: "minus square icon" }),
        "Hide replies"
      )
    )
  );
};

var CommentList = function CommentList(props) {

  var commentsDisplay = void 0;
  if (store.getState().comments.items && store.getState().comments.items.length > 0) {
    var comments = void 0;
    if (store.getState().route.view === 'user-admin') {
      comments = store.getState().comments.items.map(function (c, index) {
        return React.createElement(CommentListItem, {
          key: index,
          comment: c,
          onGetComments: props.onGetComments
        });
      });
    } else {
      comments = store.getState().comments.items.filter(function (c) {
        return c.comment_parent_id === '0';
      }).map(function (c, index) {
        return React.createElement(CommentListItem, {
          key: index,
          comment: c,
          onGetComments: props.onGetComments
        });
      });
    }

    var commentCounter = void 0;
    if (store.getState().route.view === 'topic') {
      commentCounter = React.createElement(
        "div",
        { className: "topic-view-comment-counter" },
        React.createElement(
          "h2",
          null,
          React.createElement(
            "span",
            null,
            props.topic.comments_total - props.topic.hidden_comments_total,
            " Comments"
          )
        )
      );
    }
    commentsDisplay = React.createElement(
      "div",
      null,
      commentCounter,
      React.createElement(
        "div",
        { id: "comment-list", className: "ui list" },
        comments
      )
    );
  }
  return React.createElement(
    "div",
    { id: "comment-list-wrapper" },
    commentsDisplay
  );
};

var CommentListItem = function (_React$Component3) {
  _inherits(CommentListItem, _React$Component3);

  function CommentListItem(props) {
    _classCallCheck(this, CommentListItem);

    var _this4 = _possibleConstructorReturn(this, (CommentListItem.__proto__ || Object.getPrototypeOf(CommentListItem)).call(this, props));

    _this4.state = {
      show_comment_edit_form: false,
      show_reply_form: false,
      show_replies: true
    };
    _this4.hideCommentEditForm = _this4.hideCommentEditForm.bind(_this4);
    _this4.showCommentEditForm = _this4.showCommentEditForm.bind(_this4);
    _this4.showReplyForm = _this4.showReplyForm.bind(_this4);
    _this4.hideReplyForm = _this4.hideReplyForm.bind(_this4);
    _this4.showReplies = _this4.showReplies.bind(_this4);
    _this4.hideReplies = _this4.hideReplies.bind(_this4);
    _this4.onDeleteComment = _this4.onDeleteComment.bind(_this4);
    return _this4;
  }

  _createClass(CommentListItem, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var q = "SELECT * FROM user WHERE user_name='" + this.props.comment.user_id + "' AND screen_name IS NOT NULL";
      var self = this;
      Page.cmd('dbQuery', [q], function (res) {
        var userName = void 0;
        if (res && res.length > 0) {
          userName = res[0].screen_name;
        } else {
          userName = self.props.comment.user_id;
        }
        self.setState({ userName: userName });
      });
    }
  }, {
    key: "showCommentEditForm",
    value: function showCommentEditForm() {
      this.setState({ show_comment_edit_form: true });
    }
  }, {
    key: "hideCommentEditForm",
    value: function hideCommentEditForm() {
      this.setState({ show_comment_edit_form: false }, function () {
        this.props.onGetComments();
      });
    }
  }, {
    key: "showReplyForm",
    value: function showReplyForm() {
      this.setState({ show_reply_form: true });
    }
  }, {
    key: "hideReplyForm",
    value: function hideReplyForm() {
      this.setState({ show_reply_form: false });
    }
  }, {
    key: "showReplies",
    value: function showReplies() {
      this.setState({ show_replies: true });
    }
  }, {
    key: "hideReplies",
    value: function hideReplies() {
      this.setState({ show_replies: false });
    }
  }, {
    key: "onDeleteComment",
    value: function onDeleteComment() {
      var query = "SELECT * FROM json WHERE json_id='" + this.props.comment.json_id + "'";
      Page.cmd('dbQuery', [query], function (res) {
        var inner_path = "merged-" + store.getState().config.merger_name + "/" + res[0].directory + "/" + res[0].file_name;
        this.deleteComment(inner_path);
      }.bind(this));
    }
  }, {
    key: "deleteComment",
    value: function deleteComment(inner_path) {
      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
        var _this5 = this;

        data = JSON.parse(data);
        var commentIndex = data.comment.findIndex(function (c) {
          return c.comment_id === _this5.props.comment.comment_id;
        });
        data.comment.splice(commentIndex, 1);
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            Page.cmd("wrapperNotification", ["done", "Comment Deleted!", 5000]);
            store.dispatch(decrementTopicCommentCount());
            this.props.onGetComments();
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {
      var _this6 = this;

      var c = this.props.comment;
      if (c.added < 1481025974864) c.added = 1481025974864;
      var upVotes = void 0,
          downVotes = void 0;
      if (c.votes) {
        upVotes = c.votes.up.length;
        downVotes = c.votes.down.length;
      } else {
        upVotes = c.up_votes;
        downVotes = c.down_votes;
      }

      var upDownVotesTotal = React.createElement(
        "span",
        null,
        upVotes - downVotes,
        " points (",
        React.createElement(
          "span",
          { className: "up-votes" },
          "+",
          upVotes
        ),
        "|",
        React.createElement(
          "span",
          { className: "down-votes" },
          "-",
          downVotes
        ),
        ")"
      );

      var repliesContainer = void 0,
          replyToggleBtn = void 0;
      var replies = store.getState().comments.items.filter(function (c) {
        return c.comment_parent_id === _this6.props.comment.comment_id;
      });
      if (replies.length > 0) {
        if (this.state.show_replies) {
          replies = replies.map(function (r, index) {
            return React.createElement(CommentListItem, {
              key: index,
              comment: r
            });
          });
          repliesContainer = React.createElement(
            "div",
            { className: "comment-item-replies-container" },
            replies
          );
          replyToggleBtn = React.createElement(
            "a",
            { className: "show-replies-btn", onClick: this.hideReplies },
            React.createElement("i", { className: "minus square icon" }),
            "Hide replies"
          );
        } else {
          replyToggleBtn = React.createElement(
            "a",
            { className: "show-replies-btn", onClick: this.showReplies },
            React.createElement("i", { className: "add square icon" }),
            "Show replies"
          );
        }
      }

      var formDisplay = void 0,
          showReplyFormBtn = void 0;
      if (this.state.show_reply_form) {
        formDisplay = React.createElement(
          "div",
          { className: "reply-form-wrapper" },
          React.createElement(
            "a",
            { className: "close-reply-form-btn", onClick: function onClick() {
                return _this6.hideReplyForm();
              } },
            React.createElement("i", { className: "window close outline icon mid" })
          ),
          React.createElement(CommentFormWrapper, {
            parent: c,
            hideReplyForm: this.hideReplyForm
          })
        );
      } else {
        showReplyFormBtn = React.createElement(
          "a",
          { className: "open-reply-form-btn", onClick: function onClick() {
              return _this6.showReplyForm();
            } },
          React.createElement("i", { className: "comments outline icon" }),
          " Reply"
        );
      }

      var editCommentBtn = void 0,
          deleteCommentBtn = void 0,
          commentBodyDisplay = React.createElement(
        "div",
        { className: "comment-item-body" },
        React.createElement("div", { dangerouslySetInnerHTML: { __html: c.body } })
      );

      if (c.user_id === store.getState().user.user_name) {
        if (!this.state.show_comment_edit_form) {
          editCommentBtn = React.createElement(
            "a",
            { className: "show-comment-edit-form", onClick: function onClick() {
                return _this6.showCommentEditForm();
              } },
            React.createElement("i", { className: "icon edit" }),
            "Edit"
          );
        } else {
          commentBodyDisplay = React.createElement(CommentListItemEditForm, {
            comment: c,
            hideCommentEditForm: this.hideCommentEditForm
          });
        }
      }

      var commentFileDisplay = void 0;
      if (c.file_to_item_id || c.file_id || c.embed_url) {
        if (!this.state.show_comment_edit_form) {
          commentFileDisplay = React.createElement(
            "div",
            { className: "comment-item-media-container" },
            React.createElement(ItemMediaContainer, {
              comment: c
            })
          );
        }
      }

      var userAvatarDisplay = void 0;
      if (this.state.userName) {
        userAvatarDisplay = React.createElement(UserAvatarDisplay, {
          userId: c.comment_id.split('comment')[0],
          userName: this.state.userName
        });
      }

      return React.createElement(
        "div",
        { className: "comment-list-item segment ui" },
        React.createElement(
          "div",
          { className: "comment-item-header" },
          React.createElement(CommentListItemVotesWrapper, { comment: c }),
          React.createElement(
            "div",
            { className: "comment-item-avatar" },
            userAvatarDisplay
          ),
          React.createElement(
            "div",
            { className: "comment-item-header-top" },
            React.createElement(
              "span",
              null,
              React.createElement(
                "a",
                null,
                this.state.userName
              )
            )
          ),
          React.createElement(
            "div",
            { className: "comment-item-header-bottom" },
            upDownVotesTotal,
            " \u25CF ",
            React.createElement(
              "span",
              null,
              appHelpers.getTimeAgo(c.added)
            )
          )
        ),
        commentBodyDisplay,
        commentFileDisplay,
        React.createElement(
          "div",
          { className: "comment-item-user-menu" },
          replyToggleBtn,
          showReplyFormBtn,
          editCommentBtn,
          deleteCommentBtn
        ),
        formDisplay,
        repliesContainer
      );
    }
  }]);

  return CommentListItem;
}(React.Component);

var CommentListItemEditForm = function (_React$Component4) {
  _inherits(CommentListItemEditForm, _React$Component4);

  function CommentListItemEditForm(props) {
    _classCallCheck(this, CommentListItemEditForm);

    var _this7 = _possibleConstructorReturn(this, (CommentListItemEditForm.__proto__ || Object.getPrototypeOf(CommentListItemEditForm)).call(this, props));

    _this7.state = {
      loading: false,
      text: _this7.props.comment.body
    };
    _this7.hideCommentEditForm = _this7.hideCommentEditForm.bind(_this7);
    _this7.updateCommentText = _this7.updateCommentText.bind(_this7);
    _this7.onCommentFileChange = _this7.onCommentFileChange.bind(_this7);
    _this7.readFile = _this7.readFile.bind(_this7);
    _this7.onRemoveCommentFile = _this7.onRemoveCommentFile.bind(_this7);
    _this7.removeCommentFile = _this7.removeCommentFile.bind(_this7);
    _this7.deleteCommentFile = _this7.deleteCommentFile.bind(_this7);
    _this7.onUpdateComment = _this7.onUpdateComment.bind(_this7);
    _this7.updateComment = _this7.updateComment.bind(_this7);
    return _this7;
  }

  _createClass(CommentListItemEditForm, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      // jdenticon();
      var options = formHelpers.getEasyEditorOptions();
      new EasyEditor('#ckeditor' + this.props.comment.comment_id, options);
    }
  }, {
    key: "hideCommentEditForm",
    value: function hideCommentEditForm(e) {
      e.preventDefault();
      this.props.hideCommentEditForm();
    }
  }, {
    key: "updateCommentText",
    value: function updateCommentText(e) {
      this.setState({ text: e.target.value });
    }
  }, {
    key: "onCommentFileChange",
    value: function onCommentFileChange(e) {
      var file = {
        f: e.target.files[0],
        file_name: fileHelpers.generateValidFileName(e.target.files[0].name),
        file_type: e.target.files[0].type.split('/')[1],
        file_size: e.target.files[0].size,
        media_type: e.target.files[0].type.split('/')[0],
        item_type: 'comment'
      };
      this.readFile(file, e.target.files[0]);
    }
  }, {
    key: "readFile",
    value: function readFile(file, filesObject) {
      var reader = new FileReader();
      var th = this;
      reader.onload = function () {
        file.f.data = reader.result;
        th.setState({ file: file });
      };
      reader.readAsDataURL(filesObject);
    }
  }, {
    key: "onUploadFile",
    value: function onUploadFile(inner_path) {
      if (this.props.comment.file_id) {
        this.onRemoveCommentFile(inner_path);
      } else {
        this.uploadFile(inner_path);
      }
    }
  }, {
    key: "uploadFile",
    value: function uploadFile(inner_path) {
      var file = this.state.file;
      Page.cmd("bigfileUploadInit", [inner_path, file.file_size], function (init_res) {
        var formdata = new FormData();
        var req = new XMLHttpRequest();
        formdata.append(file.file_name, file.f);
        // upload event listener
        req.upload.addEventListener("progress", function (res) {
          // update item progress
          this.setState({ fileProgress: parseInt(res.loaded / res.total * 100) });
        }.bind(this));
        // loaded event listener
        req.upload.addEventListener("loadend", function () {
          this.createFile(inner_path, this.props.comment);
        }.bind(this));
        req.withCredentials = true;
        req.open("POST", init_res.url);
        req.send(formdata);
      }.bind(this));
    }
  }, {
    key: "createFile",
    value: function createFile(inner_path, comment) {

      Page.cmd('fileGet', { inner_path: inner_path + "/data.json" }, function (data) {

        data = JSON.parse(data);
        if (data) {
          if (!data.file) {
            data.file = [];
            data.next_file_id = 1;
          }
          if (!data.file_to_item) {
            data.file_to_item = [];
            data.next_file_to_item_id = 1;
          }
        } else {
          data = {
            "file": [],
            "next_file_id": 1,
            "file_to_item": [],
            "next_file_to_item_id": 1
          };
        }

        var file = {
          file_id: store.getState().site_info.auth_address + "fl" + data.next_file_id,
          file_type: this.state.file.file_type,
          file_name: this.state.file.file_name,
          item_id: comment.comment_id,
          item_type: 'comment',
          user_id: store.getState().site_info.auth_address,
          added: Date.now()
        };

        data.file.push(file);
        data.next_file_id += 1;

        var file_to_item = {
          file_to_item_id: store.getState().site_info.auth_address + "fti" + data.next_file_to_item_id,
          item_type: 'comment',
          item_id: comment.comment_id,
          file_id: file.file_id,
          cluster_id: store.getState().config.cluster,
          user_id: file.user_id,
          added: Date.now()
        };

        data.file_to_item.push(file_to_item);
        data.next_file_to_item_id += 1;

        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path + "/data.json", btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path + "/data.json" }, function (res) {
            this.updateComment(inner_path);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "onRemoveCommentFile",
    value: function onRemoveCommentFile() {
      this.setState({ loading: true }, function () {
        var query = "SELECT * FROM json WHERE json_id='" + this.props.comment.json_id + "'";
        Page.cmd('dbQuery', [query], function (res) {
          var inner_path = "merged-" + store.getState().config.merger_name + "/" + res[0].directory;
          var file_name = this.props.comment.file_name;
          this.removeCommentFile(inner_path, file_name);
        }.bind(this));
      });
    }
  }, {
    key: "removeCommentFile",
    value: function removeCommentFile(inner_path, file_name) {

      Page.cmd('fileGet', { inner_path: inner_path + "/data.json" }, function (data) {
        var _this8 = this;

        data = JSON.parse(data);
        var fIndex = data.file.findIndex(function (f) {
          return f.file_id === _this8.props.comment.file_id;
        });
        var ftiIndex = data.file_to_item.findIndex(function (fti) {
          return fti.file_to_item_id === _this8.props.comment.file_to_item_id;
        });
        data.file.splice(fIndex, 1);
        data.file_to_item.splice(ftiIndex, 1);
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path + "/data.json", btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path + "/data.json" }, function (res) {
            this.deleteCommentFile(inner_path, file_name);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "deleteCommentFile",
    value: function deleteCommentFile(inner_path, file_name) {
      Page.cmd('fileDelete', { inner_path: inner_path + "/" + file_name }, function (res) {
        if (this.state.updating) {
          this.uploadFile(inner_path);
        } else {
          this.setState({ file_deleted: true, loading: false });
        }
      }.bind(this));
    }
  }, {
    key: "onUpdateComment",
    value: function onUpdateComment(e) {
      e.preventDefault();
      var text = $('#ckeditor' + this.props.comment.comment_id)[0].defaultValue;
      this.setState({ updating: true, loading: true, text: text }, function () {
        var query = "SELECT * FROM json WHERE json.json_id='" + this.props.comment.json_id + "'";
        Page.cmd('dbQuery', [query], function (res) {
          var json = res[0];
          var inner_path = "merged-" + store.getState().config.merger_name + "/" + json.directory;
          if (this.state.file) {
            this.onUploadFile(inner_path);
          } else {
            this.updateComment(inner_path);
          }
        }.bind(this));
      });
    }
  }, {
    key: "updateComment",
    value: function (_updateComment) {
      function updateComment(_x) {
        return _updateComment.apply(this, arguments);
      }

      updateComment.toString = function () {
        return _updateComment.toString();
      };

      return updateComment;
    }(function (inner_path) {
      Page.cmd('fileGet', { inner_path: inner_path + "/data.json" }, function (data) {
        var _this9 = this;

        data = JSON.parse(data);
        var commentIndex = data.comment.findIndex(function (c) {
          return c.comment_id === _this9.props.comment.comment_id;
        });
        data.comment[commentIndex].body = this.state.text;
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path + "/data.json", btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path + "/data.json" }, function (res) {
            Page.cmd("wrapperNotification", ["done", "Comment Updated!", 5000]);
            store.dispatch(updateComment(data.comment[commentIndex]));
            this.props.hideCommentEditForm();
          }.bind(this));
        }.bind(this));
      }.bind(this));
    })
  }, {
    key: "render",
    value: function render() {
      var commentEditFormDisplay = void 0;
      if (this.state.loading) {
        commentEditFormDisplay = React.createElement(
          "div",
          { className: "ui segment" },
          React.createElement(Loading, { msg: "updating comment...", cssClass: "centered" })
        );
      } else {

        var commentEditFormFileDisplay = void 0;
        if (this.state.file) {
          if (this.state.file.media_type === 'image') {
            commentEditFormFileDisplay = React.createElement(
              "div",
              { className: "ui segment item-file-display" },
              React.createElement("img", { src: this.state.file.f.data })
            );
          } else if (this.state.file.media_type === 'video') {
            commentEditFormFileDisplay = React.createElement(
              "div",
              { className: "ui segment item-file-display" },
              React.createElement(VideoPlayer, {
                filePath: this.state.file.data_url,
                fileType: this.state.file.file_type,
                mediaType: this.state.file.media_type
              })
            );
          }
        } else if (this.props.comment.file_id && !this.state.file_deleted) {
          commentEditFormFileDisplay = React.createElement(
            "div",
            { className: "comment-item-media-container" },
            React.createElement(
              "div",
              { className: "comment-file-menu" },
              React.createElement(
                "button",
                { className: "native-btn", type: "button", onClick: this.onRemoveCommentFile },
                React.createElement(
                  "a",
                  null,
                  React.createElement("i", { className: "icon trash" })
                )
              )
            ),
            React.createElement(ItemMediaContainer, {
              comment: this.props.comment
            })
          );
        }

        var addFileButton = void 0;
        if (!this.state.file && this.state.file_deleted || !this.state.file && !this.props.comment.file_id) {
          addFileButton = React.createElement(
            "span",
            { type: "button", className: "native-btn" },
            React.createElement(
              "a",
              null,
              "add file"
            ),
            React.createElement("input", { type: "file", onChange: this.onCommentFileChange })
          );
        }

        var fileUploadProgressDisplay = void 0;
        if (this.state.fileProgress > 0 && this.state.fileProgress < 100) {
          var progressBarCssClass = "ui active progress",
              progressBarText = "upload file";
          if (this.state.fileProgress === 100) {
            progressBarCssClass += " success";
            progressBarText = "file uploaded!";
          }
          fileUploadProgressDisplay = React.createElement(
            "div",
            { className: progressBarCssClass },
            React.createElement(
              "div",
              { className: "bar", style: { "width": this.state.fileProgress + "%" } },
              React.createElement("div", { className: "progress" })
            ),
            React.createElement(
              "div",
              { className: "label" },
              progressBarText
            )
          );
        }

        commentEditFormDisplay = React.createElement(
          "form",
          { className: "ui form comment-edit-form" },
          React.createElement(
            "div",
            { className: "field" },
            React.createElement("textarea", {
              id: "ckeditor" + this.props.comment.comment_id,
              rows: "2",
              defaultValue: this.state.text,
              onChange: this.updateCommentText })
          ),
          commentEditFormFileDisplay,
          fileUploadProgressDisplay,
          React.createElement(
            "div",
            { className: "field" },
            React.createElement(
              "div",
              { className: "btn-container" },
              React.createElement(
                "button",
                { type: "button", className: "native-btn", onClick: this.onUpdateComment },
                React.createElement(
                  "a",
                  null,
                  "update"
                )
              ),
              addFileButton,
              React.createElement(
                "button",
                { type: "button", className: "native-btn", onClick: this.hideCommentEditForm },
                React.createElement(
                  "a",
                  null,
                  "cancel"
                )
              )
            )
          )
        );
      }

      return React.createElement(
        "div",
        { className: "comment-edit-form-display" },
        commentEditFormDisplay
      );
    }
  }]);

  return CommentListItemEditForm;
}(React.Component);

var CommentListItemVotesContainer = function (_React$Component5) {
  _inherits(CommentListItemVotesContainer, _React$Component5);

  function CommentListItemVotesContainer(props) {
    _classCallCheck(this, CommentListItemVotesContainer);

    var _this10 = _possibleConstructorReturn(this, (CommentListItemVotesContainer.__proto__ || Object.getPrototypeOf(CommentListItemVotesContainer)).call(this, props));

    _this10.state = {};
    _this10.onUpVoteClick = _this10.onUpVoteClick.bind(_this10);
    _this10.onDownVoteClick = _this10.onDownVoteClick.bind(_this10);
    return _this10;
  }

  _createClass(CommentListItemVotesContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.props.getCommentVotes();
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.site_info.cert_user_id !== this.props.site_info.cert_user_id) {
        this.props.getCommentVotes();
      }
    }
  }, {
    key: "onUpVoteClick",
    value: function onUpVoteClick() {
      if (store.getState().site_info.cert_user_id) {
        var voteType = voteHelpers.configVoteActionType(this.props.comment.votes.user_vote, 'UP');
        this.props.onVoteComment(voteType);
      } else {
        Page.cmd("wrapperNotification", ["info", "Login to participate", 4000]);
      }
    }
  }, {
    key: "onDownVoteClick",
    value: function onDownVoteClick() {
      if (store.getState().site_info.cert_user_id) {
        var voteType = voteHelpers.configVoteActionType(this.props.comment.votes.user_vote, 'DOWN');
        this.props.onVoteComment(voteType);
      } else {
        Page.cmd("wrapperNotification", ["info", "Login to participate", 4000]);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var topicVotesDisplay = void 0;
      if (this.props.comment.loading_votes) {
        topicVotesDisplay = React.createElement("div", { className: "ui mini loader active" });
      } else {
        var votesDisplayCssClass = void 0;
        if (this.props.comment.votes && this.props.comment.votes.user_vote) {
          votesDisplayCssClass = this.props.comment.votes.user_vote.vote === 1 ? 'up-voted' : 'down-voted';
        }
        topicVotesDisplay = React.createElement(
          "div",
          { className: "votes-display " + votesDisplayCssClass },
          React.createElement("a", { className: "arrow up", onClick: this.onUpVoteClick }),
          React.createElement("a", { className: "arrow down", onClick: this.onDownVoteClick })
        );
      }

      return React.createElement(
        "div",
        { className: "comment-item-votes" },
        topicVotesDisplay
      );
    }
  }]);

  return CommentListItemVotesContainer;
}(React.Component);

var mapStateToCommentListItemVotesContainer = function mapStateToCommentListItemVotesContainer(state, props) {
  var site_info = state.site_info;
  var comment = props.comment;
  return {
    site_info: site_info,
    comment: comment
  };
};

var mapDispatchToCommentListItemVotesContainer = function mapDispatchToCommentListItemVotesContainer(dispatch) {
  return {
    dispatch: dispatch
  };
};

var mergeCommentListItemVotesContainerProps = function mergeCommentListItemVotesContainerProps(stateProps, dispatch) {

  function getCommentVotes() {
    var query = voteHelpers.getCommentVotesQuery(stateProps.comment.comment_id);
    Page.cmd('dbQuery', [query], function (res) {
      var user = stateProps.site_info.cert_user_id;
      var votes = voteHelpers.renderItemVotes(res, user);
      store.dispatch(assignCommentVotes(votes, stateProps.comment.comment_id));
    });
  }

  function onVoteComment(voteType) {
    store.dispatch(loadingCommentVotes(stateProps.comment.comment_id, true));
    var config = store.getState().config;
    if (voteType === 'CHANGE' || voteType === 'DELETE') {
      var query = "SELECT * FROM json WHERE json_id='" + stateProps.comment.votes.user_vote.json_id + "'";
      Page.cmd('dbQuery', [query], function (res) {
        var inner_path = "merged-" + config.merger_name + "/" + res[0].directory + "/" + res[0].file_name;
        this.voteComment(voteType, inner_path);
      }.bind(this));
    } else {
      var auth_address = stateProps.site_info.auth_address;
      var inner_path = "merged-" + config.merger_name + "/" + config.cluster + "/data/users/" + auth_address + "/data.json";
      voteComment(voteType, inner_path);
    }
  }

  function voteComment(voteType, inner_path) {
    Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
      data = JSON.parse(data);
      if (data) {
        if (!data.comment_vote) {
          data.comment_vote = [];
          data.next_comment_vote_id = 1;
        }
      } else {
        data = {
          "comment_vote": [],
          "next_comment_vote_id": 1
        };
      }
      data = voteHelpers.renderDataJsonOnTopicVote(data, stateProps.site_info, voteType, stateProps.comment.comment_id, stateProps.comment.votes.user_vote, 'comment');
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
        Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
          Page.cmd("wrapperNotification", ["done", "Comment Voted!", 10000]);
          store.dispatch(loadingCommentVotes(stateProps.comment.comment_id, false));
          getCommentVotes();
        });
      });
    });
  }

  return _extends({}, stateProps, dispatch, {
    getCommentVotes: getCommentVotes,
    onVoteComment: onVoteComment,
    voteComment: voteComment
  });
};

var CommentListItemVotesWrapper = ReactRedux.connect(mapStateToCommentListItemVotesContainer, mapDispatchToCommentListItemVotesContainer, mergeCommentListItemVotesContainerProps)(CommentListItemVotesContainer);

var CommentForm = function (_React$Component6) {
  _inherits(CommentForm, _React$Component6);

  function CommentForm(props) {
    _classCallCheck(this, CommentForm);

    var _this11 = _possibleConstructorReturn(this, (CommentForm.__proto__ || Object.getPrototypeOf(CommentForm)).call(this, props));

    _this11.state = {
      text: '',
      errors: []
    };
    _this11.renderTextArea = _this11.renderTextArea.bind(_this11);
    _this11.updateCommentText = _this11.updateCommentText.bind(_this11);
    _this11.onCommentFileChange = _this11.onCommentFileChange.bind(_this11);
    _this11.readFile = _this11.readFile.bind(_this11);
    _this11.onPostComment = _this11.onPostComment.bind(_this11);
    _this11.postComment = _this11.postComment.bind(_this11);
    _this11.onUploadFile = _this11.onUploadFile.bind(_this11);
    _this11.uploadFile = _this11.uploadFile.bind(_this11);
    _this11.finishPostingComment = _this11.finishPostingComment.bind(_this11);
    return _this11;
  }

  _createClass(CommentForm, [{
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.user !== this.props.user) {
        this.setState({ loading: true }, function () {
          this.setState({ loading: false }, function () {
            this.renderTextArea();
          });
        });
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.renderTextArea();
    }
  }, {
    key: "renderTextArea",
    value: function renderTextArea() {
      if (store.getState().site_info.cert_user_id) {
        var textAreaId = "ckeditor";
        if (this.props.parent) textAreaId = "ckeditor" + this.props.parent.comment_id;
        var options = formHelpers.getEasyEditorOptions();
        new EasyEditor('#' + textAreaId, options);
      }
    }
  }, {
    key: "certSelect",
    value: function certSelect(e) {
      Page.selectUser();
      Page.onRequest = function (cmd, message) {
        if (cmd === "setSiteInfo") {
          if (message.address === store.getState().site_info.address) {
            store.dispatch(loadingUser(true));
            if (message.cert_user_id) {
              store.dispatch(changeCert(message.auth_address, message.cert_user_id));
            } else if (!message.cert_user_id) {
              store.dispatch(changeCert(message.auth_address, message.cert_user_id));
              store.dispatch(removeUser());
            }
          }
        }
      };
    }
  }, {
    key: "updateCommentText",
    value: function updateCommentText(e) {
      this.setState({ text: e.target.value });
    }
  }, {
    key: "onCommentFileChange",
    value: function onCommentFileChange(e) {
      var file = {
        f: e.target.files[0],
        file_name: fileHelpers.generateValidFileName(e.target.files[0].name),
        file_type: e.target.files[0].type.split('/')[1],
        file_size: e.target.files[0].size,
        media_type: e.target.files[0].type.split('/')[0],
        item_type: 'comment'
      };
      this.readFile(file, e.target.files[0]);
    }
  }, {
    key: "readFile",
    value: function readFile(file, filesObject) {
      var reader = new FileReader();
      var th = this;
      reader.onload = function () {
        file.f.data = reader.result;
        th.setState({ file: file });
      };
      reader.readAsDataURL(filesObject);
    }
  }, {
    key: "onPostComment",
    value: function onPostComment(event) {
      event.preventDefault();
      var textAreaId = "ckeditor";
      if (this.props.parent) textAreaId = "ckeditor" + this.props.parent.comment_id;
      var text = $('#' + textAreaId)[0].defaultValue;
      this.setState({ text: text }, function () {
        var errors = formHelpers.validateCommentForm(this.state);
        this.setState({ errors: errors }, function () {
          if (this.state.errors.length === 0) {
            this.setState({ loading: true }, function () {
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
  }, {
    key: "postComment",
    value: function postComment() {
      var state = store.getState();
      var inner_path = "merged-" + state.config.merger_name + "/" + state.config.cluster + "/data/users/" + state.site_info.auth_address + "/data.json";
      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
        data = JSON.parse(data);
        if (data) {
          if (!data.comment) {
            data.comment = [];
            data.next_comment_id = 1;
          }
        } else {
          data = {
            "comment": [],
            "next_comment_id": 1
          };
        }

        var comment = {
          comment_id: state.site_info.auth_address + "comment" + data.next_comment_id,
          body: this.state.text,
          body_p: this.state.text.replace(/<\/?[^>]+(>|$)/g, ""),
          topic_id: this.props.topic.topic_id,
          user_id: state.site_info.cert_user_id,
          comment_parent_id: this.props.parent ? this.props.parent.comment_id : 0,
          added: Date.now()
        };
        data.comment.push(comment);
        data.next_comment_id += 1;
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            Page.cmd("wrapperNotification", ["done", "Comment Posted!", 10000]);
            if (this.state.file) {
              this.createFile(inner_path, comment);
            } else {
              this.finishPostingComment(comment);
            }
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "onUploadFile",
    value: function onUploadFile() {
      var state = store.getState();
      var inner_path = "merged-" + state.config.merger_name + "/" + state.config.cluster + "/data/users/" + state.site_info.auth_address + "/" + this.state.file.file_name;
      this.uploadFile(inner_path);
    }
  }, {
    key: "uploadFile",
    value: function uploadFile(inner_path) {
      var file = this.state.file;
      Page.cmd("bigfileUploadInit", [inner_path, file.file_size], function (init_res) {
        var formdata = new FormData();
        var req = new XMLHttpRequest();
        formdata.append(file.file_name, file.f);
        // upload event listener
        req.upload.addEventListener("progress", function (res) {
          // update item progress
          this.setState({ fileProgress: parseInt(res.loaded / res.total * 100) });
        }.bind(this));
        // loaded event listener
        req.upload.addEventListener("loadend", function () {
          this.postComment();
        }.bind(this));
        req.withCredentials = true;
        req.open("POST", init_res.url);
        req.send(formdata);
      }.bind(this));
    }
  }, {
    key: "createFile",
    value: function createFile(inner_path, comment) {

      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {

        data = JSON.parse(data);
        if (data) {
          if (!data.file) {
            data.file = [];
            data.next_file_id = 1;
          }
          if (!data.file_to_item) {
            data.file_to_item = [];
            data.next_file_to_item_id = 1;
          }
        } else {
          data = {
            "file": [],
            "next_file_id": 1,
            "file_to_item": [],
            "next_file_to_item_id": 1
          };
        }

        var file = {
          file_id: store.getState().site_info.auth_address + "fl" + data.next_file_id,
          file_type: this.state.file.file_type,
          file_name: this.state.file.file_name,
          item_id: comment.comment_id,
          item_type: 'comment',
          user_id: store.getState().site_info.auth_address,
          added: Date.now()
        };

        data.file.push(file);
        data.next_file_id += 1;

        var file_to_item = {
          file_to_item_id: store.getState().site_info.auth_address + "fti" + data.next_file_to_item_id,
          item_type: 'comment',
          item_id: comment.comment_id,
          file_id: file.file_id,
          cluster_id: store.getState().config.cluster,
          user_id: file.user_id,
          added: Date.now()
        };

        data.file_to_item.push(file_to_item);
        data.next_file_to_item_id += 1;

        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            Page.cmd("wrapperNotification", ["done", "Topic Created!", 5000]);
            this.finishPostingComment(comment);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "finishPostingComment",
    value: function finishPostingComment(comment) {
      var parent = void 0;
      if (this.props.parent) parent = this.props.parent;else parent = this.props.topic;
      store.dispatch(addComment(comment));
      store.dispatch(incrementTopicCommentCount());
      this.setState({
        text: '',
        file: '',
        loading: false,
        errors: [],
        fileProgress: ''
      });
    }
  }, {
    key: "render",
    value: function render() {
      var commentFormDisplay = void 0;
      if (this.state.loading) {
        commentFormDisplay = React.createElement(Loading, { cssClass: "centered", msg: "Posting Comment" });
      } else {

        var certUserId = store.getState().site_info.cert_user_id;

        var userId = void 0,
            textAreaDisplay = void 0,
            fileDisplay = void 0,
            buttonsFieldDisplay = void 0;
        if (certUserId) {
          userId = certUserId;
          var textAreaId = "ckeditor";
          if (this.props.parent) textAreaId = "ckeditor" + this.props.parent.comment_id;

          textAreaDisplay = React.createElement(
            "div",
            { className: "field" },
            React.createElement("textarea", {
              name: textAreaId,
              id: textAreaId,
              onChange: this.updateCommentText,
              placeholder: "comment as " + certUserId,
              rows: "2",
              value: this.state.text })
          );
          buttonsFieldDisplay = React.createElement(
            "div",
            { className: "field" },
            React.createElement(
              "button",
              { type: "button", className: "native-btn", onClick: this.onPostComment },
              React.createElement(
                "a",
                null,
                "post comment"
              )
            ),
            React.createElement(
              "span",
              { type: "button", className: "native-btn" },
              React.createElement(
                "a",
                null,
                "add file"
              ),
              React.createElement("input", { type: "file", onChange: this.onCommentFileChange })
            )
          );
        } else {
          userId = store.getState().site_info.auth_address;
          textAreaDisplay = React.createElement(
            "div",
            { className: "field" },
            React.createElement("textarea", {
              disabled: "disabled",
              placeholder: "please login to participate",
              rows: "2" })
          );
          buttonsFieldDisplay = React.createElement(
            "div",
            { className: "field" },
            React.createElement(
              "button",
              { type: "button", onClick: this.certSelect, className: "native-btn" },
              React.createElement(
                "a",
                null,
                "Login"
              )
            )
          );
        }

        if (this.state.file) {
          if (this.state.file.media_type === 'image') {
            fileDisplay = React.createElement(
              "div",
              { className: "ui segment item-file-display" },
              React.createElement("img", { src: this.state.file.f.data })
            );
          } else if (this.state.file.media_type === 'video' || this.state.file.media_type === 'audio') {
            fileDisplay = React.createElement(
              "div",
              { className: "ui segment item-file-display" },
              React.createElement(VideoPlayer, {
                filePath: this.state.file.f.data,
                fileType: this.state.file.file_type,
                mediaType: this.state.file.media_type
              })
            );
          }
        }

        var fileUploadProgressDisplay = void 0;
        if (this.state.fileProgress > 0 && this.state.fileProgress < 100) {

          var progressBarCssClass = "ui active progress",
              progressBarText = "upload file";
          if (this.state.fileProgress === 100) {
            progressBarCssClass += " success";
            progressBarText = "file uploaded!";
          }

          fileUploadProgressDisplay = React.createElement(
            "div",
            { className: progressBarCssClass },
            React.createElement(
              "div",
              { className: "bar", style: { "width": this.state.fileProgress + "%" } },
              React.createElement("div", { className: "progress" })
            ),
            React.createElement(
              "div",
              { className: "label" },
              progressBarText
            )
          );
        }

        var errorsDisplay = void 0;
        if (this.state.errors.length > 0) {
          errorsDisplay = React.createElement(
            "p",
            { className: "error" },
            this.state.errors[0].msg
          );
        }

        var user = store.getState().user;
        var userName = user.user_name;
        if (!user.user_name) {
          userName = store.getState().site_info.cert_user_id;
        }
        var userAvatar = void 0;
        if (store.getState().site_info.cert_user_id) {
          userAvatar = React.createElement(UserAvatarDisplay, {
            userId: user.user_id,
            userName: userName
          });
        }

        commentFormDisplay = React.createElement(
          "form",
          { className: "comment-form ui form" },
          React.createElement(
            "div",
            { className: "comment-avatar" },
            userAvatar
          ),
          textAreaDisplay,
          fileDisplay,
          fileUploadProgressDisplay,
          errorsDisplay,
          buttonsFieldDisplay
        );
      }

      return React.createElement(
        "div",
        { className: "comment-form-container ui segment" },
        commentFormDisplay
      );
    }
  }]);

  return CommentForm;
}(React.Component);

var mapStateToCommentFormProps = function mapStateToCommentFormProps(state, props) {
  var user = state.user;
  var route = state.route;
  var topic = state.topics.items.find(function (t) {
    return t.topic_id === route.id;
  });
  var parent = props.parent;
  var hideReplyForm = props.hideReplyForm;
  var comment = props.comment;
  return {
    user: user,
    topic: topic,
    parent: parent,
    hideReplyForm: hideReplyForm,
    comment: comment
  };
};

var mapDispatchToCommentFormProps = function mapDispatchToCommentFormProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var mergeCommentFormProps = function mergeCommentFormProps(stateProps, dispatch) {

  function getComment() {
    console.log(this.props.comment);
  }

  return _extends({}, stateProps, dispatch, {
    getComment: getComment
  });
};

var CommentFormWrapper = ReactRedux.connect(mapStateToCommentFormProps, mapDispatchToCommentFormProps, mergeCommentFormProps)(CommentForm);
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Template = function (_React$Component) {
  _inherits(Template, _React$Component);

  function Template(props) {
    _classCallCheck(this, Template);

    var _this = _possibleConstructorReturn(this, (Template.__proto__ || Object.getPrototypeOf(Template)).call(this, props));

    _this.state = {};
    _this.updateDimensions = _this.updateDimensions.bind(_this);
    return _this;
  }

  _createClass(Template, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      this.updateDimensions();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      window.addEventListener("resize", this.updateDimensions);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener("resize", this.updateDimensions);
    }
  }, {
    key: "updateDimensions",
    value: function updateDimensions() {
      var device = appHelpers.getDeviceWidth(window.innerWidth);
      this.setState({ device: device });
    }
  }, {
    key: "render",
    value: function render() {
      if (this.state.loading) {
        return React.createElement(
          "div",
          { className: "ui segment", id: "main-site-loader" },
          React.createElement(
            "div",
            { className: "ui active dimmer" },
            React.createElement(
              "div",
              { className: "ui text loader" },
              "Loading"
            )
          ),
          React.createElement("p", null)
        );
      } else {

        var route = store.getState().route;
        var viewContainerDisplay = React.createElement(
          "div",
          { className: "column twelve wide computer sixteen wide tablet" },
          React.createElement(ViewContainer, { preview: this.props.preview })
        );
        var sidebarContainerDisplay = React.createElement(
          "div",
          { className: "column four wide computer sixteen wide tablet" },
          React.createElement(SideBar, { preview: this.props.preview })
        );
        if (route.view === 'user-admin' || !this.props.preview) {
          if (route.section === 'edit-channel' || route.section === 'new-channel') {
            viewContainerDisplay = React.createElement(
              "div",
              { className: "column sixteen wide computer sixteen wide tablet" },
              React.createElement(ViewContainer, null)
            );
            sidebarContainerDisplay = '';
          }
        }

        var mainContentDisplay = void 0;
        if (this.state.device === "large" || this.state.device === "mid") {
          mainContentDisplay = React.createElement(
            "section",
            { id: "main-content", className: "ui container grid" },
            viewContainerDisplay,
            sidebarContainerDisplay
          );
        } else if (this.state.device === "tablet" || this.state.device === "mobile") {
          mainContentDisplay = React.createElement(
            "section",
            { id: "main-content", className: "ui container grid" },
            sidebarContainerDisplay,
            viewContainerDisplay
          );
        }
        return React.createElement(
          "main",
          null,
          React.createElement(Header, { preview: this.props.preview }),
          mainContentDisplay
        );
      }
    }
  }]);

  return Template;
}(React.Component);

var ViewContainer = function (_React$Component2) {
  _inherits(ViewContainer, _React$Component2);

  function ViewContainer() {
    _classCallCheck(this, ViewContainer);

    return _possibleConstructorReturn(this, (ViewContainer.__proto__ || Object.getPrototypeOf(ViewContainer)).apply(this, arguments));
  }

  _createClass(ViewContainer, [{
    key: "render",
    value: function render() {
      var route = store.getState().route;
      var viewDisplay = void 0;
      if (route.view === 'main' || route.view === 'channel' || route.view === 'search' || this.props.preview) viewDisplay = React.createElement(MainView, null);else if (route.view === 'topic') viewDisplay = React.createElement(TopicView, null);else if (route.view === 'channels') viewDisplay = React.createElement(ChannelsView, null);else if (route.view === 'user-admin') viewDisplay = React.createElement(UserAdminViewWrapper, null);
      return React.createElement(
        "section",
        { id: "content", className: "ui segment" },
        viewDisplay
      );
    }
  }]);

  return ViewContainer;
}(React.Component);

var MainView = function MainView(props) {
  return React.createElement(
    "div",
    { id: "main-view", className: "view-container" },
    React.createElement(TopicsWrapper, null)
  );
};

var ChannelsView = function ChannelsView(props) {
  return React.createElement(
    "div",
    { className: "view-container", id: "channels-view" },
    React.createElement(ChannelsListWrapper, null)
  );
};
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopicsContainer = function (_React$Component) {
  _inherits(TopicsContainer, _React$Component);

  function TopicsContainer(props) {
    _classCallCheck(this, TopicsContainer);

    var _this = _possibleConstructorReturn(this, (TopicsContainer.__proto__ || Object.getPrototypeOf(TopicsContainer)).call(this, props));

    _this.state = {};
    return _this;
  }

  _createClass(TopicsContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.props.countTopics();
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.topics && this.props.topics.sort_by !== nextProps.topics.sort_by) {
        this.props.countTopics(nextProps.topics.sort_by);
      } else if (!this.props.topics.sort_options) {
        if (nextProps.topics.sort_options) {
          this.props.countTopics();
        }
      } else {
        var route = store.getState().route;
        if (route.view === 'user-admin') {
          if (this.props.user.user_name && this.props.user.user_name !== nextProps.user.user_name) {
            this.props.countTopics();
          }
        }
      }
      if (nextProps.search && nextProps.search !== this.props.search) {
        this.props.countTopics(this.props.topics.sort_by, nextProps.search);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var topicContainerDisplay = void 0;
      if (this.props.topics.loading !== false) {
        topicContainerDisplay = React.createElement(DummyTopicList, null);
      } else {
        topicContainerDisplay = React.createElement(
          "div",
          { id: "topics-wrapper" },
          React.createElement(TopicList, {
            onDeleteTopic: this.props.countTopics
          }),
          React.createElement(TopicListNavigation, null)
        );
      }

      return React.createElement(
        "div",
        { id: "topics-container" },
        topicContainerDisplay
      );
    }
  }]);

  return TopicsContainer;
}(React.Component);

var mapStateToTopicsContainerProps = function mapStateToTopicsContainerProps(state) {
  var topics = state.topics;
  var user = state.user;
  var search = state.search;
  return {
    topics: topics,
    user: user,
    search: search
  };
};

var mapDispatchToTopicsContainerProps = function mapDispatchToTopicsContainerProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var mergeTopicsContainerProps = function mergeTopicsContainerProps(stateProps, dispatchProps) {
  function countTopics(sortBy, searchPhrase) {
    store.dispatch(loadingTopicList(true));
    if (store.getState().topics.sort_options) {

      var route = store.getState().route;

      var channelId = void 0;
      if (route.view === 'channel') channelId = route.id;
      var userId = void 0;
      if (route.view === 'user-admin') userId = store.getState().site_info.cert_user_id;

      if (!searchPhrase) {
        if (route.view === 'search') {
          searchPhrase = route.id;
        }
      }

      var query = topicHelpers.countTopicsQuery(channelId, userId, searchPhrase);

      Page.cmd('dbQuery', [query], function (res) {
        var count = res[0]["count(*)"];
        store.dispatch(setTopicsCount(count));
        getTopics(sortBy, searchPhrase);
      });
    }
  };

  function getTopics(sortBy, searchPhrase) {

    var config = store.getState().config;
    var route = store.getState().route;
    var channelId = void 0,
        userId = void 0,
        showHidden = false;

    if (route.view === 'channel' || route.view === 'user-admin' && route.section === 'edit-channel') {
      channelId = route.id;
    }

    if (route.view === 'user-admin' && route.section === 'topics') {
      userId = store.getState().site_info.cert_user_id;
    }

    if (route.view === 'user-admin') showHidden = true;

    var sort_by = void 0;
    if (!sortBy) {
      sort_by = store.getState().topics.sort_options.find(function (so) {
        return so.current === true;
      });
    } else {
      sort_by = store.getState().topics.sort_options.find(function (so) {
        return so.label === sortBy;
      });
    }

    var query = topicHelpers.getTopicsQuery(config, sort_by, channelId, userId, route.page, showHidden, searchPhrase);
    Page.cmd('dbQuery', [query], function (res) {
      store.dispatch(setTopics(res));
      store.dispatch(loadingTopicList(false));
    }.bind(this));
  }

  return _extends({}, stateProps, dispatchProps, {
    countTopics: countTopics,
    getTopics: getTopics
  });
};

var TopicsWrapper = ReactRedux.connect(mapStateToTopicsContainerProps, mapDispatchToTopicsContainerProps, mergeTopicsContainerProps)(TopicsContainer);

var TopicList = function TopicList(props) {
  var topicsDisplay = void 0;
  if (store.getState().topics.items.length > 0) {
    topicsDisplay = store.getState().topics.items.map(function (t, index) {
      return React.createElement(TopicListItem, {
        key: index,
        topic: t,
        onDeleteTopic: props.onDeleteTopic
      });
    });
  } else {
    topicsDisplay = React.createElement(
      "div",
      { className: "ui segment lightgray" },
      "no topics yet, ",
      React.createElement(
        "a",
        { href: "index.html?v=user-admin+s=new-topic+id=" + store.getState().route.id },
        "create a new topic!"
      )
    );
  }
  return React.createElement(
    "div",
    { id: "topic-list-display", className: "ui list" },
    topicsDisplay
  );
};

var TopicListItem = function (_React$Component2) {
  _inherits(TopicListItem, _React$Component2);

  function TopicListItem(props) {
    _classCallCheck(this, TopicListItem);

    var _this2 = _possibleConstructorReturn(this, (TopicListItem.__proto__ || Object.getPrototypeOf(TopicListItem)).call(this, props));

    var topicId = store.getState().route.id;
    var followed = false;
    if (store.getState().feed[topicId + " topic"]) followed = true;
    _this2.state = {
      followed: followed
    };
    _this2.followTopic = _this2.followTopic.bind(_this2);
    _this2.unfollowTopic = _this2.unfollowTopic.bind(_this2);
    _this2.showTopicBody = _this2.showTopicBody.bind(_this2);
    _this2.hideTopicBody = _this2.hideTopicBody.bind(_this2);
    return _this2;
  }

  _createClass(TopicListItem, [{
    key: "followTopic",
    value: function followTopic() {
      var params = void 0;
      var topic = store.getState().topics.items[0];
      var query = followHelpers.generateFollowChannelQuery(topic);
      var feed = [query, params];
      var feedFollow = Object.assign({}, store.getState().feed, {});
      feedFollow[topic.topic_id + " topic"] = feed;
      Page.cmd("feedFollow", [feedFollow]);
      Page.cmd('feedListFollow', [], function (feed) {
        store.dispatch(setFeedListFollow(feed));
        this.setState({ followed: true });
      }.bind(this));
    }
  }, {
    key: "unfollowTopic",
    value: function unfollowTopic() {
      var feedFollow = Object.assign({}, store.getState().feed, {});
      var topicId = store.getState().route.id;
      delete feedFollow[topicId + " topic"];
      Page.cmd("feedFollow", [feedFollow]);
      Page.cmd('feedListFollow', [], function (feed) {
        store.dispatch(setFeedListFollow(feed));
        this.setState({ followed: false });
      }.bind(this));
    }
  }, {
    key: "showTopicBody",
    value: function showTopicBody() {
      this.setState({ show_body: true });
    }
  }, {
    key: "hideTopicBody",
    value: function hideTopicBody() {
      this.setState({ show_body: false });
    }
  }, {
    key: "render",
    value: function render() {
      var t = this.props.topic;
      if (t.added < 1481025974864) t.added = 1481025974864;
      var route = store.getState().route;
      var upDownVotesTotal = void 0;
      if (t.votes) {
        upDownVotesTotal = React.createElement(
          "span",
          null,
          "(",
          React.createElement(
            "span",
            { className: "up-votes" },
            "+",
            t.votes.up.length
          ),
          "|",
          React.createElement(
            "span",
            { className: "down-votes" },
            "-",
            t.votes.down.length
          ),
          ")"
        );
      }

      var topicBodyDisplay = void 0,
          topicBodyContentToggleBtn = void 0;
      if (route.view !== 'topic') {
        if (t.body || t.file_id || t.file_to_item_id || t.embed_url || t.added <= 1498441955800) {
          if (!this.state.show_body) {
            topicBodyContentToggleBtn = React.createElement(
              "span",
              null,
              React.createElement(
                "a",
                { onClick: this.showTopicBody },
                React.createElement("i", { className: "icon add square" })
              )
            );
          } else {
            topicBodyContentToggleBtn = React.createElement(
              "span",
              null,
              React.createElement(
                "a",
                { onClick: this.hideTopicBody },
                React.createElement("i", { className: "icon minus square" })
              )
            );
            var topicBody = void 0;
            if (t.body) {
              topicBody = React.createElement(
                "div",
                { className: "topic-view-body" },
                React.createElement(ItemHtmlBodyRender, { content: t.body })
              );
            }
            var topicBodyMediaDisplay = void 0;
            if (t.file_id || t.file_to_item_id || t.embed_url || t.added <= 1498441955800) {
              topicBodyMediaDisplay = React.createElement(
                "div",
                { className: "topic-view-media" },
                React.createElement(ItemMediaContainer, {
                  topic: t
                })
              );
            }
            topicBodyDisplay = React.createElement(
              "div",
              { className: "topic-list-item-body-container ui segment" },
              topicBodyMediaDisplay,
              topicBody
            );
          }
        }
      }

      var topicEditToolbar = void 0;
      if (t.user_id === store.getState().site_info.cert_user_id) {
        topicEditToolbar = React.createElement(ItemEditToolBar, {
          topic: t,
          onDeleteTopic: this.props.onDeleteTopic
        });
      }

      var topicFollowDisplay = void 0;
      if (route.view === 'topic') {
        var topicFollowBtn = void 0;
        if (!this.state.followed) {
          topicFollowBtn = React.createElement(
            "a",
            { onClick: this.followTopic },
            React.createElement("i", { className: "icon feed" }),
            React.createElement(
              "span",
              null,
              "follow"
            )
          );
        } else {
          topicFollowBtn = React.createElement(
            "a",
            { onClick: this.unfollowTopic },
            React.createElement("i", { className: "icon feed" }),
            React.createElement(
              "span",
              null,
              "unfollow"
            )
          );
        }
        topicFollowDisplay = React.createElement(
          "div",
          { id: "topic-follow-container", className: "ui compact segment" },
          topicFollowBtn
        );
      }

      var topicListItemImageDisplay = void 0,
          topicListItemBodyCssClass = "";
      if (t.file_id || t.file_to_item_id || t.embed_url || t.added <= 1498441955800) {
        topicListItemImageDisplay = React.createElement(TopicListItemImageContainer, {
          topic: t
        });
        topicListItemBodyCssClass += " w-file";
      }

      var topicUserName = t.user_id;
      if (t.screen_name) topicUserName = t.screen_name;

      return React.createElement(
        "div",
        { className: "item ui segment topic-item" },
        React.createElement(TopicVotesWrapper, {
          topic: t
        }),
        React.createElement(
          "div",
          { className: "topic-item-body " + topicListItemBodyCssClass },
          topicListItemImageDisplay,
          React.createElement(
            "div",
            { className: "topic-item-content" },
            React.createElement(
              "div",
              { className: "topic-item-header" },
              React.createElement(
                "h3",
                null,
                React.createElement(
                  "a",
                  { href: "index.html?v=topic+id=" + t.topic_id },
                  t.title
                )
              ),
              topicEditToolbar,
              topicFollowDisplay
            ),
            React.createElement(
              "div",
              { className: "topic-item-info" },
              topicBodyContentToggleBtn,
              React.createElement(
                "span",
                null,
                " submitted ",
                appHelpers.getTimeAgo(t.added),
                " "
              ),
              React.createElement(
                "span",
                null,
                " by ",
                React.createElement(
                  "a",
                  null,
                  topicUserName
                ),
                " "
              ),
              React.createElement(
                "span",
                null,
                " to ",
                React.createElement(
                  "b",
                  null,
                  React.createElement(
                    "a",
                    { href: "index.html?v=channel+id=" + t.channel_id },
                    t.name
                  )
                )
              ),
              upDownVotesTotal
            ),
            React.createElement(
              "div",
              { className: "topic-item-comment-counter" },
              React.createElement(
                "b",
                null,
                React.createElement(
                  "a",
                  { href: "index.html?v=topic+id=" + t.topic_id },
                  t.comments_total - t.hidden_comments_total,
                  " comments"
                )
              )
            )
          ),
          topicBodyDisplay
        )
      );
    }
  }]);

  return TopicListItem;
}(React.Component);

var DummyTopicList = function DummyTopicList(props) {
  return React.createElement(
    "div",
    { className: "ui list" },
    React.createElement(
      "div",
      { className: "ui active inverted dimmer" },
      React.createElement("div", { className: "ui active loader" })
    ),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null),
    React.createElement(DummyTopic, null)
  );
};

var DummyTopic = function DummyTopic(props) {
  return React.createElement(
    "div",
    { className: "dummy-topic-item topic-item segment ui item" },
    React.createElement(
      "div",
      { className: "dummy-topic-votes" },
      React.createElement(
        "div",
        { className: "dummy-topic-votebar" },
        React.createElement(
          "div",
          { className: "votes-display" },
          React.createElement("a", { className: "arrow up" }),
          React.createElement(
            "span",
            { className: "blured" },
            "#"
          ),
          React.createElement("a", { className: "arrow down" })
        )
      )
    ),
    React.createElement(
      "div",
      { className: "dummy-topic-body" },
      React.createElement("div", { className: "dummy-topic-image" }),
      React.createElement(
        "div",
        { className: "dummy-topic-content" },
        React.createElement(
          "div",
          { className: "dummy-topic-header blured" },
          React.createElement(
            "h3",
            null,
            React.createElement(
              "a",
              null,
              "Topic Item Title"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "dummy-topic-line blured" },
          "submitted some time ago by ",
          React.createElement(
            "a",
            null,
            "user@zv.anonymous"
          ),
          " to ",
          React.createElement(
            "a",
            null,
            "some zerovoat channel"
          )
        ),
        React.createElement(
          "div",
          { className: "dummy-topic-line blured" },
          React.createElement("i", { className: "icon comments" }),
          " # comments"
        )
      )
    )
  );
};

var TopicVotesContainer = function (_React$Component3) {
  _inherits(TopicVotesContainer, _React$Component3);

  function TopicVotesContainer(props) {
    _classCallCheck(this, TopicVotesContainer);

    var _this3 = _possibleConstructorReturn(this, (TopicVotesContainer.__proto__ || Object.getPrototypeOf(TopicVotesContainer)).call(this, props));

    _this3.state = {};
    return _this3;
  }

  _createClass(TopicVotesContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.props.getTopicVotes();
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.site_info.cert_user_id !== this.props.site_info.cert_user_id) {
        this.props.getTopicVotes();
      }
    }
  }, {
    key: "render",
    value: function render() {

      var topicVotesDisplay = void 0,
          topicVotesCounter = void 0,
          topicVotesBar = void 0,
          topicVotesDisplayCssClass = "votes-display ui active inverted dimmer";
      if (this.props.topic.loading_votes === true) {
        topicVotesDisplay = React.createElement(
          "div",
          { className: topicVotesDisplayCssClass },
          React.createElement("div", { className: "ui mini loader" })
        );
      } else {
        var topicVotesPercentage = voteHelpers.generateTopicVotesBar(this.props.topic);
        topicVotesBar = React.createElement(
          "div",
          { className: "topic-votes-bar" },
          React.createElement("div", { className: "topic-votes-up", style: { height: topicVotesPercentage.uvp + "%" } }),
          React.createElement("div", { className: "topic-votes-down", style: { height: topicVotesPercentage.dvp + "%" } })
        );

        if (this.props.topic.votes) {
          topicVotesCounter = this.props.topic.votes.up.length - this.props.topic.votes.down.length;
          if (this.props.topic.votes.user_vote) {
            if (this.props.topic.votes.user_vote.vote === 0) topicVotesDisplayCssClass += " down-voted";else if (this.props.topic.votes.user_vote.vote === 1) topicVotesDisplayCssClass += " up-voted";
          }
        } else {
          topicVotesCounter = this.props.topic.up_votes - this.props.topic.down_votes;
        }
        topicVotesDisplay = React.createElement(
          "div",
          { className: topicVotesDisplayCssClass },
          React.createElement("a", { className: "arrow up", onClick: this.props.onUpVoteClick }),
          React.createElement(
            "span",
            null,
            topicVotesCounter
          ),
          React.createElement("a", { className: "arrow down", onClick: this.props.onDownVoteClick })
        );
      }

      return React.createElement(
        "div",
        { className: "topic-item-votes" },
        topicVotesDisplay,
        topicVotesBar
      );
    }
  }]);

  return TopicVotesContainer;
}(React.Component);

var mapStateToTopicVotesContainerProps = function mapStateToTopicVotesContainerProps(state, props) {
  var site_info = state.site_info;
  var topic = state.topics.items.find(function (t) {
    return t.topic_id === props.topic.topic_id;
  });
  return {
    site_info: site_info,
    topic: topic
  };
};

var mapDispatchToTopicVotesContainerProps = function mapDispatchToTopicVotesContainerProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var mergeTopicVotesContainerProps = function mergeTopicVotesContainerProps(stateProps, dispatch) {

  function getTopicVotes() {
    var query = voteHelpers.getTopicVotesQuery(stateProps.topic.topic_id);
    Page.cmd('dbQuery', [query], function (res) {
      var state = store.getState();
      var user = state.site_info.cert_user_id;
      var votes = voteHelpers.renderItemVotes(res, user);
      var route = state.route;
      store.dispatch(assignTopicVotes(votes, stateProps.topic.topic_id));
    });
  }

  function onUpVoteClick() {
    if (stateProps.site_info.cert_user_id) {
      var voteType = voteHelpers.configVoteActionType(stateProps.topic.votes.user_vote, 'UP');
      onVoteTopic(voteType);
    } else {
      Page.cmd("wrapperNotification", ["info", "Login to participate", 4000]);
    }
  }

  function onDownVoteClick() {
    if (stateProps.site_info.cert_user_id) {
      var voteType = voteHelpers.configVoteActionType(stateProps.topic.votes.user_vote, 'DOWN');
      onVoteTopic(voteType);
    } else {
      Page.cmd("wrapperNotification", ["info", "Login to participate", 4000]);
    }
  }

  function onVoteTopic(voteType) {
    store.dispatch(loadingTopicVotes(stateProps.topic.topic_id, true));
    var config = store.getState().config;
    if (voteType === 'CHANGE' || voteType === 'DELETE') {
      var query = "SELECT * FROM json WHERE json_id='" + stateProps.topic.votes.user_vote.json_id + "'";
      Page.cmd('dbQuery', [query], function (res) {
        var inner_path = "merged-" + config.merger_name + "/" + res[0].directory + "/" + res[0].file_name;
        voteTopic(voteType, inner_path);
      }.bind(this));
    } else {
      var auth_address = stateProps.site_info.auth_address;
      var inner_path = "merged-" + config.merger_name + "/" + config.cluster + "/data/users/" + auth_address + "/data.json";
      voteTopic(voteType, inner_path);
    }
  }

  function voteTopic(voteType, inner_path) {
    Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
      data = JSON.parse(data);
      if (data) {
        if (!data.topic_vote) {
          data.topic_vote = [];
          data.next_topic_vote_id = 1;
        }
      } else {
        data = {
          "topic_vote": [],
          "next_topic_vote_id": 1
        };
      }
      data = voteHelpers.renderDataJsonOnTopicVote(data, stateProps.site_info, voteType, stateProps.topic.topic_id, stateProps.topic.votes.user_vote, 'topic');
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
        Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
          Page.cmd("wrapperNotification", ["done", "Topic Voted!", 4000]);
          store.dispatch(loadingTopicVotes(stateProps.topic.topic_id, false));
          getTopicVotes();
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }

  return _extends({}, stateProps, dispatch, {
    getTopicVotes: getTopicVotes,
    onUpVoteClick: onUpVoteClick,
    onDownVoteClick: onDownVoteClick,
    onVoteTopic: onVoteTopic,
    voteTopic: voteTopic
  });
};

var TopicVotesWrapper = ReactRedux.connect(mapStateToTopicVotesContainerProps, mapDispatchToTopicVotesContainerProps, mergeTopicVotesContainerProps)(TopicVotesContainer);

var TopicListItemImageContainer = function (_React$Component4) {
  _inherits(TopicListItemImageContainer, _React$Component4);

  function TopicListItemImageContainer(props) {
    _classCallCheck(this, TopicListItemImageContainer);

    var _this4 = _possibleConstructorReturn(this, (TopicListItemImageContainer.__proto__ || Object.getPrototypeOf(TopicListItemImageContainer)).call(this, props));

    _this4.state = {
      file: false,
      loading: true
    };
    _this4.onGetFile = _this4.onGetFile.bind(_this4);
    _this4.getFile = _this4.getFile.bind(_this4);
    _this4.onImageLoading = _this4.onImageLoading.bind(_this4);
    _this4.onImageLoadError = _this4.onImageLoadError.bind(_this4);
    return _this4;
  }

  _createClass(TopicListItemImageContainer, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (this.props.topic.file_to_item_id) {
        this.onGetFile();
      } else {
        this.getFile();
      }
    }
  }, {
    key: "onGetFile",
    value: function onGetFile() {
      this.setState({ file: true }, function () {
        var query = fileHelpers.getFileToItemQuery(this.props.topic.file_to_item_id);
        Page.cmd('dbQuery', [query], function (res) {
          this.getFile(res[0].file_id);
        }.bind(this));
      });
    }
  }, {
    key: "getFile",
    value: function getFile(fileId) {
      var query = void 0;
      if (!fileId) {
        query = "SELECT * FROM file WHERE item_id='" + this.props.topic.topic_id + "'";
      } else {
        query = fileHelpers.getFileQuery(fileId);
      }
      Page.cmd('dbQuery', [query], function (res) {
        if (res && res.length > 0) {
          var file = res[0];
          var mediaType = fileHelpers.determineFileMediaType(file.file_type);
          var loading = true;
          if (mediaType === 'image') loading = false;
          var directory = file.directory;
          if (!file.directory) directory = store.getState().config.cluster + "/data/users/" + file.user_id;
          this.setState({
            file_path: "merged-" + store.getState().config.merger_name + "/" + directory + "/" + file.file_name,
            file: true,
            media_type: mediaType,
            loading: loading
          });
        }
      }.bind(this));
    }
  }, {
    key: "onImageLoading",
    value: function onImageLoading() {
      this.setState({ loading: false });
    }
  }, {
    key: "onImageLoadError",
    value: function onImageLoadError() {
      this.setState({ error: true, loading: false });
    }
  }, {
    key: "render",
    value: function render() {

      var imageDisplay = void 0,
          imageContainerCssClass = "topic-item-image-container ui segment";

      if (this.state.file) {
        if (this.state.media_type === 'image') {
          imageContainerCssClass += " image-file";
          imageDisplay = React.createElement("img", {
            onLoad: this.onImageLoading,
            onError: this.onImageLoadError,
            src: this.state.file_path
          });
        } else if (this.state.media_type === 'video') {
          imageContainerCssClass += " video-file";
          imageDisplay = React.createElement("i", { className: "file video outline icon big" });
        } else if (this.state.media_type === 'audio') {
          imageContainerCssClass += " audio-file";
          imageDisplay = React.createElement("i", { className: "file audio outline icon big" });
        }
        if (this.state.error === true) {
          imageDisplay = React.createElement("img", { src: "assets/img/404-not-found.png" });
        }
      } else {
        if (this.props.topic.embed_url) {
          imageContainerCssClass += " embeded-file";
          var embedUrl = this.props.topic.embed_url;
          var lastDot = embedUrl.lastIndexOf('.');
          var fileType = embedUrl.substring(lastDot + 1);
          var mediaType = fileHelpers.determineFileMediaType(fileType);
          if (mediaType === 'video') {
            imageContainerCssClass += " video-file";
            imageDisplay = React.createElement("i", { className: "file video outline icon big" });
          } else if (mediaType === 'audio') {
            imageDisplay = React.createElement("i", { className: "file audio outline icon big" });
          } else if (mediaType === 'image') {
            imageDisplay =
            /*<img
              onLoad={this.onImageLoading}
              onError={this.onImageLoadError}
              src={embedUrl}
            />*/
            React.createElement(
              "span",
              { style: { "fontSize": "10px" } },
              "external"
            );
          } else if (!mediaType) {
            imageDisplay = React.createElement("img", { src: "assets/img/404-not-found.png" });
          }
        } else {
          imageContainerCssClass += " no-file";
        }
      }

      if (this.state.loading && this.state.file) {
        imageContainerCssClass += " image-loading";
      }

      return React.createElement(
        "div",
        { className: imageContainerCssClass },
        React.createElement(
          "a",
          { href: "index.html?v=topic+id=" + this.props.topic.topic_id },
          imageDisplay
        )
      );
    }
  }]);

  return TopicListItemImageContainer;
}(React.Component);

var TopicListNavigation = function TopicListNavigation(props) {

  var route = store.getState().route;
  var sortBy = store.getState().topics.sort_by;
  var urlPrefix = appHelpers.generateUrlPrefix(route, sortBy);

  var prevButtonHref = void 0,
      nextButtonHref = void 0;
  if (route.page && route.page !== 1) prevButtonHref = React.createElement(
    "li",
    { className: "native-btn" },
    React.createElement(
      "a",
      { href: urlPrefix + (route.page - 1) },
      "<",
      " Newer"
    )
  );

  var pageNum = void 0;
  if (route.page) pageNum = route.page;else pageNum = 1;

  if (store.getState().topics.count > store.getState().config.listing.items_per_page * pageNum) {
    var nextPageNumber = void 0;
    if (route.page) nextPageNumber = route.page + 1;else nextPageNumber = 2;
    nextButtonHref = React.createElement(
      "li",
      { className: "native-btn" },
      React.createElement(
        "a",
        { href: urlPrefix + nextPageNumber },
        "Older ",
        ">"
      )
    );
  }

  var topicListNavigationDisplay = React.createElement(
    "ul",
    null,
    prevButtonHref,
    nextButtonHref
  );

  return React.createElement(
    "div",
    { id: "topic-list-navigation" },
    topicListNavigationDisplay
  );
};

var TopicView = function (_React$Component5) {
  _inherits(TopicView, _React$Component5);

  function TopicView(props) {
    _classCallCheck(this, TopicView);

    var _this5 = _possibleConstructorReturn(this, (TopicView.__proto__ || Object.getPrototypeOf(TopicView)).call(this, props));

    _this5.state = {
      loading: true
    };
    _this5.getTopic = _this5.getTopic.bind(_this5);
    return _this5;
  }

  _createClass(TopicView, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.getTopic();
    }
  }, {
    key: "getTopic",
    value: function getTopic() {
      var route = store.getState().route;
      var query = topicHelpers.getTopicQuery(route.id);
      Page.cmd('dbQuery', [query], function (res) {
        store.dispatch(setTopics(res));
        this.setState({ loading: false });
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {

      if (this.state.loading) {
        return React.createElement(DummyTopicView, null);
      } else {

        var route = store.getState().route;
        var topic = store.getState().topics.items.find(function (t) {
          return t.topic_id === route.id;
        });
        if (!topic) {
          return React.createElement(
            "div",
            { className: "view-container", id: "topic-view" },
            React.createElement(
              "div",
              { className: "ui segment lightgray" },
              React.createElement(
                "p",
                null,
                "topic not found..."
              )
            )
          );
        } else {
          var topicBodyContent = void 0;
          if (topic.body) {
            topicBodyContent = React.createElement(
              "div",
              { className: "topic-view-body" },
              React.createElement(ItemHtmlBodyRender, { content: topic.body })
            );
          }
          var topicMediaContainer = void 0;
          if (topic.file_to_item_id || topic.file_id || topic.embed_url || topic.added <= 1498441955800) {
            topicMediaContainer = React.createElement(
              "div",
              { className: "topic-view-media" },
              React.createElement(ItemMediaContainer, {
                topic: topic
              })
            );
          }

          var topicContentDisplay = void 0;
          if (topic.body || topic.file_id || topic.file_name || topic.embed_url) {
            topicContentDisplay = React.createElement(
              "div",
              { className: "ui segment lightgray topic-content-display" },
              topicMediaContainer,
              topicBodyContent
            );
          }

          return React.createElement(
            "div",
            { className: "view-container", id: "topic-view" },
            React.createElement(
              "div",
              { className: "topic-view-header" },
              React.createElement(TopicListItem, {
                topic: topic
              })
            ),
            topicContentDisplay,
            React.createElement(CommentsWrapper, { topic: topic })
          );
        }
      }
    }
  }]);

  return TopicView;
}(React.Component);

var DummyTopicView = function DummyTopicView(props) {
  return React.createElement(
    "div",
    { className: "view-container", id: "topic-view" },
    React.createElement(
      "div",
      { className: "ui active inverted dimmer" },
      React.createElement(
        "div",
        { className: "ui text loader" },
        "Loading Topic"
      )
    ),
    React.createElement(
      "div",
      { className: "topic-view-header" },
      React.createElement(DummyTopic, null)
    ),
    React.createElement(
      "div",
      { className: "topic-view-body ui segment" },
      React.createElement(
        "article",
        { className: "ui segment blured" },
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
      )
    )
  );
};

var TopicForm = function (_React$Component6) {
  _inherits(TopicForm, _React$Component6);

  function TopicForm(props) {
    _classCallCheck(this, TopicForm);

    var _this6 = _possibleConstructorReturn(this, (TopicForm.__proto__ || Object.getPrototypeOf(TopicForm)).call(this, props));

    var title = '',
        body = '',
        embed_url = '',
        channel_id = '';

    if (_this6.props.topic) {
      title = _this6.props.topic.title;
      body = _this6.props.topic.body;
      embed_url = _this6.props.topic.embed_url;
      channel_id = _this6.props.topic.channel_id;
    } else {
      channel_id = store.getState().route.id;
    }

    _this6.state = {
      title: title,
      body: body,
      embed_url: embed_url,
      channel_id: channel_id,
      errors: [],
      showEditor: true
    };

    _this6.onTopicTitleChange = _this6.onTopicTitleChange.bind(_this6);
    _this6.onTopicTitleBlur = _this6.onTopicTitleBlur.bind(_this6);
    _this6.onTopicChannelSelect = _this6.onTopicChannelSelect.bind(_this6);
    _this6.onTopicDescriptionChange = _this6.onTopicDescriptionChange.bind(_this6);
    _this6.toggleEditor = _this6.toggleEditor.bind(_this6);
    _this6.onTopicEmbedUrlChange = _this6.onTopicEmbedUrlChange.bind(_this6);
    _this6.onTopicEmbedUrlBlur = _this6.onTopicEmbedUrlBlur.bind(_this6);
    _this6.onTopicFileChange = _this6.onTopicFileChange.bind(_this6);
    _this6.readFile = _this6.readFile.bind(_this6);
    _this6.validateForm = _this6.validateForm.bind(_this6);
    _this6.onFormSubmit = _this6.onFormSubmit.bind(_this6);
    _this6.onCreateTopic = _this6.onCreateTopic.bind(_this6);
    _this6.onUploadFile = _this6.onUploadFile.bind(_this6);
    _this6.uploadFile = _this6.uploadFile.bind(_this6);
    _this6.createTopic = _this6.createTopic.bind(_this6);
    _this6.onUpdateTopic = _this6.onUpdateTopic.bind(_this6);
    _this6.updateTopic = _this6.updateTopic.bind(_this6);
    _this6.onRemoveTopicFile = _this6.onRemoveTopicFile.bind(_this6);
    _this6.removeTopicFile = _this6.removeTopicFile.bind(_this6);
    _this6.deleteTopicFile = _this6.deleteTopicFile.bind(_this6);
    return _this6;
  }

  _createClass(TopicForm, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var options = formHelpers.getEasyEditorOptions();
      new EasyEditor('#body', options);
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.channel && !this.props.channel) {
        this.forceUpdate();
      }
    }
  }, {
    key: "onTopicTitleChange",
    value: function onTopicTitleChange(e) {
      this.setState({ title: e.target.value }, function () {
        this.validateForm();
      });
    }
  }, {
    key: "onTopicTitleBlur",
    value: function onTopicTitleBlur() {
      this.validateForm();
    }
  }, {
    key: "onTopicChannelSelect",
    value: function onTopicChannelSelect(e) {
      this.setState({ channel_id: e.target.value }, function () {
        this.validateForm();
      });
    }
  }, {
    key: "onTopicDescriptionChange",
    value: function onTopicDescriptionChange(e) {
      this.setState({ body: e.target.value }, function () {
        this.validateForm();
      });
    }
  }, {
    key: "toggleEditor",
    value: function toggleEditor() {
      this.setState({ showEditor: false });
    }
  }, {
    key: "onTopicEmbedUrlChange",
    value: function onTopicEmbedUrlChange(e) {
      this.setState({ embed_url: e.target.value }, function () {
        this.validateForm();
      });
    }
  }, {
    key: "onTopicEmbedUrlBlur",
    value: function onTopicEmbedUrlBlur() {
      this.validateForm();
    }
  }, {
    key: "onTopicFileChange",
    value: function onTopicFileChange(e) {
      var file = {
        f: e.target.files[0],
        file_name: fileHelpers.generateValidFileName(e.target.files[0].name),
        file_type: e.target.files[0].type.split('/')[1],
        file_size: e.target.files[0].size,
        media_type: e.target.files[0].type.split('/')[0],
        item_type: 'topic'
      };
      this.readFile(file, e.target.files[0]);
    }
  }, {
    key: "readFile",
    value: function readFile(file, filesObject) {
      var reader = new FileReader();
      var th = this;
      reader.onload = function () {
        file.f.data = reader.result;
        th.setState({ file: file });
      };
      reader.readAsDataURL(filesObject);
    }
  }, {
    key: "validateForm",
    value: function validateForm() {
      var config = store.getState().config;
      var errors = formHelpers.validateTopicForm(this.state, config);
      this.setState({ errors: errors });
    }
  }, {
    key: "onFormSubmit",
    value: function onFormSubmit(event) {
      event.preventDefault();
      var route = store.getState().route;
      if (route.section === 'new-topic') {
        this.onCreateTopic();
      } else if (route.section === 'edit-topic') {
        this.onUpdateTopic();
      }
    }
  }, {
    key: "onCreateTopic",
    value: function onCreateTopic() {
      var body = $('#body')[0].defaultValue;
      this.setState({ body: body }, function () {
        var config = store.getState().config;
        var errors = formHelpers.validateTopicForm(this.state, config);
        this.setState({ errors: errors }, function () {
          if (this.state.errors.length === 0) {
            this.setState({ loading: true }, function () {
              if (this.state.file) this.onUploadFile();else this.createTopic();
            });
          }
        });
      });
    }
  }, {
    key: "onUploadFile",
    value: function onUploadFile() {
      var state = store.getState();
      var inner_path = "merged-" + state.config.merger_name + "/" + state.config.cluster + "/data/users/" + state.site_info.auth_address + "/" + this.state.file.file_name;
      this.uploadFile(inner_path);
    }
  }, {
    key: "uploadFile",
    value: function uploadFile(inner_path) {
      var file = this.state.file;
      Page.cmd("bigfileUploadInit", [inner_path, file.file_size], function (init_res) {
        var formdata = new FormData();
        var req = new XMLHttpRequest();
        formdata.append(file.file_name, file.f);
        // upload event listener
        req.upload.addEventListener("progress", function (res) {
          // update item progress
          this.setState({ fileProgress: parseInt(res.loaded / res.total * 100) });
        }.bind(this));
        // loaded event listener
        req.upload.addEventListener("loadend", function () {
          var section = store.getState().route.section;
          if (section === 'new-topic') {
            this.createTopic();
          } else if (section === 'edit-topic') {
            this.updateTopic();
          }
        }.bind(this));
        req.withCredentials = true;
        req.open("POST", init_res.url);
        req.send(formdata);
      }.bind(this));
    }
  }, {
    key: "createTopic",
    value: function createTopic() {
      var inner_path = "merged-" + store.getState().config.merger_name + "/" + store.getState().config.cluster + "/data/users/" + store.getState().site_info.auth_address + "/data.json";
      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {

        data = JSON.parse(data);
        if (data) {
          if (!data.topic) {
            data.topic = [];
            data.next_topic_id = 1;
          }
        } else {
          data = { "topic": [], "next_topic_id": 1 };
        }

        var topic = {
          topic_id: store.getState().site_info.auth_address + "topic" + data.next_topic_id,
          channel_id: this.state.channel_id,
          user_id: store.getState().site_info.cert_user_id,
          title: this.state.title,
          body: this.state.body,
          embed_url: this.state.embed_url,
          type: 'topic',
          added: Date.now()
        };

        topic.body_p = topic.body.replace(/<\/?[^>]+(>|$)/g, "");
        data.topic.push(topic);
        data.next_topic_id += 1;
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            Page.cmd("wrapperNotification", ["done", "Topic Created!", 5000]);
            if (this.state.file) {
              this.createFile(inner_path, topic);
            } else {
              window.top.location.href = "index.html?v=topic+id=" + topic.topic_id;
            }
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "createFile",
    value: function createFile(inner_path, topic) {
      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {

        data = JSON.parse(data);
        if (data) {
          if (!data.file) {
            data.file = [];
            data.next_file_id = 1;
          }
          if (!data.file_to_item) {
            data.file_to_item = [];
            data.next_file_to_item_id = 1;
          }
        } else {
          data = {
            "file": [],
            "next_file_id": 1,
            "file_to_item": [],
            "next_file_to_item_id": 1
          };
        }

        var file = {
          file_id: store.getState().site_info.auth_address + "fl" + data.next_file_id,
          file_type: this.state.file.file_type,
          file_name: this.state.file.file_name,
          item_id: topic.topic_id,
          item_type: 'topic',
          user_id: store.getState().site_info.auth_address,
          added: Date.now()
        };

        data.file.push(file);
        data.next_file_id += 1;

        var file_to_item = {
          file_to_item_id: store.getState().site_info.auth_address + "fti" + data.next_file_to_item_id,
          item_type: 'topic',
          item_id: topic.topic_id,
          file_id: file.file_id,
          cluster_id: store.getState().config.cluster,
          user_id: file.user_id,
          added: Date.now()
        };

        data.file_to_item.push(file_to_item);
        data.next_file_to_item_id += 1;

        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            Page.cmd("wrapperNotification", ["done", "File Created!", 5000]);
            window.top.location.href = "index.html?v=topic+id=" + topic.topic_id;
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "onUpdateTopic",
    value: function onUpdateTopic(event) {
      event.preventDefault();
      var body = $('#body')[0].defaultValue;
      this.setState({ body: body }, function () {
        this.setState({ loading: true }, function () {
          if (this.state.file) {
            this.onUploadFile();
          } else {
            this.updateTopic();
          }
        });
      });
    }
  }, {
    key: "updateTopic",
    value: function updateTopic() {
      var query = "SELECT * FROM json WHERE json.json_id='" + this.props.topic.json_id + "'";
      Page.cmd('dbQuery', [query], function (res) {
        var inner_path = "merged-" + store.getState().config.merger_name + "/" + res[0].directory + "/" + res[0].file_name;
        Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
          var _this7 = this;

          data = JSON.parse(data);
          var topicIndex = data.topic.findIndex(function (t) {
            return t.topic_id === _this7.props.topic.topic_id;
          });
          var topic = data.topic[topicIndex];
          topic.title = this.state.title;
          topic.body = this.state.body;
          topic.body_p = topic.body.replace(/<\/?[^>]+(>|$)/g, "");
          topic.embed_url = this.state.embed_url;
          data.topic.splice(topicIndex, 1);
          data.topic.push(topic);
          var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
          Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
            Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
              Page.cmd("wrapperNotification", ["done", "Topic Updated!", 5000]);
              if (this.state.file) {
                this.createFile(inner_path, topic);
              } else {
                window.top.location.href = "index.html?v=topic+id=" + topic.topic_id;
              }
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "onRemoveTopicFile",
    value: function onRemoveTopicFile() {
      var query = "SELECT * FROM json WHERE json_id='" + this.props.topic.json_id + "'";
      Page.cmd('dbQuery', [query], function (res) {
        var inner_path = "merged-" + store.getState().config.merger_name + "/" + res[0].directory;
        var file_name = this.props.topic.file_name;
        this.removeTopicFile(inner_path, file_name);
      }.bind(this));
    }
  }, {
    key: "removeTopicFile",
    value: function removeTopicFile(inner_path, file_name) {
      Page.cmd('fileGet', { inner_path: inner_path + "/data.json" }, function (data) {
        var _this8 = this;

        data = JSON.parse(data);
        var fIndex = data.file.findIndex(function (f) {
          return f.file_id === _this8.props.topic.file_id;
        });
        var ftiIndex = data.file_to_item.findIndex(function (fti) {
          return fti.file_to_item_id === _this8.props.topic.file_to_item_id;
        });
        data.file.splice(fIndex, 1);
        data.file_to_item.splice(ftiIndex, 1);
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path + "/data.json", btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path + "/data.json" }, function (res) {
            this.deleteTopicFile(inner_path, file_name);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "deleteTopicFile",
    value: function deleteTopicFile(inner_path, file_name) {
      Page.cmd('fileDelete', { inner_path: inner_path + "/" + file_name }, function (res) {
        this.props.getTopic();
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {

      var titleError = void 0,
          channelIdError = void 0,
          textError = void 0,
          embedUrlError = void 0,
          fileError = void 0;
      var titleFieldCss = "",
          channelFieldCss = "",
          textFieldCss = "",
          embedUrlCss = "",
          fileFieldCss = "";
      if (this.state.errors) {
        if (this.state.errors.find(function (e) {
          return e.field === 'title';
        })) {
          var titleErrorObject = this.state.errors.find(function (e) {
            return e.field === 'title';
          });
          titleError = React.createElement(
            "span",
            { className: "error-notice" },
            titleErrorObject.msg
          );
          titleFieldCss = 'error';
        }
        if (this.state.errors.find(function (e) {
          return e.field === 'channel_id';
        })) {
          var channelIdErrorObject = this.state.errors.find(function (e) {
            return e.field === 'channel_id';
          });
          channelIdError = React.createElement(
            "span",
            { className: "error-notice" },
            channelIdErrorObject.msg
          );
          channelFieldCss = 'error';
        }
        if (this.state.errors.find(function (e) {
          return e.field === 'embed_url';
        })) {
          var _channelIdErrorObject = this.state.errors.find(function (e) {
            return e.field === 'embed_url';
          });
          embedUrlError = React.createElement(
            "span",
            { className: "error-notice" },
            _channelIdErrorObject.msg
          );
          embedUrlCss = 'error';
        }
      }

      var fileDisplay = void 0;
      if (this.state.file) {
        if (this.state.file.media_type === 'image') {
          fileDisplay = React.createElement(
            "div",
            { className: "ui segment item-file-display" },
            React.createElement("img", { src: this.state.file.f.data })
          );
        } else if (this.state.file.media_type === 'video' || this.state.file.media_type === 'audio') {
          fileDisplay = React.createElement(
            "div",
            { className: "ui segment item-file-display" },
            React.createElement(VideoPlayer, {
              filePath: this.state.file.f.data,
              fileType: this.state.file.file_type,
              mediaType: this.state.file.media_type
            })
          );
        }
      }

      var currentFileDisplay = void 0,
          fileInput = void 0;
      if (this.props.topic) {
        if (this.props.topic.file_id) {
          currentFileDisplay = React.createElement(
            "div",
            { className: "form-row ui segment" },
            React.createElement(
              "div",
              { className: "topic-file-menu" },
              React.createElement(
                "button",
                { className: "native-btn", type: "button", onClick: this.onRemoveTopicFile },
                React.createElement(
                  "a",
                  null,
                  React.createElement("i", { className: "icon trash" })
                )
              )
            ),
            React.createElement(ItemMediaContainer, {
              topic: this.props.topic
            })
          );
        } else {
          fileInput = React.createElement("input", { type: "file", onChange: this.onTopicFileChange });
        }
      } else {
        fileInput = React.createElement("input", { type: "file", onChange: this.onTopicFileChange });
      }

      var textAreaDisplay = void 0;
      if (this.state.showEditor) {
        textAreaDisplay = React.createElement(
          "div",
          { className: "editor-wrapper" },
          React.createElement("textarea", {
            name: "body",
            id: "body",
            onChange: this.onTopicDescriptionChange,
            defaultValue: this.state.body }),
          React.createElement(
            "button",
            { onClick: this.toggleEditor, type: "button", className: "native-btn" },
            React.createElement(
              "a",
              null,
              "Can't see the Text Editor? click here"
            )
          )
        );
      } else {
        textAreaDisplay = React.createElement("textarea", {
          onChange: this.onTopicDescriptionChange,
          defaultValue: this.state.body });
      }

      var channelName = void 0;
      if (store.getState().channels.channel) channelName = store.getState().channels.channel.name;

      var submitFormBtn = void 0,
          topicChannelInfoDisplay = void 0;
      var route = store.getState().route;
      if (route.section === 'new-topic') {
        submitFormBtn = React.createElement(
          "button",
          { type: "button", onClick: this.onCreateTopic, className: "native-btn submit-btn" },
          React.createElement(
            "a",
            null,
            "create topic"
          )
        );
        topicChannelInfoDisplay = React.createElement(
          "div",
          { className: "form-row field " + channelFieldCss },
          React.createElement(
            "label",
            null,
            "Create new Topic in Channel: ",
            channelName
          )
        );
      } else if (route.section === 'edit-topic') {
        submitFormBtn = React.createElement(
          "button",
          { type: "button", onClick: this.onUpdateTopic, className: "native-btn submit-btn" },
          React.createElement(
            "a",
            null,
            "update topic"
          )
        );
        topicChannelInfoDisplay = React.createElement(
          "div",
          { className: "form-row field " + channelFieldCss },
          React.createElement(
            "label",
            null,
            "Edit your Topic in Channel: ",
            channelName
          )
        );
      }

      var formBottomErrorDisplay = void 0;
      if (this.state.errors.length > 0) {
        var errors = this.state.errors.map(function (e, index) {
          return React.createElement(
            "li",
            { key: index },
            e.field,
            " - ",
            e.msg
          );
        });
        formBottomErrorDisplay = React.createElement(
          "ul",
          { id: "topic-form-errors-display" },
          errors
        );
      }

      var fileUploadProgressDisplay = void 0;
      if (this.state.fileProgress) {
        var progressBarCssClass = "ui active progress",
            progressBarText = "upload file";
        if (this.state.fileProgress === 100) {
          progressBarCssClass += " success";
          progressBarText = "file uploaded!";
        }
        fileUploadProgressDisplay = React.createElement(
          "div",
          { className: progressBarCssClass },
          React.createElement(
            "div",
            { className: "bar", style: { "width": this.state.fileProgress + "%" } },
            React.createElement("div", { className: "progress" })
          ),
          React.createElement(
            "div",
            { className: "label" },
            progressBarText
          )
        );
      }

      var loadingDisplay = void 0;
      if (this.state.loading) {
        var loadingText = 'creating topic';
        if (route.section === 'edit-topic') loadingText = 'updating topic';
        loadingDisplay = React.createElement(
          "div",
          { className: "ui active inverted dimmer" },
          React.createElement(
            "div",
            { className: "ui text loader" },
            loadingText,
            "..."
          )
        );
      }

      return React.createElement(
        "div",
        { id: "topic-form-container", className: "form-container" },
        React.createElement(
          "form",
          { id: "topic-form", className: "ui segment form" },
          loadingDisplay,
          topicChannelInfoDisplay,
          React.createElement(
            "div",
            { className: "form-row field " + titleFieldCss },
            React.createElement(
              "label",
              null,
              "Title"
            ),
            React.createElement("input", {
              type: "text",
              onBlur: this.onTopicTitleBlur,
              onChange: this.onTopicTitleChange,
              defaultValue: this.state.title }),
            titleError
          ),
          React.createElement(
            "div",
            { className: "form-row field " + textFieldCss },
            React.createElement(
              "label",
              null,
              "Text"
            ),
            textAreaDisplay
          ),
          React.createElement("hr", null),
          React.createElement(
            "div",
            { className: "form-row field " + embedUrlCss },
            React.createElement(
              "label",
              null,
              "Embed URL from ",
              React.createElement(
                "a",
                { href: "/12MVkvYGcRW6u2NYbpfwVad1oQeyG4s9Er" },
                "IFS"
              )
            ),
            React.createElement("input", {
              type: "text",
              onBlur: this.onTopicEmbedUrlBlur,
              onChange: this.onTopicEmbedUrlChange,
              defaultValue: this.state.embed_url }),
            embedUrlError
          ),
          React.createElement(
            "div",
            { className: "form-row field " + fileFieldCss },
            React.createElement(
              "label",
              null,
              "File"
            ),
            fileInput,
            fileDisplay,
            currentFileDisplay
          ),
          fileUploadProgressDisplay,
          React.createElement(
            "div",
            { className: "form-row field" },
            formBottomErrorDisplay,
            submitFormBtn
          )
        )
      );
    }
  }]);

  return TopicForm;
}(React.Component);

var mapStateToTopicFormProps = function mapStateToTopicFormProps(state) {
  var channel = state.channels.channel;
  return {
    channel: channel
  };
};

var mapDispatchToTopicFormProps = function mapDispatchToTopicFormProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var TopicFormWrapper = ReactRedux.connect(mapStateToTopicFormProps, mapDispatchToTopicFormProps)(TopicForm);
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UserMenu = function (_React$Component) {
  _inherits(UserMenu, _React$Component);

  function UserMenu(props) {
    _classCallCheck(this, UserMenu);

    var _this = _possibleConstructorReturn(this, (UserMenu.__proto__ || Object.getPrototypeOf(UserMenu)).call(this, props));

    _this.state = {};
    return _this;
  }

  _createClass(UserMenu, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (store.getState().site_info.cert_user_id !== store.getState().user.user_name) {
        this.props.getUser();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var user = this.props.user;
      var userMenuDisplay = void 0;
      if (!user || user && !user.user_id) {
        userMenuDisplay = React.createElement(Loading, { msg: " ", cssClass: "mini" });
      } else {
        if (this.props.site_info.cert_user_id) {
          var userNameDisplay = void 0;
          if (user.screen_name) {
            userNameDisplay = user.screen_name;
          } else if (user.user_name) {
            userNameDisplay = user.user_name.split('@')[0];
          } else if (user.user_id) {
            userNameDisplay = store.getState().site_info.cert_user_id;
          }
          userMenuDisplay = React.createElement(
            "div",
            { id: "user-menu-wrapper" },
            React.createElement(
              "span",
              null,
              React.createElement(
                "a",
                { href: "index.html?v=user-admin+s=profile" },
                React.createElement("i", { className: "user icon" }),
                " ",
                userNameDisplay
              )
            ),
            React.createElement(
              "span",
              null,
              "|"
            ),
            React.createElement(
              "span",
              null,
              React.createElement(
                "a",
                { onClick: function onClick() {
                    return _this2.props.certSelect();
                  } },
                "switch"
              )
            )
          );
        } else {
          userMenuDisplay = React.createElement(
            "div",
            { id: "user-menu-wrapper" },
            React.createElement(
              "span",
              null,
              React.createElement(
                "a",
                { onClick: function onClick() {
                    return _this2.props.certSelect();
                  } },
                "Login"
              ),
              " to participate"
            )
          );
        }
      }

      return React.createElement(
        "div",
        { id: "user-menu" },
        userMenuDisplay
      );
    }
  }]);

  return UserMenu;
}(React.Component);

var mapStateToUserMenuProps = function mapStateToUserMenuProps(state) {
  var site_info = state.site_info;
  var user = state.user;
  var feed = state.feed;
  return {
    site_info: site_info,
    user: user,
    feed: feed
  };
};

var mapDispatchToUserMenuProps = function mapDispatchToUserMenuProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var mergedUserMenuProps = function mergedUserMenuProps(stateProps, dispatch) {

  function getUser() {
    store.dispatch(loadingUser(true));
    var cert_user_id = store.getState().site_info.cert_user_id;
    if (cert_user_id) {
      var auth_address = store.getState().site_info.auth_address;
      var query = userHelpers.getUserQuery(auth_address);
      var _userCreated = store.getState().userCreated;
      Page.cmd('dbQuery', [query], function (res) {
        if (res.length > 0) {
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

  function registerUser() {
    var config = store.getState().config;
    var inner_path = "merged-" + config.merger_name + "/" + config.cluster + "/data/users/" + stateProps.site_info.auth_address + "/data.json";
    Page.cmd('fileGet', { inner_path: inner_path, required: false }, function (data) {
      data = JSON.parse(data);
      if (data) {
        if (!data.user) {
          data.user = [];
          data.next_user_id = 1;
        }
      } else {
        data = {
          "user": [],
          "next_user_id": 1
        };
      }
      var user = {
        user_id: stateProps.site_info.auth_address,
        user_name: stateProps.site_info.cert_user_id,
        added: Date.now()
      };
      data.user.push(user);
      data.next_user_id += 1;
      var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
      Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
        console.log('file write - ' + res);
        Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
          console.log('site publish - ' + res);
          Page.cmd("wrapperNotification", ["done", "User Registered!", 3000]);
          store.dispatch(userCreated(stateProps.site_info.cert_user_id));
          store.dispatch(setUser(user));
          finishLoadingUser();
        });
      });
    });
  }

  function finishLoadingUser() {
    store.dispatch(loadingUser(false));
  }

  function certSelect() {
    Page.selectUser();
    var self = this;
    Page.onRequest = function (cmd, message) {
      if (cmd === "setSiteInfo") {
        if (message.address === store.getState().site_info.address) {
          store.dispatch(loadingUser(true));
          if (message.cert_user_id) {
            store.dispatch(changeCert(message.auth_address, message.cert_user_id));
            self.getUser();
          } else if (!message.cert_user_id) {
            store.dispatch(changeCert(message.auth_address, message.cert_user_id));
            store.dispatch(removeUser());
            self.finishLoadingUser();
          }
        }
      }
    };
  }

  return _extends({}, stateProps, dispatch, {
    getUser: getUser,
    registerUser: registerUser,
    finishLoadingUser: finishLoadingUser,
    certSelect: certSelect
  });
};

var UserMenuWrapper = ReactRedux.connect(mapStateToUserMenuProps, mapDispatchToUserMenuProps, mergedUserMenuProps)(UserMenu);

var UserAdminView = function (_React$Component2) {
  _inherits(UserAdminView, _React$Component2);

  function UserAdminView() {
    _classCallCheck(this, UserAdminView);

    return _possibleConstructorReturn(this, (UserAdminView.__proto__ || Object.getPrototypeOf(UserAdminView)).apply(this, arguments));
  }

  _createClass(UserAdminView, [{
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.user) {
        if (this.props.user.user_id !== nextProps.user.user_id) this.forceUpdate();
      } else {
        if (nextProps.user) this.forceUpdate();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var userSectionDisplay = void 0;
      if (this.props.user) userSectionDisplay = React.createElement(UserSectionContainer, { user: this.props.user });
      return React.createElement(
        "div",
        { id: "user-admin-view", className: "view-container" },
        userSectionDisplay
      );
    }
  }]);

  return UserAdminView;
}(React.Component);

var mapStateToUserAdminViewProps = function mapStateToUserAdminViewProps(state) {
  var user = state.user;
  return {
    user: user
  };
};

var mapDispatchToUserAdminViewProps = function mapDispatchToUserAdminViewProps(dispatch) {
  return {
    dispatch: dispatch
  };
};

var UserAdminViewWrapper = ReactRedux.connect(mapStateToUserAdminViewProps, mapDispatchToUserAdminViewProps)(UserAdminView);

var UserSectionContainer = function UserSectionContainer(props) {
  var userSectionDisplay = void 0;
  if (props.user.user_id) {
    var section = store.getState().route.section;
    if (section === 'profile') userSectionDisplay = React.createElement(UserProfileSection, { user: props.user });else if (section === 'channels') userSectionDisplay = React.createElement(UserChannelsSection, null);else if (section === 'topics') userSectionDisplay = React.createElement(UserTopicsSection, null);else if (section === 'comments') userSectionDisplay = React.createElement(UserCommentsSection, null);else if (section === 'new-topic') userSectionDisplay = React.createElement(UserNewTopicSection, null);else if (section === 'edit-topic') userSectionDisplay = React.createElement(UserEditTopicSection, null);else if (section === 'new-channel') userSectionDisplay = React.createElement(UserNewChannelSection, null);else if (section === 'edit-channel') userSectionDisplay = React.createElement(UserEditChannelSection, null);
  }
  return React.createElement(
    "div",
    { id: "user-section-container" },
    userSectionDisplay
  );
};

var UserProfileSection = function (_React$Component3) {
  _inherits(UserProfileSection, _React$Component3);

  function UserProfileSection(props) {
    _classCallCheck(this, UserProfileSection);

    var _this4 = _possibleConstructorReturn(this, (UserProfileSection.__proto__ || Object.getPrototypeOf(UserProfileSection)).call(this, props));

    var user = _this4.props.user;
    _this4.state = {
      screen_name: user.screen_name || '',
      about: user.about || '',
      showEditor: true
    };

    _this4.onUserProfileScreenNameChange = _this4.onUserProfileScreenNameChange.bind(_this4);
    _this4.onUserProfileAboutChange = _this4.onUserProfileAboutChange.bind(_this4);
    _this4.toggleEditor = _this4.toggleEditor.bind(_this4);
    _this4.onUpdateUserProfile = _this4.onUpdateUserProfile.bind(_this4);
    _this4.updateUserProfile = _this4.updateUserProfile.bind(_this4);
    return _this4;
  }

  _createClass(UserProfileSection, [{
    key: "componentDidMount",
    value: function componentDidMount() {

      var options = formHelpers.getEasyEditorOptions();
      new EasyEditor('#ckeditor1', options);
      this.setState({ loading: false });
    }
  }, {
    key: "onUserProfileScreenNameChange",
    value: function onUserProfileScreenNameChange(e) {
      this.setState({ screen_name: e.target.value });
    }
  }, {
    key: "onUserProfileAboutChange",
    value: function onUserProfileAboutChange(about) {
      this.setState({ about: about });
    }
  }, {
    key: "toggleEditor",
    value: function toggleEditor() {
      this.setState({ showEditor: false });
    }
  }, {
    key: "onUpdateUserProfile",
    value: function onUpdateUserProfile() {
      var about = $('#ckeditor1')[0].defaultValue;
      this.setState({ loading: true, about: about }, function () {
        var query = "SELECT * FROM json WHERE json_id='" + store.getState().user.json_id + "'";
        Page.cmd('dbQuery', [query], function (res) {
          var json = res[0];
          var inner_path = "merged-" + store.getState().config.merger_name + "/" + json.directory + "/" + json.file_name;
          this.updateUserProfile(inner_path);
        }.bind(this));
      });
    }
  }, {
    key: "updateUserProfile",
    value: function updateUserProfile(inner_path) {
      Page.cmd('fileGet', { inner_path: inner_path }, function (data) {
        data = JSON.parse(data);
        var uIndex = data.user.findIndex(function (u) {
          return u.user_id === store.getState().user.user_id;
        });
        data.user[uIndex].screen_name = this.state.screen_name;
        data.user[uIndex].about = this.state.about;
        var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));
        Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function (res) {
          Page.cmd("sitePublish", { "inner_path": inner_path }, function (res) {
            Page.cmd("wrapperNotification", ["done", "Profile Updated!", 5000]);
            this.setState({ loading: false });
            store.dispatch(setUser(data.user[uIndex]));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: "render",
    value: function render() {

      var loadingDisplay = void 0;
      if (this.state.loading) {
        loadingDisplay = React.createElement(
          "div",
          { className: "ui active inverted dimmer" },
          React.createElement("div", { className: "ui text loader" })
        );
      }

      var textAreaDisplay = void 0;
      if (this.state.showEditor) {
        textAreaDisplay = React.createElement(
          "div",
          { className: "editor-wrapper" },
          React.createElement("textarea", { defaultValue: this.state.about, name: "ckeditor1", id: "ckeditor1" }),
          React.createElement(
            "button",
            { onClick: this.toggleEditor, type: "button", className: "native-btn" },
            React.createElement(
              "a",
              null,
              "Can't see the Text Editor? click here"
            )
          )
        );
      } else {
        textAreaDisplay = React.createElement("textarea", {
          onChange: this.onUserProfileAboutChange,
          defaultValue: this.state.about });
      }

      return React.createElement(
        "div",
        { id: "user-profile-section", className: "user-admin-section" },
        React.createElement(
          "form",
          { id: "user-profile-form", className: "ui lightgray form segment" },
          loadingDisplay,
          React.createElement(
            "div",
            { className: "field" },
            React.createElement(
              "label",
              { className: "label" },
              "Profile Name (Optional)"
            ),
            React.createElement("input", { defaultValue: this.state.screen_name, type: "text", onChange: this.onUserProfileScreenNameChange })
          ),
          React.createElement(
            "div",
            { className: "field" },
            React.createElement(
              "label",
              { className: "label" },
              "About"
            ),
            textAreaDisplay
          ),
          React.createElement(
            "div",
            { className: "field" },
            React.createElement(
              "button",
              { className: "native-btn", type: "button", onClick: this.onUpdateUserProfile },
              React.createElement(
                "a",
                null,
                "Update Profile"
              )
            )
          )
        )
      );
    }
  }]);

  return UserProfileSection;
}(React.Component);

var UserChannelsSection = function (_React$Component4) {
  _inherits(UserChannelsSection, _React$Component4);

  function UserChannelsSection() {
    _classCallCheck(this, UserChannelsSection);

    return _possibleConstructorReturn(this, (UserChannelsSection.__proto__ || Object.getPrototypeOf(UserChannelsSection)).apply(this, arguments));
  }

  _createClass(UserChannelsSection, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { id: "user-channels-section", className: "user-admin-section" },
        React.createElement(ChannelsListWrapper, null)
      );
    }
  }]);

  return UserChannelsSection;
}(React.Component);

var UserNewChannelSection = function (_React$Component5) {
  _inherits(UserNewChannelSection, _React$Component5);

  function UserNewChannelSection() {
    _classCallCheck(this, UserNewChannelSection);

    return _possibleConstructorReturn(this, (UserNewChannelSection.__proto__ || Object.getPrototypeOf(UserNewChannelSection)).apply(this, arguments));
  }

  _createClass(UserNewChannelSection, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { id: "user-new-channel-section", className: "user-admin-section" },
        React.createElement(ChannelForm, null)
      );
    }
  }]);

  return UserNewChannelSection;
}(React.Component);

var UserEditChannelSection = function (_React$Component6) {
  _inherits(UserEditChannelSection, _React$Component6);

  function UserEditChannelSection(props) {
    _classCallCheck(this, UserEditChannelSection);

    var _this7 = _possibleConstructorReturn(this, (UserEditChannelSection.__proto__ || Object.getPrototypeOf(UserEditChannelSection)).call(this, props));

    _this7.state = {
      loading: true
    };
    _this7.getChannelEditTabs = _this7.getChannelEditTabs.bind(_this7);
    _this7.getChannel = _this7.getChannel.bind(_this7);
    return _this7;
  }

  _createClass(UserEditChannelSection, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.getChannelEditTabs();
    }
  }, {
    key: "getChannelEditTabs",
    value: function getChannelEditTabs() {
      var tabs = channelHelpers.getChannelEditTabs();
      this.setState({ tabs: tabs, current_tab: 0 }, function () {
        this.getChannel();
      });
    }
  }, {
    key: "getChannel",
    value: function getChannel() {
      var query = "SELECT * FROM channel WHERE channel_id='" + store.getState().route.id + "'";
      Page.cmd('dbQuery', [query], function (res) {
        this.setState({ channel: res[0] });
      }.bind(this));
    }
  }, {
    key: "onTabClick",
    value: function onTabClick(value) {
      this.setState({ current_tab: value });
    }
  }, {
    key: "render",
    value: function render() {
      var _this8 = this;

      var userEditChannelSectionDisplay = void 0;
      if (!this.state.channel) {
        userEditChannelSectionDisplay = React.createElement(
          "div",
          { className: "ui segment lightgray" },
          React.createElement(Loading, { cssClass: "centered", msg: "Loading Channel..." })
        );
      } else {

        var channel = this.state.channel;
        var tabMenu = this.state.tabs.map(function (t, index) {
          return React.createElement(
            "a",
            {
              key: index,
              className: _this8.state.current_tab === index ? "item active" : "item",
              onClick: function onClick() {
                return _this8.onTabClick(index);
              } },
            t.label
          );
        });

        var tabs = this.state.tabs.map(function (t, index) {
          var tabCssClass = "ui bottom attached tab segment";
          var tabContent = void 0;
          if (index === 0) tabContent = React.createElement(ChannelForm, { channel: channel });else if (index === 1) tabContent = React.createElement(ChannelModeratorsContainer, { channel: channel });else if (index === 2) tabContent = React.createElement(ChannelLayoutEditorContainer, { channel: channel });
          return React.createElement(
            "div",
            {
              key: index,
              className: index === _this8.state.current_tab ? tabCssClass + " active" : tabCssClass },
            tabContent
          );
        });

        userEditChannelSectionDisplay = React.createElement(
          "div",
          { className: "user-edit-channel-wrapper" },
          React.createElement(
            "div",
            { className: "ui top attached tabular menu" },
            tabMenu
          ),
          React.createElement(
            "div",
            { id: "channel-edit-tabs-container" },
            tabs
          )
        );
      }
      return React.createElement(
        "div",
        { id: "user-edit-channel-section", className: "user-admin-section" },
        userEditChannelSectionDisplay
      );
    }
  }]);

  return UserEditChannelSection;
}(React.Component);

var UserTopicsSection = function (_React$Component7) {
  _inherits(UserTopicsSection, _React$Component7);

  function UserTopicsSection() {
    _classCallCheck(this, UserTopicsSection);

    return _possibleConstructorReturn(this, (UserTopicsSection.__proto__ || Object.getPrototypeOf(UserTopicsSection)).apply(this, arguments));
  }

  _createClass(UserTopicsSection, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { id: "user-channels-section", className: "user-admin-section" },
        React.createElement(TopicsWrapper, null)
      );
    }
  }]);

  return UserTopicsSection;
}(React.Component);

var UserNewTopicSection = function (_React$Component8) {
  _inherits(UserNewTopicSection, _React$Component8);

  function UserNewTopicSection() {
    _classCallCheck(this, UserNewTopicSection);

    return _possibleConstructorReturn(this, (UserNewTopicSection.__proto__ || Object.getPrototypeOf(UserNewTopicSection)).apply(this, arguments));
  }

  _createClass(UserNewTopicSection, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "user-section-container", id: "user-new-topic-section" },
        React.createElement(TopicFormWrapper, null)
      );
    }
  }]);

  return UserNewTopicSection;
}(React.Component);

var UserEditTopicSection = function (_React$Component9) {
  _inherits(UserEditTopicSection, _React$Component9);

  function UserEditTopicSection(props) {
    _classCallCheck(this, UserEditTopicSection);

    var _this11 = _possibleConstructorReturn(this, (UserEditTopicSection.__proto__ || Object.getPrototypeOf(UserEditTopicSection)).call(this, props));

    _this11.state = {
      loading: true,
      current_tab: 1
    };
    _this11.getTopic = _this11.getTopic.bind(_this11);
    _this11.handleTabItemClick = _this11.handleTabItemClick.bind(_this11);
    return _this11;
  }

  _createClass(UserEditTopicSection, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.getTopic();
    }
  }, {
    key: "getTopic",
    value: function getTopic() {
      var route = store.getState().route;
      var query = topicHelpers.getTopicQuery(route.id);
      Page.cmd('dbQuery', [query], function (res) {
        store.dispatch(setTopics(res));
        this.setState({ loading: false });
      }.bind(this));
    }
  }, {
    key: "handleTabItemClick",
    value: function handleTabItemClick(num) {
      this.setState({ current_tab: num });
    }
  }, {
    key: "render",
    value: function render() {
      var topicDisplay = void 0;
      if (this.state.loading) {
        topicDisplay = React.createElement(Loading, { msg: "loading topic.." });
      } else {
        var topic = store.getState().topics.items[0];
        topicDisplay = React.createElement(TopicForm, {
          topic: topic,
          getTopic: this.getTopic
        });
      }
      return React.createElement(
        "div",
        { id: "user-edit-topic-section", className: "user-admin-section" },
        topicDisplay
      );
    }
  }]);

  return UserEditTopicSection;
}(React.Component);

var UserCommentsSection = function (_React$Component10) {
  _inherits(UserCommentsSection, _React$Component10);

  function UserCommentsSection() {
    _classCallCheck(this, UserCommentsSection);

    return _possibleConstructorReturn(this, (UserCommentsSection.__proto__ || Object.getPrototypeOf(UserCommentsSection)).apply(this, arguments));
  }

  _createClass(UserCommentsSection, [{
    key: "render",
    value: function render() {
      var userId = store.getState().site_info.cert_user_id;
      return React.createElement(
        "div",
        { id: "user-comments-section", className: "user-admin-section" },
        React.createElement(CommentsWrapper, { userId: userId })
      );
    }
  }]);

  return UserCommentsSection;
}(React.Component);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ReactRedux = ReactRedux,
    Provider = _ReactRedux.Provider,
    connect = _ReactRedux.connect;

var store = Redux.createStore(reducer);

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = {
      loading: true
    };
    _this.initApp = _this.initApp.bind(_this);
    _this.checkMergerPermissions = _this.checkMergerPermissions.bind(_this);
    _this.getMergerSites = _this.getMergerSites.bind(_this);
    _this.addMergerSites = _this.addMergerSites.bind(_this);
    _this.createCertificate = _this.createCertificate.bind(_this);
    _this.certSelect = _this.certSelect.bind(_this);
    _this.finishLoadingApp = _this.finishLoadingApp.bind(_this);
    return _this;
  }

  _createClass(App, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.initApp();
    }
  }, {
    key: 'initApp',
    value: function initApp() {
      Page.cmd('serverInfo', {}, function (server_info) {
        store.dispatch(setServerInfo(server_info));
        Page.cmd('siteInfo', {}, function (site_info) {
          store.dispatch(setSiteInfo(site_info));
          Page.cmd('wrapperGetLocalStorage', [], function (local_storage) {
            store.dispatch(setLocalStorage(local_storage));
            Page.cmd('feedListFollow', [], function (feed) {
              store.dispatch(setFeedListFollow(feed));
              Page.cmd('fileGet', { 'inner_path': 'data/config.json' }, function (config) {
                config = JSON.parse(config);
                store.dispatch(setSiteConfig(config));
                this.checkMergerPermissions();
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }
  }, {
    key: 'checkMergerPermissions',
    value: function checkMergerPermissions() {
      var state = store.getState();
      if (state.site_info.settings.permissions.indexOf('Merger:' + state.config.merger_name) > -1) {
        this.getMergerSites();
      } else {
        Page.cmd('wrapperPermissionAdd', 'Merger:' + state.config.merger_name, function (res) {
          this.getMergerSites();
        }.bind(this));
      }
    }
  }, {
    key: 'getMergerSites',
    value: function getMergerSites() {
      Page.cmd("mergerSiteList", { query_site_info: true }, function (res) {
        var state = store.getState();
        var missingSiteList = appHelpers.generateMissingSiteList(res, state.config.clusters);
        if (missingSiteList.length > 0) {
          this.addMergerSites(missingSiteList);
        } else {
          this.routeApp();
        }
      }.bind(this));
    }
  }, {
    key: 'addMergerSites',
    value: function addMergerSites(missingSiteList) {
      Page.cmd("mergerSiteAdd", { "addresses": missingSiteList }, function (data) {
        Page.cmd("wrapperNotification", ["info", "if this is a fresh ZeroNet install, please wait for a few minutes until ZeroNet installs all the relevant plugins, before you register", 20000]);
        Page.cmd("wrapperNotification", ["info", "refresh this site to view new content", 10000]);
      }.bind(this));
    }
  }, {
    key: 'routeApp',
    value: function routeApp() {
      var route = appHelpers.generateAppRoute(window.location.search);
      store.dispatch(setAppRoute(route));
      if (!store.getState().local_storage.zv_cert_created) {
        if (store.getState().site_info.cert_user_id && store.getState().site_info.cert_user_id.split('@')[1] === "zv.anonymous") {
          // console.log('zv anonymous cert created');
        } else {
          this.createCertificate();
        }
      }
      this.finishLoadingApp();
    }
  }, {
    key: 'createCertificate',
    value: function createCertificate() {
      if (!name) name = appHelpers.generateRandomString(13);
      var certname = "zv.anonymous";
      var genkey = "5JLwSwpk8mN7FmgC8zAAdXHiHyky928UAh3vDJpNWVetsjTxyLV";
      var genid = bitcoin.ECPair.fromWIF(genkey);
      var cert = bitcoin.message.sign(genid, store.getState().site_info.auth_address + "#web/" + name.slice(0, 13)).toString("base64");
      var self = this;
      Page.cmd("certAdd", [certname, "web", name, cert], function (res) {
        var local_storage = store.getState().local_storage;
        local_storage['zv_cert_created'] = true;
        Page.cmd("wrapperSetLocalStorage", local_storage);
        self.certSelect();
      }.bind(this));
    }
  }, {
    key: 'certSelect',
    value: function certSelect() {
      Page.selectUser();
      Page.onRequest = function (cmd, message) {
        if (cmd === "setSiteInfo" && message.address === store.getState().site_info.address) {
          store.dispatch(loadingUser(true));
          store.dispatch(changeCert(message.auth_address, message.cert_user_id));
          // getUser();
        }
      };
    }
  }, {
    key: 'finishLoadingApp',
    value: function finishLoadingApp() {
      var th = this;
      th.setState({ loading: false });
    }
  }, {
    key: 'render',
    value: function render() {

      var templateDisplay = void 0;
      if (this.state.loading) {
        templateDisplay = React.createElement(
          'div',
          { id: 'main-site-loader', className: 'ui segment' },
          React.createElement('p', null),
          React.createElement('p', null),
          React.createElement('p', null),
          React.createElement(
            'div',
            { className: 'ui active dimmer' },
            React.createElement(LoadingCubeGrid, null),
            React.createElement(
              'b',
              null,
              'Loading Zite'
            )
          )
        );
      } else {
        templateDisplay = React.createElement(Template, { loading: this.state.loading });
      }

      return React.createElement(
        Provider,
        { store: store },
        templateDisplay
      );
    }
  }]);

  return App;
}(React.Component);

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));
