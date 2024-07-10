const games = (doc: GoogleAppsScript.Spreadsheet.Spreadsheet) => {
  const sheet = doc.getSheetByName('Jeux')

  if (!sheet) return []

  const values = sheet.getRange('B2:N').getRichTextValues()
  // const valuesId = sheet.getRange('A2:A').getValues()
  const result = []

  interface Game {
    // id: number | null
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

  for (const value of values) {
    let hostname

    switch (value[0]?.getText().split('.')[0]) {
      case 'F95z':
        hostname = 'f95zone.to'
        break
      case 'LewdCorner':
        hostname = 'lewdcorner.com'
        break
      default:
        hostname = null
        break
    }

    const row: Game = {
      // id: valuesId[i][0] || null,
      domain: value[0]?.getText() || '',
      hostname,
      name: value[1]?.getText() || '',
      version: value[2]?.getText() || '',
      tversion: value[3]?.getText() || '',
      tname: value[4]?.getText() || '',
      status: value[5]?.getText() || '',
      tags: value[6]?.getText().split(', ') || [],
      type: value[7]?.getText() || '',
      traductor: value[8]?.getText() || null,
      proofreader: value[9]?.getText() || null,
      ttype: value[10]?.getText() || '',
      ac: Boolean(value[11]?.getText()),
      image: value[12]?.getText() || null,
      link: value[1]?.getLinkUrl() || '',
      tlink: value[4]?.getLinkUrl() || '',
      trlink: value[8]?.getLinkUrl() || null,
    }

    result.push(row)
  }

  return result
}

export default games
