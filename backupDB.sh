#!/bin/bash
mkdir -p dbBackup
DIR="./db/"
if [ -d "$DIR" ]; then
  cp ./db/mtgCardDB.db ./dbBackup/mtgCardDB_bk_$(date +%d_%m_%Y-%H_%M).db
else
   echo "Error: '${DIR}' not found. Can not continue."
fi
