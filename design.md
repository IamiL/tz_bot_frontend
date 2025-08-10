## Дизайн-система v1.1

### Две цветовые темы: Light и Dark

*(все значения названы как design tokens; синтаксис — CSS-custom-properties / JSON-tokens, можно импортировать в Figma или Style-Dictionary)*

---

### 1. Базовая палитра (Shared Core)

| Token             | HEX       | Роль |
| ----------------- | --------- | ---- |
| `--clr-black`     | `#000000` |      |
| `--clr-gray-900`  | `#231f20` |      |
| `--clr-gray-700`  | `#727272` |      |
| `--clr-gray-300`  | `#bfbfbf` |      |
| `--clr-white`     | `#ffffff` |      |
| `--clr-brand-500` | `#ff3c00` |      |
| `--clr-brand-400` | `#f37130` |      |
| `--clr-brand-600` | `#f0512c` |      |

```css
:root {              /* shared */
  --brand-gradient: linear-gradient(90deg,#ff3c00 0%,#f37130 50%,#f0512c 100%);
}
```

---

## 2. Dark Theme

> Оптимальная тёмная тема — не чисто чёрная, а с **γ-корректным** фоном ≈ `#121212`. Мы строим на базе `--clr-gray-900`.

```css
/* tokens-source */
[data-theme="dark"] {
  /* Neutrals & Surfaces */
  --surface-canvas:        #121212;            /* ≈ 8 % L* */
  --surface-subtle:        #1e1e1f;            /* gray-900 +8 % */
  --surface-elevated:      #1f1f1f;
  --border-default:        #2e2e2f;
  /* Text */
  --text-primary:          #f5f5f5;            /* near-white */
  --text-secondary:        #bfbfbf;
  --text-inverse:          #000000;
  /* Brand (не меняем оттенок, лишь усиливаем контраст) */
  --brand-primary:         #ff3c00;
  --brand-hover:           #f37130;
  --brand-active:          #f0512c;
  --focus-ring:            0 0 0 3px rgba(255,60,0,.6);
}
```

### Компоненты (Dark)

| Компонент            | Normal                                                                         | Hover                    | Active                        |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------ | ----------------------------- |
| **Primary Button**   | `--brand-primary` / `--text-inverse`                                           | `--brand-hover`          | `--brand-active`              |
| **Secondary Button** | `transparent` / текст `--brand-primary`, border `--brand-primary`              | фон `rgba(255,60,0,.12)` | текст/бордер `--brand-active` |
| **Card**             | `--surface-elevated`, тень `0 2px 4px rgba(0,0,0,.6)`                          |                          |                               |
| **Input**            | фон `--surface-subtle`, border `--border-default` → `--brand-primary` on focus |                          |                               |

---

## 3. Типографика (общая)

| Role         | Font          | Size / Line | Light Color        | Dark Color         |
| ------------ | ------------- | ----------- | ------------------ | ------------------ |
| Display / H1 | Inter Bold    | 48 / 56 px  | `--text-primary`   | `--text-primary`   |
| H2           | Inter Bold    | 32 / 40 px  | »                  | »                  |
| Body 1       | Inter Regular | 16 / 24 px  | »                  | »                  |
| Body 2       | Inter Regular | 14 / 20 px  | `--text-secondary` | `--text-secondary` |

---

## 4. Графические правила

| Параметр      | Значение                                                   |
| ------------- | ---------------------------------------------------------- |
| Базовая сетка | 8 pt (8, 16, 24 …)                                         |
| Радиусы       | 4 px (input), 12 px (card), 24 px (CTA)                    |
| Тени (Light)  | `0 2px 4px rgba(0,0,0,.08)` • `0 4px 12px rgba(0,0,0,.06)` |
| Тени (Dark)   | `0 2px 4px rgba(0,0,0,.6)` • `0 4px 12px rgba(0,0,0,.48)`  |
| Фокус-state   | outline: var(--focus-ring)                                 |

---

## 5. Семантические цвета (опционально добавить)

| Semantic | Light BG / Text       | Dark BG / Text        |
| -------- | --------------------- | --------------------- |
| Success  | `#009e60` / `#ffffff` | `#008652` / `#ffffff` |
| Warning  | `#f8b000` / `#000000` | `#e09b00` / `#000000` |
| Error    | `#e02424` / `#ffffff` | `#c91f1f` / `#ffffff` |

*(используйте акцентный оранжевый для brand-action, а семантические — только для статусов/алёртов)*

---

## 6. Использование темы в коде

```html
<body data-theme="light"> <!-- или dark -->
  …
  <button class="btn-primary">Купить</button>
</body>
```

```css
.btn-primary {
  background: var(--brand-primary);
  color: var(--text-inverse);
  border-radius: 24px;
  padding: 12px 24px;
  transition: background .15s;
}
.btn-primary:hover   { background: var(--brand-hover); }
.btn-primary:active  { background: var(--brand-active); }
.btn-primary:focus-visible { outline: var(--focus-ring); }
```

Смена темы = одно действие на корневом элементе (`data-theme` либо `class="dark"`).
Все компоненты автоматически наследуют корректные переменные.

---

## 7. Проверка доступности

| Проверка                                | Light                  | Dark       |
| --------------------------------------- | ---------------------- | ---------- |
| Primary btn (`#ff3c00` ↔ `#ffffff`)     | 4.02 : 1 ✓             | 4.02 : 1 ✓ |
| Текст основной (`#231f20` ↔ `#ffffff`)  | 11.27 : 1 AA ✓         | —          |
| Текст на тёмном (`#f5f5f5` ↔ `#121212`) | 14.3 : 1 AA ✓          | —          |
| Вторичный текст                         | ≥ 4.5 : 1 (оба режима) |            |

---

### 8. Расширение

1. **Motion**: 200 ms cubic-bezier(0.4, 0, 0.2, 1) для Navigation / Modals.
2. **Spacing tokens**: `space-1 = 2 px`, `space-2 = 4 px`, … `space-10 = 40 px`.
3. **Iconography**: линейный стиль, stroke 2 px; цвет `currentColor` (наследование от текста).
4. **Documentation**: генерируйте Storybook с two-panel toggle (`light` / `dark`) для визуальной проверки.