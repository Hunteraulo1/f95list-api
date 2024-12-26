const updates = (doc: GoogleAppsScript.Spreadsheet.Spreadsheet) => {
  const sheet = doc.getSheetByName('MAJ')

  if (!sheet) return []

  const values = sheet.getRange('A2:C202').getValues() // 200 rows
  const result = []

  interface Updates {
    date: string
    type: string
    names: string[]
  }

  for (const value of values) {
    const row: Partial<Updates> = {}

    row.date = value[0]
    row.type = value[1]
    row.names = value[2].split(',  ')

    result.push(row)
  }

  return result
}

export default updates
