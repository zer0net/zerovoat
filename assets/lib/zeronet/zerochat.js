(function() {
  var ZeroChat,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ZeroChat = (function(_super) {
    __extends(ZeroChat, _super);

    function ZeroChat() {
      this.onOpenWebsocket = __bind(this.onOpenWebsocket, this);
      this.selectUser = __bind(this.selectUser, this);
      return ZeroChat.__super__.constructor.apply(this, arguments);
    }

    ZeroChat.prototype.selectUser = function() {
      Page.cmd("certSelect", [["zeroid.bit","zv.anonymous"]]);
      return false;
    };

    ZeroChat.prototype.route = function(cmd, message) {
      console.log(cmd, message);
      if (cmd === "setSiteInfo") {
        return this.site_info = message.params;
      }
    };

    ZeroChat.prototype.onOpenWebsocket = function(e) {
      return this.cmd("siteInfo", {}, (function(_this) {
        return function(site_info) {
          return _this.site_info = site_info;
        };
      })(this));
    };

    return ZeroChat;

  })(ZeroFrame);

  window.Page = new ZeroChat();  

}).call(this);
