# XDM Visualization

This repository is for the visualization of xdms in [XDM Public Repo](https://github.com/adobe/xdm). All schema design and discussions should happen there.

See [visualization of XDM Public Repo's master branch](https://opensource.adobe.com/xdmVisualization/prod/master/), which is refreshed everyday.

### Usage
To refresh the xdm visualization manually for a specific git branch, please get write permission for the repo and follow the steps below.<br/><br/> ![here](images/xdmVisualization.png)

1\. Click `Actions` from github web interface.

2\. Under Workflows -> All workflows, select `xdm-visualization`.

3\. Select the `Run workflow` drop down on the far right.

4\. Under `XDM Repo Branch Name *` and `XDM Repo HTTPS URL *`, enter the branch and repoURL to generate the visualization from. Default is master branch of https://github.com/adobe/xdm.git.

5\. Click the green `Run workflow` button.

6\. Go to `https://opensource.adobe.com/xdmVisualization/prod/yourGithubID_branchEnteredAbove/` to see XDM visualization in D3 if the branch is folked repo, if the branch is created directly from public repo, use `https://opensource.adobe.com/xdmVisualization/prod/branchEnteredAbove/`. 

### Build process

The xdm visualization build runs every 24 hours automatically through github actions by getting the latest xdm from the master branch of [XDM Public Repo](https://github.com/adobe/xdm). 

Here are the [main build script](https://github.com/adobe/xdmVisualization/blob/master/scripts/xdmVisual4Git.sh) and [github action workflow cron job config](https://github.com/adobe/xdmVisualization/blob/master/.github/workflows/xdmVisualCron.yml).