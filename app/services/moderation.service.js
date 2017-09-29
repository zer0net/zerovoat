app.factory('Moderation', [
	function() {

		var Moderation = {};

		Moderation.findCurrentItemModeration = function(moderations,mod){
			var c_mod;
			moderations.forEach(function(moderation,index){
				if (moderation.item_type === mod.item_type && 
					moderation.item_id === mod.item_id &&
					moderation.moderation_type === mod.moderation_type &&
					moderation.current === true){
					c_mod = {
						moderation:moderation,
						index:index
					};
				}
			});
			return c_mod;
		};

		Moderation.renderItemModertaions = function(item,moderations,view){
			if (moderations.length > 0){
				if (moderations.length === 1){
					item.moderation = moderations[0];
				} else if (moderations.length > 1){
					item.moderations = moderations;
					// get most recent moderation item index
					var most_recent_index = 0;
					var most_recent = 0;
					item.moderations.forEach(function(moderation,index){
						if (moderation.added > most_recent){
							most_recent = moderation.added;
							most_recent_index = index;
						}
					});
					// assign to item moderation
					item.moderation = item.moderations[most_recent_index];
				}
				if (item.moderation){
					if (view === 'moderate' || view === 'edit' || view === 'user-admin'){
						item.visible = 1;
					} else {
						item.visible = item.moderation.visible;							
					}
				}
			} else {
				item.visible = 1;
			}
			return item;
		};
		return Moderation;
	}
]);