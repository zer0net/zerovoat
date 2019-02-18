window.userHelpers = (function(){

  function getUserQuery(userId){
    let q = "SELECT u.*, f.*, fti.*";
    q+= ", (SELECT count(*) FROM channel WHERE channel.user_id=u.user_name) as channels_total";
    q+= ", (SELECT count(*) FROM topic WHERE topic.user_id=u.user_name) as topics_total";
    q+= ", (SELECT count(*) FROM comment WHERE comment.user_id=u.user_name) as comments_total";
    q += " FROM user u";
    q += " LEFT JOIN file AS f ON f.item_id=u.user_id AND f.item_type='user'";
    q += " LEFT JOIN file_to_item AS fti ON fti.item_id=u.user_id";
    q += " WHERE u.user_id='"+userId+"'";
    return q;
  }

  function getUserAvatarQuery(userId){
    let q = "SELECT f.*, fti.*";
    q += " FROM file f";
    q += " LEFT JOIN file_to_item AS fti ON fti.item_id=f.item_id "
    q += " WHERE f.item_id='"+userId+"'";
    return q;
  }

  function randomRgba(str) {
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      var colour = '#';
      for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
      }
      return colour;
  }

  function hashCode(str) { // java String#hashCode
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
         hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
  }

  function intToRGB(i){
      var c = (i & 0x00FFFFFF)
          .toString(16)
          .toUpperCase();

      return "00000".substring(0, 6 - c.length) + c;
  }

  return {
    getUserQuery,
    getUserAvatarQuery,
    randomRgba,
    hashCode,
    intToRGB
  }
}())
