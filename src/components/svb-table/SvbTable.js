import Formatter from './Formatter'
import './styles/svb-table.scss'

export default class SvbTable {
  /**
   * Initializes the SvbTable instance with data.
   * @param {Object} data - The data for the table.
   */
  constructor(data) {
    this.data = data
    this.activeRow = null
    this.pinnedColumns = []
    this.render()
  }

  /**
   * Renders the table and appends it to the container.
   */
  render() {
    // Create container for the table to enable scrolling with fixed header and footer
    this.container = SvbTable.createElement('div', null, 'svb-table-container')

    // Create table element
    this.element = SvbTable.createElement(
      'table',
      'doc-list-table',
      'svb-table'
    )

    // Build table header
    this.buildHeader()

    // Build table body
    this.buildBody()

    // Build table footer
    this.buildFooter()

    // Append table to container
    this.container.appendChild(this.element)
  }

  /**
   * Builds the table header based on data columns.
   */
  buildHeader() {
    const thead = document.createElement('thead')
    const headerRow = document.createElement('tr')

    // Add row number header cell
    // const rowNumTh = document.createElement('th')
    // rowNumTh.textContent = '#'
    // rowNumTh.classList.add('row-number')
    // headerRow.appendChild(rowNumTh)

    const { columns, settings } = this.data

    columns.forEach((colName) => {
      const th = document.createElement('th')
      const setting = settings[colName]

      th.textContent = setting ? setting.represent : colName
      th.dataset.name = colName

      // Add resizable handler
      const resizer = document.createElement('div')

      resizer.classList.add('resizer')
      th.appendChild(resizer)

      const pinIcon = document.createElement('span')

      pinIcon.classList.add('pin-icon')
      pinIcon.innerHTML = '&#128204;' // Paperclip emoji as a pin icon
      th.appendChild(pinIcon)

      // Attach pinning event
      pinIcon.addEventListener('click', () => {
        this.togglePinColumn(index)
      })

      // Apply styles from settings if needed
      if (setting) {
        if (setting.columnWidth) {
          th.style.width = `${setting.columnWidth}px`
        }

        if (setting.textAlign) {
          th.style.textAlign = setting.textAlign
        }
      }

      headerRow.appendChild(th)

      // Attach resize event
      this.initResizableColumns(th, resizer)
    })

    thead.appendChild(headerRow)
    this.element.appendChild(thead)
  }

  togglePinColumn(colIndex) {
    const isPinned = this.pinnedColumns.includes(colIndex)

    if (isPinned) {
      this.pinnedColumns = this.pinnedColumns.filter((i) => i !== colIndex)
    } else {
      this.pinnedColumns.push(colIndex)
    }

    this.applyPinnedColumns()
  }

  applyPinnedColumns() {
    const rows = this.element.querySelectorAll('tr')

    rows.forEach((row) => {
      row.childNodes.forEach((cell, index) => {
        if (this.pinnedColumns.includes(index)) {
          cell.classList.add('pinned')
          cell.style.left = `${this.getPinnedOffset(index)}px`
        } else {
          cell.classList.remove('pinned')
          cell.style.left = ''
        }
      })
    })
  }

  getPinnedOffset(colIndex) {
    let offset = 0

    for (let i = 0; i < colIndex; i++) {
      if (this.pinnedColumns.includes(i)) {
        const th = this.element.querySelector(`th:nth-child(${i + 1})`)

        offset += th.offsetWidth
      }
    }

    return offset
  }

  initResizableColumns(th, resizer) {
    let x = 0
    let w = 0

    const mouseDownHandler = (e) => {
      x = e.clientX
      const styles = window.getComputedStyle(th)

      w = parseInt(styles.width, 10)

      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)
    }

    const mouseMoveHandler = (e) => {
      const dx = e.clientX - x

      th.style.width = `${w + dx}px`
    }

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler)
      document.removeEventListener('mouseup', mouseUpHandler)
    }

    resizer.addEventListener('mousedown', mouseDownHandler)
  }

  /**
   * Builds the table body based on data rows.
   */
  buildBody() {
    const tbody = document.createElement('tbody')

    this.data.rows.forEach((rowData) => {
      const tr = document.createElement('tr')
      const uuid = rowData[0]

      tr.dataset.uuid = uuid

      // Add row number cell
      // const rowNumTd = document.createElement('td')
      // rowNumTd.textContent = rowIndex + 1
      // rowNumTd.classList.add('row-number')
      // tr.appendChild(rowNumTd)

      rowData.forEach((cellData, index) => {
        const td = document.createElement('td')
        const columnName = this.data.columns[index]

        td.dataset.name = columnName

        // Format data based on column
        let displayValue = ''

        if (typeof cellData === 'object' && cellData !== null) {
          displayValue = cellData.r
        } else {
          if (columnName === 'docdate') {
            displayValue = Formatter.formatDate(cellData)
          } else if (columnName === 'sum' || columnName === 'sumfact') {
            displayValue = Formatter.formatNumber(cellData)
          } else {
            displayValue = cellData
          }
        }

        td.textContent = displayValue

        // Apply text alignment if specified
        const setting = this.data.settings[columnName]

        if (setting && setting.textAlign) {
          td.style.textAlign = setting.textAlign
        }

        tr.appendChild(td)
      })

      tbody.appendChild(tr)
    })

    this.element.appendChild(tbody)

    // Add event listeners for interactivity
    this.addRowEventListeners()
  }

  buildFooter() {
    const tfoot = document.createElement('tfoot')
    const footerRow = document.createElement('tr')

    this.data.columns.forEach((colName) => {
      const td = document.createElement('td')

      td.dataset.name = colName
      td.textContent = '' // Initially empty
      footerRow.appendChild(td)
    })

    tfoot.appendChild(footerRow)
    this.element.appendChild(tfoot)
  }

  setFooterValue(columnName, value) {
    const footerCell = this.element.querySelector(
      `tfoot td[data-name="${columnName}"]`
    )

    if (footerCell) {
      footerCell.textContent = value
    }
  }

  getFooterValue(columnName) {
    const footerCell = this.element.querySelector(
      `tfoot td[data-name="${columnName}"]`
    )

    return footerCell ? footerCell.textContent : null
  }

  /**
   * Clears current rows and loads new data into the table.
   * @param {Object} newData - The new data to load.
   */
  loadRows(newData) {
    // Update data
    this.data = newData

    // Clear the table body
    const tbody = this.element.querySelector('tbody')

    if (tbody) {
      tbody.remove()
    }

    // Rebuild the body with the new data
    this.buildBody()
  }

  /**
   * Adds a new row to the table.
   * @param {Array} rowData - The data for the new row.
   */
  addRow(rowData) {
    this.data.rows.push(rowData)
    const tbody = this.element.querySelector('tbody')
    const tr = document.createElement('tr')
    const uuid = rowData[0]

    tr.dataset.uuid = uuid

    rowData.forEach((cellData, index) => {
      const td = document.createElement('td')
      const columnName = this.data.columns[index]

      td.dataset.name = columnName

      if (typeof cellData === 'object' && cellData !== null) {
        td.textContent = cellData.r
      } else {
        td.textContent = cellData
      }

      tr.appendChild(td)
    })

    tbody.appendChild(tr)
    this.attachRowEvents(tr)
    // Reload the table rows
    this.loadRows(this.data)
  }

  /**
   * Removes a row from the table based on UUID.
   * @param {string} uuid - The unique identifier of the row to remove.
   */
  removeRow(uuid) {
    const index = this.data.rows.findIndex((row) => row[0] === uuid)

    if (index !== -1) {
      this.data.rows.splice(index, 1)

      // Reload the table rows
      this.loadRows(this.data)
    }
  }

  /**
   * Returns the currently active row.
   * @returns {Array|null} The active row data or null if no row is active.
   */
  getActiveRow() {
    if (this.activeRow) {
      const uuid = this.activeRow.dataset.uuid

      return this.data.rows.find((row) => row[0] === uuid)
    }

    return null
  }

  /**
   * Sets the value in a specific cell.
   * @param {Object} args - Contains uuid, columnName, and value.
   */
  setValue({ uuid, columnName, value }) {
    const rowIndex = this.data.rows.findIndex((row) => row[0] === uuid)
    const colIndex = this.data.columns.indexOf(columnName)

    if (rowIndex !== -1 && colIndex !== -1) {
      this.data.rows[rowIndex][colIndex] = value

      const tbody = this.element.querySelector('tbody')
      const tr = tbody.querySelector(`tr[data-uuid="${uuid}"]`)

      if (tr) {
        const td = tr.children[colIndex]

        if (typeof value === 'object' && value !== null) {
          td.textContent = value.r
        } else {
          td.textContent = value
        }
      }
    }
  }

  /**
   * Gets the value from a specific cell.
   * @param {Object} args - Contains uuid and columnName.
   * @returns {any} The value from the specified cell.
   */
  getValue({ uuid, columnName }) {
    const rowIndex = this.data.rows.findIndex((row) => row[0] === uuid)
    const colIndex = this.data.columns.indexOf(columnName)

    if (rowIndex !== -1 && colIndex !== -1) {
      return this.data.rows[rowIndex][colIndex]
    }

    return null
  }

  /**
   * Adds event listeners for row interactivity.
   */
  addRowEventListeners() {
    const rows = this.element.querySelectorAll('tbody tr')

    rows.forEach((row) => this.attachRowEvents(row))
  }

  /**
   * Attaches hover and click events to a table row.
   * @param {HTMLElement} row - The table row element.
   */
  attachRowEvents(row) {
    row.addEventListener('mouseenter', () => {
      row.classList.add('hover')
    })
    row.addEventListener('mouseleave', () => {
      row.classList.remove('hover')
    })
    row.addEventListener('click', () => {
      if (this.activeRow) {
        this.activeRow.classList.remove('active')
      }

      this.activeRow = row
      row.classList.add('active')
    })
  }

  /**
   * Utility method to create an HTML element with optional id, classes, and innerHTML.
   * @param {string} tagname
   * @param {string|null} id
   * @param {string|null} classList
   * @param {string|null} innerHTML
   * @returns {HTMLElement}
   */
  static createElement(tagname, id = null, classList = null, innerHTML = null) {
    const element = document.createElement(tagname)

    if (id) element.id = String(id)

    if (classList) {
      const classNames = classList.split(' ')

      classNames.forEach((name) => {
        element.classList.add(name)
      })
    }

    if (innerHTML) element.innerHTML = innerHTML

    return element
  }
}
