app.directive('itemEditToolbar', ['Item',
  function(Item) {

    // item edit toolbar controller
    var controller = function($scope,$element) {

      // set item
      $scope.setItem = function(item){
        $scope.item = Item.determineItemTypeId(item);
      };
    
      // toggle visibility
      $scope.toggleVisibility = function(item){
        if (item.item_type === 'topic'){
          $scope.toggleTopicVisibility(item);
        } else if (item.item_type === 'comment'){
          $scope.toggleCommentVisibility(item);
        }
      };

      // toggle sticky
      $scope.toggleSticky = function(item,channel){
        if (channel.sticky_id !== item[$scope.item_type + '_id'] || !channel.sticky_id){
          if (item.item_type === 'topic'){
            $scope.addStickyTopic(item,channel);
          } else if (item.item_type === 'comment'){
            $scope.addStickyComment(item,channel);
          }
        } else {
          if (item.item_type === 'topic'){
            $scope.removeStickyTopic(item,channel);
          } else if (item.item_type === 'comment'){
            $scope.removeStickyComment(item,channel);
          }
        }
      };

    };

    var template =  '<div class="item-edit-toolbar fg-color-secondary" ng-if="view === \'user-admin\' || view === \'moderate\' || view === \'edit\'">' +
                        '<div ng-if="item.item_type && item.item_id">' +
                            '<!-- edit item -->' +
                            '<a ng-if="item.user_id === page.site_info.cert_user_id && item.item_type !== \'comment\'" href="index.html?view:edit+section:{{item.item_type}}+{{item.item_id}}={{item[item.item_id]}}">' +
                              '<i uib-tooltip="edit {{item.item_type}}" class="fa fa-pencil-square-o" aria-hidden="true"></i>' +
                            '</a>' +
                            '<a ng-if="item.user_id === page.site_info.cert_user_id && item.item_type === \'comment\'" ng-click="editComment(item)">' +
                              '<i uib-tooltip="edit {{item.item_type}}" class="fa fa-pencil-square-o" aria-hidden="true"></i>' +
                            '</a>' +
                            '<!-- /edit item -->' +
                            '<!-- moderate item -->' +
                            '<a ng-if="item.user_id !== page.site_info.cert_user_id && item.item_type !== \'comment\'" href="index.html?view:moderate+section:{{item.item_type}}+{{item.item_id}}={{item[item.item_id]}}">' +
                              '<i uib-tooltip="moderate {{item.item_type}}" class="fa fa-pencil-square-o" aria-hidden="true"></i>' +
                            '</a>' +
                            '<!-- /moderate -->' +
                            '<!-- toggle visibility --> ' +
                            '<a href="#" ng-if="item.item_type !== \'channel\'" ng-click="toggleVisibility(item)" class="toggle-visibility">' +
                              '<i ng-if="item.moderation.visible === 1 || !item.moderation" uib-tooltip="hide {{item.item_type}}" class="fa fa-eye"></i>' +
                              '<i ng-if="item.moderation.visible === 0" uib-tooltip="show {{item.item_type}}" class="fa fa-eye-slash"></i>' +
                            '</a>' +
                            '<!-- /toggle visibility --> ' +
                            '<!-- toggle sticky -->' +
                            '<a href="#" ng-if="item.item_type === \'topic\' && section === \'channel\'" ng-click="toggleSticky(item,channel)" class="toggle-sticky">' +
                              '<i ng-if="item.channel.sticky_id === item.topic_id" uib-tooltip="unset {{item.item_type}} sticky" class="fa fa-star"></i>' +
                              '<i ng-if="item.channel.sticky_id !== item.topic_id" uib-tooltip="set {{item.item_type}} sticky" class="fa fa-star-o"></i>' +
                            '</a>' +                            
                            '<!-- /toggle featured -->' +
                        '</div>' +
                    '</div>';

    return {
      restrict: 'AE',
      replace:false,
      controller: controller,
      template:template
    }

  }
]);            