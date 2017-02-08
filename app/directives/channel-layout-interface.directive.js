app.directive('channelLayoutInterface', [
	function() {

		// channel layout interface controller
		var controller = function($scope,$element) {

			// init channel layout interface
			$scope.init = function(){
				// set item type & scope mode
				$scope.item_type = 'layout';
				if (!$scope.channel.layout){
					$scope.mode = 'new';
					$scope.initDefaultLayout();
				} else {
					$scope.mode = 'edit';
					$scope.layout = $scope.channel.layout;
				}
				// init default values
				$scope.initDefaultLayoutOptions();
			};

			// init default layout
			$scope.initDefaultLayout = function(){
				$scope.layout = {
					bg_color:'#f4f4f4',
					header_bg_color:'#ffffff',
					fg_color:'#ffffff',
					fg_color_secondary:'#f4f4f4',
					heading_color:'#333',
					text_color:'#333',
					subtext_color:'#707070',
					link_color:'#337ab7',
					subheader_height:'0'
				};
			};

			// init default layout options
			$scope.initDefaultLayoutOptions = function(){
				$scope.bg_size_options = ['auto','cover','contain'];
				$scope.bg_repeat_options = ['repeat','no-repeat','repeat-x','repeat-y','round','space'];
				$scope.bg_position_options = ['left top','left center','left bottom','right top','right center','right bottom','center top','center center','center bottom'];
				$scope.bg_attachment_options = ['scroll','fixed','local'];
				
				// watch for subheader vars
				var subheader_watch_vars = ['$scope.layout.subheader_bg_image','$scope.layout.subheader_bg_color','$scope.layout.subheader_text'];
				$scope.$watchCollection('$scope.layout.subheader_bg_image', function() {
					$scope.setDefaultSubheaderAttributes();
				});
			};

			// set default subheader attribuets
			$scope.setDefaultSubheaderAttributes = function(){
				$scope.layout.subheader_height = 100;
				$scope.layout.subheader_bg_size = 'contain';
				$scope.layout.subheader_bg_repeat = 'no-repeat';
				$scope.layout.subheader_bg_position = 'left top';
				$scope.layout.subheader_title_margin_top = '40';
				$scope.layout.subheader_title_margin_left = '15';
			};

			// on create layout
			$scope.onCreateLayout = function(layout){
				$scope.loading = true;
				$scope.createChannelLayout($scope.channel,layout);
			};

			// on update layout 
			$scope.onUpdateLayout = function(layout){
				$scope.loading = false;
				$scope.updateChannelLayout(layout);
			};
     
		};

		var template =  '<section class="form" ng-init="init()" files>' +
							'<!-- layout config tabs -->' +
							'<uib-tabset active="0">' +
							    '<uib-tab index="0" heading="Background">' +
								    '<div class="row">' +
								        '<div class="form-field col-xs-12">' +
								          '<label class="col-xs-2">Header Color: </label>' +
								          '<div class="col-xs-10">' +
								            '<div colorpicker class="colorpicker-btn" style="background-color:{{layout.header_bg_color}};" ng-model="layout.header_bg_color"></div>' +
								            '<input type="text" class="colorpicker-text form-control" ng-model="layout.header_bg_color"/>' +
								          '</div>' +
								        '</div>' +
									    '<div class="form-field col-xs-12">' +
									        '<label class="col-xs-2">Background Color: </label>' +
									        '<div class="col-xs-10">' +
									          '<div colorpicker class="colorpicker-btn" style="background-color:{{layout.bg_color}};" ng-model="layout.bg_color"></div>' +
									          '<input type="text" class="form-control colorpicker-text" ng-model="layout.bg_color"/>' +
									        '</div>' +
									    '</div>' +
									    '<div class="form-field col-xs-12">' +
									        '<label class="col-xs-2">Background Image:</label>' +
									        '<div class="col-xs-10">' +
								        		'<input class="form-control" name="bg_image" type="file" filereader />' +
									        '</div>' +
									    '</div>' +
								        '<div ng-if="layout.bg_image" class="form-field col-xs-3">' +
								          '<label class="col-xs-6">Repeat: </label>' +
								          '<div class="col-xs-6">' +
								          	'<select class="form-control" ng-model="layout.bg_image_repeat">' +
								          		'<option ng-repeat="option in bg_repeat_options" value="{{option}}">{{option}}</option>' +
								          	'</select>' +
								          '</div>' +
								        '</div>' +
								        '<div ng-if="layout.bg_image" class="form-field col-xs-3">' +
								          '<label class="col-xs-6">Size: </label>' +
								          '<div class="col-xs-6">' +
								          	'<select class="form-control" ng-model="layout.bg_image_size">' +
								          		'<option ng-repeat="option in bg_size_options" value="{{option}}">{{option}}</option>' +
								          	'</select>' +
								          '</div>' +
								        '</div>' +
								        '<div ng-if="layout.bg_image" class="form-field col-xs-3">' +
								          '<label class="col-xs-6">Position: </label>' +
								          '<div class="col-xs-6">' +
								          	'<select class="form-control" ng-model="layout.bg_image_position">' +
								          		'<option ng-repeat="option in bg_position_options" value="{{option}}">{{option}}</option>' +
								          	'</select>' +
								          '</div>' +
								        '</div>' +
								        '<div ng-if="layout.bg_image" class="form-field col-xs-3">' +
								          '<label class="col-xs-6">Attachment: </label>' +
								          '<div class="col-xs-6">' +
								          	'<select class="form-control" ng-model="layout.bg_image_attachment">' +
								          		'<option ng-repeat="option in bg_attachment_options" value="{{option}}">{{option}}</option>' +
								          	'</select>' +
								          '</div>' +
								        '</div>' +
								    '</div>' +
							    '</uib-tab>' +
							    '<uib-tab index="2" heading="Sub Header">' +
							      '<div class="row">' +
							      	'<div class="col-xs-12 form-heading">' +
							      		'<h3>Background</h3>' +
							      	'</div>' +
							        '<div class="form-field col-xs-6">' +
							          '<label class="col-xs-3">Image:</label>' +
							          '<div class="col-xs-9">' +
								        	'<input class="form-control" name="subheader_bg_image" type="file" filereader />' +
							          '</div>' +
							        '</div>' +
							        '<div class="form-field col-xs-6">' +
							          '<label class="col-xs-3">Color: </label>' +
							          '<div class="col-xs-9">' +
							            '<div colorpicker class="colorpicker-btn" style="background-color:{{layout.subheader_bg_color}};" ng-model="layout.subheader_bg_color"></div>' +
							            '<input type="text" class="form-control colorpicker-text" ng-model="layout.subheader_bg_color"/>' +
							          '</div>' +
							        '</div>' +
							        '<div ng-if="layout.subheader_bg_image || layout.subheader_bg_color" class="form-field col-xs-3">' +
							          '<label class="col-xs-6">Height: </label>' +
							          '<div class="col-xs-6">' +
							            '<input type="text" ng-model="layout.subheader_height" class="form-control"/>' +
							          '</div>' +
							        '</div>' +
							        '<div ng-if="layout.subheader_bg_image" class="form-field col-xs-3">' +
							          '<label class="col-xs-6">Size: </label>' +
							          '<div class="col-xs-6">' +
							          	'<select class="form-control" ng-model="layout.subheader_bg_size">' +
							          		'<option ng-repeat="option in bg_size_options" value="{{option}}">{{option}}</option>' +
							          	'</select>' +
							          '</div>' +
							        '</div>' +
							        '<div ng-if="layout.subheader_bg_image" class="form-field col-xs-3">' +
							          '<label class="col-xs-6">Repeat: </label>' +
							          '<div class="col-xs-6">' +
							          	'<select class="form-control" ng-model="layout.subheader_bg_repeat">' +
							          		'<option ng-repeat="option in bg_repeat_options" value="{{option}}">{{option}}</option>' +
							          	'</select>' +
							          '</div>' +
							        '</div>' +
							        '<div ng-if="layout.subheader_bg_image" class="form-field col-xs-3">' +
							          '<label class="col-xs-6">Position: </label>' +
							          '<div class="col-xs-6">' +
							          	'<select class="form-control" ng-model="layout.subheader_bg_position">' +
							          		'<option ng-repeat="option in bg_position_options" value="{{option}}">{{option}}</option>' +
							          	'</select>' +
							          '</div>' +
							        '</div>' +
							      	'<div class="col-xs-12 form-heading">' +
							      		'<h3>Title</h3>' +
							      	'</div>' +
							        '<div class="form-field col-xs-12">' +
							          '<label class="col-xs-2">Text: </label>' +
							          '<div class="col-xs-10">' +
							            '<input type="text" class="form-control" ng-model="layout.subheader_title_text"/>' +
							          '</div>' +
							        '</div>' +
							        '<div ng-if="layout.subheader_title_text" class="form-field col-xs-12">' +
							          '<label class="col-xs-2">Color:</label>' +
							          '<div class="col-xs-10">' +
							            '<div colorpicker class="colorpicker-btn" style="background-color:{{layout.subheader_text_color}};" ng-model="layout.subheader_text_color"></div>' +
							            '<input type="text" class="colorpicker-text form-control" ng-model="layout.subheader_text_color"></span>' +
							          '</div>' +
							        '</div>' +
							        '<div ng-if="layout.subheader_title_text" class="form-field col-xs-12">' +
							          '<label class="col-xs-2">Margin: </label>' +
							          '<div class="col-xs-10">' +
							          	'<div class="input-label-container">' +
								          	'<label>Top</label>' +
								            '<input type="text" class="form-control" ng-model="layout.subheader_title_margin_top"/>' +
							            '</div>' +
							          	'<div class="input-label-container">' +
								          	'<label>Left</label>' +
								            '<input type="text" class="form-control" ng-model="layout.subheader_title_margin_left"/>' +
							            '</div>' +
							          '</div>' +
							        '</div>' +
							      '</div>' +
							    '</uib-tab>' +
							    '<uib-tab index="3" heading="Content">' +
							        '<div class="row">' +
								        '<div class="form-field col-xs-4">' +
								          '<label class="col-xs-6">Foreground:</label>' +
								          '<div class="col-xs-6" style="padding:0;">' +
								            '<div colorpicker class="colorpicker-btn" style="background-color:{{layout.fg_color}};" ng-model="layout.fg_color"></div>' +
								            '<input type="text" class="colorpicker-text form-control" ng-model="layout.fg_color"/>' +
								          '</div>' +
								        '</div>' +
								        '<div class="form-field col-xs-4">' +
								          '<label class="col-xs-6">2nd Foreground:</label>' +
								          '<div class="col-xs-6" style="padding:0;">' +
								            '<div colorpicker class="colorpicker-btn" style="background-color:{{layout.fg_color_secondary}};" ng-model="layout.fg_color_secondary"></div>' +
								            '<input type="text" class="colorpicker-text form-control" ng-model="layout.fg_color_secondary"/>' +
								          '</div>' +
								        '</div>' +
								        '<div class="form-field col-xs-4">' +
								          '<label class="col-xs-6">Heading:</label>' +
								          '<div class="col-xs-6" style="padding:0;">' +
								            '<div colorpicker class="colorpicker-btn" style="background-color:{{layout.heading_color}};" ng-model="layout.heading_color"></div>' +
								            '<input type="text" class="colorpicker-text form-control" ng-model="layout.heading_color"/>' +
								          '</div>' +
								        '</div>' +
							        '</div>' +
							        '<div class="row">' +
								        '<div class="form-field col-xs-4">' +
								          '<label class="col-xs-6">Text:</label>' +
								          '<div class="col-xs-6" style="padding:0;">' +
								            '<div colorpicker class="colorpicker-btn" style="background-color:{{layout.text_color}};" ng-model="layout.text_color"></div>' +
								            '<input type="text" class="colorpicker-text form-control" ng-model="layout.text_color"></span>' +
								          '</div>' +
								        '</div>' +
								        '<div class="form-field col-xs-4">' +
								          '<label class="col-xs-6">Subtext:</label>' +
								          '<div class="col-xs-6" style="padding:0;">' +
								            '<div colorpicker class="colorpicker-btn" style="background-color:{{layout.subtext_color}};" ng-model="layout.subtext_color"></div>' +
								            '<input type="text" class="colorpicker-text form-control" ng-model="layout.subtext_color"/>' +
								          '</div>' +
								        '</div>' +
								        '<div class="form-field col-xs-4">' +
								          '<label class="col-xs-6">Link:</label>' +
								          '<div class="col-xs-6" style="padding:0;">' +
								            '<div colorpicker class="colorpicker-btn" style="background-color:{{layout.link_color}};" ng-model="layout.link_color"></div>' +
								            '<input type="text" class="colorpicker-text form-control" ng-model="layout.link_color"/>' +
								          '</div>' +
								        '</div>' +
							        '</div>' +
							        '<div class="row">' +
								        '<div class="form-field col-xs-4">' +
								            '<label class="col-xs-6">button bg:</label>' +
								            '<div class="col-xs-6" style="padding:0;">' +
								            	'<div colorpicker class="colorpicker-btn" style="background-color:{{layout.btn_bg_color}};" ng-model="layout.btn_bg_color"></div>' +
								            	'<input type="text" class="colorpicker-text form-control" ng-model="layout.btn_bg_color"/>' +
								            '</div>' +
								        '</div>' +
								        '<div class="form-field col-xs-4">' +
								            '<label class="col-xs-6">button text:</label>' +
								            '<div class="col-xs-6" style="padding:0;">' +
								            	'<div colorpicker class="colorpicker-btn" style="background-color:{{layout.btn_text_color}};" ng-model="layout.btn_text_color"></div>' +
								            	'<input type="text" class="colorpicker-text form-control" ng-model="layout.btn_text_color"/>' +
								            '</div>' +
								        '</div>' +
								        '<div class="form-field col-xs-4">' +
								            '<label class="col-xs-6">button text:</label>' +
								            '<div class="col-xs-6" style="padding:0;">' +
								            	'<div colorpicker class="colorpicker-btn" style="background-color:{{layout.btn_border_color}};" ng-model="layout.btn_border_color"></div>' +
								            	'<input type="text" class="colorpicker-text form-control" ng-model="layout.btn_border_color"/>' +
								            '</div>' +
								        '</div>' +
							        '</div>' +
							    '</uib-tab>' +
							'</uib-tabset>' +
							'<!-- /layout config tabs -->' +
							'<hr/>' +
							'<channel-layout-css ng-init="initChannelLayoutCss(layout)"></channel-layout-css>' +
							'<div class="layout-preview-container">' +
								'<div class="preview-body">' +
									'<site-header ng-init="initLayoutPreviewView()"></site-header>' +
									'<subheader ng-init="initSubHeader(layout)"></subheader>' +
									'<main id="main-content" class="container">' +
										'<section class="main-content col-xs-9 fg-color">' + 
											'<topic-list></topic-list>' +
										'</section>' +
										'<section class="col-xs-3">' +
											'<sidebar></sidebar>' +
										'</sectio>' +
									'</main>' +
								'</div>' +
							'</div>' +
							'<hr/>' +
							'<button ng-if="mode === \'new\'" ng-hide="loading" class="btn primary-btn" ng-click="onCreateItem(layout)">submit</button>' +
							'<button ng-if="mode === \'edit\'" ng-hide="loading" class="btn primary-btn" ng-click="onUpdateItem(layout)">update</button>' +
							'<span ng-show="loading" class="loader"></span>' +
						'</section>';

		return {
			restrict: 'E',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);