angular.module('myApp')
    .service('myLocalStorage', ['localStorageService', function(localStorageService){
        
        let self = this

        self.clearSessionLocalStorage = function(){
            localStorageService.remove('user')
            localStorageService.remove('timer')
            localStorageService.remove('token')
            localStorage.remove('favoritPois')
            console.log('user, timer and token deleted')
        }

        self.addLocalStorage = function (key, value) {
            var dataVal = localStorageService.get(key)
            if (!dataVal){
                if (localStorageService.set(key, value)) {
                    console.log(key + " added")
                }
                else
                    console.log('failed to add ' + key)
            }
            else
                console.log(key + ' alredy exist in local storage')
        }

        self.getLocalStorage= function (key)
        {
            var data = localStorageService.get(key)
            if(!data)
                console.log(key + ' not exist in local storage')
            return data
        }

        self.updateLocalStorage = function (key,value)
        {
            localStorageService.remove(key)
            localStorageService.set(key,value)
            console.log(key + ' updated')
        }

        self.deleteLocalStorage = function(key)
        {
            localStorageService.remove(key)
            console.log(key + ' deleted')
        }
    }])