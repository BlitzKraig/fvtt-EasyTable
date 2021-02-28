# EasyTable

![EasyTable Release](https://github.com/BlitzKraig/fvtt-EasyTable/workflows/EasyTable%20Release/badge.svg)
![Latest Release Download Count](https://img.shields.io/github/downloads/BlitzKraig/fvtt-EasyTable/latest/easytable-release.zip)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q01YIEJ)

Easy RollTables from CSV (or any-SV) data!

Now includes Entity Collections! (Items, Actors, Scenes, Macros, Playlists, JournalEntrys, RollTables)

See 'Entity Collections' section below for details.

---

## Method 1 - CSV or *-sv Input

1. Go to the RollTables tab in FVTT
2. Click on the CSV to Table button
3. Fill in the table title, description(optional) and copy/paste your *-sv data
4. Generate

### Weighting Entries

Entries can be weighted by adding integers inside curly braces after the entry name, and before the separator.

Higher weight entries will be randomly selected more often, by expanding the range and weight in the table.

Weighting example data:

`Entry 1, Entry 2{2}, Entry 3{4}, Entry 4`

In this example, the resulting table will be a `1d8` roll with the following ranges.

* Entry 1 - 1
* Entry 2 - 2,3
* Entry 3 - 4,5,6,7
* Entry 4 - 8

### NEW in 1.3.0 - Entity Collections

You can now use EasyTable to create 'Entities' in your tables.

Entities can reference: 'Actor', 'Scene', 'Macro', 'Playlist', 'JournalEntry', 'RollTable', 'Item'

The Entity must exist in your world, and not inside a Compendium.

Non-existant entities will simply output as text.

#### Default Entity

There is a new `Default Entity` dropdown in the CSV importer. You can change this to any of the entity types. Any data inserted into the table without a specific entity tag will be checked to see if it exists as this entity type.

For example:

I have a `Greatsword` item and a `Bow` item in my Items directory.

I set the `Default Entity` to `Item`, then import `Greatsword,Bow,Crossbow`

The resulting table will contain a fully linked reference to the `Greatsword` item, and the `Bow` item.

The `Crossbow` entry will revert to a simple text entry, as it does not exist in this instance.

#### Per Entry Entity

The Weighting brackets can also be used to specify a particular Entity type for an entry.

This can be combined with the `Default Entity` dropdown to make things easier.

The entity should be tagged with an `@` symbol followed by the entity type inside the weighting brackets.

If the entry also has a weight, the entity tag should come after the weight.

For example:

I have a `Greatsword` item and a `Bow` item in my Items directory.

I have a `Cool Scene` scene and a `Cooler Scene` scene in my Scenes directory

I set the `Default Entity` to `Item`, then import `Greatsword,Bow,Cool Scene{@Scene},Cooler Scene{4@Scene}`

The resulting table will contain fully linked references to the `Greatsword` and `Bow` items, and fully linked references to the `Cool Scene` and `Cooler Scene` scenes. The `Cooler Scene` entry will also have a weight of 4.

## Method 2 - TablePaste Input

TablePate input is designed to allow you to copy and paste data from tables in digital sourcebooks, or from the web.

As long as the table has the dice roll in column 1 and the value in column 2, you should be able to highlight and copy all of the values to use with EasyTable

1. Go to the Rollable Tables tab in FVTT, click the New EasyTable button.
2. Click the TablePaste button
3. Fill in the table title, description(optional) and copy/paste some data from a table (e.g The random misfortunes table on <https://www.5esrd.com/spellcasting/alternate-magic-rules/ritual-magic/#Non-Ritual_Casters>)
4. Generate!

TablePaste does not support Entity Collections

Weighting is handled automatically in TablePaste mode, using the dice roll column

## Exporting Tables to CSV

EasyTable can export any table to CSV, including a customisable separator, optional weights and entity types, ready to be edited externally or re-imported with EasyTable.

Simply right click a table in your tables directory and choose Export EasyTable, then follow the instructions.

Note that the export function does not export the title or the description, just the data inside the table.

## Manifest

`https://raw.githubusercontent.com/BlitzKraig/fvtt-EasyTable/master/module.json`

## Feedback

For bugs/feedback, create an issue on GitHub, or contact me on Discord at Blitz#6797

## [Release Notes](./CHANGELOG.md)
