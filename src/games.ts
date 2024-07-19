const games = (doc: GoogleAppsScript.Spreadsheet.Spreadsheet) => {
  const sheet = doc.getSheetByName('Jeux')

  if (!sheet) return []

  const values = sheet.getRange('A2:N').getValues()
  const valuesRich = sheet.getRange('C2:K').getRichTextValues()
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
    prlink: string | null
  }

  for (let i = 0; i < values.length; i++) {
    let hostname

    switch (values[i][1].split('.')[0]) {
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
      id: values[i][0] || null,
      domain: values[i][1] || '',
      hostname,
      name: values[i][2] || '',
      version: values[i][3] || '',
      tversion: values[i][4] || '',
      tname: values[i][5] || '',
      status: values[i][6] || '',
      tags: values[i][7].split(',  ') || [],
      type: values[i][8] || '',
      traductor: values[i][9] || null,
      proofreader: values[i][10] || null,
      ttype: values[i][11] || '',
      ac: values[i][12] || false,
      image: values[i][13] || null,
      link: valuesRich[i][0]?.getLinkUrl() || '',
      tlink: valuesRich[i][3]?.getLinkUrl() || '',
      trlink: valuesRich[i][7]?.getLinkUrl() || null,
      prlink: valuesRich[i][8]?.getLinkUrl() || null,
    }

    result.push(row)
  }

  return result
}

export default games
