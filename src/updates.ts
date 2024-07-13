const updates = (doc: GoogleAppsScript.Spreadsheet.Spreadsheet) => {
  const sheet = doc.getSheetByName('MAJ')

  if (!sheet) return []

  const values = sheet.getRange('A2:C15').getValues()
  const result = []

  interface Updates {
    date: string
    type: string
    names: string[]
  }

  const date = new Date()
  date.setDate(date.getTime() - 30 * 24 * 3600 * 1000) // 30 days

  for (const value of values) {
    const thisDate = new Date(value[0])

    if (thisDate < date) break

    const row: Partial<Updates> = {}

    row.date = value[0]
    row.type = value[1]
    row.names = value[2].split(', ')

    result.push(row)
  }

  return result
}

export default updates
