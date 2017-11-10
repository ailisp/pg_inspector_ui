function indexFromHead(table, value) {
  return table.find('th:contains("' + value + '")').index();
}

function highlightRowBy(table, by, value) {
  var index = indexFromHead(table, by);
  var row = -1;
  table.find("tbody tr").each(function(i) {
    var current_row = $(this);
    var current_cell_text = $(current_row.children("td")[index]).text();
    if (current_cell_text == value) {
      row = i;
      current_row.addClass("success");
    } else {
      current_row.removeClass("success");
    }
  });
  return row;
};

function fullDateToShort(fullDate) {
  return fullDate.split(/\s+/)[1];
}

function showShortDateInCol(colHead) {
  var index = indexFromHead($('#connections'), colHead);
  $('#connections tr').each(function() {
    var current_row = $(this);
    var col = $(current_row.children("td")[index]);
    col.attr('full-date', col.text());
    col.text(fullDateToShort(col.text()));
  });
}

function showFullDateInCol(colHead) {
  var index = indexFromHead($('#connections'), colHead);
  $('#connections tr').each(function() {
    var current_row = $(this);
    var col = $(current_row.children("td")[index]);
    col.text(col.attr('full-date'));
  });
}

function showFullDate(full) {
  if (full) {
    showFullDateInCol('backend_start');
    showFullDateInCol('xact_start');
    showFullDateInCol('query_start');
    showFullDateInCol('state_change');
  } else {
    showShortDateInCol('backend_start');
    showShortDateInCol('xact_start');
    showShortDateInCol('query_start');
    showShortDateInCol('state_change');
  }
};

function showAllConnections(all) {
  if (all) {
    $("#connections tr").show();
  } else {
    var spid_index = $('#connections th:contains("spid")').index();
    $("#connections tr:not(:first)").each(function() {
      var current_row = $(this);
      var current_row_spid = $(current_row.children("td")[spid_index]).text();
      if(spid_in_graph(current_row_spid)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }
};

var graph_spid = new Set();

function spid_in_graph(spid) {
  return graph_spid.has(spid);
};

$(document).ready(function() {
  $("#graph").graphviz({
    url: "output/output.svg",
    ready: function() {
      var gv = this;
      gv.nodes().each(function () {
        var node = $(this);
        var spid = node.attr("data-name");
        graph_spid.add(spid);
      });

      gv.nodes().click(function () {
        var node = $(this);
        var spid = node.attr("data-name");

        gv.highlight(node, false);
        gv.bringToFront(node);
        var row = highlightRowBy($("#connections"), "spid", spid);
        var row_cells = $("#connections tr").eq(row).find("td");
        var server_id = row_cells.eq(indexFromHead($("#connections"), "server_id")).text();
        highlightRowBy($("#servers"), "server_id", server_id);
        var worker_id = row_cells.eq(indexFromHead($("#connections"), "worker_id")).text();
        highlightRowBy($('#workers'), "worker_id", worker_id);
      });

      $(document).keydown(function (evt) {
        if (evt.keyCode == 27) {
          gv.highlight();
        }
      });
    }
  });

  $("#locksTableOuter").load("output/table.html", function(){
    $("#connections tr .pg_inspector_col_query:not(:first)").each(function() {
      $(this).html("<pre><code>" + $(this).text() +"</code></pre>");
    });

    $("#show-conn-group input:checkbox:not(:checked)").each(function() {
      var column = "#connections .pg_inspector_col_" + $(this).attr("name");
      $(column).hide();
    });
    $("#show-conn-group input:checkbox").click(function(){
      var column = "#connections .pg_inspector_col_" + $(this).attr("name");
      $(column).toggle();
    });

    showFullDate(false);
    $("#option-group input:checkbox[name=show_full_date]").change(function(){
      if(this.checked) {
        showFullDate(true);
      } else {
        showFullDate(false);
      }
    });
    showAllConnections(false);
    $("#option-group input:checkbox[name=show_all_connections]").change(function(){
      if(this.checked) {
        showAllConnections(true);
      } else {
        showAllConnections(false);
      }
    });
  });
});
