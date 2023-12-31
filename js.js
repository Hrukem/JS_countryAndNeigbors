`use strict`;

const key = `здесь_должен_быть_ключ_с_сайта_weatherapi.com`;

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");

function renderCards(data, className = "") {
  const html = `
   <article class="country ${className}">
          <img class="country__img" src="${data.flags.svg}" />
          <div class="country__data">
            <h3 class="country__name">${data.name.common}</h3>
            <h4 class="country__region">${data.region}</h4>
            <p class="country__row"><span>👫</span>${data.population}</p>
            <p class="country__row"><span>🗣️</span>${
              Object.entries(data.languages)[0][1]
            }</p>
            <p class="country__row"><span>💰</span>${
              Object.entries(Object.entries(data.currencies)[0][1])[0][1]
            }</p>
          </div>
        </article>
   `;
  countriesContainer.insertAdjacentHTML(`beforeend`, html);
}

function renderError(message) {
  countriesContainer.insertAdjacentText(`beforeend`, message);
}

function getJSON(url, errMsg = `Что-то пошло не так.`) {
  return fetch(url).then(function (response) {
    if (!response.ok) {
      throw new Error(`${errMsg} (${response.status})`);
    }
    return response.json();
  });
}

function getCountryData(country) {
  // страна 1
  const request = getJSON(
    `https://restcountries.com/v3.1/name/${country}`,
    `Страна не найдена`
  )
    .then(function (data) {
      renderCards(data[0]);

      if (!data[0].borders) {
        throw new Error(`Соседей нет`);
      }

      const neighbour = data[0].borders[0];
      if (!neighbour) {
        throw new Error(`Не найдены соседи`);
      }

      // страна 2
      return getJSON(
        `https://restcountries.com/v3.1/alpha/${neighbour}`,
        `Страна не найдена`
      ).then(function (data) {
        const [res] = data;
        renderCards(res, `neighbour`);
      });
    })
    .catch(function (err) {
      renderError(`${err.message}`);
    })
    .finally(function () {
      countriesContainer.style.opacity = 1;
    });
}
/* 
function getNameCountryByCoords() {
  navigator.geolocation.getCurrentPosition(async function (location) {
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    const [data] = await fetch(
      `http://api.weatherapi.com/v1/search.json?key=${key}&q=${latitude},${longitude}`
    ).then((response) => response.json())
    .catch(function(err) {
      renderError(`${err.message}`)
    });
    
    getCountryData(`${data.country}`);
  });
}
 */

function getNameCountryByCoords() {
  new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  })
    .then(function (location) {
      // console.log(location);
      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;
      fetch(
        `http://api.weatherapi.com/v1/search.json?key=${key}&q=${latitude},${longitude}`
      )
        .then((response) => response.json())
        .then(([data]) => getCountryData(`${data.country}`))
        .catch((err) => renderError(err.message));
    })
    .catch((err) => renderError(err.message));
}

btn.addEventListener(`click`, function () {
  getNameCountryByCoords();
});
