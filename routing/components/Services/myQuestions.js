angular.module('myApp')
.service('myQuestions', [function(){
    let self = this
    let questions = ["What is your favorite color?", "What is the name of your mother?"]
    self.get = function () {
        return questions;
    }
}])