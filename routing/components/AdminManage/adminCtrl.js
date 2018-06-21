angular.module('myApp')
.controller('adminCtrl', ['$http', 'myLocalStorage', function($http, myLocalStorage){

    let self = this
    let serverUrl = myLocalStorage.getLocalStorage('ServerUrl')

    self.colors = ['#72C02C', '#3498DB', '#717984', '#F1C40F'];
    self.pois = myLocalStorage.getLocalStorage('pois')

    self.rankVSview_lables = myLocalStorage.getLocalStorage('categories')
    self.rankVSview_series = ['Ranks', 'Views']
    self.rankVSview_data = []
    self.rankVSview_loaded = false

    self.viewPois_lables = self.pois
    self.viewPois_data = []
    self.viewPois_loaded = false

    self.rankPois_lables = self.pois
    self.rankPois_data = []
    self.rankPois_loaded = false

    self.reviewDate_lables = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct","Nov", "Dec"]
    self.reviewDate_series = ['Reviews']
    self.reviewDate_data = []
    self.reviewDate_loaded = false

    self.rankVSviewInit = function(){   
        let allPois = self.pois
        let countRanks = {}
        let countViews = {}
        angular.forEach(allPois, function(value, key){
            if(!countRanks[value.category])
                countRanks[value.category] = value.rateCounter
            else
                countRanks[value.category] += value.rateCounter

            if(!countViews[value.category])
                countViews[value.category] = value.numberOfViewers
            else
                countViews[value.category] += value.numberOfViewers
        })

        let values1 = []
        let values2 = []
        let real_lable = []
        for(var i=0;i<self.rankVSview_lables.length;i++){
            let lable = self.rankVSview_lables[i].category
            values1.push(countRanks[lable])
            values2.push(countViews[lable])
            real_lable.push(lable)
        }
        self.rankVSview_data.push(values1)
        self.rankVSview_data.push(values2)
        self.rankVSview_lables = real_lable
        self.rankVSview_loaded = true
    }

    self.viewPoisInit = function(){
        let real_lable = []
        angular.forEach(self.viewPois_lables, function(value, key){
            self.viewPois_data.push(value.numberOfViewers)
            real_lable.push(value.name)
        })
        self.viewPois_lables = real_lable
        self.viewPois_loaded = true
    }

    self.rankPoisInit = function(){
        let real_lable = []
        angular.forEach(self.rankPois_lables, function(value, key){
            self.rankPois_data.push(value.rateCounter)
            real_lable.push(value.name)
        })
        self.rankPois_lables = real_lable
        self.rankPois_loaded = true
    }

    self.reviewDateInit = function(){
        let allPois = self.pois
        let countReviews = {}
        let promises = []
        angular.forEach(allPois, function(value, key){
            let prom = new Promise(function(resolve, reject){
                $http.get(serverUrl + 'general/locationInfo/' + key)
                .then(function(result){
                    resolve(result.data.reviews)
                })
            })
            promises.push(prom)
        })

        Promise.all(promises)
        .then(function(values){
            for(var i=0;i<values.length;i++){
                let reviews = values[i]
                for(var j=0;j<reviews.length;j++){
                    let date = new Date(reviews[j].reviewDate).getMonth()
                    if(!countReviews[date])
                        countReviews[date] = 1
                    else
                        countReviews[date]++
                }
            }

            let data_values = []
            angular.forEach(countReviews, function(value,key){
                data_values.push(value)
            })

            console.log(data_values)
            self.reviewDate_data = data_values
            self.reviewDate_loaded = true
        })
    }

    self.datasetOverride = [{ yAxisID: 'y-axis-1' }];
    self.options = {
      scales: {
        yAxes: [
          {
            id: 'y-axis-1',
            type: 'linear',
            display: true,
            position: 'left'
          }
        ]
      }
    }
    
}])