const doGet = () => {
  const doc = SpreadsheetApp.openById('1ELRF0kpF8SoUlslX5ZXZoG4WXeWST6lN9bLws32EPfs')
  const sheet = doc.getSheetByName('Traducteurs/Relecteurs')

  if (!sheet) return

  const values = sheet.getRange('A2:B').getRichTextValues()
  const valuesNumber = sheet.getRange('C2:D').getValues()
  const output = []

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

    row['name'] = values[i][0]?.getText()
    row['pages'] = pages
    row['tradCount'] = valuesNumber[i][0]
    row['readCount'] = valuesNumber[i][1]
    row['score'] = valuesNumber[i][0] + valuesNumber[i][1]

    output.push(row)
  }
  return ContentService.createTextOutput(JSON.stringify({ data: output })).setMimeType(ContentService.MimeType.JSON)
}

export { doGet }
