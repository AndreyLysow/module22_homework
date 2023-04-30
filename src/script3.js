const btn = document.querySelector('button');
		const output = document.querySelector('#output');
    const firstLi = document.createElement('li');
		const secondLi = document.createElement('li');
		const mapDiv = document.querySelector('#map');
		let map;

		btn.addEventListener('click', () => {
   firstLi.innerText=`Размеры экрана пользователя ширина: ${window.screen.width} x высота: ${window.screen.height}`;
output.appendChild(firstLi);
			const error = () => {
				secondLi.textContent = 'Информация о местоположении недоступна';
			};

			const success = (position) => {
				const {latitude, longitude} = position.coords;
				secondLi.textContent = `Широта: ${latitude} °, Долгота: ${longitude} °`;

				// Создаем объект карты и устанавливаем его центр на местоположение пользователя
				map = new ymaps.Map(mapDiv, {
					center: [latitude, longitude],
					zoom: 14
				});

				// Добавляем маркер на карту, который показывает местоположение пользователя
				const marker = new ymaps.Placemark([latitude, longitude], {
					hintContent: 'Вы здесь'
				});
				map.geoObjects.add(marker);
			};

			if (!navigator.geolocation) {
				secondLi.textContent = 'Информация о местоположении недоступна';
			} else {
				secondLi.textContent = 'Определение местоположения…';
				navigator.geolocation.getCurrentPosition(success, error);
			}

			output.appendChild(secondLi);
		});