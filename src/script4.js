const btn = document.querySelector('button');
const output = document.querySelector('#output');

btn.addEventListener('click', () => {
  output.innerHTML = '';
  
  const firstLi = document.createElement('li');
  const secondLi = document.createElement('li');
  output.appendChild(firstLi);
  output.appendChild(secondLi);

  const fetchRequest = (url) => {
    return fetch(url)
      .then(response => response.json())
      .catch(() => console.log('error'));
  };

  const error = () => {
    firstLi.textContent = 'Невозможно получить информацию о местоположении';
  };

  const success = async (position) => {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;
    const url = `https://api.ipgeolocation.io/timezone?apiKey=32bcd4a6e4b548968e7afcdb682ac679&lat=${latitude}&long=${longitude}`;
    const requestResult = await fetchRequest(url);
    if (requestResult.length !== 0) {
      firstLi.innerText = `временная зона, в которой находится пользователь: ${requestResult.timezone}`;
      secondLi.innerText = `местные дата и время: ${requestResult.date_time_txt}`;
    }
  };

  if (!navigator.geolocation) {
    firstLi.innerText = 'Невозможно получить информацию о местоположении';
  } else {
    firstLi.textContent = 'Местоположение пользователя определяется. Ждите...';
    navigator.geolocation.getCurrentPosition(success, error);
  }
});

