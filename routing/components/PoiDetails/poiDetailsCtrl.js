angular.module('myApp')
    .controller('poiDetailsCtrl', ['$scope', '$http', '$routeParams', '$timeout', 'myLocalStorage', 'favoritPoisManage', function ($scope, $http, $routeParams, $timeout, myLocalStorage, favoritPoisManage) {

        let self = this
        let serverUrl = myLocalStorage.getLocalStorage('ServerUrl')

        self.goldStarImgUrl = favoritPoisManage.goldStarImgUrl
        self.blackStarImgUrl = favoritPoisManage.blackStarImgUrl
        self.poi = {}
        self.poiId = $routeParams.poiId
        self.mapCor = {
            1:{id:1, x:43.642, y:-79.376},
            2:{id:2, x:43.643, y:-79.387},
            3:{id:3, x:43.647, y:-79.377},
            4:{id:4, x:43.668, y:-79.395},
            5:{id:5, x:43.642, y:-79.386},
            6:{id:6, x:43.820, y:-79.183},
            7:{id:7, x:43.620, y:-79.374},
            8:{id:8, x:43.843, y:-79.542},
            9:{id:9, x:43.655, y:-79.387},
            10:{id:10, x:43.654, y:-79.393},
            11:{id:11, x:43.609, y:-79.750},
            12:{id:12, x:43.654, y:-79.380},
            13:{id:13, x:43.669, y:-79.391},
            14:{id:14, x:43.653, y:-79.398},
            15:{id:15, x:43.650, y:-79.392},
            16:{id:16, x:43.644, y:-79.388},
            17:{id:17, x:43.650, y:-79.375},
            18:{id:18, x:43.657, y:-79.383},
            19:{id:19, x:43.657, y:-79.383},
            20:{id:20, x:43.657, y:-79.383}
        }


        self.message = ""
        self.connected = false

        self.initilaize = function () {
            $http.get(serverUrl + 'general/locationInfo/' + self.poiId)
            .then(function (responce) {
                self.poi = responce.data
                self.createMap()
                if (self.poi.reviews.length > 2) {
                    let allReviews = self.poi.reviews
                    let reviewSortDate = allReviews.sort((a, b) => new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime());
                    let only2reviews = []
                    only2reviews.push(reviewSortDate[reviewSortDate.length-2])
                    only2reviews.push(reviewSortDate[reviewSortDate.length-1])
                    self.poi.reviews = only2reviews
                }
                }, function (responce) {
                console.log(responce)         
            })
            if ($scope.appCtrl.username.localeCompare('guest') != 0)
                self.connected = true
        }

        self.addRemoveFavorit = function (poiId) {
            self.message = favoritPoisManage.addRemoveFavorit(poiId)

            $timeout(function () {
                self.message = "";
            }, 2000)
        }

        self.isFavorit = function (poiId) {
            return favoritPoisManage.isFavorit(poiId)
        }


        //for map
        $scope.$on("$destroy", function () {
            self['id' + self.poiId] = false

        });


        self.addRemoveFavorit = function (poiId) {
            self.message = favoritPoisManage.addRemoveFavorit(poiId)

            $timeout(function () {
                self.message = "";
            }, 2000)
        }

        self.saveFavoritPoiToServer = function () {
            favoritPoisManage.saveInServer()
                .then(function (result) {
                    alert(result)
                })
                .catch(function (err) {
                    alert(result)
                });
        }

        self.isFavorit = function (poiId) {
            return favoritPoisManage.isFavorit(poiId)
        }

        //maps
        self.createMap = function(){
            let x = self.mapCor[self.poiId].x
            let y = self.mapCor[self.poiId].y

            var mymap1 = L.map('map').setView([43.653, -79.38], 9);
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mymap1);
            L.marker([x, y]).addTo(mymap1).bindPopup(self.poi.locationObject[0].name).openPopup();

        }
    }])