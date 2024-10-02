## Методы и функции

### Конструктор

```javascript
constructor(data)
```

Инициализирует экземпляр SvbTable с заданными данными.

- **Параметры:**
  - `data` (Object): Объект с данными таблицы, содержащий колонки, строки и настройки.

### render()

```javascript
render()
```

Рендерит таблицу и добавляет её в контейнер `this.container`.

### buildHeader()

```javascript
buildHeader()
```

Создаёт заголовок таблицы на основе колонок из `this.data.columns`.

### buildBody()

```javascript
buildBody()
```

Создаёт тело таблицы на основе строк из `this.data.rows`.

### buildFooter()

```javascript
buildFooter()
```

Создаёт футер таблицы.

### sortColumnData(columnName)

```javascript
sortColumnData(columnName)
```

Сортирует данные таблицы по указанному столбцу.

- **Параметры:**
  - `columnName` (string): Имя столбца для сортировки.

### updateSortIcons()

```javascript
updateSortIcons()
```

Обновляет иконки сортировки в заголовке таблицы.

### initResizableColumns(th, resizer)

```javascript
initResizableColumns(th, resizer)
```

Инициализирует возможность изменения ширины столбцов.

- **Параметры:**
  - `th` (HTMLElement): Элемент заголовка столбца.
  - `resizer` (HTMLElement): Элемент-резайзер для изменения ширины.

### loadRows(newData)

```javascript
loadRows(newData)
```

Загружает новые строки в таблицу.

- **Параметры:**
  - `newData` (Object): Объект с новыми данными таблицы.

### addRow(rowData)

```javascript
addRow(rowData)
```

Добавляет новую строку в таблицу.

- **Параметры:**
  - `rowData` (Array): Массив с данными для новой строки.

### removeRow(uuid)

```javascript
removeRow(uuid)
```

Удаляет строку из таблицы по её UUID.

- **Параметры:**
  - `uuid` (string): Уникальный идентификатор строки.

### getActiveRow()

```javascript
getActiveRow()
```

Возвращает данные текущей активной строки.

- **Возвращает:**
  - `Array|null`: Массив данных активной строки или `null`, если нет активной строки.

### setValue({ uuid, columnName, value })

```javascript
setValue({ uuid, columnName, value })
```

Устанавливает значение в конкретную ячейку таблицы.

- **Параметры:**
  - `uuid` (string): Уникальный идентификатор строки.
  - `columnName` (string): Имя столбца.
  - `value` (any): Новое значение ячейки.

### getValue({ uuid, columnName })

```javascript
getValue({ uuid, columnName })
```

Получает значение из конкретной ячейки таблицы.

- **Параметры:**

  - `uuid` (string): Уникальный идентификатор строки.
  - `columnName` (string): Имя столбца.

- **Возвращает:**
  - `any`: Значение ячейки или `null`, если ячейка не найдена.

### addRowEventListeners()

```javascript
addRowEventListeners()
```

Добавляет обработчики событий для строк таблицы (наведение курсора, клик).

### attachRowEvents(row)

```javascript
attachRowEvents(row)
```

Присоединяет события наведения и клика к строке таблицы.

- **Параметры:**
  - `row` (HTMLElement): Элемент строки таблицы.
