# pg_inspector_ui

pg_inspector_ui is a ui for ManageIQ's pg_inspector tool. It can load the output from pg_inspector and generate lock graph for it's blocking connections. Then examine the blocking information in a web browser.

## Usage

1. Install graphviz from system package manager.
2. Clone this repo using `git clone --recursive https://github.com/ailisp/pg_inspector_ui.git`
3. Run `./lock_graph.rb path/to/pg_inspector_locks_output.yml` or just `path/to/lock_graph.rb` in the directory `pg_inspector_locks_output.yml` placed. 
4. Open lock_graph.html in browser to see lock graph with some simple interactive help information.

