var cities = [];
var apiKey = "d7da3d1e6100e0be9ea41f7fefaead47";

// Algolia places API
var placesAutocomplete = places({
apiKey: 'd7da3d1e6100e0be9ea41f7fefaead47',
container: document.querySelector('#city'),
templates: {
    value: function(suggestion){
        console.log(suggestion);
        return suggestion.name;
    }
}
}).configure({
    countries:['us'],
    type: 'city',
    aroundLatLngViaIP: false,
    useDeviceLocation: false
});

$("#city-search").click(function() {
    var city = $("#city").val().trim();
    
    if (city) {
        if (cities.includes(city)) {
            var index = cities.indexOf(city);
            cities.splice(index,1);
            cities.unshift(city);
        }
        else if (cities.length < 10) {
            cities.unshift(city);
        }
        else {
            cities.pop();
            cities.unshift(city);
        }
    }
    else {
        window.alert("Please Enter A City.");
    }

    $("#city").val("");
    saveCities();
    loadCities();
    getWeather(city);
});

var loadCities = function() {
    cities = JSON.parse(localStorage.getItem("cities"));
    $(".list-group").empty();

    if (!cities) {
        cities = [];
    }

    $.each(cities, function(index) {
        createCityEl(cities[index]);
    })
};

var saveCities = function() {
    localStorage.setItem("cities", JSON.stringify(cities));
};

var createCityEl = function(city) {
    var cityListEl = $("<li>")
        .addClass("list-group-item list-group-item-action")
        .text(city);
    
    $(".list-group").append(cityListEl);
};

$(".list-group").on("click", "li", function(event) {
    event.preventDefault();
    cityText = $(this).text();
    getWeather(cityText);
});

var getWeather = function(city) {
    var url = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&appid="+apiKey+"&units=imperial";

    fetch(url)
        .then(response => response.json())
        .then(data => {
            var lat = data.coord.lat;
            var lon = data.coord.lon;
            var cityName = data.name;
            
            return fetch("https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=minutely,hourly&appid="+apiKey+"&units=imperial");
        })
        .then(response => response.json())
        .then(data => {
            
            displayWeather(data, city);
            displayForecast(data);
        })
        .catch(error => {
            console.log("City Could Not Be Found");
            displayError();
        })
};

var displayWeather = function(data, city){
    console.log("Data:", data)
    $("#city-display").text(city);
    $("#date-display").text(" "+ convertUnixTimestamp( data.current.dt) );
    $("#icon-display").html("<img src='http://openweathermap.org/img/wn/"+data.current.weather[0].icon+"@2x.png' >");
    $("#icon-display img").attr("alt", data.current.weather[0].description+ " icon");
    $("#icon-display img").attr("title", data.current.weather[0].description);
    $(".temp").text("Temperature: "+Math.round(data.current.temp*10)/10+" \u00B0F");
    $(".humidity").text("Humidity: "+data.current.humidity+"%");
    $(".wind").text("Wind Speed: "+Math.round(data.current.wind_speed*10)/10+" MPH");

    var uvi = data.current.uvi;
    var uvSpanEl = $("<span>");

    if (uvi <= 2) {
        uvSpanEl.addClass("low").text(uvi);
    }
    else if (uvi <= 5) {
        uvSpanEl.addClass("moderate").text(uvi);
    }
    else if (uvi <= 7) {
        uvSpanEl.addClass("high").text(uvi);
    }
    else if (uvi <= 10) {
        uvSpanEl.addClass("veryhigh").text(uvi);
    }
    else {
        uvSpanEl.addClass("extreme").text(uvi);
    }

    $(".uv").text("UV Index: ");
    $(".uv").append(uvSpanEl);
};

var displayForecast = function(data) {
    
    $("#five-day-forecast").show();

    for (var i = 1; i < 6; i++) {
        var date = convertUnixTimestamp(data.daily[i].dt);
        var desc = data.daily[i].weather[0].description;
        var icon = data.daily[i].weather[0].icon;
        var maxTemp = data.daily[i].temp.max;
        var minTemp = data.daily[i].temp.min;
        var humidity = data.daily[i].humidity;
        
        tempCard = $('[forecast="'+i+'"]');
        tempCard.find(".card-header").text(date);
        tempCard.find(".card-desc").text(desc);
        tempCard.find(".card-icon").attr("src","https://openweathermap.org/img/wn/"+icon+"@2x.png");
        tempCard.find(".card-icon").attr("alt",data.daily[i].weather[0].description+" icon");

        tempCard.find(".card-maxtemp").text("Max Temp: "+Math.round(maxTemp*10)/10+ " \u00B0F");
        tempCard.find(".card-mintemp").text("Min Temp: "+Math.round(minTemp*10)/10+ " \u00B0F");
        tempCard.find(".card-humidity").text("Humidity "+humidity+"%");

    }
};

var displayError = function() {
    $("#city-display").text("City Not Found");
    $("#date-display, #icon-display, .temp, .humidity, .wind,.uv").text("");
    $("#five-day-forecast").hide();

};

var convertUnixTimestamp = function(timestamp) {
    var unixTimestamp = timestamp;
    var milliseconds = unixTimestamp * 1000;
    var dateObject = new Date(milliseconds);
    var dateFormat = dateObject.toLocaleString();
    var date = dateFormat.split(",")[0];
    return date;
};

loadCities();