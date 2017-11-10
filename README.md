# pg_inspector_ui readme

pg_inspector_ui is a ui for ManageIQ's pg_inspector tool. It can load the output from pg_inspector and generate lock graph for it's blocking connections. Then examine the blocking information in a web browser.

## Usage
First install graphviz from system package manager and ruby-graphviz gem. Note that there's also a gem called "graphviz", make sure that one is not installed. Also need trollop and nokogiri. Will make a Gemfile for this.
