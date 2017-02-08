app.directive('channelLayoutCss', [
  function() {

    // channel list controller
    var controller = function($scope,$element) {

    	// init channel layout css
	    $scope.initChannelLayoutCss = function(layout){
	      	$scope.layout = layout;
	      	if ($scope.view === 'edit'){
		      	$scope.root_html_container = '.layout-preview-container';
		      	$scope.root_html_body = '.preview-body';
		    } else {
		    	$scope.root_html_container = '';
		    	$scope.root_html_body = 'body';
		    }
	    };
    };

    var template =  '<style>' +
						'{{root_html_container}} {{root_html_body}} {' +
						    'background-color: {{layout.bg_color}} !important;' +
						    'background-image: url({{layout.bg_image}}) !important;' +
						    'background-attachment:{{layout.bg_image_attachment}};' +
						    'background-repeat:{{layout.bg_image_repeat}};' +
						    'background-position:{{layout.bg_image_position}};' +
						    'background-size:{{layout.bg_image_size}};' +
						    'color:{{layout.text_color}} !important;' +
						'}' +
						'{{root_html_container}} header {' +
						    'background-color: {{layout.header_bg_color}} !important;' +
						'}' +
						'{{root_html_container}} .fg-color,' +
						'{{root_html_container}} .comment .comment .comment{background-color: {{layout.fg_color}} !important;}' +
						'{{root_html_container}} .fg-color-secondary,' +
						'{{root_html_container}} .topic-item:nth-child(even),' +
						'{{root_html_container}} .comment .comment ,' +
						'{{root_html_container}} .well {background-color: {{layout.fg_color_secondary}} !important;}' +
						'{{root_html_container}} h1,' +
						'{{root_html_container}} h2,' +
						'{{root_html_container}} h3,' +
						'{{root_html_container}} h4,' +
						'{{root_html_container}} h5,' +
						'{{root_html_container}} h6 {color: {{layout.heading_color}} !important;}' +
						'{{root_html_container}} .subtext-color {color: {{layout.subtext_color}} !important;}' +
						'{{root_html_container}} .subheader {' +
						    'background-color: {{layout.subheader_bg_color}} !important;' +
						    'background-image: url({{layout.subheader_bg_image}}) !important;' +
						    'background-size: {{layout.subheader_bg_size}} !important;' +
						    'background-position: {{layout.subheader_bg_position}} !important;' +
						    'background-repeat: {{layout.subheader_bg_repeat}} !important;' +
						    'height:{{layout.subheader_height}}px !important;' +
						'}' +
						'{{root_html_container}} .subheader h1 {' +
							'margin-top:{{layout.subheader_title_margin_top}}px;' +
							'margin-left:{{layout.subheader_title_margin_left}}px;' +
							'color:{{layout.subheader_text_color}} !important;' +
						'}' +
						'{{root_html_container}} a {color: {{layout.link_color}} !important;}' +
						'{{root_html_container}} .btn {' +
							'background:{{layout.btn_bg_color}} !important;' +
							'color:{{layout.btn_text_color}} !important;' +
							'border-color:{{layout.btn_border_color}} !important;' +
						'}' +
					'</style>';

    return {
      restrict: 'AE',
      replace:false,
      controller: controller,
      template:template
    }

  }
]);            
							