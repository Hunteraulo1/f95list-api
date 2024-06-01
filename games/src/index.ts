const doGet = () => {
  const doc = SpreadsheetApp.openById('1ELRF0kpF8SoUlslX5ZXZoG4WXeWST6lN9bLws32EPfs')
  const sheet = doc.getSheetByName('Jeux')

  if (!sheet) return

  const values = sheet.getDataRange().getRichTextValues()
  const output = []

  interface Game {
    domain: string
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
    if (i > 0) {
      const row: Game = {
        domain: values[i][1]?.getText() || '',
        name: values[i][2]?.getText() || '',
        version: values[i][3]?.getText() || '',
        tversion: values[i][4]?.getText() || '',
        tname: values[i][5]?.getText() || '',
        status: values[i][6]?.getText() || '',
        tags: values[i][7]?.getText().split(', ') || [],
        type: values[i][8]?.getText() || '',
        traductor: values[i][9]?.getText() || null,
        proofreader: values[i][10]?.getText() || null,
        ttype: values[i][11]?.getText() || '',
        ac: Boolean(values[i][12]?.getText()),
        image: values[i][13]?.getText() || null,
        link: values[i][2]?.getLinkUrl() || '',
        tlink: values[i][5]?.getLinkUrl() || '',
        trlink: values[i][9]?.getLinkUrl() || null,
      }

      output.push(row)
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ data: output })).setMimeType(ContentService.MimeType.JSON)
}

export { doGet }
