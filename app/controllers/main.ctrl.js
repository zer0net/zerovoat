app.controller('MainCtrl', ['$scope','$rootScope','$location',
	function($scope,$rootScope,$location) {

		/** ZeroFrame **/

		    // select user
		    $scope.selectUser = function(){
		    	Page.selectUser();
				Page.onRequest = function(cmd, message) {
				    if (cmd == "setSiteInfo") {
						// site info
						Page.site_info = message;
						// attach to scope
						$scope.page = Page;
						// update site
						$scope.$apply();
					}
				};
		    };

		/** /ZeroFrame **/

		/** INIT **/

			// init
			$scope.init = function(){
				$scope.loading = true;
				// update site info
				$scope.updateSiteInfo();
				// route
				$scope.routeSite();
			};

		    // update site info
		    $scope.updateSiteInfo = function(){
		    	// get site info
				Page.cmd("siteInfo", {}, function(site_info) {
					// site info
					Page.site_info = site_info;
					// attach to scope
					$scope.page = Page;
					// update site
					Page.cmd('siteUpdate',{"address":$scope.page.site_info.address});
					// apply 
					$scope.$apply(function(){
						// get site config
						$scope.getConfig();
					});
				});
		    };

		    // get config
		    $scope.getConfig = function(){
		    	$scope.site_title = 'Zeronet Central';
		    	$scope.site_slogan = 'The Central Place of Zeronet';
		    };

		    // set channel - global
			$rootScope.$on('setChannel',function(event,mass) {
				$scope.channel = mass;
			});

			// route site
			$scope.routeSite = function() {
				var route = $location.$$absUrl;
				// section
				if (route.indexOf('topic') > -1){
					$scope.section = 'topic';
				} else if (route.indexOf('channels') > -1) {
					$scope.section = 'channels';
				} else if (route.indexOf('channel') > -1){
					$scope.section = 'channel';
				} else if (route.indexOf('sector') > -1) {
					$scope.section = 'sector';
				} else {
					$scope.section = 'main';
				}
				// view
				if (route.indexOf('topic.html') > -1){
					$scope.view = 'view';
				} else if (route.indexOf('edit.html') > -1) {
					$scope.view = 'edit';
				} else if (route.indexOf('new.html') > -1){
					$scope.view = 'new';
				} else if (route.indexOf('moderate.html') > -1) {
					$scope.view = 'moderate';
				} else if (route.indexOf('user-admin.html') > -1){
					$scope.view = 'user-admin';
				} else {
					$scope.view = 'main';
				}
				console.log($scope.section);
				console.log($scope.view);
			};

		/** INIT **/


	}
]);