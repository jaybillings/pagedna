// Color blocks within cell
var colorBlock = $$({
    model: {
        color: 'blue'
    },
    view: {
        format: '<div data-bind="class=color"></div>'
    },
    controller: {}
});

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
        },
        content: function () {
            
        }()
    },
    view: {
       format: '<tr data-bind="content"></tr>'
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
                })
                me.append(newCell);
            }
            $$.document.append(me, 'table');
        },
        'click td': function (e) {
            console.log(this.model.get('states'));
            console.log(this.model.size());
            var me = this,
                color = e.target.className,
                states = me.model.get('states'),
                colName = states[color],
                colNum = me.model.get('columns').indexOf(colName),
                newColNum = colNum + 1 < me.model.get('columns').length ? colNum + 1 : 0;
            states[color] = me.model.get('columns')[newColNum];
            me.model.set({'states': states});
            me.view.render();
        }
    }
});

// Table

var table = $$({
    model: {
        columns: ['A', 'B']
    },
    view: {
        format:
        '<table id="dna-table">\
            <tr>\
                <th>A</th><th>B</th>\
            </tr>\
        </table>'
    },
    controller: {
        'create': function () {
            var me = this;
            $.getJSON("data/rows.json", function (data) {
                for (var i in data) {
                    var newRow = $$(row, {sequence: data[i].sequence, states: data[i].states});
                    me.append(newRow);
                }
            });
        }
    }
});
$$.document.append(table);


// Add column form

// Get JSON form
