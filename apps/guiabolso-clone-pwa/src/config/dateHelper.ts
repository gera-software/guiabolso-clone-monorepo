/**
 * 
 * @param number um número de 0 a 11 representando o mês
 * @returns strign representando o mês com três letras
 */
export function numberToMonth (number: number) {
    const months = [ 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez' ]
    return months[number]
}

/**
 * 
 * @param date 
 * @returns string com data em UTC no formato yyyy-mm-dd
 */
export function dateToUTCString(date: Date | null | undefined) : string {
    if(date) {
        // return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${(date.getDate()).toString().padStart(2, '0')}`
        return date.toISOString().split('T')[0]
    }
    return ''
}

/**
 * 
 * @returns string com data atual local no formato yyyy-mm-dd
 */
export function currentDateToUTCString() : string {
    const c = new Date()
    return dateToUTCString(new Date(Date.UTC(c.getFullYear(), c.getMonth(), c.getDate())))
}
  
/**
 * 
 * @param dateString string no formato yyyy-mm-dd
 * @returns data UTC correspondente
 */
export function stringToUTCDate(dateString: string): Date {
    
      // const date = new Date(dateString)
      // const start = date.toISOString().split('T')[0]
      // const end = (new Date()).toISOString().split('T')[1]
      // const isoDateString = start + 'T' + end
      // return new Date(isoDateString)
  
      const [ year, month, day ] = dateString.split('-')
      const date = new Date(Date.UTC(+year, +month - 1, +day))
      // date.setFullYear(+year, +month - 1, +day)
    //   console.log(dateString, date.toLocaleString(), date.toUTCString(), date.toISOString())
      return date
  }