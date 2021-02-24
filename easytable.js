Hooks.on("renderSidebarTab", async (app, html) => {
    if (!game.user.isGM) {
        return;
    }
    if (app.options.id == "tables") {
        // -- CSV Mode --
        let csvButton = $("<button class='new-easytable'><i class='fas fa-file-csv'></i> CSV</button>")
        let settings = game.settings.get("EasyTable", "tableSettings")
        let title = settings.title;
        let description = settings.description;
        let csvData = settings.data;
        let separator = settings.separator;
        csvButton.click(function () {
            new Dialog({
                title: "EasyTable from CSV",
                content: `<div>
         <div class="form-group"><div>Table Title</div><input type='text' name="tableTitle" value="${title}"/></div>
         <div class="form-group"><div>Table Description</div><input type='text' name="tableDescription" value="${description}"/></div>
         <div class="form-group" title="Paste your CSV data here"><div>CSV Data</div><textarea name="csv">${csvData}</textarea></div>
         <div class="form-group" title="Change the separator character"><div>Separator</div><input type='text' name="separator" maxlength="1" value="${separator}"/></div>
         <hr/>
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
                            if (!title) {
                                ui.notifications.error("EasyTables require a Title");
                                return;
                            } else if (!csvData) {
                                ui.notifications.error("EasyTables require the CSV Data field to be filled");
                                return;
                            } else if (!separator || separator.length > 1) {
                                //TODO: Restrict this properly
                                ui.notifications.error("EasyTables require the separator field to contain a single character");
                                return;
                            }
                            //TODO: Improve settings update
                            game.settings.set("EasyTable", "tableSettings", {
                                title: 'EasyTable',
                                description: 'An easy table',
                                data: `val1${separator}val2${separator}val3`,
                                separator: separator || ','
                            });
                            await EasyTable.generateTable(title, description, csvData, separator);

                            ui.notifications.notify(`EasyTable ${title} created`);
                        }
                    },
                    cancel: {
                        label: "Cancel"
                    }
                },
                default: "generate"
            }).render(true);

        })

        // -- Table Paste mode --
        let tableButton = $("<button class='new-easytable'><i class='fas fa-file-csv'></i> TablePaste</button>");
        tableButton.click(function () {
            new Dialog({
                title: "EasyTable Table Paste Mode",
                content: `<div> 
                <div class="form-group"><div>Table Title</div><input type='text' name="tableTitle" value="${title}"/></div>
                <div class="form-group"><div>Table Description</div><input type='text' name="tableDescription" value=""/></div>
                <div class="form-group" title="Paste your table data here"><div>Table Data - DO NOT include a table header here. Set the title above.</div><textarea name="tableData"></textarea></div>
                <hr/>
            </div>
            `,
                buttons: {
                    generate: {
                        label: "Generate",
                        callback: async (html) => {
                            let title = html.find('[name="tableTitle"]').val();
                            let description = html.find('[name="tableDescription"]').val();
                            let tableData = html.find('[name="tableData"]').val();

                            //TODO: Notify while dialog is still open, allowing changes
                            if (!title) {
                                ui.notifications.error("EasyTables require a Title");
                                return;
                            } else if (!tableData) {
                                ui.notifications.error("EasyTables require the Table Data field to be filled");
                                return;
                            }

                            await EasyTable.generateTablePastedData(title, description, tableData);

                            ui.notifications.notify(`EasyTable ${title} created`);
                        }
                    },
                    cancel: {
                        label: "Cancel"
                    }
                },
                default: "generate"
            }).render(true);

        });

        let header = `<span class="new-easytable">EasyTable</span><div class="easytable-actions header-actions action-buttons flexrow">
    </div>`;
        $(header).insertAfter(html.find('.directory-header').find('.header-actions'));
        $('.easytable-actions').append(csvButton).append(tableButton);
    }
})

Hooks.on("init", () => {
    let etSettings = {
        title: 'EasyTable',
        description: 'An easy table. Optional {} denotes weight',
        data: 'val1,val2{2},val3',
        separator: ','
    };
    game.settings.register("EasyTable", "tableSettings", {
        name: "Easytable Default Settings",
        scope: "world",
        config: false,
        default: etSettings
    });
});



class EasyTable {
    static async generateTable(title, description, csvData, separator) {

        let resultsArray = [];
        let csvElements = csvData.split(separator);
        csvElements.forEach((csvElement, i) => {
            let [text, weight] = csvElement.split('{');
            if (weight) {
                weight = weight.split('}')[0];
            }
            console.log(weight);
            resultsArray.push({
                "type": 0,
                "text": text,
                "weight": weight || 1,
                "drawn": false
            });
        });
        let table = await RollTable.create({
            name: title,
            description: description,
            results: resultsArray,
            replacement: true,
            displayRoll: true
        });
        await table.normalize();
    }

    static async generateTablePastedData(title, description, tableData) {

        let resultsArray = [];
        let processed = [];
        let tableEntries = tableData.split(/[\r\n]+/);
        tableEntries.forEach((tableEntry, i) => {
            if (processed[i]) {
                return;
            }
            processed[i] = true;
            tableEntry = tableEntry.trim();
            if (tableEntry.length < 1) {
                return;
            }
            let weight, text;
            if (tableEntry.match(/^\d/)) {
                [weight, text] = tableEntry.split(/(?<=^\S+)\s/)
                try {
                    if (weight.match(/[\d]+-[\d]+/)) {
                        let [beginRange, endRange] = weight.split('-');
                        if (endRange === '00') {
                            endRange = '100'
                        }
                        weight = endRange - beginRange + 1;
                    } else if (weight.match(/[\d]+–[\d]+/)) { // Not actually a hyphen...
                        let [beginRange, endRange] = weight.split('–');
                        if (endRange === '00') {
                            endRange = '100'
                        }
                        weight = endRange - beginRange + 1;
                    } else {
                        weight = 1;
                    }
                    if (!text) {
                        // Likely in a linebreak-based table
                        while (!text && i < tableEntries.length - 1) {
                            let index = ++i;
                            processed[index] = true;
                            text = tableEntries[index].trim();
                        }
                    }
                } catch (e) {
                    console.log(e);
                    weight = 1;
                }
            }
            if (!text) {
                text = "TEXT MISSING";
            }
            resultsArray.push({
                "type": 0,
                "text": text,
                "weight": weight || 1,
                "drawn": false
            });
        });
        let table = await RollTable.create({
            name: title,
            description: description,
            results: resultsArray,
            replacement: true,
            displayRoll: true
        });
        await table.normalize();
    }
}