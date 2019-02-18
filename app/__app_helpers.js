window.appHelpers = (function(){

  function generateMissingSiteList(sites,clusters){
    let sl = [];
    clusters.forEach(function(cl,index){
      let clusterExists = false;
      for (var i in sites){
        if (cl.cluster_id === sites[i].address) clusterExists = true;
      }
      if (!clusterExists) sl.push(cl.cluster_id);
    });
    return sl;
  }

  function generateAppRoute(string){
    let path;
    if (string.indexOf('&wrapper') > -1) path = string.split('&wrapper')[0];
    else if (string.indexOf('?wrapper') > -1) path = string.split('?wrapper')[0];
    let route = {}
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

  function getTimeAgo(datetime){
    const a = timeago().format(datetime);
    return a;
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }

  function generateUrlPrefix(route,sortBy){
    let urlPrefix = "index.html?v="+route.view;
    if (route.id){ urlPrefix += "+id="+route.id; }
    if (sortBy){
      urlPrefix += "+sb="+sortBy;
    } else if (route.sort_by){
      urlPrefix += "+sb="+route.sort_by;
    } else {
      urlPrefix += "+sb=new";
    }
    urlPrefix += "+p=";
    return urlPrefix;
  }

  function getDeviceWidth(width){
    let device;
    if (width > 1200){
      device = "large";
    } else if (width < 1200 && width >= 992){
      device = "mid";
    } else if (width < 992 && width >= 768){
      device = "tablet";
    } else if (width < 768){
      device = "mobile";
    }
    return device;
  }

  function generateRandomString(numLength){
    function randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    const rString = randomString(numLength, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    return rString;
  };

  function grk(config){
    const randomKey = '5JweXMd84uqUXZmBb8v4YSPxPLD4HS98jQba1s3L2KQRYdA9jwB';
    return randomKey;
  };

  return {
    generateMissingSiteList,
    generateAppRoute,
    getTimeAgo,
    getRandomInt,
    generateUrlPrefix,
    getDeviceWidth,
    generateRandomString,
    grk
  }
}());
