import getList from './src/api/get-list'
import SvbTable from './src/components/svb-table/SvbTable'
import './src/scss/main.scss'

const request = getList()
const tableWrapper = document.querySelector('#table-wrapper')

request.then((response) => {
  const svbTable = new SvbTable(response)

  // Append the table container to the wrapper
  tableWrapper.appendChild(svbTable.container)
  // Select the buttons
  const createButton = document.getElementById('create-button')
  const deleteButton = document.getElementById('delete-button')

  // Attach event listeners
  createButton.addEventListener('click', () => {
    // Logic to add a new row
    addNewRow(svbTable)
  })

  deleteButton.addEventListener('click', () => {
    // Logic to delete the selected (active) row
    deleteActiveRow(svbTable)
  })
})

// Function to add a new row
function addNewRow(svbTable) {
  const newRow = [
    generateUUID(), // UUID
    new Date().toISOString(), // Current date and time
    { v: generateUUID(), r: 'Приложение №' + (svbTable.data.rows.length + 1) },
    { v: generateUUID(), r: 'Договор №' + (svbTable.data.rows.length + 1) },
    { v: generateUUID(), r: 'Проект №' + (svbTable.data.rows.length + 1) },
    {
      v: generateUUID(),
      r: 'TОО Подрядчик ' + (svbTable.data.rows.length + 1),
    },
    svbTable.data.rows.length + 1 + 'КБ' + (svbTable.data.rows.length + 1),
    { v: generateUUID(), r: 'Работы ' + (svbTable.data.rows.length + 1) },
    '250000',
    '305000',
    '25 д.',
  ]

  svbTable.addRow(newRow)
}

// Function to delete the active row
function deleteActiveRow(svbTable) {
  const activeRowData = svbTable.getActiveRow()

  if (activeRowData) {
    const uuidToRemove = activeRowData[0] // UUID is the first element
    // eslint-disable-next-line padding-line-between-statements
    svbTable.removeRow(uuidToRemove)
  } else {
    alert('Пожалуйста, выберите строку для удаления.') // "Please select a row to delete."
  }
}

// Function to generate a UUID
function generateUUID() {
  // Simple UUID generator (not RFC4122 compliant)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8

    return v.toString(16)
  })
}
