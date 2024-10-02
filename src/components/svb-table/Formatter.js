export default class Formatter {
  static formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    const date = new Date(dateString)

    return date.toLocaleDateString('ru-RU', options)
  }

  static formatNumber(numberString) {
    const number = Number(numberString)

    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
}
