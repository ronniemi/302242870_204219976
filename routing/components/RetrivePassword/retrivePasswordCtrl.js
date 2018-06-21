angular.module('myApp')
.controller('retrivePasswordCtrl', ['$http', '$location','myQuestions', 'myLocalStorage', function($http, $location, myQuestions, myLocalStorage){

    let self = this
    let ServerUrl = myLocalStorage.getLocalStorage('ServerUrl')

    self.questions = myQuestions.get()
    self.user = {}

    self.retrive = function(){
        $http.post(ServerUrl + 'users/retrivePassword', self.user)
            .then(function(responce){
                if(responce.data.success){
                    let password = responce.data.password
                    alert("your password is: " + password);
                    $location.path('/login')
                    console.log('user retrived password sucessfully')
                }
                else
                    alert('wrong username or answer')
            }, function(responce){
                alert("Something went wrong while tring to retrive password");
                console.log('Something went wrong while tring to retrive password')
            })
    }
}])