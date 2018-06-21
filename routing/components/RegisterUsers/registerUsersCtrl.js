angular.module('myApp')
    .controller('registerUsersCtrl', ['$http', '$location', 'myLocalStorage', 'setHeadersToken', 'favoritPoisManage', function($http, $location, myLocalStorage, setHeadersToken, favoritPoisManage){
        
        let self = this
        let ServerUrl = myLocalStorage.getLocalStorage('ServerUrl')

        self.popularPois = []
        self.lastPois = []
        self.haveLastPois = true

        self.initilaize = function(){
            $http.get(ServerUrl + 'reg/locations/mostPopularLocationsForUser')
            .then(function(responce){
                self.popularPois = responce.data
            }, function(responce){
                alert("something went wrong while tring to connect to server")
            }) 

            $http.get(ServerUrl + 'reg/locations/lastSavedLocations')
            .then(function(responce){
                let pois = myLocalStorage.getLocalStorage('pois')
                if(responce.data.length > 0){
                    self.haveLastPois = true
                    for(i=0;i<2;i++){
                        let id = responce.data[i].locationId
                        self.lastPois.push(pois[id])
                    }
                }
                else
                    self.haveLastPois = false
            }, function(responce){
                alert("something went wrong while tring to connect to server")
            })
            favoritPoisManage.initalize()
        }

        self.goToPoiDetails = function(poiId){
            $location.path('/poiDetails/' + poiId)
        }
    }])