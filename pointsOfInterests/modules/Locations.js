var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var cors = require('cors');
var jwt = require('jsonwebtoken');
var DButilsAzure = require('./DButils');


router.get("/favoriteLocations", function(req, res){
    var username = req.decode.payload.username;
    var locationId_order;
    var locationsID;
    var locationsObjects;
    DButilsAzure.execQuery("SELECT locationId, orderIndex FROM LocationsForUsers WHERE username='" + username + "'")
    .then(function(result){
        locationId_order = result
        locationsID  = arrayToString(result);
        return DButilsAzure.execQuery("SELECT * FROM Locations WHERE Id in (" + locationsID + ")")    
    })
    .then(function(result){
        locationsObjects = result;
        var answer = [];
        for(var i=0;i<locationsObjects.length;i++){
            for(var j=0;j<locationId_order.length;j++){
                if(locationsObjects[i].id === locationId_order[j].locationId){
                    let locationInfo = locationsObjects[i]
                    locationInfo['index'] = locationId_order[j].orderIndex
                    answer.push(locationInfo)
                }
            }
        }
        res.send(answer);
    })

    .catch(function(err){
        res.json({success: false})
        console.log(err);
        res.send({
            seccuss: false,
            error: err
        });
    })
})

//get most popular location in user favorite categories
router.get("/mostPopularLocationsForUser", function(req, res){
    var username = req.decode.payload.username;
    var user;
    var findFirstPopularLocation, findSecondPopularLocation;

    //find user
    DButilsAzure.execQuery("SELECT * FROM Users WHERE username='" + username + "'")
    .then(function(result){
        user = result;
        //find locations for first category
        findFirstPopularLocation = new Promise(
            function(resolve, reject){
                var firstCategory = getMostPopularLocationInCategory(user[0].category1);
                resolve(firstCategory);
            });

        //find locations for second category
        findSecondPopularLocation = new Promise(
            function(resolve, reject){
                var secondCategory = getMostPopularLocationInCategory(user[0].category2);
                resolve(secondCategory);
            });

        //return 2 locations for categories
        Promise.all([findFirstPopularLocation, findSecondPopularLocation])
        .then(function(values){
            // console.log(values);

        res.send([values[0], values[1]]);
        
        })
    })
    .catch(function(err){
        console.log(err);
        res.send({
            seccuss: false,
            error: err
        });
    })

})

//get last 2 saved locations for user
router.get("/lastSavedLocations", function(req, res){

    var username = req.decode.payload.username;
    DButilsAzure.execQuery("SELECT * FROM LocationsForUsers WHERE username='" + username + "'")
    .then(function(result){
        var dates = getLatestDate(result);
        var ans = [];
        for(var i = 0; i < result.length; i++){
            if((result[i].savedDate - dates[0] == 0) || (result[i].savedDate - dates[1] == 0))
                ans.push(result[i]);
        }
        res.send(ans);

    })
    .catch(function(err){
        res.json({success: false})
        console.log(err);
        res.send({
            seccuss: false,
            error: err
        });
    })
})

//update favorite list
router.put("/updateFavoriteList", function(req,res){
    var username = req.decode.payload.username;
    var favoriteLocations = req.body.favoriteLocations
    DButilsAzure.execQuery("SELECT locationId FROM LocationsForUsers WHERE username='" + username + "'")
    .then(function(result){
        //check if user deleted locations from favorites list
        oldFavoriteLocations = [];
        favoriteLocationsToDelete = [];
        for(var i = 0; i < result.length; i++){
            if(!contains(favoriteLocations, result[i].locationId))
                favoriteLocationsToDelete.push(result[i].locationId)
            else
                oldFavoriteLocations.push(result[i].locationId);
            
        }
        //change list order and add new locations
        queriesToRun = []
        var query;
        for(var i = 1; i <= favoriteLocations.length; i++){
            if(contains(oldFavoriteLocations, favoriteLocations[i-1]))
                query = "UPDATE LocationsForUsers SET orderIndex=" + i + " WHERE locationId=" + favoriteLocations[i-1]+ " AND username='" + username + "'";
            else
                query = "INSERT INTO LocationsForUsers (username, locationId, savedDate, orderIndex) VALUES ('" + username + "', '" + favoriteLocations[i-1] + "', GetDate(), " + i + ")";
            
                queriesToRun.push(query); 
        }
        

        //delete locations
        for(var i = 0; i < favoriteLocationsToDelete.length; i++){
            query = "DELETE FROM LocationsForUsers WHERE locationId=" + favoriteLocationsToDelete[i] + " AND username='" + username + "'";
            queriesToRun.push(query); 
        }

        //create promise foreach query
        promises = [];
        for(var i = 0; i < queriesToRun.length; i++){
            promises.push(DButilsAzure.execQuery(queriesToRun[i]));
        }

        Promise.all(promises)
        .then(function(values){
            res.send({success: "true"});
        })
        .catch(function(err){
            res.json({success: false})
        })
    })
    .catch(function(err){
        res.json({success: false})
        console.log(err);
        res.send({
            seccuss: false,
            error: err
        });
    })
})


//add review for location
router.post("/addReview", function(req,res){
    var username = req.decode.payload.username;
    var locationId = req.body.locationId;
    var review = req.body.review;
    console.log("INSERT INTO ReviewsForLocation (username, locationId, reviewDate, review) VALUES ('" + username + "', '" + locationId + "', GetDate(), '" + review  + "')");
    DButilsAzure.execQuery("INSERT INTO ReviewsForLocation (username, locationId, reviewDate, review) VALUES ('" + username + "', '" + locationId + "', GetDate(), '" + review  + "')")
    .then(function(result){
        res.json({success:true})
    })
    .catch(function(err){
        res.json({success:false})
        console.log(err);
        res.send({
            seccuss: false,
            error: err
        });
    })
})

//add rate to loction
router.put("/rateLocation", function(req,res){
    var username = req.decode.payload.username;
    var locationId = req.body.locationId;
    var rate = parseInt(req.body.rate);

    DButilsAzure.execQuery("SELECT * FROM Locations WHERE id='" + locationId + "'")
    .then(function(result){
        var currentRate = parseFloat(result[0].rate);
        var numOfRates = parseInt(result[0].rateCounter);
        var newRate = (currentRate*numOfRates + rate)/(numOfRates + 1);
        updateLocationRate(locationId, newRate, numOfRates + 1);
        res.send({newRate: newRate});
    })
    .catch(function(err){
        console.log(err);
        res.send({
            seccuss: false,
            error: err
        });
    })
})



//change favorite locations order
router.post("/changeLocationsOrder", function(req, res){
    var username = req.decode.payload.username;
    var newOrder = req.body.locations;

    DButilsAzure.execQuery("DELETE FROM LocationsForUsers WHERE username='" + username + "'")
    .then(function(result){
        addLocationsInNewOrder(newOrder);
    })
    .catch(function(err){
        console.log(err);
        res.send({
            seccuss: false,
            error: err
        });
    })
})

//update location rate according to new user rate
function updateLocationRate(locationId, newRate, newRateCounter){
    var query = "UPDATE Locations SET rate=" + newRate + ", rateCounter=" + newRateCounter + " WHERE id=" + locationId;
    return DButilsAzure.execQuery(query)
    .then(function(result){
        return "location updated seccessfully";
    })
    .catch(function(err){
        res.json({success: false})
        console.log(err);
        res.send({
            seccuss: false,
            error: err
        });
    })


}


//add location to LocationsForusers in user required order
function addLocationsInNewOrder(newOrder){
    var query = "INSERT INTO LocationsForUsers (username, locationId, savedDate) VALUES";
    for(var i = 0; i < newOrder.length; i++){
        query += "('" + newOrder[i].username + "', '" + newOrder[i].locationId + "', '" + newOrder[i].savedDate + "')";
        if(i < newOrder.length - 1)
        query += ", "
    }
    return DButilsAzure.execQuery(query)
    .then(function(result){
        console.log("order changed");
    })
    .catch(function(err){
        res.json({success: false})
        console.log(err);
        res.send({
            seccuss: false,
            error: err
        });
    })

}

function getLatestDate(data) {
    // convert to timestamp and sort
    var sortedDates = data.map(function(item) {
       return new Date(item.savedDate).getTime()
    }).sort(); 
    // take latest
    var first = sortedDates[sortedDates.length-1];
    var second = sortedDates[sortedDates.length-2];
    // convert to js date object 
    return [new Date(first), new Date(second)];
 }

//get location with the highest rank in specific category
function getMostPopularLocationInCategory(category){
    return DButilsAzure.execQuery("SELECT * FROM Locations WHERE category = '" + category + "'")
    .then(function(result){
        var maxRate = result[0].rate;
        var popularLocation = result[0];
        for(var i = 1; i < result.length; i++){
            if(result[i].rate > maxRate){
                maxRate = result[i].rate;
                popularLocation = result[i];
            }
        }
        return popularLocation;
    })
    .catch(function(err){
        res.json({success: false})
        console.log(err);
        res.send(err);
    })

}



//convert array to string
function arrayToString(arr){
    var str = "";
    for(var i = 0; i < arr.length - 1; i++)
        str += arr[i].locationId + ", ";
    str += arr[arr.length - 1].locationId;
    return str;
}

function contains(array, id){
    for(var i = 0; i < array.length; i++){
        if(array[i].locationId == id || array[i] == id)
            return true;
    }
    return false;
}

module.exports = router;
