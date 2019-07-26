#!/usr/bin/env ruby

def replace_line_in_file(file_name, line_pattern, replacement)
  text = File.read(file_name)
  new_contents = text.gsub(line_pattern, replacement)
  File.open(file_name, "w") {|file| file.puts new_contents }
end


# execute
file_name   = ARGV[0];
build_id    = ARGV[1];
branch_name = ARGV[2];

puts("Reading file #{file_name}")
# job number -> travisVersion
puts("travisVersion = #{build_id}")
replace_line_in_file(file_name, /const travisVersion.*/, "const travisVersion='#{build_id}';")
# branch -> branchName
puts("branchName = #{branch_name}")
replace_line_in_file(file_name, /const branchName.*/, "const branchName='#{branch_name}';")
