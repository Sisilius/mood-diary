# 🌸 Дневник настроения

Маленькое личное приложение для отслеживания настроения: один экран на день, пять смайликов,
отметка «плакала / нет», поле для триггеров и поле для хорошего. Плюс календарь и график динамики.

- **Фронтенд:** React + TypeScript + Vite (статика)
- **Бэкенд:** Supabase (Auth + Postgres с RLS)
- **Хостинг:** GitHub Pages через GitHub Actions

## Что умеет

- Вход по email и паролю (один личный аккаунт), сброс пароля письмом.
- Страница дня: настроение 😭 😣 😐 😛 🤪, отдельный переключатель 🥲, два текстовых поля.
- Автосохранение: не нужно нажимать «Сохранить».
- Свайпы влево/вправо и стрелки для перелистывания дней, кнопка «К сегодня».
- Календарь по месяцам: эмодзи настроения и 🥲 в уголке дня, переход к любому дню.
- Статистика: среднее настроение, заполненные дни, дни со слезами, серия, график за 7/30/90 дней.
- Адаптивная вёрстка под телефон, можно добавить на домашний экран.

## Быстрый старт

Нужны Node.js 20+ и аккаунт Supabase.

```bash
npm install
copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux
npm run dev
```

Открой адрес из терминала (обычно http://localhost:5173).

## Настройка Supabase

1. Создай проект на [supabase.com](https://supabase.com).
2. Открой **SQL Editor** и выполни целиком файл [`supabase/schema.sql`](supabase/schema.sql).
   Он создаёт таблицу `entries`, включает RLS и добавляет политики «только свои записи».
3. Создай аккаунт для неё: **Authentication → Users → Add user**. Укажи email и пароль,
   включи **Auto Confirm User** (чтобы не ждать письма).
4. **Authentication → Providers → Email**: выключи **Allow new users to sign up**,
   чтобы никто посторонний не мог зарегистрироваться. Вход и сброс пароля продолжат работать.
5. **Project Settings → API**: скопируй `Project URL` и `anon public` ключ в `.env`:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

6. Перезапусти `npm run dev`.

> `anon` ключ публичный — это нормально. Данные защищены RLS: каждая строка привязана к
> `auth.uid()`, поэтому без входа в аккаунт её не прочитать.

### Сброс пароля

Supabase присылает ссылку, которая возвращает на приложение. Добавь адреса в
**Authentication → URL Configuration → Redirect URLs**:

- `http://localhost:5173/` — для разработки,
- `https://<твой-логин>.github.io/<репозиторий>/` — для продакшена (именно с `/` на конце).

## Деплой на GitHub Pages

1. Создай репозиторий и запушь проект в ветку `main`:

   ```bash
   git init
   git add .
   git commit -m "Mood diary"
   git branch -M main
   git remote add origin https://github.com/<логин>/<репозиторий>.git
   git push -u origin main
   ```

2. В репозитории: **Settings → Secrets and variables → Actions → New repository secret**.
   Добавь два секрета:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Settings → Pages → Build and deployment → Source**: выбери **GitHub Actions**.

4. Запушь изменения (или запусти workflow вручную во вкладке **Actions**). Через минуту
   приложение будет доступно по адресу `https://<логин>.github.io/<репозиторий>/`.

Сборка использует `base: './'`, поэтому работает и на project pages, и на кастомном домене
без правок конфига.

## Как это устроено

```
src/
  App.tsx                  вход, вкладки, навигация по дням
  components/
    DayPage.tsx            экран дня, свайпы, автосохранение
    MoodPicker.tsx         5 смайликов
    CryToggle.tsx          переключатель 🥲
    Calendar.tsx           календарь месяца
    MoodChart.tsx          SVG-график без сторонних библиотек
    StatsPage.tsx          статистика и выход
  hooks/useEntries.ts      загрузка/upsert записей + оптимистичные обновления
  context/AuthContext.tsx  сессия Supabase
  lib/dates.ts             работа с локальными датами (date-fns, ru)
  lib/moods.ts             шкала настроений
supabase/schema.sql        таблица, RLS, триггер updated_at
.github/workflows/deploy.yml
```

Одна запись = один день (`unique (user_id, day)`). Дата хранится как локальная `date`,
поэтому «день» определяется часовым поясом телефона, а не UTC.

## Что легко поменять

- **Название:** `APP_NAME` в `src/config.ts`.
- **Смайлики и подписи:** `MOODS` в `src/lib/moods.ts` (цвет карточки тоже там).
- **Палитра:** CSS-переменные в начале `src/styles.css`.
- **Глубина истории:** `HISTORY_MONTHS` в `src/config.ts` (по умолчанию 60 месяцев).

## Ограничения

- GitHub Pages — статический хостинг, поэтому серверной части нет: всё общение идёт
  напрямую с Supabase по HTTPS, а доступ ограничен RLS.
- Push-уведомлений и напоминаний нет — приложение не просит заходить каждый день.
- Если очень хочется «напомни вечером», это следующий шаг: PWA + сервис-воркер или
  Supabase Edge Function с cron.
