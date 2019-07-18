/* global google */

(function () {
    'use strict';
    window.AppUtils = {
        getRamdon: function () {
            var epoch = new Date().getTime();
            var ram = undefined;
            while (!ram) {
                ram = Math.random().toString().split(".")[1];
                if (ram.length > 5) {
                    ram = ram.substring(0, 5);
                } else {
                    ram = undefined;
                }
            }
            return epoch+''+ram;
        },
        resizingMap: function (map) {
            var center = map.getCenter();
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
        },
        cutString: function (string, max) {
            if (string.length > max) {
                return string.substr(0, max) + "...";
            }
            return string;
        },
        mapType: function (type) {
            if(!type){ return '';}
            // Transforma mimetype en tipo de archivo legible
            var tempType = type.split("/").pop();
            var regex = /^.*\.(.*)$/g;
            var msType = regex.exec(tempType);
            if (msType && msType.length > 1) {
                tempType = msType[1];
            }
            type =  tempType;
            // Obtener className según tipo de archivo
            var className;
            switch (type) {
                case "ms-excel": case "sheet":
                    className = "excel";
                    break;
                case "ms-word": case "document":
                    className = "word";
                    break;
                case "ms-powerpoint": case "presentation": case "slideshow":
                    className = "powerpoint";
                    break;
                case "pdf":
                    className = "pdf";
                    break;
                case "jpeg": case "jpg": case "png": case "gif":
                    className = "image";
                    break;
                default:
                    className = "archive";
            }
            return className;
        },
        toHumanSize: function(size) {
            var i = Math.floor(Math.log(size) / Math.log(1024));
            return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
        },
        getWatchers: function(root){
            root = angular.element(root || document.documentElement);
            var watcherCount = 0;

            function getElemWatchers(element) {
                var isolateWatchers = getWatchersFromScope(element.data().$isolateScope);
                var scopeWatchers = getWatchersFromScope(element.data().$scope);
                var watchers = scopeWatchers.concat(isolateWatchers);
                angular.forEach(element.children(), function (childElement) {
                watchers = watchers.concat(getElemWatchers(angular.element(childElement)));
                });
                return watchers;
            }
            function getWatchersFromScope(scope) {
                if (scope) {
                return scope.$$watchers || [];
                } else {
                return [];
                }
            }
            return getElemWatchers(root);
        }
    };
})();
