let weatherMapKey = "018c2c15244ec6d7bfaf6bbc7f8bf297";
let weatherMapEndPointBase =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&appid=" +
  weatherMapKey;
let forecastBaseEndpoint =
  "https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=" +
  weatherMapKey;

let geolocationbase =
  "http://api.openweathermap.org/geo/1.0/direct?limit=5&appid=" +
  weatherMapKey +
  "&q=";

let reversegeobase =
  "http://api.openweathermap.org/geo/1.0/reverse?limit=1&appid=" +
  weatherMapKey;

async function getCurrentWeather(city) {
  let endpoint = weatherMapEndPointBase + "&q=" + city;
  let weather = await fetch(endpoint);
  return weather.json();
}

let searchInp = document.querySelector(".weather_search");
let city = document.querySelector(".weather_city");
let day = document.querySelector(".weather_day");
let humidity = document.querySelector(".weather_indicator--humidity>.value");
let wind = document.querySelector(".weather_indicator--wind>.value");
let pressure = document.querySelector(".weather_indicator--pressure>.value");
let temp = document.querySelector(".weather_temp>.value");
let img = document.querySelector(".weather_image");
let datalist = document.querySelector("#suggestions");

let get_day = (ms) => {
  let today = new Date(ms).toLocaleDateString("hi-IN", { weekday: "long" });
  return today;
};

let updateCurrentWeather = (data) => {
  city.innerText = data.name;
  humidity.innerText = data.main.humidity;
  pressure.innerText = data.main.pressure;
  data.main.temp >= 0
    ? (temp.innerText = "+" + Math.round(data.main.temp))
    : (temp.innerText = Math.round(data.main.temp));
  let direction;
  let wspeed = data.wind.speed;
  let wdeg = data.wind.deg;
  if (wdeg > 45 && wdeg <= 135) {
    direction = "East";
  } else if (wdeg > 135 && wdeg <= 225) {
    direction = "South";
  } else if (wdeg > 225 && wdeg <= 315) {
    direction = "West";
  } else {
    direction = "North";
  }
  wind.innerText = `${direction}, ${wspeed}`;
  day.innerText = get_day(data.dt * 1000);
};

let changeCurrentIcon = (data) => {
  let arr = data.weather[0];
  let icon = arr.icon;
  if (icon === "01d") img.setAttribute("src", "../images/clear-sky.png");
  else if (icon === "01n")
    img.setAttribute("src", "images/clear-sky-night2.png");
  else if (icon === "02d") img.setAttribute("src", "../images/few-clouds.png");
  else if (icon === "02n") img.setAttribute("src", "images/few-clouds-n.webp");
  else if (icon === "03n" || icon === "03d")
    img.setAttribute("src", "images/scattered-clouds.png");
  else if (icon === "04n" || icon === "04d")
    img.setAttribute("src", "images/broken-clouds.png");
  else if (icon === "09n" || icon === "09d")
    img.setAttribute("src", "images/shower-rain.png");
  else if (icon === "10n" || icon === "10d")
    img.setAttribute("src", "images/rain.png");
  else if (icon === "11n" || icon === "11d")
    img.setAttribute("src", "images/thunderstrom.png");
  else if (icon === "13n" || icon === "13d")
    img.setAttribute("src", "images/snow.png");
  else if (icon === "50n" || icon === "50d")
    img.setAttribute("src", "images/mist.png");
};

let getForecast = async (id) => {
  let endpoint = forecastBaseEndpoint + "&id=" + id;
  let response = await fetch(endpoint);
  let forecast = await response.json();
  forecastList = forecast.list;
  let fiveDay = [];
  forecastList.forEach((e) => {
    let datestring = e.dt_txt;
    datestring = datestring.replace(" ", "T");
    let hr = new Date(datestring).getHours();
    if (hr === 12) {
      fiveDay.push(e);
    }
  });
  return fiveDay;
};

let updateForecast = (nf) => {
  let cards = document.querySelector(".forecastSection");
  cards.innerHTML = "";
  let str = "";
  console.log(nf);
  nf.forEach((e) => {
    let icon = e.weather[0].icon;
    let iconurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
    let day = get_day(e.dt * 1000);
    let temp = e.main.temp;
    let temp_value = "";
    if (temp >= 0) {
      temp_value = "+" + Math.round(temp);
    } else {
      temp_value = Math.round(temp);
    }
    str += `<div class="col-md-2 mb-2">
      <div class="card h-100">
        <div class="card-body text-center">
          <div class="row" id="huh">
            <div class="col-12">
              <img
                src=${iconurl}
                alt="weather icon"
                class="img-fluid weather_forcast_icon"
              />
            </div>
          </div>
          <div class="row" id="huh">
            <div class="col-12"><h3>${day}</h3></div>
            <div class="col-12">
              <p><span>${temp_value}</span> &deg;</p>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  });
  cards.innerHTML = `<div class="col-md-1 mb-2"></div>${str}<div class="col-md-1 mb-2"></div>`;
};

let doCurrentWeatherAction = async (data) => {
  let weather = await getCurrentWeather(data);
  if (weather.cod == "404") {
    Swal.fire({
      title: "OOPs",
      text: "You've entered a wrong city name",
      icon: "error",
    });
    return;
  }
  updateCurrentWeather(weather);
  changeCurrentIcon(weather);
  let nextfive = await getForecast(weather.id);
  updateForecast(nextfive);
};

searchInp.addEventListener("keydown", (e) => {
  if (e.keyCode == 13) {
    doCurrentWeatherAction(searchInp.value);
  }
});

searchInp.addEventListener("input", async () => {
  if (searchInp.value.length < 2) {
    return;
  }
  let endpoint = geolocationbase + searchInp.value;
  let result = await fetch(endpoint);
  result = await result.json();
  datalist.innerHTML = "";
  result.forEach((e) => {
    let option = document.createElement("option");
    option.value = `${e.name}`;
    datalist.appendChild(option);
  });
});

async function success(pos) {
  let cord = pos.coords;
  let lat = cord.latitude.toString();
  let long = cord.longitude.toString();
  let endpoint = reversegeobase + "&lat=" + lat + "&lon=" + long;
  let city = await fetch(endpoint);
  city = await city.json();
  console.log(city);
  let city_obj = city[0];
  let name = city_obj.name;
  doCurrentWeatherAction(name);
  Swal.fire({
    title: "Location detected!",
    text: "Your current location is " + name,
    icon: "success",
  });
}

function failure(pos) {
  Swal.fire("OOPss..", "Can't detect your location", "error");
}

$(document).ready(() => {
  let option = {
    enableHighFrequency: true,
    timeout: 5000,
    maximumAge: 10000,
  };
  navigator.geolocation.getCurrentPosition(success, failure, option);
});
