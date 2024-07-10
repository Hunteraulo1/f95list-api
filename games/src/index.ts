import games from 'games'
import traductors from 'traductors'
import updates from 'updates'

const doGet = () => {
  const doc = SpreadsheetApp.openById('1ELRF0kpF8SoUlslX5ZXZoG4WXeWST6lN9bLws32EPfs')

  const output = {
    games: games(doc),
    updates: updates(doc),
    traductors: traductors(doc),
  }

  return ContentService.createTextOutput(JSON.stringify({ data: output })).setMimeType(ContentService.MimeType.JSON)
}

export { doGet }
