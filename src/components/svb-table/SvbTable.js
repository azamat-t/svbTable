import Formatter from './Formatter'
import './styles/svb-table.scss'

export default class SvbTable {
  constructor(data) {
    this.data = data
    this.activeRow = null
    this.sortColumn = null
    this.sortOrder = 'asc'
    this.render()
  }

  render() {
    this.container = SvbTable.createElement('div', null, 'svb-table-container')
    this.element = SvbTable.createElement(
      'table',
      'doc-list-table',
      'svb-table'
    )
    this.buildHeader()
    this.buildBody()
    this.buildFooter()
    this.container.appendChild(this.element)
  }

  buildHeader() {
    const thead = document.createElement('thead'),
      headerRow = document.createElement('tr'),
      { columns, settings } = this.data

    columns.forEach((colName) => {
      const setting = settings[colName],
        th = SvbTable.createElement('th'),
        headerContent = SvbTable.createElement('div', null, 'header-content'),
        headerText = SvbTable.createElement(
          'span',
          null,
          null,
          setting ? setting.represent : colName
        ),
        sortIcon = SvbTable.createElement('span', null, 'sort-icon'),
        resizer = SvbTable.createElement('div', null, 'resizer')

      if (this.sortColumn === colName)
        sortIcon.innerHTML = this.sortOrder === 'asc' ? '&#9650;' : '&#9660;'

      headerContent.append(headerText, sortIcon)
      th.append(headerContent, resizer)
      th.dataset.name = colName

      if (setting) {
        if (setting.columnWidth) th.style.width = `${setting.columnWidth}px`
        if (setting.textAlign) th.style.textAlign = setting.textAlign
      }

      headerRow.appendChild(th)
      this.initResizableColumns(th, resizer)
      th.addEventListener('click', (e) => {
        if (e.target === resizer || e.target.classList.contains('resizer'))
          return
        this.sortColumnData(colName)
      })
    })

    thead.appendChild(headerRow)
    this.element.appendChild(thead)
  }

  sortColumnData(columnName) {
    if (this.sortColumn === columnName)
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
    else {
      this.sortColumn = columnName
      this.sortOrder = 'asc'
    }

    const colIndex = this.data.columns.indexOf(columnName)
    if (colIndex === -1) return

    this.data.rows.sort((a, b) => {
      let valA = a[colIndex],
        valB = b[colIndex]

      if (typeof valA === 'object' && valA !== null) valA = valA.r
      if (typeof valB === 'object' && valB !== null) valB = valB.r

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

      if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1
      return 0
    })

    this.loadRows(this.data)
    this.updateSortIcons()
  }

  updateSortIcons() {
    this.element.querySelectorAll('th').forEach((th) => {
      const colName = th.dataset.name,
        sortIcon = th.querySelector('.sort-icon')

      if (sortIcon) {
        sortIcon.innerHTML =
          colName === this.sortColumn
            ? this.sortOrder === 'asc'
              ? '&#9650;'
              : '&#9660;'
            : ''
      }
    })
  }

  initResizableColumns(th, resizer) {
    let x = 0,
      w = 0

    const mouseDownHandler = (e) => {
      x = e.clientX
      w = th.offsetWidth
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

  buildBody() {
    const tbody = document.createElement('tbody'),
      { rows, columns, settings } = this.data

    rows.forEach((rowData) => {
      const tr = document.createElement('tr')
      tr.dataset.uuid = rowData[0]

      rowData.forEach((cellData, index) => {
        const td = document.createElement('td'),
          columnName = columns[index],
          setting = settings[columnName]

        td.dataset.name = columnName

        let displayValue =
          typeof cellData === 'object' && cellData !== null
            ? cellData.r
            : cellData

        if (columnName === 'docdate') {
          displayValue = Formatter.formatDate(displayValue)
        } else if (['sum', 'sumfact'].includes(columnName)) {
          displayValue = Formatter.formatNumber(displayValue)
        }

        td.textContent = displayValue
        if (setting?.textAlign) td.style.textAlign = setting.textAlign

        tr.appendChild(td)
      })

      tbody.appendChild(tr)
    })

    this.element.appendChild(tbody)
    this.addRowEventListeners()
  }

  buildFooter() {
    const tfoot = document.createElement('tfoot'),
      footerRow = document.createElement('tr')

    this.data.columns.forEach((colName) => {
      const td = document.createElement('td')
      td.dataset.name = colName
      footerRow.appendChild(td)
    })

    tfoot.appendChild(footerRow)
    this.element.appendChild(tfoot)
  }

  setFooterValue(columnName, value) {
    const footerCell = this.element.querySelector(
      `tfoot td[data-name="${columnName}"]`
    )
    if (footerCell) footerCell.textContent = value
  }

  getFooterValue(columnName) {
    const footerCell = this.element.querySelector(
      `tfoot td[data-name="${columnName}"]`
    )
    return footerCell ? footerCell.textContent : null
  }

  loadRows(newData) {
    this.data = newData
    const tbody = this.element.querySelector('tbody')
    if (tbody) tbody.remove()
    this.buildBody()
    this.updateSortIcons()
  }

  addRow(rowData) {
    this.data.rows.push(rowData)
    this.loadRows(this.data)
  }

  removeRow(uuid) {
    const index = this.data.rows.findIndex((row) => row[0] === uuid)
    if (index !== -1) {
      this.data.rows.splice(index, 1)
      this.loadRows(this.data)
    }
  }

  getActiveRow() {
    if (this.activeRow) {
      const uuid = this.activeRow.dataset.uuid
      return this.data.rows.find((row) => row[0] === uuid)
    }
    return null
  }

  setValue({ uuid, columnName, value }) {
    const rowIndex = this.data.rows.findIndex((row) => row[0] === uuid),
      colIndex = this.data.columns.indexOf(columnName)

    if (rowIndex !== -1 && colIndex !== -1) {
      this.data.rows[rowIndex][colIndex] = value
      this.loadRows(this.data)
    }
  }

  getValue({ uuid, columnName }) {
    const rowIndex = this.data.rows.findIndex((row) => row[0] === uuid),
      colIndex = this.data.columns.indexOf(columnName)
    if (rowIndex !== -1 && colIndex !== -1) {
      return this.data.rows[rowIndex][colIndex]
    }
    return null
  }

  addRowEventListeners() {
    this.element
      .querySelectorAll('tbody tr')
      .forEach((row) => this.attachRowEvents(row))
  }

  attachRowEvents(row) {
    row.addEventListener('mouseenter', () => row.classList.add('hover'))
    row.addEventListener('mouseleave', () => row.classList.remove('hover'))
    row.addEventListener('click', () => {
      if (this.activeRow) this.activeRow.classList.remove('active')
      this.activeRow = row
      row.classList.add('active')
    })
  }

  static createElement(tagname, id = null, classList = null, innerHTML = null) {
    const element = document.createElement(tagname)
    if (id) element.id = String(id)
    if (classList) element.classList.add(...classList.split(' '))
    if (innerHTML) element.innerHTML = innerHTML
    return element
  }
}
