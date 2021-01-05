#!/bin/bash
#used to generate xdm visualization to a webserver for shared access

#Pre-processing xdm json schema id field
xdms=$(find bower_components/mdjson-schemas -path bower_components/mdjson-schemas/_vendor/msft/cdm -prune  -o -name "*.schema.json" -print)
for xdm in $xdms; do
  echo "processing---> $xdm"
  oldid=${xdm:32}
  newid=$(echo $oldid|rev|cut -d'/' -f 1|rev)
  echo $oldid
  echo $newid
  sed -i '' "s~${oldid}~${newid}~g" $xdm
  sed -i '' "s~\"\$id\":~\"id\":~g" $xdm
done

#grunt prod
echo "Running grunt prod"
rm -rf prod
rm -rf Gruntfile.js
sed "s/xdmVersion/$1/g" Gruntfile_template.js > Gruntfile.js
grunt prod

#generate xdm schema visualization pages
cd prod/$1/
folders=(adobe channels common content context data external)

for folder in ${folders[@]}; do
  objs=$(find "schemas/$folder" -name "*.schema.json" -print -maxdepth 2)
  for obj in $objs; do
    origin="${obj/schemas\//}"
    schema="${origin/.schema.json/}"
    filename="${schema//\//.}"
    echo "filename-->" $filename
    cp basic.html $filename.html #use basic as template
    sed  -i '' "s#experience/Profile.schema.json#$origin#g" $filename.html
  done
done

echo "Uploading xdm visualization"
cd ../../
tar -cvf xdmVisualization.tar ./
scp xdmVisualization.tar xdmdocs@or1010050204100.corp.adobe.com:/home/tomcat/webapps/xdmVisualization
ssh xdmdocs@or1010050204100.corp.adobe.com "cd /home/tomcat/webapps/xdmVisualization; tar -xvf xdmVisualization.tar; rm xdmVisualization.tar"
rm xdmVisualization.tar
rm -rf prod
rm Gruntfile.js
