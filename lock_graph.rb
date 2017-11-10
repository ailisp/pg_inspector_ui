require 'trollop'
require 'yaml'
require 'pg_inspector/error'
require 'pg_inspector/pg_inspector_operation'
require 'pg_inspector/util'
# gem install ruby-graphviz and be sure to gem uninstall graphviz if it's installed before
require 'graphviz'
require 'nokogiri'

module PgInspector
  class LockGraph < PgInspectorOperation
    HELP_MSG_SHORT = 'Generate human readable lock graph'.freeze
    attr_accessor :data, :connection_blocks

    def parse_options(args)
      self.options = Trollop.options(args) do
        opt(:connections, "Human readable connection information with locks",
            :type => :string, :short => "c", :default => DEFAULT_OUTPUT_PATH + "locks_output.yml")
      end
    end

    def run
      load_lock_connection_file
      obtain_block_info
      generate_lock_graph
      update_information_table
      notify_finish
    end

    private

    def load_lock_connection_file
      self.data = YAML.load_file(options[:connections])
    end

    def obtain_block_info
      self.connection_blocks = {}
      data["connections"].each do |conn|
        connection_blocks[conn["spid"]] = conn["blocked_by"]
      end
    end

    def generate_lock_graph
      g = GraphViz.new(:G, :type => :digraph)
      blocked_by_connections = connection_blocks.select { |_spid, blocked_by| !blocked_by.empty? }
      related_connections = blocked_by_connections.collect { |spid, blocked_by| blocked_by | [spid] }
      related_connections = related_connections.flatten
      related_connections &= related_connections
      connection_blocks.each do |spid, blocked_by|
        next unless related_connections.include?(spid)
        g.add_nodes(spid.to_s)
        blocked_by.each do |blocked_by_spid|
          g.add_edges(spid.to_s, blocked_by_spid.to_s)
        end
      end
      g.output(:svg => DEFAULT_OUTPUT_PATH + 'output.svg')
    end

    def update_information_table
      File.open(DEFAULT_OUTPUT_PATH + 'table.html', 'w') do |file|
        file.puts(hash_to_html_table(data, "connections"))
        file.puts(hash_to_html_table(data, "servers"))
        file.puts(hash_to_html_table(data, "workers"))
        file.puts(hash_to_html_table(data, "other_processes"))
      end
    end

    def notify_finish
      puts "Update output.svg and table.html in pg_inspector/output successful."
      puts "Please open pg_inspector/lock_graph.html in browser to analysis."
    end

    def hash_to_html_table(hash, title_key)
      doc = Nokogiri::HTML::DocumentFragment.parse("")
      Nokogiri::HTML::Builder.with(doc) do |d|
        d.table(:id => title_key, :class => "table") do
          d.captain { d.h3 { d.text(title_key) } }
          d.tr do
            table_header(hash, title_key).each do |col|
              d.th(:class => "pg_inspector_col_#{col}") { d.text(col) }
            end
          end
          hash[title_key].each do |row|
            d.tr do
              row.each do |header, col|
                d.td(:class => "pg_inspector_col_#{header}") { d.text(col) }
              end
            end
          end
        end
      end
      doc.to_xhtml(:indent => 3)
    end

    def table_header(hash, title_key)
      hash[title_key].first.keys
    end
  end
end
