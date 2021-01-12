# XDM Visualization

This repository is intended to be the visualization of xdms in [XDM Public Repo](https://github.com/adobe/xdm). All schema design and discussions should happen there.

See [visualization of XDM Public Repo's master branch](https://opensource.adobe.com/xdmVisualization/prod/master/).

### Prerequisite

1\. Ruby gem version 2.6.14 (use `sudo gem install -n /usr/local/bin sass` to install sass)

2\. Grunt grunt-cli version 1.3.2 (use `npm install -g grunt-cli` to install)

### Usage
        
1\. Clone the git repo.

2\. Under the root of git branch, run `npm install` to setup dependencies.

3\. Under the root of git branch, run `./scripts/xdmVisual4Git.sh yourBranchName`. Example: `./scripts/xdmVisual4Git.sh master`

4\. Commit changes to master branch.

5\. Go to `https://opensource.adobe.com/xdmVisualization/prod/yourBranchName/` to see XDM visualization in D3. 