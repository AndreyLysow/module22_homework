// WebSocket-сервера для подключения
const wsUri = "wss://echo.websocket.org/";
const newWsUri = "wss://ws.ifelse.io/";

// HTML-элементы
const userInput = document.getElementById("userMessage");
const output = document.getElementById("output");
const btnClose = document.querySelector('.j-btn-close');
const btnSend = document.querySelector('.j-btn-send');
const btnGeoloc = document.querySelector('.j-btn-geoloc');
const theForm = document.querySelector('form');


// Регулярное выражение для скрытия ответа сервера по умолчанию при подключении
const re = /^Request served by [\da-f]{8}$/;

// WebSocket-подключение и переменная, предотвращающая повторное появление сообщения о геолокации
let websocket = doConnect(newWsUri);
let preventNextMessageShowUp = 0;

async function getGeoData() {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    showMessageWithCoords(latitude, longitude);
    console.log(latitude, longitude);
  } catch (error) {
    showMessage('Невозможно определить ваше местоположение', 'error');
    console.error(error);
  }

  function showMessageWithCoords(latitude, longitude) {
    showMessage(`<a href="https://www.openstreetmap.org/#map=17/${latitude}/${longitude}" title="Широта: ${latitude} °, Долгота: ${longitude} °" alt="Широта: ${latitude} °, Долгота: ${longitude} °" target="_blank" >Гео-локация</a>`,'geolocation'); //альтернативный вариант вывода
   


    //ЭТОТ ЗАКОММЕНТИРОВАННЫЙ ФРАГМЕНТ КОДА ПОКАЗЫВАЕТ КАК ВСЕ ТАКИ ГЛЮЧЕН openstreetmap лцчше использовать yandex maps

    // const message = `<a href="#" title="Широта: ${latitude} °, Долгота: ${longitude} °" alt="Широта: ${latitude} °, Долгота: ${longitude} °" class="geolocation-link">Гео-локация</a>`;
    // showMessage(message);
  //   const geolocationElement = document.querySelector('.geolocation-link');
  //   if (geolocationElement) {
  //     geolocationElement.addEventListener('click', () => {
  //       openNewWindow(latitude, longitude);
  //     });
  //   }
  // }
  // function openNewWindow(latitude, longitude) {

   
  //   const newWindow = window.open('', '', 'width=400,height=400');
  //   const mapContainer = document.createElement('div');
  //   mapContainer.id = 'map2';
  //   newWindow.document.body.appendChild(mapContainer);
  //   map = L.map(mapContainer).setView([latitude, longitude], 10);

  //   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     attribution:
  //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //   }).addTo(map);
  
  //   L.marker([latitude, longitude])
  //     .addTo(map)
  //     .bindPopup('Ваше местоположение')
  //     .openPopup();
  
  }
  

}

// Функция для подключения к WebSocket
function doConnect(wsUri) {
  let websocket = new WebSocket(wsUri); 
  websocket.onopen = function(evt) {
    showMessage('Соединение с сервером установлено', '');
    btnClose.style.display = 'none';
  };
  websocket.onclose = function(evt) {
    showMessage('Отсутствует соединение с сервером. Переподключитесь (обновите страницу)', '');
  };
  websocket.onmessage = function(evt) {
    showMessage(evt.data, 'responder');
  };
  websocket.onerror = function(evt) {
    showMessage(evt.data, 'error');
  };
  return websocket;
}

// Функция для проверки, открыто ли WebSocket-соединение
function isOpen(ws) { 
  return ws.readyState === ws.OPEN;
}


function showMessage(message, sender='responder') {
  if(re.exec(message) !== null){  // проверяем сообщение на наличие регулярного выражения
    sender='system';
    preventNextMessageShowUp=1;
  }
  if(message.length === 0){  // проверяем сообщение на наличие текста
    sender='error';
    message='Ошибка. Заполните поле сообщения';
  }

  if((preventNextMessageShowUp === 0) || (preventNextMessageShowUp === 2)){  // проверяем, может ли сообщение быть показано
    let pre = document.createElement("div");

    switch(sender) {  // выбираем класс сообщения в зависимости от отправителя
      case 'responder':
        pre.classList.add('responderMessage');
      break;
      case 'user':
        pre.classList.add('userMessage');
      break;
      case 'geolocation':
        pre.classList.add('userMessage');
        preventNextMessageShowUp=2;
      break;
      case 'system':
        pre.classList.add('systemMessage');
        message='System: ' + message;  // добавляем префикс "System" к сообщению
      break;
      case 'error':
        pre.classList.add('errorMessage');
        message='System error: ' + message;  // добавляем префикс "System error" к сообщению
      break;
      default:
        pre.classList.add('unknownSourceMessage');
      }
    pre.innerHTML = '<p>' + message + '</p>';
    output.appendChild(pre);  // добавляем сообщение на страницу
  }
    preventNextMessageShowUp = (preventNextMessageShowUp > 0)? preventNextMessageShowUp - 1 : preventNextMessageShowUp;
}

btnSend.addEventListener('click', async (e) => {
  e.preventDefault();

  if (typeof websocket === 'undefined' ) {  // проверяем, определен ли объект websocket
    if ( !isOpen(websocket)) websocket = doConnect(newWsUri);  // если объект не определен или не открыт, устанавливаем соединение
  }
  if (( websocket.readyState === 3 ) || ( websocket.readyState === 2 )) {  // проверяем состояние объекта websocket
        websocket.close();
        websocket = doConnect(newWsUri);  // закрываем текущее соединение и открываем новое

        while (websocket.readyState !== 1) {  // ждем, пока новое соединение не будет установлено
          await new Promise(r => setTimeout(r, 250));
        }
   }

  let message = userInput.value;
  if(message.length !== 0) websocket.send(message);  // отправляем сообщение через websocket
  showMessage(message, 'user');  // отображаем сообщение на странице
  userInput.value='';
  userInput.focus();
});

btnGeoloc.addEventListener('click', async (e) => {
  e.preventDefault();
  if (typeof websocket === 'undefined' ) {
    if ( !isOpen(websocket)) websocket = doConnect(newWsUri);
  }
  if (( websocket.readyState === 3 ) || ( websocket.readyState === 2 )) {
        websocket.close();
        websocket = doConnect(newWsUri);
        while (websocket.readyState !== 1) {
          await new Promise(r => setTimeout(r, 250));
        }
   }

  getGeoData();  // получаем геоданные
});

btnClose.addEventListener('click', () => {
  websocket.close();
});


userInput.addEventListener('submit', () => {
  btnSend.click();
});
 theForm.addEventListener('submit', (e) => {
  e.preventDefault();
  btnSend.click();
});

