app.directive("filereader", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                console.log();
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        // file name
                        var file_name = changeEvent.target.files[0].name.split(' ').join('_').normalize('NFKD').replace(/[\u0300-\u036F]/g, '').replace(/ß/g,"ss");
                        file_name = file_name.replace(/([^a-z0-9]+)/gi, '-');
                        // get file type
                        var splitByLastDot = function(text) {
                            var index = text.lastIndexOf('.');
                            return [text.slice(0, index), text.slice(index + 1)]
                        }
                        // file obj
                        var file = {
                            data_uri:loadEvent.target.result,
                            file_type:splitByLastDot(changeEvent.target.files[0].name)[1],
                            name:file_name,
                            model_name:element[0].name
                        };
                        scope.$parent.onReadFile(file);
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);