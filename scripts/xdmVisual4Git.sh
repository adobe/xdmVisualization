#!/bin/bash
#used to generate xdm visualization from a single branch of xdm public repo

if [ "$#" -ne 2 ]; then
  echo "Wrong number of argument!"
  echo "Usage: ./scripts/xdmVisual4Git.sh repoBranchName repoHttpsURL"
  exit 1
fi

#set repo branch name to be displayed on visualization main page
repoBranch=$2"_"$1
xdmgit="/xdm.git"
github="https://github.com/"
repoBranch=${repoBranch//$xdmgit}
repoBranch=${repoBranch//$github}
if [[ $repoBranch == adobe_* ]]
then
  repoBranch=${repoBranch//"adobe_"}
fi

#Pre-processing xdm json schemas by clone public repo and running xed conversion before saving to mdjson-schemas.
(rm -rf publicXdm; git clone -b $1 $2 publicXdm)
(cd publicXdm; npm install; npm run xed-validation)
(rm -rf bower_components/mdjson-schemas/*; cp -r ./publicXdm/bin/xed-validation/xed/* ./bower_components/mdjson-schemas/; rm -rf publicXdm)
#for facebook only
(cp -r ./bower_components/test/* ./bower_components/mdjson-schemas/)
node ./scripts/convert.js
node ./scripts/fixRef.js
node ./scripts/removeDeprecated.js
retVal=$?
if [ "${retVal}" -ne 0 ]; then
  exit "${retVal}"
fi

xdms=$(find bower_components/mdjson-schemas -name "*.schema.json" -print)
for xdm in $xdms; do
  echo "processing---> $xdm"
  oldid=${xdm:32}
  #remove the folder path from id
  newid=$(echo $oldid|rev|cut -d'/' -f 1|rev)
  #echo $oldid
  #echo $newid
  sed -i '' "s~${oldid}~${newid}~g" $xdm
  sed -i '' "s~\"\$id\":~\"id\":~g" $xdm
done

#setup the xed files location, build visualization html files by grunt prod
echo "Running grunt prod"
rm -rf prod/$repoBranch/
rm -rf Gruntfile.js
sed "s/xdmVersion/$repoBranch/g" Gruntfile_template.js > Gruntfile.js
grunt prod

#generate xdm visualization navigation page list.md without using dropdown
./scripts/listGen.sh $repoBranch

#generate xdm visualization navigation page index.md by using dropdown
node ./scripts/dropdown.js $repoBranch
(rm prod/index.html; rm index.html)

#git push the latest build.
git add .
git commit -m "merge xdm visualization for $repoBranch branch"
git push origin
#grunt connect:server:keepalive
