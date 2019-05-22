#!/usr/bin/env ruby

# const
configs = {
  "name" => "config",
  "file" => 'src/config.js',
  "regex" => /const LT_CFG.*/,
  "changes" => {
    'prod'    => "const LT_CFG = LT_PROD;",
    'beta'    => "const LT_CFG = LT_PROD;",
    'prod2'   => "const LT_CFG = LT_PROD2;",
    'staging' => "const LT_CFG = LT_STAGING;",
    'stage'   => "const LT_CFG = LT_STAGING;",
    'staging2'=> "const LT_CFG = LT_STAGING2;",
    'stage2'  => "const LT_CFG = LT_STAGING2;",
    'dev'     => "const LT_CFG = LT_DEV;",
    'dev2'    => "const LT_CFG = LT_DEV2;",
    'local'   => "const LT_CFG = LT_LOCAL;",
    # 'dev-local'   => [
    #   {
    #     "regex" => /const LT_CFG.*/,
    #     ""
    # ]
  }
}
native_cfg = {
  "name" => "native-config",
  "file" => 'src/version.js',
  "changes" => {
    'native'   => [
      {"regex": /const exploreIsNative.*/,    "target" => "const exploreIsNative = true;" },
      {"regex": /const hotelitemIsNative.*/,  "target" =>"const hotelitemIsNative = true;"}
    ],
    'native1'   => [
      {"regex": /const exploreIsNative.*/,    "target" => "const exploreIsNative = true;"   },
      {"regex": /const hotelitemIsNative.*/,  "target" => "const hotelitemIsNative = false;"}
    ],
    'web'   => [
      {"regex": /const exploreIsNative.*/,    "target" => "const exploreIsNative = false;"  },
      {"regex": /const hotelitemIsNative.*/,  "target" => "const hotelitemIsNative = false;"}
    ],
  }
}
compilation_time = {
  "name" => "compile-time",
  "file" => 'src/version.js',
  "regex" => /const compilationTime.*/,
  "target" => "const compilationTime = '#{Time.now.strftime("%Y-%m-%d %H:%M:%S %Z")}';"
}
reactotron = {
  "prod" => {
    "file" => 'src/config-debug.js',
    # "regex": /const exploreIsNative.*/,
    # "target" => "const exploreIsNative = false;"
    "exec" => 'npm i reactotron-react-native -P'
  },
  "dev" => {
    # "file" => 'src/utils/reactotronLogging.js',
    "file" => 'src/config-debug.js',
    # "regex": /const exploreIsNative.*/,
    # "target" => "const exploreIsNative = false;"
    "exec" => 'npm i reactotron-react-native -D'
  },
}
errorLevel = {
  "name" => "error-level",
  "file" => 'src/config-debug.js',
  "regex": /const errorLevel.*/,
  "target" => "const errorLevel = 0;"
}

# all automatically executed
changes_auto = [compilation_time, errorLevel]; # CURRENTLY ENABLED by default (release)
# the rest
changes_other = [configs, native_cfg];


# functions
def help()
  if (
    ['-h','-help','--help','help','?','/?'].index(ARGV[0]) != nil \
      || ($0.index('./scripts') != 0 && Dir.pwd.index('scripts/') != nil)
  )
    cmd =  "./scripts/select_config.rb" #$0 #File.basename($0)
    puts("\n")
    puts("Usage:")
    puts("    #{cmd}  <params>...\n\n")
    puts("Examples:")
    puts("    #{cmd}  prod native")
    puts("    #{cmd}  dev native1")
    puts("    #{cmd}  web staging")
    puts("\nAll possible params:")
    $changes_names.each {|key,value| puts("    <#{key}>: #{value.join(', ')}")}
    puts("\nNotes:")
    puts("    Params order can be random.")
    puts("    Call path needs to be root of 'scripts/'\n")
    puts("\n")
    exit(1)
  end
end

def replace_line_in_file(file_name, line_pattern, target, item)
  if ($debug > 0) then
    puts "    name: #{item['name']}\n    file: #{file_name}\n    regex: #{line_pattern}\n    target: #{target}"
    return
  end

  text = File.read(file_name)
  puts("  Replacing '#{line_pattern}' with '#{target}'")
  new_contents = text.gsub(line_pattern, target)
  File.open(file_name, "w") {|file| file.puts new_contents }
end

def process_item_params(object)
  if object.key?("changes")
    return object["changes"].keys
  else
    return object["name"]
  end
end


def array_to_object(item,default)
  result = {}
  if item.class.to_s == "Array"
    item.each_with_index do |value,index|
      obj = {}
      default.each {|key2,value2| obj["#{key2}"] = value2}
      value.each {|key3,value3| obj["#{key3}"] = value3}
      prefix = default.key?("param") \
        ? default["param"]
        : "auto"
      result["#{prefix}_#{index+1}"] = obj
    end
  else
    result = item
  end

  return result
end


def process_auto_changes(auto)
  obj = process_change({"changes" => auto},{})
  result = [obj]
end


def process_change(item,default)
  result = nil
  is_array = false
  
  default["file"] = item["file"] if (item.key?("file"))
  default["regex"] = item["regex"] if (item.key?("regex"))

  if item.key?("changes") then
    item2 = item['changes']
    is_array = (item2.class == Array)
    default["param"] = item2["param"] if (!is_array && item2.key?('param'))
    tmp = (is_array) \
      ? item2 \
      : item2[default["param"].to_s]
    if tmp.class.to_s == "String"
      result = default.clone
      result["target"] = tmp
    else
      is_array = (tmp.class.to_s == "Array")
      result = array_to_object(tmp,default)
    end   
  elsif item.key?("change") then
    result = item["change"]
  else
    result = default.merge(item)
  end

  if !is_array then
    result = 
      (result.key?('param')) \
        ? { "#{result['param']}" => result } \
        : { "#{result['name']}" => result }
  end
  
  return result
end


def find_change(key, all, param)
  result = nil

  all.each do |item|
    default = {
      "name" => item['name'],
      "param" => param
    }
    default["file"] = item["file"] if (item.key?("file"))
    default["regex"] = item["regex"] if (item.key?("regex"))

    if key == item["name"] then
      result = process_change(item,default)
      break
    end
  end

  if result.key?("file") && !result.key?("param") then
    result["param"] = param
  end

  return result
end


def create_config(changes_auto, changes_other)
  # prepare the ones to execute
  changes = []
    # add automatic changes
  changes = process_auto_changes(changes_auto)

  # gather names of changes enabled and keys for params
  changes_names = {}
  changes_all = changes_other
  changes_all.each do |item|
    changes_names[item["name"]] = [];
    result = nil
    result = process_item_params(item)
    
    if changes_names[item["name"]].count > 0 then
      puts("Skipping duplicate '#{item['name']}' parameter")
    else
      changes_names[item["name"]] = result
    end
  end

  # parse arguments from command line
  ARGV.each_with_index do |cmd_param,i|
    changes_names.each do |key,param_names|
      if param_names.index(cmd_param)
        another_change = find_change(key,changes_other,cmd_param)
        if another_change then
          changes.push(another_change)
        end
      end
    end
  end

  if $debug > 1 then
    puts "changes_names"
    changes_names.each_with_index {|item,i| puts "   #{i}: #{item}"}
    puts "changes"
    changes.each_with_index {|item,i| puts "    #{i}: #{item["name"]}"}
    puts "params"
    changes.each {|key,item| puts "    #{key}: #{item}"}
  end

  $changes_names = changes_names
  $changes = changes
end


def main_exec(changes)
  puts("\n")
  # puts("Selecting config: #{cfg}\n")
  puts("Reading #{changes.count} chang#{changes.count == 1 ? 'e' : 'es'}:\n")

  # execute
  j=0
  changes.each_with_index do |current,i|
    current.each do |key,item|
      j+=1
      puts("\n  Executing change (#{j}) #{key}, #{item['name']}")
      puts("  ------------------------------------------------")
      name = key
      regex = item["regex"]
      file = item["file"]
      target = item["target"]
      puts("  Reading file '#{file}'")
      replace_line_in_file(file, regex, target, item)
      puts("\n\n")
    end
  end

  puts("\nDone.\n\n")
end


# main exec
# The use of global variables is for readability
# Used globals: $changes, $changes_names
  # global variable
$debug = 0
$changes = []
$changes_names = {}
  # if help param
create_config(changes_auto,changes_other)
help()
  # execution
main_exec($changes)