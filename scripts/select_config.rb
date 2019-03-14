#!/usr/bin/env ruby

# PARAM 1: prod|staging|dev
# PARAM 2: native|web

def replace_line_in_file(file_name, line_pattern, replacement)
  text = File.read(file_name)
  puts("replacing '#{line_pattern}' with '#{replacement}'")
  new_contents = text.gsub(line_pattern, replacement)
  File.open(file_name, "w") {|file| file.puts new_contents }
end


# changes list
configs = ['prod', 'staging', 'dev', 'local']
select_config = ['src/config.js', 
        /const LT_CFG.*/,
        {
          'prod'    => "const LT_CFG = LT_PROD;",
          'staging' => "const LT_CFG = LT_STAGING;",
          'dev'     => "const LT_CFG = LT_DEV;",
          'local'   => "const LT_CFG = LT_LOCAL;",
        }
]
native_cfg = ['src/version.js', 
        /const exploreIsNative.*/,
        {
          'native'   => [
            "const exploreIsNative = true;",
            "const hotelitemIsNative = true;",
          ],
          'native1'   => [
            "const exploreIsNative = true;",
            "const hotelitemIsNative = false;",
          ],
          'web'   => [
            "const exploreIsNative = false;",
            "const hotelitemIsNative = false;",
          ]
        }
]

# help case
if (ARGV.count == 0 \
			|| ['-h','-help','--help','help','?','/?'].index(ARGV[0]) != nil
)
	puts("\n")
	puts("Usage:\n\tselect_config.rb  prod|staging|dev|local  native|web")
	puts("\n")
	exit
end 

# execute
changes = [select_config]; # DISABLED
cfg = ARGV[0]
if ARGV.count > 1 then
  changes.push({
    "item" => native_cfg,
    "id" => ARGV[1]
  })
end

# changes.each do |item|
#   puts('----> item')
#   puts(item)
# end
# exit()

puts("\n")
if (
  configs.index(cfg) != nil \
    && ([1,2].index(ARGV.count) > -1) \
    && ['help','--help','/h','-h'].index(cfg) == nil
)
  puts("Selecting config: #{cfg}\n")
  puts("Executing #{changes.count} chang#{changes.count == 1 ? 'e' : 'es'}:")
  i=0
  changes.each do |itemObject|
    if itemObject.class.to_s == "Array"
      item = itemObject
      id = cfg
    else
      puts(itemObject)
      item = itemObject["item"]
      id = itemObject["id"]
    end
    file = item[0]
    regexp = item[1]
    repl = item[2][id]
    i+=1
    puts("\n  Executing change #{i}")
    puts("  --------------------------------")
    puts("  Reading file #{file}")
    puts("  Replacing regexp result of '#{regexp}'(#{regexp.class}) with '#{repl}(#{repl.class}')\n")
    replace_line_in_file(file, regexp, repl)
  end
else
  cmd = $0 #File.basename($0)
  puts("Usage:\n\t#{cmd} <#{configs.join('|')}>")
  puts("Examples:")
  puts("\t#{cmd} staging")
  puts("\t#{cmd} prod")
end
puts("\nDone.\n\n")