angular.module('myApp')
 .controller('registerCtrl', ['$location', '$http', 'myLocalStorage', 'myQuestions', function($location, $http, myLocalStorage, myQuestions) {

    let self = this;
    let ServerUrl = myLocalStorage.getLocalStorage('ServerUrl')

    self.countries = []
    self.categories = []
    self.emptyCategory = "not choosen"
    self.questions = myQuestions.get()
    self.user = {}

    self.initFileds = function(){
        setCountries()
        setCategories()
    }

    self.submit = function(){
        if(self.user){
            if(self.user.category3 === null || typeof self.user.category3 === 'undefined')
                self.user.category3 = self.emptyCategory
            if(self.user.category4 === null || typeof self.user.category4 === 'undefined')
                self.user.category4 = self.emptyCategory
            self.user.verificationQues1 = self.questions[0]
            self.user.verificationQues2 = self.questions[1]
            $http.post(ServerUrl + 'users/register', self.user)
            .then(function(responce){
                self.user.username= responce.data.username
                self.user.password = responce.data.password
                myLocalStorage.addLocalStorage('user', self.user)
                alert("registration complited! \n username: " + self.user.username + "\n password: " + self.user.password);
                console.log('user added sucessfully')
                $location.path('/login')
            }, function(responce){
                alert("Something went wrong while tring to add new user");
                console.log('Something went wrong while tring to add new user')
            })
        }
    }

    let setCountries = function(){
        $http.get(ServerUrl + 'general/allCountries')
        .then(function(responce){
            self.countries = responce.data.Countries.Country
        }, function(responce){
            console.log('Something went wrong while tring get countries from server')
        })
    }

    let setCategories = function(){
        self.categories = myLocalStorage.getLocalStorage('categories')
    }

 }])