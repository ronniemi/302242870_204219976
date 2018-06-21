angular.module('myApp')
.service('autenticateToken', ['$location', 'myLocalStorage', 'setHeadersToken', 'jwtHelper', function($location, myLocalStorage, setHeadersToken, jwtHelper){

    let self = this

    self.setToken = function(token){
        myLocalStorage.updateLocalStorage('token', token)
        setHeadersToken.setToken(token)
    }

    self.autenticate = function(token){
        if(!token){
            $location.path('/')
            return false;
        }

        let expired = jwtHelper.isTokenExpired(token)
        if(expired){
            alert("session is over - please log in again")
            myLocalStorage.clearSessionLocalStorage()
            $location.path('/')
            return false
        }
        setHeadersToken.setToken(token)
        return true
    }
}])