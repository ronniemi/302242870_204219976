angular.module('myApp')
.filter('indexFilter', [function() {
    return function (inputArray, indexArray) {
        var array = [];
        for(var i=0;i<inputArray;i++){
            if(indexArray.indexOf(inputArray[i]) === -1){
                array.push(inputArray[i])
            }
        }
        return array;
    };
}]);