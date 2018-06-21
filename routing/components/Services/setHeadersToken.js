angular.module('myApp')
    .service('setHeadersToken', ['$http', 'myLocalStorage', function($http, myLocalStorage){
        let self = this
        self.token = ""
        self.setToken = function(t){
            let headerToken = $http.defaults.headers.common['x-access-token']
            if(headerToken != t){
                self.token = t
                $http.defaults.headers.common['x-access-token'] = self.token
                myLocalStorage.addLocalStorage('token', self.token)
                console.log('set token')
            }
        }
    }])