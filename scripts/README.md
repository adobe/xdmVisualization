### xdmVisual4Git.sh

The xdmVisual4Git.sh is the main script for the visualization build and calls the below scripts in order.

1: `xed-validation.sh`: Converting xdm to xed, this script is from public repo and executed as `npm run xed-validation`.

2: `convert.js`: Fixes those can not be displayed in the visualization due to the open source code limitation such as array items and map objects.

3: `fixRef.js`: Fixes the $ref issue where $id is not aligned with folder structure anymore.

4: `removeDeprecated.js`: Removes deprecated xdm files.

5: `listGen.sh`: Generate xdm visualization navigation page list.md without using dropdown

6: `dropdownGen.js`: Generates the index.md with dropdowns from the listOfXdms.txt.