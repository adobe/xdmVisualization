#!/bin/bash
#generate xdm visualization navigation page list.md without using dropdown

repoBranch=$1
cd prod/$repoBranch/
rm index.html
echo "# XDM Visualization" >> list.md
echo "## Git Repo Branch: $repoBranch" >> list.md

#loop all the xdm files and categorize them into different arrays by filename pattern
uberSchemas=()
standardComponents=()
extensionComponents=()
standardCompGrp=()

folders=(adobe behaviors airship facebook classes datatypes fieldgroups uberschemas)

rm ../../listOfXdms.txt
for folder in ${folders[@]}; do
  objs=$(find "schemas/$folder" -name "*.schema.json" -print -maxdepth 5)
  for obj in $objs; do
    origin="${obj/schemas\//}"
    schema="${origin/.schema.json/}"
    filename="${schema//\//.}"
    #echo "filename-->" $filename
    if [[ $filename != *.obj[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]* ]] # not showing generated objs
    then
        echo "$filename," >> ../../listOfXdms.txt
        if [[ $filename == adobe.* || $filename == airship.* || $filename == facebook.* ]]
        then
          extensionComponents+=( ${filename} )
        elif [[ $filename == uberschemas.* ]];
        then
          uberSchemas+=( $filename )
        else
          standardComponents+=( ${filename} )
        fi
        #echo "<a href = "http://localhost:9001/prod/$repoBranch/$filename.html">${filename}</a>" >> index.html
        #echo "<br>" >> index.html
    fi
    cp basic.html $filename.html #use basic as template
    sed  -i '' "s#experience/Profile.schema.json#$origin#g" $filename.html
  done
done

#standard component group setup for classes, datatypes, fieldgroups etc.
for i in ${standardComponents[@]}; do
  value=$(echo ${i%%.*})
  if ! (printf '%s\n' "${standardCompGrp[@]}" | grep -xq $value); then
    standardCompGrp+=( $value )
  fi
done

#create visualization hyperlinks for list.md
echo "### Standard XDM Schemas" >> list.md
for i in ${uberSchemas[@]}; do
  echo "Generating HTML:" $i
  echo "[$i](http://opensource.adobe.com/xdmVisualization/prod/$repoBranch/$i.html)<br/>" >> list.md
done

echo "### Standard Core Components" >> list.md

for h in ${standardCompGrp[@]}; do
  echo "#### "$h >> list.md
  for i in ${standardComponents[@]}; do
    if [[ $i == $h.* ]]
    then
      echo "Generating HTML:" $i
      echo "[$i](http://opensource.adobe.com/xdmVisualization/prod/$repoBranch/$i.html)<br/>" >> list.md
    fi
  done
done

echo "### Extension Components" >> list.md
for i in ${extensionComponents[@]}; do
  echo "Generating HTML:" $i
  echo "[$i](http://opensource.adobe.com/xdmVisualization/prod/$repoBranch/$i.html)<br/>" >> list.md
done

