app.factory('Moderation', [
	function() {
		var Moderation = {};
		Moderation.findCurrentItemModeration = function(moderations,mod){
			var c_mod;
			moderations.forEach(function(moderation,index){
				if (moderation.item_type === mod.item_type && 
					moderation.item_id === mod.item_id &&
					moderation.current === true){
					moderation.current = false;
					c_mod = {
						moderation:moderation,
						index:index
					};
				}
			});
			return c_mod;
		};
		return Moderation;
	}
]);