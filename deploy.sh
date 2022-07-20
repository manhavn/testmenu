if ! [ $3 ]; then
  echo "sh deploy.sh do3e.dev popup v0.0.1"
  exit
fi
echo "start deploy"
yarn build
ssh root@$1 "mkdir -p /root/$2"
scp Dockerfile root@$1:/root/$2
scp nginx.conf root@$1:/root/$2
scp -r build root@$1:/root/$2
ssh root@$1 "cd /root/$2;
docker stop $2;
docker rm $2;
docker build -t $2:$3 .;
cd /root;
rm -R /root/$2;
docker run -d --restart always --name $2 -p 7000:7000 -it $2:$3"
