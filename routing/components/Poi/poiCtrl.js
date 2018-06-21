angular.module('myApp')
.controller('poiCtrl', ['$location', '$timeout', '$scope', '$http', '$routeParams', 'myLocalStorage', 'favoritPoisManage', function($location, $timeout, $scope, $http, $routeParams, myLocalStorage, favoritPoisManage){
    
    let self = this
    let serverUrl = myLocalStorage.getLocalStorage('ServerUrl')

    self.AllPois = true

    self.goldStarImgUrl = favoritPoisManage.goldStarImgUrl
    self.blackStarImgUrl = favoritPoisManage.blackStarImgUrl
    self.reviewImgUrl = favoritPoisManage.addReviewImgUrl
    self.manImgUrl = favoritPoisManage.manImgUrl
    self.categoryToShow = 'all'
    self.categories = myLocalStorage.getLocalStorage('categories')
    self.poiArray = []
    self.message = ""
    self.numberOfFavorit = 0
    self.connected = false
    self.reviewPoi = {}
    self.indexArray = []
    self.newIndexArray = []
    self.newPoiOrder = []

    self.initalize = function(){
        favoritPoisManage.initalize()
        self.numberOfFavorit = favoritPoisManage.getNumberOfFavorits()

        let type = $routeParams.type
        if(type.localeCompare('favorit') === 0){
            self.AllPois = false
            self.poiArray = favoritPoisManage.favoritPoisArrayInfo
            self.connected = true
            self.indexArray = Array.apply(null, {length: self.numberOfFavorit + 1}).map(Number.call, Number)
            self.indexArray.splice(0, 1)
            self.newIndexArray = []
            self.newPoiOrder = []
        }
        else{
            let pois = myLocalStorage.getLocalStorage('pois')
            angular.forEach(pois, function(value, key){
                self.poiArray.push(value)
            })
            if($scope.appCtrl.username.localeCompare('guest')!=0)
                self.connected = true
        }
    }

    self.goToPoiDetails = function(poiId){
        $location.path('/poiDetails/' + poiId)
    }

    self.check = function(poiName, searchedName){
        let lower_poiName = (poiName + "").toLowerCase()
        let lower_serchedName = (searchedName + "").toLowerCase()
        if(lower_poiName.localeCompare(lower_serchedName)===0){
            self.found = true
            return true
        }
        return false
    }

    self.addRemoveFavorit = function(poiId){
        self.message = favoritPoisManage.addRemoveFavorit(poiId)
        self.numberOfFavorit = favoritPoisManage.getNumberOfFavorits()
        if(!self.AllPois){
            self.poiArray = favoritPoisManage.favoritPoisArrayInfo
            self.indexArray = Array.apply(null, {length: self.numberOfFavorit + 1}).map(Number.call, Number)
            self.indexArray.splice(0, 1)
            for(var i=0;i<self.newPoiOrder.length;i++){
                if(self.newPoiOrder[i].id === poiId){
                    let poiOrder_idx = self.newPoiOrder[i].index
                    self.newPoiOrder.splice(i,1)
                    poiOrder_idx = self.newIndexArray.indexOf(poiOrder_idx)
                    if(poiOrder_idx > -1)
                        self.newIndexArray.splice(poiOrder_idx,1)
                }
            }
        }
        $timeout(function() {
            self.message = "";
        }, 2000)
    }

    self.saveFavoritPoiToServer = function(){
        favoritPoisManage.saveInServer()
        .then(function(result){
            alert(result)
            if(!self.AllPois)
                location.reload()
        })
        .catch(function(err){
            alert(err)
        });
    }

    self.isFavorit = function(poiId){
        return favoritPoisManage.isFavorit(poiId)
    }

    self.addReview = function(){
        let rank = "0"
        if(document.getElementById("rank_1").checked)
            rank="1"
        else if(document.getElementById("rank_2").checked)
            rank="2"
        else if(document.getElementById("rank_3").checked)
            rank="3"
        else if(document.getElementById("rank_4").checked)
            rank="4"
        else if(document.getElementById("rank_5").checked)
            rank="5"
        
        let promise1 = {}
        let promise2 = {}
        if(rank.localeCompare("0")!=0){
            var obj = {locationId: self.reviewPoi.id, rate: rank}
            promise1 = $http.put(serverUrl + 'reg/locations/rateLocation', obj)
        }
        else{
            if(!self.review || self.review.length===0){
                alert('you didnt enter review or rank')
                return
            }
            else
                promise1 = Promise.resolve()
        }

        if(self.review && self.review.length > 0){
            var obj = {locationId: self.reviewPoi.id, review: self.review}
            promise2 = $http.post(serverUrl + 'reg/locations/addReview', obj)
        }
        else
            promise2 = Promise.resolve()
        
        Promise.all([promise1, promise2])
        .then(function(results){
            if(results[1] && !results[1].data.success)
                alert("you cant review the same point of intrest more then one time")
            else{
                alert("thank you for review!")
                if(results[0]){
                    $http.get(serverUrl + 'general/locationInfo/' + self.reviewPoi.id)
                    .then(function(result){
                        let pois = myLocalStorage.getLocalStorage('pois')
                        pois[self.reviewPoi.id] = result.data.locationObject[0]
                        myLocalStorage.updateLocalStorage('pois', pois)
                        for(var i=0;i<self.poiArray.length;i++){
                            if(self.poiArray[i].id === self.reviewPoi.id){
                                self.poiArray[i].rate = result.data.locationObject[0].rate
                                self.poiArray[i].rateCounter = result.data.locationObject[0].rateCounter
                                self.reviewPoi = self.poiArray[i]
                                endOfReview()
                                return
                            }
                        }
                    })
                }
            }
        })
        .catch(function(err){
            alert("something went wrong while tring to add review")
            endOfReview()
        })
    }

    let endOfReview = function(){
        self.closeDialog()
        self.review = ""
        document.getElementById("rank_1").checked = false
        document.getElementById("rank_2").checked = false
        document.getElementById("rank_3").checked = false
        document.getElementById("rank_4").checked = false
        document.getElementById("rank_5").checked = false
    }

    self.closeDialog = function(){
        document.getElementById("reviewDialog").close()
        self.reviewPoi = {}
    }

    self.openDialog = function(poi){
        self.reviewPoi = poi
        document.getElementById("reviewDialog").showModal()
    }

    self.goToFavoritPage = function(){
        $location.path('/poi/favorit')
    }

    self.addIndex = function(poi){
        order = self.selectedOption[poi.id]

        if(!order)
            return
        if(self.newIndexArray.indexOf(order) > -1){
            alert('you cant have two point of intrest with the same index')
            for(var i=0;i<self.newPoiOrder.length;i++){
                if(poi.id === self.newPoiOrder[i].id){
                    self.selectedOption[poi.id] = self.newPoiOrder[i].index
                    return
                }
            }
            self.selectedOption[poi.id] = ""
            return
        }
        for(var i=0;i<self.newPoiOrder.length;i++){
            if(self.newPoiOrder[i].id === poi.id){
                let oldOrder_idx = self.newIndexArray.indexOf(self.newPoiOrder[i].index)
                self.newIndexArray.splice(oldOrder_idx, 1)
                self.newPoiOrder.splice(i, 1)
            }
        }
        self.newIndexArray.push(order)
        self.newPoiOrder.push({id: poi.id, index: order})
    }

    self.saveNewOrder = function(){
        if(self.newIndexArray.length < self.indexArray.length){
            alert("you didnt choose order for all point of intrest")
            return
        }
        else{
            favoritPoisManage.reOrder(self.newPoiOrder)
            self.poiArray = favoritPoisManage.favoritPoisArrayInfo
            self.selectedOption = {}
            self.newPoiOrder = []
            self.newIndexArray = []
            alert("new order saved!")
        }
    }
}])

