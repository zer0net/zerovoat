app.directive('moderatorForm', [
	function() {

		// channel layout interface controller
		var controller = function($scope,$element) {
     
		};

		var template = '<div id="moderator-form" class="form">' +
						  '<div class="form-field row">' +
						    '<label class="col-xs-2">select user:</label>' +
						    '<div class="col-xs-10" ng-init="getUsers(channel)">' +
						      '<select ng-model="moderator" class="form-control">' +
						        '<option ng-repeat="user in users" ng-bind="user.user_name" value="{{user.user_name}}"></option>' +
						      '</select>' +
						    '</div>' +
						  '</div>' +
						  '<div class="form-field row">' +
						    '<div class="col-xs-offset-2 col-xs-10">' +
						      '<button class="btn primary-btn" ng-click="addChannelModerator(moderator)">add moderator</button>' +
						    '</div>' +
						  '</div>' +
						  '<!-- /moderator form -->' +
						  '<!-- moderator list -->' +
						  '<hr ng-if="moderators"/>' +
						  '<section id="moderators-list" ng-if="moderators">' +
						    '<div class="row moderator-list-item" ng-repeat="moderator in moderators">' +
						      '<div class="col-xs-12">' +
						        '<ul>' +
						          '<li><span class="user-name">{{moderator.user_name}}</span></li>' +
						          '<li>channel mod since: <span am-time-ago="moderator.added"></span></li>' +
						          '<li moderations ng-init="getModerations(moderator)" ng-show="moderator.moderations.length > 0">' +
						          	'moderations:' +
						            '<ul>' +
						              '<li ng-repeat="moderation in moderator.moderations | orderBy:\'-added\'">' +
						                'moderated ' +
						                '<b>{{moderation.item_type}}:{{moderation.item_id}}</b> ' +
						                '<i>visibile:{{moderation.visible}}</i>  - ' +
						                '<span am-time-ago="moderation.added"></span>' +
						              '</li>' +
						            '</ul>' +
						          '</li>' +
						        '</ul>' +
						        '<hr ng-if="$index > moderators.length"/>' +
						      '</div>' +
						    '</div>' +
						  '</section>' +
						  '<!-- /moderator list -->' +
						'</div>';

		return {
			restrict: 'E',
			replace:false,
			controller: controller,
			template:template
		}

	}
]);