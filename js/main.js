/* === Object partials === */

// Color blocks within cell
var colorBlock = $$({color: 'blue'}, '<div data-bind="class=color"></div>');

// Table cell
var cell = $$({}, '<td></td>');

// Table row
var row = $$({
    model: {
        columns: ['A', 'B'],
        sequence: ["red", "green", "yellow", "blue"],
        states: {
            "red": "A",
            "green": "A",
            "yellow": "A",
            "blue": "A"
        }
    },
    view: {
       format: '<tr></tr>'
    },
    controller: {
        'create': function() {
            var me = this;
            for (var i = 0; i < me.model.get('columns').length; i++) {
                var newCell = $$(cell, {});
                $.each(me.model.get('sequence'), function (j, val) {
                    if (me.model.get('states')[val] === me.model.get('columns')[i]) {
                        var newColorBlock = $$(colorBlock, {color: val});
                        newCell.append(newColorBlock);
                    }
                });
                me.append(newCell);
            }
        },
        'change:states': function () {
            this.empty();
            this.trigger('create');
        },
        'click td': function (e) {
            var me = this,
                color = e.target.className,
                states = me.model.get('states'),
                colName = states[color],
                colNum = me.model.get('columns').indexOf(colName),
                newColNum = colNum + 1 < me.model.get('columns').length ? colNum + 1 : 0;
            states[color] = me.model.get('columns')[newColNum];
            me.model.set({'states': states});
            this.parent().trigger('updateCount');
        }
    }
});

// Row headers
var rowHeader = $$({
    model: {
        label: 'A',
        count: '0'
    },
    view: {
        format: '<th><span data-bind="label"></span> (<span data-bind="count"></span>)</th>'
    },
    controller: {
        'create': function() {
            var me = this;
            // Handle count updates
            this.bind('updateCount', function(params, count) {
               me.model.set({'count': count.toString()});
            });
        }
    }
});

/* === Root objects === */

// Table
var table = $$({
    model: {
        columns: ['A', 'B'],
        rows: []
    },
    view: {
        format: '<table id="dna-table"></table>'
    },
    controller: {
        'create': function () {
            var me = this,
                counts = [0, 0];
            $.getJSON("data/rows.json", function (data) {
                for (var i in data) {
                    // Make rows
                    var newRow = $$(row, {sequence: data[i].sequence, states: data[i].states, columns: me.model.get('columns')});
                    me.append(newRow);
                    me.model.set({'rows': me.model.get('rows').concat([newRow])});
                    // Count blocks
                    $.each(data[i].states, function (j, val) {
                        var col = me.model.get('columns').indexOf(val);
                        counts[col] += 1;
                    });
                }
                // Set headers
                me.view.$('tr:first-child').before('<tr></tr>');
                $.each(me.model.get('columns'), function (i, val) {
                    var newHeader = $$(rowHeader, {label: val, count: counts[i]});
                    me.append(newHeader, 'tr:first-child');
                    // Pass along count updates to header obj
                    me.bind('updateCount', function() {
                        var count = getCount(i + 1);
                        newHeader.trigger('updateCount', [count]);
                    });
                });
            });
            // Bind add column function
            me.bind('addColumn', function(e, name) {
                me.model.set({'columns': me.model.get('columns').concat([name])});
                me.model.set({'rows': []});
                me.view.$().empty();
                me.trigger('create');
            });
        }
    }
});
$$.document.append(table);

// Add column form
var addForm = $$({
    model: {
        statusMessage: ''
    },
    view: {
        format: $('#add-col-template').html()
    },
    controller: {
        'submit form': function (e) {
            var colName;
            e.preventDefault();

            colName = this.view.$('input').val();
            if (table.model.get('columns').indexOf(colName) !== -1) {
                this.model.set({'statusMessage': 'A column with that name already exists.'})
            } else if (!nameIsValid(colName)) {
                this.model.set({'statusMessage': 'SThat column name is not valid.'});
            } else {
                table.trigger('addColumn', colName);
                this.model.set({'statusMessage': 'Trying to set columnName'});
            }
        },
        'focus input': function() {
            this.view.$('input').val('');
            this.model.set({'statusMessage': ''});
        }
    }
});
$$.document.append(addForm);

// Get JSON form
var saveForm = $$({
    model: {
        tableFormat: ''
    },
    view: {
        format: $('#save-template').html()
    },
    controller: {
        'submit &': function (e) {
            var layout = [];
            e.preventDefault();

            this.view.$().val('');
            $.each(table.model.get('rows'), function (i, val) {
                var rowLayout = {};
                rowLayout.sequence = val.model.get('sequence');
                rowLayout.states = val.model.get('states');
                layout.push(rowLayout);
            });

            this.model.set({'tableFormat': JSON.stringify(layout)});
            console.log('saved!');
            console.log(e);
        }
    }
});
$$.document.append(saveForm);

/* === Helper functions == */
var getCount = function(position) {
    return $('table tr td:nth-child(' + position + ') div').length;
};

var nameIsValid = function(name) {
    var reg = /^([A-FN-Z])(-\d{1,4})?$/g;
    return reg.test(name);
};
