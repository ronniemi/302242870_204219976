angular.module('myApp')
.service('favoritPoisManage', ['$http', 'myLocalStorage', function($http, myLocalStorage){

    let self = this
    let serverUrl = myLocalStorage.getLocalStorage('ServerUrl')

    self.goldStarImgUrl = "../../assets/filled-star.png"
    self.blackStarImgUrl = "../../assets/star.png"
    self.addReviewImgUrl = "../../assets/comments.png"
    self.manImgUrl = "../../assets/32441.png"
    self.favoritPoisArray = []
    self.favoritPoisArrayInfo = []

    self.initalize = function(){
        self.favoritPoisArray = myLocalStorage.getLocalStorage('favoritPois')
        if(!self.favoritPoisArray){
            self.favoritPoisArray = []
            $http.get(serverUrl + 'reg/locations/favoriteLocations')
            .then(function(responce){
                for(var i=0;i<responce.data.length;i++){
                    self.favoritPoisArray.push({id: responce.data[i].id, index: responce.data[i].index})
                    self.favoritPoisArrayInfo.push(responce.data[i])
                }
                myLocalStorage.addLocalStorage('favoritPois', self.favoritPoisArray)
            }, function(responce){
                console.log('err while tring to get favorutLocation from server')
            })
        }
        else{
            self.favoritPoisArrayInfo = []
            let pois = myLocalStorage.getLocalStorage('pois')
            angular.forEach(pois, function(value, key){
                for(var i=0;i<self.favoritPoisArray.length;i++){
                    if(self.favoritPoisArray[i].id === value.id){
                        let loctionInfo = value
                        value['index'] = self.favoritPoisArray[i].index
                        self.favoritPoisArrayInfo.push(loctionInfo)
                    }
                }
            })
        }
    }

    self.addRemoveFavorit = function(poiId){
        let message = ""
        var poiIndex = 0
        var deleted = false
        for(poiIndex=0;poiIndex<self.favoritPoisArray.length;poiIndex++){
            if(self.favoritPoisArray[poiIndex].id === poiId){
                let poiOrder = self.favoritPoisArray[poiIndex].index
                self.favoritPoisArray.splice(poiIndex, 1)
                removeFromPoisInfo(poiId)
                self.favoritPoisArray = self.updatePoiIndex(poiOrder, self.favoritPoisArray)
                self.favoritPoisArrayInfo = self.updatePoiIndex(poiOrder, self.favoritPoisArrayInfo)
                message = "point of intrest removed from favorits"
                deleted = true
                break
            }
        }
        if(!deleted){
            self.favoritPoisArray.push({id: poiId, index: poiIndex+1})
            addToPoisInfo(poiId, poiIndex+1)
            message = "point of intrest added to favorits"
        }
        myLocalStorage.updateLocalStorage('favoritPois', self.favoritPoisArray)
        return message
    }

    self.updatePoiIndex = function(indexDeleted, array){
        let sortedByIndex = array.sort((a, b) => parseFloat(a.index) - parseFloat(b.index));
        for(var i=indexDeleted-1;i<sortedByIndex.length;i++){
            sortedByIndex[i].index = sortedByIndex[i].index - 1
        }
        return sortedByIndex
    }

    self.reOrder = function(newOrder){
        self.favoritPoisArray = reOrderArray(newOrder, self.favoritPoisArray)
        self.favoritPoisArrayInfo = reOrderArray(newOrder, self.favoritPoisArrayInfo)
        myLocalStorage.updateLocalStorage('favoritPois', self.favoritPoisArray)
        self.saveInServer()
    }

    let reOrderArray = function(newOrder, array){
        for(var i=0;i<newOrder.length;i++){
            for(var j=0; j<array.length;j++){
                if(newOrder[i].id === array[j].id)
                    array[j].index = newOrder[i].index
            }
        }
        return array
    }

    let removeFromPoisInfo = function(poiId){
        for(var i=0;i<self.favoritPoisArrayInfo.length;i++){
            if(self.favoritPoisArrayInfo[i].id === poiId){
                self.favoritPoisArrayInfo.splice(i,1)
                return
            }
        }
    }

    let addToPoisInfo = function(poiId, poiIndex){
        let pois = myLocalStorage.getLocalStorage('pois')
        angular.forEach(pois, function(value, key){
            if(value.id === poiId){
                let loctionInfo = value
                loctionInfo['index'] = poiIndex
                self.favoritPoisArrayInfo.push(loctionInfo)
                return
            }
        })
    }

    self.saveInServer = function(){
        if(self.favoritPoisArray.length > 0){
            let promise = new Promise(function(resolve, reject){
                let favoritPoisArrayIds = []
                let sortedByIndex = self.favoritPoisArray.sort((a, b) => parseFloat(a.index) - parseFloat(b.index));
                for(var i=0;i<sortedByIndex.length;i++){
                    favoritPoisArrayIds.push(sortedByIndex[i].id)
                }
                let obj = {favoriteLocations: favoritPoisArrayIds}
                $http.put(serverUrl + 'reg/locations/updateFavoriteList', obj)
                .then(function(responce){
                    resolve("favorit point of intrest saved!")
                }, function(responce){
                    reject("somthing went wrong while tring to save favorit point of intrest")
                })
            })
            return promise
        }
        else
            return Promise.resolve("there is no favorit point of intrest to save")
    }

    self.getNumberOfFavorits = function(){
        return self.favoritPoisArray.length
    }

    self.isFavorit = function(poiId){
        for(var i=0;i<self.favoritPoisArray.length;i++){
            if(self.favoritPoisArray[i].id === poiId)
                return true
        }
        return false
    }
}])