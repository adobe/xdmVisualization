#!/bin/bash
#usage: ./scripts/globalXdmVisual.sh authToken
#example: ./scripts/globalXdmVisual.sh ey123456789

schemabase="schemaregistry"
objectprefix="obj"
l=$((${#schemabase}+${#objectprefix}+1))
folders=($schemabase)

#Get xed from xdm registry api
(rm -rf bower_components/mdjson-schemas/*; mkdir -p bower_components/mdjson-schemas/$schemabase)
node ./scripts/xedGen4Class.js bearer=$1
#node ./scripts/xedGen.js bearer=$1
node ./scripts/convert.js
retVal=$?
if [ "${retVal}" -ne 0 ]; then
  exit "${retVal}"
fi

#Pre-processing xdm json schema id field
xdms=$(find bower_components/mdjson-schemas -path bower_components/mdjson-schemas/_vendor/msft/cdm -prune  -o -name "*.schema.json" -print)
for xdm in $xdms; do
  #echo "Pre-processing: $xdm"
  oldid=${xdm:32}
  newid=$(echo $oldid|rev|cut -d'/' -f 1|rev)
  sed -i '' "s~${oldid}~${newid}~g" $xdm
  sed -i '' "s~\"\$id\":~\"id\":~g" $xdm
done

#grunt prod
echo "Running grunt prod"
(rm -rf prod; rm -rf Gruntfile.js)
sed "s/xdmVersion//g" Gruntfile_template.js > Gruntfile.js
grunt prod

#generate xdm schema visualization pages
cd prod/
rm index.html
echo "<!DOCTYPE html>" >> index.html
echo "<html>" >> index.html
echo "<head>" >> index.html
echo "<title>XDM Visualization</title>" >> index.html
echo "</head>" >> index.html
echo "<body>" >> index.html
echo "<h1>XDM Visualization</h1>" >> index.html


for folder in ${folders[@]}; do
  objs=$(find "schemas/$folder" -name "*.schema.json" -print -maxdepth 5)
  for obj in $objs; do
    origin="${obj/schemas\//}"
    schema="${origin/.schema.json/}"
    filename="${schema//\//.}"
    if [ ${filename:0:$l} != ${schemabase}.${objectprefix} ] # not showing generated objs
    then
        echo "Generating HTML:" $filename
        echo "<a href = "http://localhost:9001/prod/$filename.html">${filename/$schemabase./}</a>" >> index.html
        echo "<br>" >> index.html
    fi
    cp basic.html $filename.html #use basic as template
    sed  -i '' "s#experience/Profile.schema.json#$origin#g" $filename.html
  done
done

echo "</body>" >> index.html
echo "</html>" >> index.html

#start visual in local webserver
grunt connect:server:keepalive
