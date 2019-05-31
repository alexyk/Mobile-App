#!/usr/bin/env ruby

# sequence
#  main_exec
#    create_config  - prepare changes to execute
#      (1) find_change     - parse params
#      (2) process_change  - get change to execute

# const
configs = {
  "name" => "config",
  "file" => 'src/config.js',
  "regex" => /const LT_CFG.*/,
  "changes" => {
    'prod'    => "const LT_CFG = LT_PROD;",
    'beta'    => "const LT_CFG = LT_PROD;",
    'prod2'   => "const LT_CFG = LT_PROD2;",
    'dev'     => "const LT_CFG = LT_DEV;",
    'dev2'    => "const LT_CFG = LT_DEV2;",
    'local'   => "const LT_CFG = LT_LOCAL;",
    'staging' => "const LT_CFG = LT_STAGING;",
    'staging2'=> "const LT_CFG = LT_STAGING2;",
    'stage2'  => "const LT_CFG = LT_STAGING2;",
  }
}
# TODO: Make this an option of the object - alt, or alt_name(s) etc.
configs["changes"]["stage"] = configs["changes"]["staging"]
configs["changes"]["beta"] = configs["changes"]["prod"]
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
  "name" => "reactotron-installation-type",
  "changes" => {
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
    }
  }
}
reactotron["changes"]["saveProd"] = reactotron["changes"]["prod"]
reactotron["changes"]["saveDev"] = reactotron["changes"]["dev"]
errorLevel = {
  "name" => "error-level",
  "file" => 'src/config-debug.js',
  "changes" => {
    "release" => {
      "regex" => /const errorLevel.*/,
      "target" => "const errorLevel = 0;"
    },
    "error0" => {
      "regex" => /const errorLevel.*/,
      "target" => "const errorLevel = 0;"
    },
    "error1" => {
      "regex" => /const errorLevel.*/,
      "target" => "const errorLevel = 1;"
    },
    "error2" => {
      "regex" => /const errorLevel.*/,
      "target" => "const errorLevel = 2;"
    },
    "error3" => {
      "regex" => /const errorLevel.*/,
      "target" => "const errorLevel = 3;"
    },
  }
}
errorLevel["changes"]["release"]["file"] = errorLevel["file"]
errorLevel["changes"]["release"]["name"] = errorLevel["name"]
logging = {
  "name" => "logging",
  "changes" => {
    "release" => {
      "file"=>"src/config-debug.js",
      "regex"=>/const clog =.*/,
      "target"=>"const clog = () => {};"
    }
  }
}
logging["changes"]["release"]["name"] = logging["name"]


# all automatically executed
changes_auto = [compilation_time, errorLevel["changes"]["release"], logging["changes"]["release"]]; # CURRENTLY ENABLED by default (release)
# the rest
changes_other = [configs, native_cfg, reactotron, errorLevel];


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
  if ($debug > 1) then
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
  result = item
  if result.key?('changes') then
    result["change"] = nil
  end
  is_array = false

  if $debug > 2 then
    puts "   [process_change]\n\titem: #{item},\n\tdefault: #{default}"
  else
    if $debug > 1 then puts "   [process_change]   default[param]: #{default['param']}\n" end
  end
  
  tmp_file = item["file"] if item["file"]
  tmp_regex = item["regex"] if (item.key?("regex"))
  default["file"] = tmp_file
  default["regex"] = tmp_regex

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
    # debug
    if $debug > 0 then
      puts("   [process_change] not array -> result has param key: #{result.key?('param')}")
      puts("                                 result: #{result}\n")
    end

    # fill gaps for name and file
    if !result.key?('file') && item.key?('file') then
      result['file'] = item['file']
    end
    if !result.key?('name') && item.key?('name') then
      result['name'] = item['name']
    end
    name = ( result.key?('param') ? result['param'] : result['name'] )
    result = { "#{name}": result}

    # debug
    if $debug > 0 then
      puts("                     result name: #{name}")
    end
  end
  
  return result
end


def find_change(key, all, param)
  result = nil

  if $debug > 0 then
    puts
    puts "[DEBUG][find_change] Parsing parameter '#{param}'"
  end

  default = {
    "param" => param
  }

  all.each do |item|
    default["name"] = item['name'],
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

  if $debug > 0 then
    puts "[result][process_change -> find_change]: #{result}"
    puts "[DEBUG][find_change] End parsing parameter '#{param}'"
    puts
  end

  return result
end


def create_config(changes_auto, changes_other)
  # prepare the ones to execute
  changes = []
    # add automatic changes
  changes = process_auto_changes(changes_auto)

  if $debug > 4 then
    puts
    puts "Changes class: #{changes.class}"
    changes.each{|item|
      n=1
      item.each{|key,value|
        puts
        puts "------  auto change #{n} -------"
        puts "  key: #{key}"
        puts "  value: #{value}"
        puts
        n+=1
      }
    }
    exit()
  end

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
    if $debug > 2 then
      puts "params"
      changes.each {|key,item| puts "    #{key}: #{item}"}
    end
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
      if file and file.length>0 then
        puts("  Reading file '#{file}'")
        replace_line_in_file(file, regex, target, item)
      else
        puts("File name is empty: '#{file}', for '#{item}'")
      end
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
if $debug > 0 then
  puts("\nDebug mode active: #{$debug}\n\n")
end
  # if help param
create_config(changes_auto,changes_other)
help()
  # execution
main_exec($changes)