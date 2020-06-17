Hooks.on("renderSidebarTab", async (app, html) => {
  if (app.options.id == "tables") {
    let button = $("<button class='new-easytable'><i class='fas fa-file-csv'></i> New EasyTable</button>")
    let settings = game.settings.get("easytable", "tableSettings")
    let title = settings.title;
    let description = settings.description;
    let csvData = settings.data;
    let separator = settings.separator;
    button.click(function () {
      new Dialog({
        title: "EasyTable",
        content: `<div>
         <div class="form-group import"><div class="import-options">Table Title</div><input type = 'text' name = "tableTitle" value= "${title}"/></div>
         <div class="form-group import"><div class="import-options">Table Description</div><input type = 'text' name = "tableDescription" value= "${description}"/></div>
         <div class="form-group import" title="Paste your CSV data here"><div class="import-options">CSV Data</div><input type = 'text' name = "csv" value="${csvData}"/></div>
         <div class="form-group import" title="Change the separator character"><div class="import-options">Separator</div><input type = 'text' name = "separator" value="${separator}"/></div>
        </div>
        `,
        buttons: {
          generate: {
            label: "Generate",
            callback: async (html) => {
              let title = html.find('[name="tableTitle"]').val();
              let description = html.find('[name="tableDescription"]').val();
              let csvData = html.find('[name="csv"]').val();
              let separator = html.find('[name="separator"]').val();

              //TODO: Notify while dialog is still open, allowing changes
              if(!title){
                ui.notifications.error("EasyTables require a Title");
                return;
              } else if(!csvData){
                ui.notifications.error("EasyTables require the CSV Data field to be filled");
                return;
              } else if(!separator || separator.length > 1){
                //TODO: Restrict this properly
                ui.notifications.error("EasyTables require the separator field to contain a single character");
                return;
              }
              await EasyTable.generateTable(title, description, csvData, separator);
              game.settings.set("easytable", "tableSettings", {
                separator: separator
              });

              ui.norifications.notify(`EasyTable ${title} created`);
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
      description: 'An easy table',
      data: 'val1,val2,val3',
      separator: ','
    }
  })
})



class EasyTable {
  static async generateTable(title, description, csvData, separator) {

    let resultsArray = [];
    let csvElements = csvData.split(separator);
    csvElements.forEach((value, i) => {
      resultsArray.push({
        "type": 0,
        "text": value,
        "weight": 1,
        "range": [i + 1, i + 1],
        "drawn": false
      });
    });
    await RollTable.create({
      name: title,
      results: resultsArray,
      formula: `1d${csvElements.length}`,
      replacement: true,
      displayRoll: true
    });
  }
}
