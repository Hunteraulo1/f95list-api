const doGet = () => {
  const doc = SpreadsheetApp.openById(
    "1ELRF0kpF8SoUlslX5ZXZoG4WXeWST6lN9bLws32EPfs"
  );
  const sheet = doc.getSheetByName("MAJ");

  if (!sheet) return;

  const values = sheet.getRange("A2:C15").getValues();
  const output = [];

  interface Updates {
    date: string;
    type: string;
    names: string[];
  }

  console.log("call API");

  const date = new Date();
  date.setDate(date.getDate() - 7);

  for (var i = 0; i < values.length; i++) {
    const thisDate = new Date(values[i][0]);
    
    if (thisDate < date) break 
    
    const row: Partial<Updates> = {};
      
    row["date"] = values[i][0];
    row["type"] = values[i][1];
    row["names"] = values[i][2].split(", ");

    output.push(row);
  }
  return ContentService.createTextOutput(
    JSON.stringify({ data: output })
  ).setMimeType(ContentService.MimeType.JSON);
};

export { doGet };
