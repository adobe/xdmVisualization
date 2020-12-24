#!/bin/bash
#used to generate xdm visualization from a single branch of xdm public repo

#Pre-processing xdm json schemas
(rm -rf bower_components/mdjson-schemas/*; cp -r ../xdm/bin/xed-validation/xed/* ./bower_components/mdjson-schemas/)
node ./scripts/convert.js
(node ./scripts/fixref.js; rm schemaLoc.json)
retVal=$?
if [ "${retVal}" -ne 0 ]; then
  exit "${retVal}"
fi

xdms=$(find bower_components/mdjson-schemas -name "*.schema.json" -print)
for xdm in $xdms; do
  echo "processing---> $xdm"
  oldid=${xdm:32}
  newid=$(echo $oldid|rev|cut -d'/' -f 1|rev)
  #echo $oldid
  #echo $newid
  sed -i '' "s~${oldid}~${newid}~g" $xdm
  sed -i '' "s~\"\$id\":~\"id\":~g" $xdm
done

#grunt prod
echo "Running grunt prod"
rm -rf prod/$1/
rm -rf Gruntfile.js
sed "s/xdmVersion/$1/g" Gruntfile_template.js > Gruntfile.js
grunt prod

#generate xdm schema visualization pages
cd prod/$1/
rm index.html
echo "<!DOCTYPE html>" >> index.html
echo "<html>" >> index.html
echo "<head>" >> index.html
echo "<title>XDM Visualization</title>" >> index.html
echo "</head>" >> index.html
echo "<body>" >> index.html
echo "<h1>XDM Visualization</h1>" >> index.html

folders=(adobe behaviors common airship classes datatypes mixins uberschemas)

for folder in ${folders[@]}; do
  objs=$(find "schemas/$folder" -name "*.schema.json" -print -maxdepth 5)
  for obj in $objs; do
    origin="${obj/schemas\//}"
    schema="${origin/.schema.json/}"
    filename="${schema//\//.}"
    #echo "filename-->" $filename
    if [[ $filename != *.obj[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]* ]] # not showing generated objs
    then
        echo "Generating HTML:" $filename
        echo "<a href = "http://localhost:9001/prod/$1/$filename.html">${filename}</a>" >> index.html
        echo "<br>" >> index.html
    fi
    cp basic.html $filename.html #use basic as template
    sed  -i '' "s#experience/Profile.schema.json#$origin#g" $filename.html
  done
done

echo "</body>" >> index.html
echo "</html>" >> index.html

grunt connect:server:keepalive
