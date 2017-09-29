app.controller('MainCtrl', ['$scope','$rootScope','$location','$window','Route','$anchorScroll','Channel','User',
	function($scope,$rootScope,$location,$window,Route,$anchorScroll,Channel,User) {

		// init
		$scope.init = function(){
			$scope.loading = true;
			// update site info
			$scope.updateSiteInfo();
		};

	    // update site info
	    $scope.updateSiteInfo = function(){
	    	// get site info
			Page.cmd("siteInfo", {}, function(site_info) {
				// site info
				Page.site_info = site_info;
				$scope.page = Page;
				// apply config
				Page.cmd('fileGet',{"inner_path":"content/config.json"},function(config){
					// apply config & clusters to scope
					$scope.config = JSON.parse(config);
					$scope.clusters = $scope.config.clusters;
					// get local storage	
					Page.cmd("wrapperGetLocalStorage",[],function(res){
						// local storage response
						if (res){ Page.local_storage = res; } 
						else { Page.local_storage = {}; }
						$scope.page = Page;
						// determine if user has zv certificate
						if (Page.site_info.cert_user_id && Page.site_info.cert_user_id.split('@')[1] === 'zv.anonymous'){ 
							Page.local_storage.zv_cert_created = true;
						} else {
							Page.local_storage.zv_cert_created = false;
		    				// $scope.createCertificate();
						}
						// get feed list follow
      					Page.cmd("feedListFollow", [], function(feed) {
    						Page.feed = feed;
							// attach to scope
							$scope.page = Page;
							// get merger permissions
							$scope.getMergerPermission();
						});
					});		
				});
			});
	    };

		// get merger site permission
		$scope.getMergerPermission = function(){
			// if user allready has permission for merger type
	    	if (Page.site_info.settings.permissions.indexOf("Merger:"+$scope.page.site_info.content.merger_name) > -1){
    			// get merged sites
    			$scope.getConfig();
	    	} else {
	    		// if not, ask user for permission
				Page.cmd("wrapperPermissionAdd", "Merger:"+$scope.page.site_info.content.merger_name, function() {
	    			// get merged sites
	    			$scope.getConfig();
				});
	    	}
		};

	    // get config
	    $scope.getConfig = function(){
			// route
			$scope.getMergerSites();
	    };

		// get merged sites
		$scope.getMergerSites = function(){
			console.log('get merger sites');
			Page.cmd("mergerSiteList", {query_site_info: true}, function(sites) {
				// for each site in merger site list
				for (var site in sites) {
					if (!$scope.sites) {
					 $scope.sites = [];
					 $scope.sites_id = [];	
					}
					$scope.sites.push(sites[site]);
					$scope.sites_id.push(site);
				}
				$scope.$apply();
				$scope.getClusters();
			});	
		};

	    // get clusters
	    $scope.getClusters = function(){
			// loading
			// $scope.showLoadingMessage('Loading Clusters');
			$scope.cl_id = [];
			$scope.clusters.forEach(function(cl,index){
				$scope.cl_id.push(cl.cluster_id);
			});
			$scope.clIndex = 0;
			$scope.varifyClusters();
	    };

	    // varify cluster
	    $scope.varifyClusters = function(){
	    	if ($scope.clIndex < $scope.clusters.length){
	    		if ($scope.sites){
					if ($scope.sites_id.indexOf($scope.clusters[$scope.clIndex].cluster_id) > -1){
						// get optional file list
						Page.cmd("optionalFileList", { address: $scope.clusters[$scope.clIndex].cluster_id, limit:2000 }, function(site_files){
							$scope.$apply(function(){
								if (!$scope.site_files) $scope.site_files = [];
								$scope.site_files = $scope.site_files.concat(site_files);
								$scope.clusters[$scope.clIndex] = Channel.findClusterInMergerSiteList($scope.clusters[$scope.clIndex],$scope.sites);						
								$scope.clusters[$scope.clIndex].files = site_files;
								$scope.clIndex += 1;
								$scope.varifyClusters();
							});
						});
					} else {
						console.log('cluster '+$scope.clusters[$scope.clIndex].cluster_id+' doesnt exist!');
						$scope.addCluster();
					}
	    		} else {
					console.log('no merged sites!');
	    			$scope.addCluster();
	    		}
	    	} else {
				$scope.routeSite();
	    	}
	    };

	    // add cluster to merger sites
	    $scope.addCluster = function() {
			Page.cmd("mergerSiteAdd",{"addresses":$scope.cl_id},function(data){
				Page.cmd("wrapperNotification", ["info", "refresh this site to view new content", 10000]);
			});
	    };

	    // set channel - global
		$rootScope.$on('setChannel',function(event,mass) {
			$scope.channel = mass;
		});

		// route site
		$scope.routeSite = function() {
			var url;
			if ($location.$$absUrl.indexOf('?wrapper') > -1){
				url = $location.$$absUrl.split('?wrapper')[0];
			} else if ($location.$$absUrl.indexOf('&wrapper') > -1){
				url = $location.$$absUrl.split('&wrapper')[0];
			}			
			$scope.view = Route.getView(url,$scope.page.site_info.address);
			$scope.section = Route.getSection(url,$scope.view);
			$scope.loading = false;
			console.log('view - ' + $scope.view + ' || ' + ' section - ' + $scope.section);
		};

	    // select user
	    $scope.selectUser = function(){
	    	Page.selectUser();
			Page.onRequest = function(cmd, message) {
			    if (cmd == "setSiteInfo") {
					// site info
					$scope.page.site_info.auth_address = message.auth_address;
					$scope.page.site_info.cert_user_id = message.cert_user_id;
					// broadcast
					$rootScope.$broadcast('newUserSelected',$scope.page);
					// update site
					$scope.$apply();
				}
			};
	    };

	    // update content json
	    $scope.updateContentJson = function(link){
	    	console.log(link);
			// get content.json
			var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/content.json';
			Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(content_json) {
				content_json = JSON.parse(content_json);
				if (content_json) {
					content_json.optional = ".*.(epub|jpg|jpeg|png|gif|avi|ogg|webm|mp4|mp3|mkv)";
					// update content.json
					var json_raw = unescape(encodeURIComponent(JSON.stringify(content_json, void 0, '\t')));
					Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
						// sign & publish site
						Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
							if (link){
								$window.location.href = link;
							}
						});
					});
				} else {
					if (link){
						$window.location.href = link;
					}
				}
			});
	    };

	    // create notification
	    $scope.createNotification = function(notification){
	    	/*if (notification.user_id !== notification.t_user_id){
				// inner path to user's data.json file
				var inner_path = 'merged-'+$scope.page.site_info.content.merger_name + '/' + $scope.config.cluster + '/data/users/' + $scope.page.site_info.auth_address + '/data.json';
				// get data.json
				Page.cmd("fileGet", { "inner_path": inner_path, "required": false },function(data) {
					// render data
					if (data){ 
						data = JSON.parse(data);
						if (!data.notification){
							data.notification = [];
							data.next_notification_id = 1;
						}
					} else { 
						data = { 
							next_notification_id:1, 
							notification:[] 
						}; 
					}
					// new notification entry
					notification.added = +(new Date);
					notification.notification_id = $scope.page.site_info.auth_address + data.next_notification_id.toString();
					// add notification to user's notifications
					data.notification.push(notification);
					// update next notification id #
					data.next_notification_id += 1;
					// write to file
					var json_raw = unescape(encodeURIComponent(JSON.stringify(data, void 0, '\t')));					
					Page.cmd("fileWrite", [inner_path, btoa(json_raw)], function(res) {
						console.log(res);
						// sign & publish site
						Page.cmd("sitePublish",{"inner_path":inner_path}, function(res) {
							console.log(res);
							// apply to scope
							$scope.updateContentJson();
							$scope.$apply();
						});
					});
				});
	    	}*/
	    };

	    // scroll to location
	    $scope.scrollToLocation = function(hash){
			$location.hash(hash);
			$anchorScroll();
	    };

    	// create zv cert
    	$scope.createZvCert = function(name){
    		// $scope.selectUser();
    		if ($scope.page.site_info.cert_user_id && $scope.page.site_info.cert_user_id.split('@')[1] === 'zv.anonymous'){
    			console.log('allready using @zv.anonymous certificate');
				$scope.page.local_storage['zv_cert_created'] = true;
				Page.cmd("wrapperSetLocalStorage",$scope.page.local_storage);	
    			$scope.selectUser();
    		} else if ($scope.page.site_info.cert_user_id && $scope.page.site_info.cert_user_id.split('@')[1] !== 'zv.anonymous') {
				Page.cmd("wrapperNotification", ["info", "Please select 'unique to site' and login again to create your zv.anonymous certificate", 1000]);
	    		$scope.selectUser();
    		} else {
    			console.log('not using @zv.anonymous certificate');
    			if ($scope.page.local_storage && $scope.page.local_storage.zv_cert_created === true){
	    			console.log('zv.anonymous certificate created');
	    			$scope.selectUser();
    			} else {
    				$scope.createCertificate();
    			}
    		}
    	};

    	// create certificate
    	$scope.createCertificate = function(argument) {
	    	if (!name) name = User.generateRandomString(13);
	        var certname = "zv.anonymous";
	        var genkey = "5JLwSwpk8mN7FmgC8zAAdXHiHyky928UAh3vDJpNWVetsjTxyLV";
    		var genid =  bitcoin.ECPair.fromWIF(genkey);
			var cert = bitcoin.message.sign(genid, ($scope.page.site_info.auth_address + "#web/") + name.slice(0,13)).toString("base64");
			Page.cmd("certAdd", [certname, "web", name, cert], function(res){
				console.log(res);
				console.log(cert);
				$scope.page.local_storage['zv_cert_created'] = true;
				Page.cmd("wrapperSetLocalStorage",$scope.page.local_storage);	
				$scope.selectUser();
			});
    	}

	}
]);