# XDM Visualization

This repository is intended to be the visualization of xdms in [XDM Public Repo](https://github.com/adobe/xdm). All schema design and discussions should happen there.

See [visualization of XDM Public Repo's master branch](https://opensource.adobe.com/xdmVisualization/prod/master/).

### Usage
The xdm visualization is currently refreshed every 12 hours for the master branch of the public repo. 
If you want to refresh it manually, please follow the steps ![here](images/xdmVisualization.png)

        
1\. Click `Actions` from github web interface.

2\. Under Workflows->All workflows,select `xdm-visualization`.

3\. Click `Run workflow`.

4\. Under `XDM Public Repo Branch Name *`, enter the branch name which you want to generate the visualization. Default is "master"

5\. Click `Run workflow`

6\. Go to `https://opensource.adobe.com/xdmVisualization/prod/<branch name entered above>/` to see XDM visualization in D3. 