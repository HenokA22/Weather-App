//Henok Assalif
//Backend code for Weather App

//key variables
const searchButton = document.querySelector(".searchBtn");
const locationButton = document.querySelector(".locationBtn");
const cityInput = document.querySelector(".cityInput");
const weatherCardDiv = document.querySelector(".weather-cards");
const currentCardDiv = document.querySelector(".current-weather");

const API_KEY = "640088dc7eb41b621c39992959359906";





//function start

function changeDateFormat(inputDate) {
    const parts = inputDate.split("-");

    if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${month}-${day}-${year}`;

    } else {
        return "Invalid date format";
    }
}

const getCityCoord = function() {
    // Here I am getting the value contained inside the input box
    const cityName = cityInput.value.trim();
    
    if(!cityName) {
        return alert("Not found");
    };

    const Direct_Geocode_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // GeoCode API get, then, and catch. data is a JSON object 
    fetch(Direct_Geocode_API_URL).then(res => res.json()).then(data => {
        if(!data.length) {
            return alert(`No coordinates found for ${cityName}`);
        }
        //this format allows for you to copy the properites from the first element
        //most likely it is a object with the same properity names as the left of the expression below
        const {name, lat, lon } = data[0];

        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occured while fetching the coordinates!")
    })
}

const getUserCoord = function() {
    //this uses browser to get users current location
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; // Gets user coord
            const Reverse_Geocode_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            // GeoCode API get, then, and catch. data is a JSON object
            // This gets city name 
            fetch(Reverse_Geocode_URL).then(res => res.json()).then(data => {
                if(!data.length) {
                    return alert(`No coordinates found for ${cityName}`);
                }

                
                //this format allows for you to copy the properites from the first element
                //most likely it is a object with the same properity names as the left of the expression below
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);

            }).catch(() => {
                alert("An error occured while fetching the city!")
            })
        },
        error => { //displaying error to user if locaiton permission is denied
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
}


//changing the html weathercard placeholder to info from JSON data from API request
function createWeatherCard (cityName, weatherItem, index){
    //the split is taking the 2023-08-14 00:00:00 format and spliting it into an array of two and geting index 0
    var date = weatherItem.dt_txt.split(" ")[0];
    date = changeDateFormat(date);
    var temp = weatherItem.main.temp.toFixed(2);
    var icon = weatherItem.weather[0].icon;
    var windSpeed = weatherItem.wind.speed;
    var humidity = weatherItem.main.humidity;
    var currentWeather = weatherItem.weather[0].description.split(" ").map(word => word.charAt(0).toLocaleUpperCase() + word.slice(1)).join(" ");  // to make first char of words upper case


    if(index === 0) { //weather card for current day
        return `<div class="details">
                    <h2>${cityName} (${date})</h2>
                    <h4>Temperature: ${temp}°F</h4>
                    <h4>Wind: ${windSpeed} M/S</h4>
                    <h4>Humidity: ${humidity}%</h4>
                </div>
                
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt = "weather-icon">
                    <h4>${currentWeather}</h4>
                </div>`;
    } else { // weather card for 5 day forecast
        return `<li class="card">
                    <h3>(${date})</h3>
                    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt = "weather-icon">
                    <h4>Temp: ${temp}°F</h4>
                    <h4>Wind: ${windSpeed} M/S</h4>
                    <h4>Humidity: ${humidity}%</h4>  
                </li>`;
    }

}

const getWeatherDetails = function(cityName, lat, lon) {
    const Weather_API = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`;


    // Weather Report API get, then(to see if its json), then(do something with the data) and catch(if error reteriving data)
    // data is a JSON object 
    fetch(Weather_API).then(res => res.json()).then(data => {
        //this array is just for if statement logic, the actual array kept it the result of the filter method 
        //on the sixDaysForecast array. 
        const uniqueForecastDays = [];
        console.log(data);
        //filter method return a new array of elements from attached array that passes call back method condition
        //In this case, the method filter original array to get only unique days.
        const sixDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();

            if(!(uniqueForecastDays.includes(forecastDate))){
                //this is what being sent into the new array
                return uniqueForecastDays.push(forecastDate);
            }
        });


        cityInput.value = "";
        weatherCardDiv.innerHTML = "";
        currentCardDiv.innerHTML = "";
        
        console.log(sixDaysForecast);
        //parsing info from each weather info object from API
        // then creating weather cards by inject updated html with new info from API        
        sixDaysForecast.forEach((weatherInfo,index) => {
            if(index === 0){
                currentCardDiv.innerHTML += createWeatherCard(cityName, weatherInfo, index)
            } else {
                weatherCardDiv.innerHTML += createWeatherCard(cityName, weatherInfo, index);
            }
        }); 
    }).catch(() => {
        alert("An error occured while fetching the weather forecast!")
    });
}
//function end


//actual event logic and flow of call (if we think about main method from java)
searchButton.addEventListener('click', getCityCoord);

locationButton.addEventListener('click', getUserCoord);

