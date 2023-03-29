# lm-saf-project

LM SAF project

## SAF TEMPLATE FILE

(Below is an example of the README that should be in place for a SAF-developed InSpec profile -- requirements, running instructions, etc.)

InSpec profile to validate the secure configuration of a Kubernetes node against [DISA's](https://iase.disa.mil/stigs/Pages/index.aspx) Kubernetes Secure Technical Implementation Guide (STIG) Version 1 Release 1.

## Getting Started  
It is intended and recommended that InSpec and this profile be run from a __"runner"__ host (such as a DevOps orchestration server, an administrative management system, or a developer's workstation/laptop) against the target remotely using the SSH transport.

__For the best security of the runner, always install on the runner the _latest version_ of InSpec and supporting Ruby language components.__

Latest versions and installation options are available at the [InSpec](http://inspec.io/) site.

The Kubernetes STIG includes security requirements for both the Kubernetes cluster itself and the nodes that comprise it. This profile includes the checks for the node portion. It is intended  to be used in conjunction with the <b>[Kubernetes Cluster](https://github.com/mitre/k8s-cluster-stig-baseline)</b> profile that performs automated compliance checks of the Kubernetes cluster.

## Getting Started

### Requirements

#### Kubernetes Cluster
- Kubernetes Platform deployment
- Access to the Kubernetes Node over ssh
- Account providing appropriate permissions to perform audit scan


#### Required software on the InSpec Runner
- git
- [InSpec](https://www.chef.io/products/chef-inspec/)

### Setup Environment on the InSpec Runner
#### Install InSpec
Go to https://www.inspec.io/downloads/ and consult the documentation for your Operating System to download and install InSpec.

#### Ensure InSpec version is at least 4.23.10 
```sh
inspec --version
```
