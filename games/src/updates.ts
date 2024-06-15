export const updates = (doc: GoogleAppsScript.Spreadsheet.Spreadsheet) => {
  const sheet = doc.getSheetByName('MAJ')

  if (!sheet) return []

  const values = sheet.getRange('A2:C15').getValues()
  const result = []

  interface Updates {
    date: string
    type: string
    names: string[]
  }

  console.log('call API')

  const date = new Date()
  date.setDate(date.getDate() - 30) // 7

  for (let i = 0; i < values.length; i++) {
    const thisDate = new Date(values[i][0])

    if (thisDate < date) break

    const row: Partial<Updates> = {}

    row['date'] = values[i][0]
    row['type'] = values[i][1]
    row['names'] = values[i][2].split(', ')

    result.push(row)
  }

  return result
}
