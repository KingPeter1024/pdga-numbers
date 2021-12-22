#!/bin/bash
cd client;
echo running npm run build
npm run build;
cd ..
echo PDGA Numbers is built! run node index.js to start the server
