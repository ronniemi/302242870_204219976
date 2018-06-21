angular.module('myApp')
    .controller('myAppCtrl', ['$http', 'myLocalStorage', 'autenticateToken','jwtHelper', function($http, myLocalStorage, autenticateToken, jwtHelper){

        let self = this
        let serverUrl = 'http://localhost:3000/'
        self.username = 'guest'

        self.initilize = function(){
            let url = myLocalStorage.getLocalStorage('ServerUrl')
            if(!url){
                myLocalStorage.addLocalStorage('ServerUrl', serverUrl)
                $http.get(serverUrl + 'general/allLocations')
                .then(function(responce){
                    let pois = responce.data
                    let obj = {}
                    for(i=0;i<pois.length;i++){
                        let id = pois[i].id
                        obj[id] = pois[i]
                    }
                    myLocalStorage.addLocalStorage('pois', obj)
                }, function(responce){
                    console.log('Something went wrong while tring get pois from server')
                })

                let categories = []
                $http.get(serverUrl + 'general/allCategories')
                .then(function(responce){
                    angular.forEach(responce.data, function(obj) {
                        if(obj.category != 'not choosen')
                            categories.push(obj)
                    })
                    myLocalStorage.addLocalStorage('categories', categories)
                }, function(responce){
                    console.log('Something went wrong while tring get categories from server')
                })
            }
            else
                self.cheackToken()
        }

        self.cheackToken = function(){
            let token = myLocalStorage.getLocalStorage('token')
            if(token && autenticateToken.autenticate(token)){
                let payload = jwtHelper.decodeToken(token)
                self.username = payload.username
                self.admin = payload.admin
            }
            else{
                self.username = 'guest'
                self.admin = false
            }
        }
    }])
