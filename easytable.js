Hooks.on("renderSidebarTab", async (app, html) => {
  if (app.options.id == "tables") {
    let button = $("<button class='new-easytable'><i class='fas fa-file-csv'></i> New EasyTable</button>")
    let settings = game.settings.get("easytable", "tableSettings")
    let title = settings.title;
    let csvData = settings.data;
    button.click(function () {
      new Dialog({
        title: "EasyTable",
        content: `<div>
         <div class="form-group import"><div class="import-options">Table Title</div><input type = 'text' name = "tableTitle"/></div>
         <div class="form-group import" title="Paste your CSV data here"><div class="import-options">CSV Data</div><input type = 'text' name = "csv" value="${csvData}"/></div>
        </div>
        `,
        buttons: {
          generate: {
            label: "Generate",
            callback: async (html) => {
              let title = html.find('[name="tableTitle"]').val();
              let csvData = html.find('[name="csv"]').val();

              await EasyTable.generate(title, csvData)
              console.log('EasyTable created');
            }
          },
          cancel: {
            label: "Cancel"
          }
        },
        default: "generate"
      }).render(true);
    })
    html.find(".directory-footer").append(button);
  }
})

Hooks.on("init", () => {
  game.settings.register("easytable", "tableSettings", {
    name: "Easytable Default Settings",
    scope: "world",
    config: false,
    default: {
      title: 'EasyTable',
      data: 'hello,world,this,is,an,easytable'
    }
  })
})



class EasyTable {
  static async generateTable(title, csvData) {

    let resultsArray = [];
    csvData.split(',').forEach((value, i) => {
      resultsArray.push({
        "type": 0,
        "text": value,
        "weight": 1,
        "range": [i+1, i+1],
        "drawn": false
      });
    });
    await RollTable.create({
      name: title,
      results: resultsArray,
      formula: "1d"+csvData.length,
      replacement: true,
      displayRoll: true
    });
  }
}
