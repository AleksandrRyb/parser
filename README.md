# Парсер для mymeet.ai

Этот проект представляет собой парсер, разработанный для извлечения текстового содержимого и изображений с сайта mymeet.ai.

## Требования

- Node.js (версия 14 или выше)
- npm (обычно устанавливается вместе с Node.js)

## Установка

1. Клонируйте репозиторий:
   ```
   git clone https://github.com/AleksandrRyb/parser.git
   cd parser
   ```

2. Установите зависимости:
   ```
   npm install
   ```

## Запуск скрипта

1. Соберите проект:
   ```
   npm run build
   ```

2. Запустите парсер:
   ```
   npm start
   ```

## Результаты

После выполнения скрипта:
- Текстовое содержимое будет сохранено в файле `text/content.txt`
- Изображения будут сохранены в директории `images/`

## Примечания

- Убедитесь, что у вас есть стабильное интернет-соединение перед запуском скрипта.
- Время выполнения скрипта может варьироваться в зависимости от объема данных на сайте и скорости вашего интернет-соединения.

## Устранение неполадок

Если вы столкнулись с проблемами при запуске скрипта, убедитесь, что:
1. Установлена последняя версия Node.js
2. Все зависимости установлены корректно
3. В файле package.json присутствует строка `"type": "module"`
