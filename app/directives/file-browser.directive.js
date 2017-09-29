app.directive('fileBrowser', ['$rootScope','File',
	function($rootScope,File) {

		// files directive controller
		var controller = function($scope,$element) {

			// init file browser
			$scope.initFileBrowser = function(){
				// cluster menu
				$scope.cl_menu = File.renderClustersMenu($scope.clusters);
				$scope.current_cluster = $scope.cl_menu[0].cluster_id;
				// browser menu
				$scope.browser_menu = [{
					title:'all',
					value:'all'
				},{
					title:'my files',
					value:'my-files'
				}];
				// init file type menu
				$scope.initFileTypeMenu();
			};

			// init file type menu
			$scope.initFileTypeMenu = function(){
				if ($scope.current_cluster === '19gtNiKNZMq6nTdWThGCQQAS2bCYAY1tFh'){
					var query = File.getFileTypes();
					Page.cmd("dbQuery",query,function(i_filetypes){
						$scope.$apply(function(){
							// file types
							$scope.filetypes = i_filetypes;							
							$scope.countFiles();
						});
					});
				} else {
					var query = File.getItemFileTypes();
					Page.cmd("dbQuery",query,function(i_filetypes){
						$scope.$apply(function(){
							// file types
							$scope.filetypes = i_filetypes;
							$scope.countFiles();
						});
					});
				}
			};

			// count files
			$scope.countFiles = function(){
				if ($scope.current_cluster === '19gtNiKNZMq6nTdWThGCQQAS2bCYAY1tFh'){
					var query = File.generateFileCountQuery($scope.user_id,$scope.file_type);
					Page.cmd("dbQuery",query,function(files_count){
						$scope.files_count = files_count[0]["count(*)"];
						$scope.generatePagination($scope.files_count);
					});
				} else {
					var query = File.generateItemAsFileCountQuery($scope.user_id,$scope.file_type);
					Page.cmd("dbQuery",query,function(f_items_count){
						$scope.f_items_count = f_items_count[0]["count(*)"];
						$scope.generatePagination($scope.f_items_count);
					});
				}
			};

			// generate pagination 
			$scope.generatePagination = function(file_count) {
				console.log(file_count);
				$scope.pagination = {
					totalItems:file_count,
					items_per_page:20,
					currentPage:1,
					numPages: file_count / 12,
				}
				$scope.getFiles();
			}
			// get files 
			$scope.getFiles = function(){
				console.log($scope.current_cluster);
				if ($scope.current_cluster === '19gtNiKNZMq6nTdWThGCQQAS2bCYAY1tFh'){
					var query = File.generateFileBrowserQuery($scope.pagination,$scope.user_id,$scope.file_type,$scope.item_batch_total);
					Page.cmd("dbQuery",query,function(files){
						$scope.file_batch_total = files.length;
						$scope.$apply(function(){
							$scope.cdn_files = files;
							$scope.cdn_files = File.getSiteFiles($scope.cdn_files,$scope.site_files,$scope.config,$scope.sites,$scope.page.site_info.address,$scope.section,$scope.clusters);
						});
					});
				} else {
					var query = File.generateItemAsFileQuery($scope.pagination,$scope.user_id,$scope.file_type,$scope.current_cluster);
					Page.cmd("dbQuery",query, function(items){
						console.log(items);
						$scope.item_batch_total = items.length;
						$scope.$apply(function(){
							$scope.cdn_files = items;
							$scope.cdn_files = File.getSiteFiles($scope.cdn_files,$scope.site_files,$scope.config,$scope.sites,$scope.page.site_info.address,$scope.section,$scope.clusters);
						});
					});
				}
			};

			// select file to embed
			$scope.selectFileToEmbed = function(file,item){
				item.file = file;
			};

			// get my files
			$scope.filterByUserFiles = function(){
				console.log($scope.user);
				delete $scope.current_cluster;
				delete $scope.file_type;
				delete $scope.pagination;				
			};

			// filter by file type
			$scope.filterByFileType = function(file_type){
				$scope.file_type = file_type;
				$scope.countFiles()
			};

			$scope.filterClusterFiles = function(cl){
				$scope.current_cluster = cl.cluster_id;
				delete $scope.file_type;
				delete $scope.pagination;
				$scope.initFileTypeMenu()
			};

			// filter by file type
			$scope.pageChanged = function(){
				$scope.getFiles();
			};

			// get cluster menu item class
			$scope.getClusterMenuItemClass = function(cl) {
				var css_class = '';
				if (cl.cluster_id === $scope.current_cluster) css_class = 'selected';
				return css_class;
			}

			// get file types menu item class
			$scope.getFileTypesMenuItemClass = function(f_type){
				var css_class = '';
				if ($scope.file_type === f_type.file_type) css_class = 'selected';
				return css_class;
			};
		};

		var template =  '<section id="file-browser" ng-init="initFileBrowser()">' +
							'<ul class="top-file-browser-menu">' + 
								'<li class="selected"><a ng-click="resetFilter()">All Files</a></li>' +
								'<li><a ng-click="filterByUserFiles()">My Files</a></li>' +
							'</ul>' +
							'<ul class="clusters-file-browser-menu">' + 
								'<li ng-repeat="cl in cl_menu" ng-class="getClusterMenuItemClass(cl)"><a ng-click="filterClusterFiles(cl)">{{cl.title}}</a></li>' +
							'</ul>' +
							'<div class="browser-main">' +
								'<ul class="left-file-browser-menu col-sm-2">' +
									'<li ng-repeat="item in filetypes" ng-class="getFileTypesMenuItemClass(item)">' +
										'<a ng-click="filterByFileType(item.file_type)">{{item.file_type}}</a>' +
									'</li>' +
								'</ul>' +
								'<section class="file-list row col-sm-10">' +
									'<div ng-repeat="file in cdn_files | orderBy:\'-added\'" class="col-sm-3 file-item {{file.file_type}}" ng-click="selectFileToEmbed(file,topic)">' +
										'<div class="inner-wrap">' +
											'<img ng-if="file.image" ng-src="{{file.image_path}}"/>' +
											'<img ng-if="file.video" ng-src="/{{page.site_info.address}}/assets/img/video-play-icon.jpg"/>' +
											'<img ng-if="file.audio" ng-src="/{{page.site_info.address}}/assets/img/music-icon.jpg"/>' +
										'</div>' +
										'<ul>' +
											'<li><span ng-bind="file.file_name"></span></li>' +
											'<li><span>{{file.file_type}}</span></li>' +
											'<li>{{file.site_file.cluster_title}} | peers: <span ng-if="file.site_file.peer > 0" ng-bind="file.site_file.peer"></span><span ng-if="!file.site_file.peer">0</span></li>' +
										'</ul>' +
									'</div>' +
								'</section>' +
    							'<ul class="col-sm-10" style="margin-left:16.66666667%;" ng-if="pagination.numPages > 1" uib-pagination total-items="pagination.totalItems" items-per-page="pagination.items_per_page" ng-model="pagination.currentPage" ng-change="pageChanged()" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo;" boundary-links="true"></ul>' +
							'</div>' +
							'<hr style="float:left;width:100%;margin:15px 0"/>' +
 						'</div>';
		return {
			restrict: 'AE',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);