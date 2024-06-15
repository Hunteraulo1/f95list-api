export const games = (doc: GoogleAppsScript.Spreadsheet.Spreadsheet) => {
  const sheet = doc.getSheetByName('Jeux')

  if (!sheet) return []

  const valuesId = sheet.getRange('A2:A').getValues()
  const values = sheet.getRange('B2:N').getRichTextValues()
  const result = []

  interface Game {
    id: number | null
    domain: string
    hostname: string | null
    name: string
    version: string
    tversion: string
    tname: string
    status: string
    tags: string[]
    type: string
    traductor: string | null
    proofreader: string | null
    ttype: string
    ac: boolean
    image: string | null
    link: string
    tlink: string
    trlink: string | null
  }

  console.log('call API')

  for (let i = 0; i < values.length; i++) {
    let hostname

    switch (values[i][0]?.getText().split('.')[0]) {
      case 'F95z':
        hostname = 'f95zone.to'
        break
      case 'LewdCorner':
        hostname = 'lewdcorner.com'
        break
      default:
        hostname = null
    }

    const row: Game = {
      id: valuesId[i][0] || null,
      domain: values[i][0]?.getText() || '',
      hostname,
      name: values[i][1]?.getText() || '',
      version: values[i][2]?.getText() || '',
      tversion: values[i][3]?.getText() || '',
      tname: values[i][4]?.getText() || '',
      status: values[i][5]?.getText() || '',
      tags: values[i][6]?.getText().split(', ') || [],
      type: values[i][7]?.getText() || '',
      traductor: values[i][8]?.getText() || null,
      proofreader: values[i][9]?.getText() || null,
      ttype: values[i][10]?.getText() || '',
      ac: Boolean(values[i][11]?.getText()),
      image: values[i][12]?.getText() || null,
      link: values[i][1]?.getLinkUrl() || '',
      tlink: values[i][4]?.getLinkUrl() || '',
      trlink: values[i][8]?.getLinkUrl() || null,
    }

    result.push(row)
  }

  return result
}
