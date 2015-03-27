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
        }
    }
});

// Table header
var header = $$({
    model: {
        label: 'A',
        count: 0
    },
    view: {
        format: ''
    },
    controller: {}
});

/* === Root objects === */

// Table
var table = $$({
    model: {
        columns: ['A', 'B']
    },
    view: {
        format:
        '<table id="dna-table">\
            <tr>\
                <th>A <span data-bind="count"></span></th><th>B <span data-bind="count"></span></th>\
            </tr>\
        </table>'
    },
    controller: {
        'create': function () {
            var me = this;
            $.getJSON("data/rows.json", function (data) {
                for (var i in data) {
                    var newRow = $$(row, {sequence: data[i].sequence, states: data[i].states, columns: me.model.get('columns')});
                    me.append(newRow);
                }
            });
        }
    }
});
$$.document.append(table);

// Add column form
var addCol = $$({
    model: {},
    view: {
        format: ''
    },
    controller: {}
});

// Get JSON form
var getJSON = $$({

});
