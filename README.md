# pg_inspector_ui readme

pg_inspector_ui is a ui for ManageIQ's pg_inspector tool. It can load the output from pg_inspector and generate lock graph for it's blocking connections. Then examine the blocking information in a web browser.

## Usage

First install graphviz from system package manager. Then run `./lock_graph.rb path/to/pg_inspector_locks_output.yml` or just `path/to/lock_graph.rb` in the directory `pg_inspector_locks_output.yml` placed. Then open lock_graph.html in browser to see lock graph with some simple interactive help information.

