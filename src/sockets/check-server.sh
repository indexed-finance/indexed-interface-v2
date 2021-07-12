serverProcess=`lsof -i :443 -Fp | grep p | cut -c2-99`
size=${#serverProcess}

if [ $size == 0 ] 
then cd ~/Apps/ndx-dapp && yarn start:server
fi
