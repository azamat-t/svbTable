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
    this.sortColumn = null
    this.sortOrder = 'asc' // 'asc' or 'desc'
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

    const { columns, settings } = this.data

    columns.forEach((colName) => {
      const th = document.createElement('th')
      const setting = settings[colName]

      // Create a container for the header content
      const headerContent = document.createElement('div')

      headerContent.classList.add('header-content')

      // Header text
      const headerText = document.createElement('span')

      headerText.textContent = setting ? setting.represent : colName
      headerContent.appendChild(headerText)

      // Sort icon
      const sortIcon = document.createElement('span')

      sortIcon.classList.add('sort-icon')

      // If this column is currently sorted, show the sort icon
      if (this.sortColumn === colName) {
        sortIcon.innerHTML = this.sortOrder === 'asc' ? '&#9650;' : '&#9660;'
      }

      headerContent.appendChild(sortIcon)

      th.appendChild(headerContent)

      th.dataset.name = colName

      // Add resizable handler
      const resizer = document.createElement('div')

      resizer.classList.add('resizer')
      th.appendChild(resizer)

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

      // Attach sorting event
      th.addEventListener('click', (e) => {
        // Prevent sorting when clicking on the resizer
        if (e.target === resizer || e.target.classList.contains('resizer')) {
          return
        }

        this.sortColumnData(colName)
      })
    })

    thead.appendChild(headerRow)
    this.element.appendChild(thead)
  }

  sortColumnData(columnName) {
    if (this.sortColumn === columnName) {
      // Toggle sort order
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
      // Set new sort column and default to ascending
      this.sortColumn = columnName
      this.sortOrder = 'asc'
    }

    // Get the index of the column to sort
    const colIndex = this.data.columns.indexOf(columnName)

    if (colIndex === -1) {
      return
    }

    // Perform the sorting
    this.data.rows.sort((a, b) => {
      let valA = a[colIndex]
      let valB = b[colIndex]

      // If the value is an object with 'r', use 'r' for comparison
      if (typeof valA === 'object' && valA !== null) {
        valA = valA.r
      }

      if (typeof valB === 'object' && valB !== null) {
        valB = valB.r
      }

      // Handle different data types
      const isNumber = !isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))
      const isDate = !isNaN(Date.parse(valA)) && !isNaN(Date.parse(valB))

      if (isNumber) {
        valA = parseFloat(valA)
        valB = parseFloat(valB)
      } else if (isDate) {
        valA = new Date(valA)
        valB = new Date(valB)
      } else {
        valA = valA.toString().toLowerCase()
        valB = valB.toString().toLowerCase()
      }

      if (valA < valB) {
        return this.sortOrder === 'asc' ? -1 : 1
      }

      if (valA > valB) {
        return this.sortOrder === 'asc' ? 1 : -1
      }

      return 0
    })

    // Update the table body
    this.loadRows(this.data)

    // Update the sort icons in header
    this.updateSortIcons()
  }

  updateSortIcons() {
    const headers = this.element.querySelectorAll('th')

    headers.forEach((th) => {
      const colName = th.dataset.name
      const sortIcon = th.querySelector('.sort-icon')

      if (sortIcon) {
        if (colName === this.sortColumn) {
          sortIcon.innerHTML = this.sortOrder === 'asc' ? '&#9650;' : '&#9660;'
        } else {
          sortIcon.innerHTML = ''
        }
      }
    })
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

    // Update sort icons
    this.updateSortIcons()
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

        // Reload the table rows
        this.loadRows(this.data)
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
