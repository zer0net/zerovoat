app.factory('Route', [
	function() {
		
		var Route = {};

		// get view from url
		Route.getView = function(url,site_address){
			var view = '';
			// config view
			url = url.split(site_address + '/')[1];
			if (url === '' || url === 'index.html'){
				view = 'main';
			} else {
				if (url.indexOf('view:') > -1){
					view = url.split('view:')[1];
					if (view.indexOf('+') > -1){
						view = view.split('+')[0];
					}
				}
			}
			return view;
		};

		// get section from url
		Route.getSection = function(url,view){
			var section = url.split('section:')[1];
			if (section){
				if (section.indexOf('+') > -1){
					section = section.split('+')[0];
				}
			} else {
				section = 'main';
			}
			return section;
		};

		return Route;
	}
]);