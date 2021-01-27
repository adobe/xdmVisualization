# XDM Visualization

This repository is for the visualization of xdms in [XDM Public Repo](https://github.com/adobe/xdm). All schema design and discussions should happen there.

See [visualization of XDM Public Repo's master branch](https://opensource.adobe.com/xdmVisualization/prod/master/), which is refreshed every 12 hours.

### Usage
To refresh the xdm visualization manually for a specific git branch, please follow the steps below.<br/><br/> ![here](images/xdmVisualization.png)

1\. Click `Actions` from github web interface.

2\. Under Workflows -> All workflows, select `xdm-visualization`.

3\. Select the `Run workflow` drop down on the far right.

4\. Under `XDM Public Repo Branch Name *`, enter the branch to generate the visualization from. Default is "master".

5\. Click the green `Run workflow` button.

6\. Go to `https://opensource.adobe.com/xdmVisualization/prod/<branch entered above>/` to see XDM visualization in D3. 