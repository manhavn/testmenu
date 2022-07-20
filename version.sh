ssh root@$1 "cd /root/$2;
docker stop $2;
docker rm $2;
docker run -d --restart always --name $2 -p 7000:7000 -it $2:$3"
