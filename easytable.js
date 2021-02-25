Hooks.on("renderSidebarTab", async (app, html) => {
    if (!game.user.isGM) {
        return;
    }
    if (app.options.id == "tables") {
        // -- CSV Mode --
        let csvButton = $(`<button class='new-easytable'><i class='fas fa-file-csv'></i> ${game.i18n.localize("EASYTABLE.ui.button-csv-title")}</button>`)
        let settings = game.settings.get("EasyTable", "tableSettings")
        let title = settings.title;
        let description = settings.description;
        let csvData = settings.data;
        let separator = settings.separator;
        csvButton.click(function () {
            new Dialog({
                title: game.i18n.localize("EASYTABLE.ui.dialog.csv.title"),
                content: `
                <div>
                    <div class="form-group"><div>${game.i18n.localize("EASYTABLE.ui.dialog.csv.table-title")}</div><input type='text' name="tableTitle" value="${title}"/></div>
                    <div class="form-group"><div>${game.i18n.localize("EASYTABLE.ui.dialog.csv.table-description")}</div><input type='text' name="tableDescription" value="${description}"/></div>
                    <div class="form-group" title="${game.i18n.localize("EASYTABLE.ui.dialog.csv.csv-data-tooltip")}"><div>${game.i18n.localize("EASYTABLE.ui.dialog.csv.csv-data")}</div><textarea name="csv">${csvData}</textarea></div>
                    <div class="form-group" title="${game.i18n.localize("EASYTABLE.ui.dialog.csv.separator-tooltip")}"><div>${game.i18n.localize("EASYTABLE.ui.dialog.csv.separator")}</div><input type='text' name="separator" maxlength="1" value="${separator}"/></div>
                    <div class="form-group" title="${game.i18n.localize("EASYTABLE.ui.dialog.csv.defaultcollection-tooltip")}"><div>${game.i18n.localize("EASYTABLE.ui.dialog.csv.defaultcollection")}</div>
                        <select name="defaultcollection" id="defaultcollection">
                            <option value="Text">Text</option>
                            <option value="Item">Item</option>
                            <option value="Actor">Actor</option>
                            <option value="Scene">Scene</option>
                            <option value="JournalEntry">JournalEntry</option>
                            <option value="Macro">Macro</option>
                            <option value="RollTable">RollTable</option>
                            <option value="Playlist">Playlist</option>
                        </select>
                    </div>
                    <hr/>
                </div>
                `,
                buttons: {
                    generate: {
                        label: game.i18n.localize("EASYTABLE.ui.dialog.csv.button.generate"),
                        callback: async (html) => {
                            let title = html.find('[name="tableTitle"]').val();
                            let description = html.find('[name="tableDescription"]').val();
                            let csvData = html.find('[name="csv"]').val();
                            let separator = html.find('[name="separator"]').val();
                            let defaultCollection = html.find('[name="defaultcollection"').val();
                            console.log(defaultCollection);

                            //TODO: Notify while dialog is still open, allowing changes
                            if (!title) {
                                ui.notifications.error(game.i18n.localize("EASYTABLE.notif.title-required"));
                                return;
                            } else if (!csvData) {
                                ui.notifications.error(game.i18n.localize("EASYTABLE.notif.csv-required"));
                                return;
                            } else if (!separator || separator.length > 1) {
                                //TODO: Restrict this properly
                                ui.notifications.error(game.i18n.localize("EASYTABLE.notif.separator-required"));
                                return;
                            }
                            game.settings.set("EasyTable", "tableSettings", {
                                title: 'EasyTable',
                                description: 'An easy table',
                                data: `val1${separator}val2${separator}val3`,
                                separator: separator || ','
                            });
                            await EasyTable.generateTable(title, description, csvData, separator, defaultCollection);

                            ui.notifications.notify(`${game.i18n.localize("EASYTABLE.notif.table-created")} ${title}`);
                        }
                    },
                    cancel: {
                        label: game.i18n.localize("EASYTABLE.ui.dialog.csv.button.cancel")
                    }
                },
                default: "generate"
            }).render(true);

        })

        // -- Table Paste mode --
        let tableButton = $(`<button class='new-easytable'><i class='fas fa-file-csv'></i> ${game.i18n.localize("EASYTABLE.ui.button-tablepaste-title")}</button>`)
        tableButton.click(function () {
            new Dialog({
                title: game.i18n.localize("EASYTABLE.ui.dialog.tablepaste.title"),
                content: `<div> 
                <div class="form-group"><div>${game.i18n.localize("EASYTABLE.ui.dialog.tablepaste.table-title")}</div><input type='text' name="tableTitle" value="${title}"/></div>
                <div class="form-group"><div>${game.i18n.localize("EASYTABLE.ui.dialog.tablepaste.table-description")}</div><input type='text' name="tableDescription" value=""/></div>
                <div class="form-group" title="${game.i18n.localize("EASYTABLE.ui.dialog.tablepaste.table-data-tooltip")}"><div>${game.i18n.localize("EASYTABLE.ui.dialog.tablepaste.table-data")}</div><textarea name="tableData"></textarea></div>
                <div class="form-group" title="${game.i18n.localize("EASYTABLE.ui.dialog.tablepaste.safemode-tooltip")}"><div>${game.i18n.localize("EASYTABLE.ui.dialog.tablepaste.safemode")}</div><input type="checkbox" id="safeMode" name="safeMode"></div>
                <hr/>
            </div>
            `,
                buttons: {
                    generate: {
                        label: game.i18n.localize("EASYTABLE.ui.dialog.tablepaste.button.generate"),
                        callback: async (html) => {
                            let title = html.find('[name="tableTitle"]').val();
                            let description = html.find('[name="tableDescription"]').val();
                            let tableData = html.find('[name="tableData"]').val();
                            let safeMode = html.find('[name="safeMode"]')[0].checked

                            if (!title) {
                                ui.notifications.error(game.i18n.localize("EASYTABLE.notif.title-required"));
                                return;
                            } else if (!tableData) {
                                ui.notifications.error(game.i18n.localize("EASYTABLE.notif.tabledata-required"));
                                return;
                            }

                            await EasyTable.generateTablePastedData(title, description, tableData, safeMode);

                            ui.notifications.notify(`${game.i18n.localize("EASYTABLE.notif.table-created")} ${title}`);
                        }
                    },
                    cancel: {
                        label: game.i18n.localize("EASYTABLE.ui.dialog.tablepaste.button.cancel")
                    }
                },
                default: "generate"
            }, {
                resizable: true
            }).render(true);

        });

        let header = `<span class="new-easytable">${game.i18n.localize("EASYTABLE.ui.button-header")}</span><div class="easytable-actions header-actions action-buttons flexrow">
    </div>`;
        $(header).insertAfter(html.find('.directory-header').find('.header-actions'));
        $('.easytable-actions').append(csvButton).append(tableButton);
    }
})

Hooks.on("init", () => {
    let etSettings = {
        title: game.i18n.localize("EASYTABLE.settings.default.title"),
        description: game.i18n.localize("EASYTABLE.settings.default.description"),
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

    static getCollection(collection) {
        let validCollection = ['Actor', 'Scene', 'Macro', 'Playlist', 'JournalEntry', 'RollTable', 'Item']
        if (validCollection.includes(collection)) {
            return collection
        }
        return '';
    }

    static getResultId(collection, text) {
        let resultId = '';
        let img = 'icons/svg/d20-black.svg'
        if (collection == 'Text' || !collection) {
            return [resultId, img];
        }
        let entity;
        switch (collection) {
            case 'Actor':
                    entity = game.actors.getName(text);
                    resultId = entity?.id||''
                    img = entity?.img||img;
                break;
            case 'Scene':
                    entity = game.scenes.getName(text);
                    resultId = entity?.id||''
                    img = entity?.img||img;
                break;
            case 'Macro':
                    entity = game.macros.getName(text);
                    resultId = entity?.id||''
                    img = entity?.data?.img||img;
                break;
            case 'Playlist':
                    entity = game.playlists.getName(text);
                    resultId = entity?.id||''
                    // img = entity?.img||img;
                break;
            case 'JournalEntry':
                    entity = game.journal.getName(text);
                    resultId = entity?.id||''
                    img = entity?.data?.img||img;
                break;
            case 'RollTable':
                    entity = game.tables.getName(text);
                    resultId = entity?.id||''
                    img = entity?.data?.img||img;
                break;
            case 'Item':
                    entity = game.items.getName(text);
                    resultId = entity?.id||''
                    img = entity?.img||img;
                break;
            default:
                break;
        }
        return [resultId, img];
    }

    static async generateTable(title, description, csvData, separator, defaultCollection = 'Text') {
        let resultsArray = [];
        let csvElements = csvData.split(separator);
        let rangeIndex = 1;
        csvElements.forEach((csvElement, i) => {
            let [text, opts] = csvElement.split('{');
            let weight;
            let collection = defaultCollection;
            if (opts) {
                opts = opts.split('}')[0];
                [weight, collection] = opts.split('@');
                weight = parseInt(weight);
            }
            if (!weight || weight < 1) {
                weight = 1;
            }
            let type = 1;
            let resultCollection = EasyTable.getCollection(collection);
            let [resultID, img] = EasyTable.getResultId(resultCollection, text);
            if(!resultID || resultID.length < 1){
                resultCollection = '';
                type = 0;
            }
            resultsArray.push({
                "type": type,
                "text": text,
                "weight": weight,
                "range": [rangeIndex, rangeIndex + (weight - 1)],
                "collection": resultCollection,
                "resultId": resultID,
                "drawn": false,
                "img": img
            });
            rangeIndex += weight;
        });

        let table = await RollTable.create({
            name: title,
            description: description,
            results: resultsArray,
            replacement: true,
            displayRoll: true,
            img: "modules/EasyTable/easytable.png"
        });
        await table.normalize();
    }

    static async generateTablePastedData(title, description, tableData, safeMode = false) {

        if(!safeMode){
            var rows = tableData.split(/\n(?=\d+[-–+\t])/);

            tableData = "";

            rows.forEach(row => {
                row = row.replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').replace(/^\s+|\s+$/, '');
                tableData += row + "\n";
            });
        }

        let resultsArray = [];
        let processed = [];
        let tableEntries = tableData.split(/[\r\n]+/);
        let rangeIndex = 1;
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
            if (!weight || weight < 1) {
                weight = 1;
            }
            weight = parseInt(weight);
            resultsArray.push({
                "type": 0,
                "text": text,
                "weight": weight || 1,
                "range": [rangeIndex, rangeIndex + (weight - 1)],
                "drawn": false
            });
            rangeIndex += weight;
        });
        let table = await RollTable.create({
            name: title,
            description: description,
            results: resultsArray,
            replacement: true,
            displayRoll: true,
            img: "modules/EasyTable/easytable.png"
        });
        await table.normalize();
    }
}