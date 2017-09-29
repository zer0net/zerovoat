app.factory('Channel', [
	function() {
		var Channel = {};

		// generate topic query
		Channel.generateUserChannelsQuery = function(user,section){
			console.log(user);
			console.log(section);
		};


		// find cluster in merger sites list
		Channel.findClusterInMergerSiteList = function(cluster,sites){
			for (var site in sites) {
			    if (sites[site].address === cluster.cluster_id){
			    	for (var attr in sites[site]){
			    		cluster[attr] = sites[site][attr]
			    	}
			    }
			}
			return cluster;
		};

		return Channel;
	}
]);