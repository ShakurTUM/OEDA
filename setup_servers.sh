#!/bin/bash
cd ~
cd OEDA
cd Backend
python setup.py install


cd ../Frontend
npm install -g @angular/cli@1.7.3
npm install
