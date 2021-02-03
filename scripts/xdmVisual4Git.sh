#!/bin/bash
#used to generate xdm visualization from a single branch of xdm public repo

if [ "$#" -ne 1 ]; then
  echo "Wrong number of argument!"
  echo "Usage: ./scripts/xdmVisual4Git.sh yourXdmGitBranchName"
  exit 1
fi

#Pre-processing xdm json schemas
(rm -rf publicXdm; git clone -b $1 https://github.com/adobe/xdm.git publicXdm)
(cd publicXdm; npm install; npm run xed-validation)
(rm -rf bower_components/mdjson-schemas/*; cp -r ./publicXdm/bin/xed-validation/xed/* ./bower_components/mdjson-schemas/; rm -rf publicXdm)
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
echo "# XDM Visualization" >> index.md
echo "## Git Repo Branch: $1" >> index.md
echo "# XDM Visualization" >> dropdown.md
echo "## Git Repo Branch: $1" >> dropdown.md

uberSchemas=()
standardComponents=()
extensionComponents=()
standardCompGrp=()

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
        if [[ $filename == adobe.* || $filename == airship.* ]]
        then
          extensionComponents+=( ${filename} )
        elif [[ $filename == uberschemas.* ]];
        then
          uberSchemas+=( $filename )
        else
          standardComponents+=( ${filename} )
        fi
        #echo "<a href = "http://localhost:9001/prod/$1/$filename.html">${filename}</a>" >> index.html
        #echo "<br>" >> index.html
    fi
    cp basic.html $filename.html #use basic as template
    sed  -i '' "s#experience/Profile.schema.json#$origin#g" $filename.html
  done
done

#standard component group
for i in ${standardComponents[@]}; do
  value=$(echo ${i%%.*})
  if ! (printf '%s\n' "${standardCompGrp[@]}" | grep -xq $value); then
    standardCompGrp+=( $value )
  fi
done

echo "### Standard XDM Schemas" >> index.md
echo "<details>" >> dropdown.md
echo "<summary>Standard XDM Schemas</summary>" >> dropdown.md
echo "<ul>" >> dropdown.md
for i in ${uberSchemas[@]}; do
  echo "Generating HTML:" $i
  echo "[$i](http://opensource.adobe.com/xdmVisualization/prod/$1/$i.html)<br/>" >> index.md
  echo "<li><a href=\"http://opensource.adobe.com/xdmVisualization/prod/$1/$i.html\">$i</a></li>" >> dropdown.md
done
echo "</ul>" >> dropdown.md
echo "</details>" >> dropdown.md

echo "### Standard Core Components" >> index.md
echo "<details>" >> dropdown.md
echo "<summary>Standard Core Components</summary>" >> dropdown.md
echo "<ul>" >> dropdown.md

for h in ${standardCompGrp[@]}; do
  echo "##### "$h >> index.md
  for i in ${standardComponents[@]}; do
    if [[ $i == $h.* ]]
    then
      echo "Generating HTML:" $i
      echo "[$i](http://opensource.adobe.com/xdmVisualization/prod/$1/$i.html)<br/>" >> index.md
      echo "<li><a href=\"http://opensource.adobe.com/xdmVisualization/prod/$1/$i.html\">$i</a></li>" >> dropdown.md
    fi
  done
done
echo "</ul>" >> dropdown.md
echo "</details>" >> dropdown.md

echo "### Extension Components" >> index.md
echo "<details>" >> dropdown.md
echo "<summary>Extension Components</summary>" >> dropdown.md
echo "<ul>" >> dropdown.md
for i in ${extensionComponents[@]}; do
  echo "Generating HTML:" $i
  echo "[$i](http://opensource.adobe.com/xdmVisualization/prod/$1/$i.html)<br/>" >> index.md
  echo "<li><a href=\"http://opensource.adobe.com/xdmVisualization/prod/$1/$i.html\">$i</a></li>" >> dropdown.md
done
echo "</ul>" >> dropdown.md
echo "</details>" >> dropdown.md

(rm ../index.html; rm ../../index.html)
#git add ../../
#git commit -m "merge xdm visualization for $1 branch"
#git push origin
#grunt connect:server:keepalive
