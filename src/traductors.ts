const traductors = (doc: GoogleAppsScript.Spreadsheet.Spreadsheet) => {
  const sheet = doc.getSheetByName('Traducteurs/Relecteurs')

  if (!sheet) return []

  const values = sheet.getRange('A2:B').getRichTextValues()
  const valuesNumber = sheet.getRange('C2:D').getValues()
  const result = []

  interface Traductor {
    name: string
    pages: {
      title: string
      link: string
    }[]
    tradCount: number
    readCount: number
    score: number
  }

  for (let i = 0; i < values.length; i++) {
    const row: Partial<Traductor> = {}

    const pages: Traductor['pages'] = []

    const linksData = values[i][1]?.getRuns() || []

    if (linksData[0].getText() !== '') {
      for (const link of linksData) {
        if (link.getText() === ' - ') continue

        pages.push({
          title: link.getText(),
          link: link.getLinkUrl() || '',
        })
      }
    }

    row.name = values[i][0]?.getText()
    row.pages = pages
    row.tradCount = valuesNumber[i][0]
    row.readCount = valuesNumber[i][1]
    row.score = valuesNumber[i][0] + valuesNumber[i][1]

    result.push(row)
  }

  return result
}

export default traductors
