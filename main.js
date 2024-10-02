import getList from './src/api/get-list'
import SvbTable from './src/components/svb-table/SvbTable'
import './src/scss/main.scss'

const request = getList()
const tableWrapper = document.querySelector('#table-wrapper')

request.then((response) => {
  const svbTable = new SvbTable(response)
  tableWrapper.appendChild(svbTable.container)

  const createButton = document.getElementById('create-button')
  const deleteButton = document.getElementById('delete-button')

  createButton.addEventListener('click', () => {
    addNewRow(svbTable)
  })

  deleteButton.addEventListener('click', () => {
    deleteActiveRow(svbTable)
  })

  const uuid = '89326d90-fd15-4070-a8a0-538e2c9dd386'
  const columnName = 'sum'
  const newValue = '3456000'

  svbTable.setValue({ uuid, columnName, value: newValue })
  const sumValue = svbTable.getValue({ uuid, columnName })
  console.log('The sum is:', sumValue)
})

function addNewRow(svbTable) {
  const index = svbTable.data.rows.length + 1
  const newRow = [
    generateUUID(),
    new Date().toISOString(),
    { v: generateUUID(), r: 'Приложение №' + index },
    { v: generateUUID(), r: 'Договор №' + index },
    { v: generateUUID(), r: 'Проект №' + index },
    { v: generateUUID(), r: 'TОО Подрядчик ' + index },
    index + 'КБ' + index,
    { v: generateUUID(), r: 'Работы ' + index },
    '250000',
    '305000',
    '25 д.',
  ]

  svbTable.addRow(newRow)
}

function deleteActiveRow(svbTable) {
  const activeRowData = svbTable.getActiveRow()
  if (activeRowData) {
    const uuidToRemove = activeRowData[0]
    svbTable.removeRow(uuidToRemove)
  } else {
    alert('Пожалуйста, выберите строку для удаления.')
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
