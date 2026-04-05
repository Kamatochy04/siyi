# Лендинг «Сияй»

Одностраничный сайт на **Vite**, **Tailwind CSS**, **AOS**. Запуск разработки:

```bash
npm install
npm run dev
```

Сборка для выкладки на хостинг:

```bash
npm run build
```

Статика появится в папке `dist/` — её нужно загрузить на хостинг или подключить к Netlify / Vercel / GitHub Pages.

## Отправка формы

Скопируйте `.env.example` в `.env` и задайте переменные.

| Режим (`VITE_FORM_MODE`) | Описание |
|--------------------------|----------|
| `mock` | Заявка не уходит никуда, показывается сообщение об успехе (по умолчанию). |
| `web3forms` | Письма на вашу почту через [Web3Forms](https://web3forms.com): укажите email на сайте, скопируйте **Access Key** в `VITE_WEB3FORMS_ACCESS_KEY`. |
| `formspree` | POST JSON на URL из `VITE_FORM_ENDPOINT` (Formspree, Getform и аналоги). |
| `webhook` | POST JSON `{ name, phone, email, source }` на `VITE_WEBHOOK_URL` (например Google Apps Script). |
| `whatsapp` | Открывается WhatsApp с текстом заявки; номер без `+`, только цифры: `VITE_WHATSAPP_PHONE`. |

**Почта (web3forms):** в корне проекта создайте файл `.env` (из `.env.example`), выставьте `VITE_FORM_MODE=web3forms` и вставьте ключ. Почта получателя задаётся один раз на [web3forms.com](https://web3forms.com) при создании ключа. После изменения `.env` перезапустите `npm run dev` или пересоберите `npm run build`.

Секреты и URL вебхуков в репозиторий не коммитьте — только в `.env` на сервере сборки или в настройках хостинга.

## Контент

Тексты, фото и видео в проекте — **заглушки**. Замените их материалами заказчика: изображения в `index.html` (или положите файлы в `public/` и укажите пути `/имя.jpg`).
