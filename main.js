import getList from './src/api/get-list'
import SvbTable from './src/components/svb-table/SvbTable'
import './src/scss/main.scss'

const request = getList()
const tableWrapper = document.querySelector('#table-wrapper')

request.then((response) => {
  const svbTable = new SvbTable(response)

  // Append the table container to the wrapper
  tableWrapper.appendChild(svbTable.container)
})
