# Online Appendix

This appendix is supplementary material to the submission "A Tool for Online Experiment-Driven Adaptation" by Ilias Gerostathopoulos, Ali Naci Uysal, Christian Prehofer and Tomas Bures.

## Video illustration (with subtitles) accompanying our tool can be found on [Youtube](https://youtu.be/JfgcnUO_o8g)

## Evaluating feasibility of OEDA by using it to optimize CrowdNav
Please check the [separate page](https://github.com/alinaciuysal/OEDA/wiki/Applying-OEDA-to-CrowdNav). 

## OEDA -- Getting Started

### Required Dependencies
- [Zookeeper & Kafka](https://kafka.apache.org/quickstart#quickstart_startserver)
- [Python 2.7](https://www.python.org/download/releases/2.7/)
- [ElasticSearch 6.2.4](https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.6.3.tar.gz)
- [SUMO](http://sumo.dlr.de/wiki/Downloads)
- [CrowdNav](https://github.com/alinaciuysal/CrowdNav/tree/oeda)
- [Node.js and npm](https://www.npmjs.com/get-npm)
- If you want to use the R optimizer, you need to also clone and install [mlrMBO-API](https://github.com/alinaciuysal/mlrMBO-API)

### [Installation](https://github.com/alinaciuysal/OEDA/wiki/Installation)

### New Installation instruction
* install git
`sudo apt-get install git`

* clone this repo
`cd ~`
`git clone https://github.com/iliasger/OEDA.git`
`cd OEDA`
`bash ./req_installer.sh`

* setup flask, express, angular
`bash ./setup_servers.sh`
`cd ~/OEDA/Frontend/`
`bash ./serve.sh`


#### [Instructions to use](https://github.com/alinaciuysal/OEDA/wiki/Instructions-to-use)


### Guide 
The best way to get started with using OEDA is to watch the above video. 

#### _Contact_ 
[Ali Naci Uysal](mailto:ali.uysal@tum.de) or [Dr. Ilias Gerostathopoulos](http://www4.in.tum.de/~gerostat/)
