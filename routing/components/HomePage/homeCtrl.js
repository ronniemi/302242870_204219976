angular.module('myApp')
.controller('homeCtrl', ['$scope', '$location', '$http', '$window', 'setHeadersToken',
  'myLocalStorage', 'autenticateToken', function($scope, $location, $http, $window, setHeadersToken, myLocalStorage, autenticateToken){

    let self = this
    let ServerUrl = myLocalStorage.getLocalStorage('ServerUrl')

    self.loggedIn = false
    self.user = {}
    self.connected = false
    self.randomPoi = []

    self.initilize = function(){
        if($scope.appCtrl.username != 'guest'){
            $location.path('/registerUsers')
            return
        }
        
        let autenticate = autenticateToken.autenticate()
        if(autenticate){
            self.connected = true
        }
        $http.get(ServerUrl + 'general/randomPopularLocations')
        .then(function(responce){
            self.randomPoi = responce.data
        }, function(responce){
            alert("something went wrong while tring to connect to server")
        })
    }

    self.login = function(){
        if(self.user){
            $http.post(ServerUrl + 'users/login', self.user)
            .then(function(responce){
                if(responce.data.success){
                    let token = responce.data.token
                    autenticateToken.setToken(token)
                    myLocalStorage.addLocalStorage('user', self.user)
                    $scope.appCtrl.username = self.user.username
                    alert("you are loged in!");
                    $location.path('/registerUsers')
                    console.log('user loged in sucessfully')
                }
                else
                    alert('wrong username or password')
            }, function(responce){
                alert("Something went wrong while tring to login");
                console.log('Something went wrong while tring to login')
            })
        }
    }

    self.goToRegisration = function(){
        $location.path('/register')
    }

    self.goToPoiDetails = function(poiId){
        $location.path('/poiDetails/' + poiId)
    }

    self.retrivePassword = function(){
        $location.path('/retrivePassword')
        
    }

    self.encorageRegister = function(){
        let token = myLocalStorage.getLocalStorage('token')
        if(!token){
            if(confirm("join us and register to M&R"))
                $location.path('/register')
        }
    }
}])