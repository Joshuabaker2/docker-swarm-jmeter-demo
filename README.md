# Swarm JMeter Demo
The purpose of this demo is to demonstrate that a service running in a Docker swarm can withstand a greater load (tested with load-testing software JMeter) than an individual container.

## Steps

### Swarm Mode
1. Create a docker image based off the dockerfile:

```
docker build -t swarm-jmeter-demo .
```

To test it locally, run:
```
 docker run -d -p 9000:9000 --name swarm-jmeter-demo swarm-jmeter-demo
 curl localhost:9000/random
```
And you should get a response. Take down the container after this
```
docker stop swarm-jmeter-demo
```

2. Set up a local registry to host your image
```
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

Tag your image to point to the registry:
```
docker tag swarm-jmeter-demo localhost:5000/swarm-jmeter-demo
```

Push your image to your registry. 
```
docker push localhost:5000/swarm-jmeter-demo
```

Test it by running
```
docker run -d -p 9000:9000 --name swarm-jmeter-demo localhost:5000/swarm-jmeter-demo
```

3. Modify docker-compose.yml to use your local ip.

4. Create 3 virtual machines with 200 mb of RAM (so they are quickly overwhelmed)
```
docker-machine create --driver virtualbox --virtualbox-memory 200 manager1
docker-machine create --driver virtualbox --virtualbox-memory 200 worker1
docker-machine create --driver virtualbox --virtualbox-memory 200 worker2
```

NOTE: If the creation of the docker-machine hangs, try giving them more memory.

Before we get any further, let's set up port forwarding for the manager node. We can do this either with the GUI or the CLI. We need port 9000 available, because that is the port for our web server. 

```
VBoxManage modifyvm "manager1" --natpf1 rule1,tcp,,9000,,9000
```

5. Get the IP address of the manager
```
docker-machine ip manager1
```
Ours is `192.168.99.100`

6. SSH into the manager node to create the swarm
```
docker-machine ssh manager1
```

7. Initialize the swarm
```
$ docker swarm init --advertise-addr <manager1 ip>
Swarm initialized: current node (dizg6iq1tt848dj0qn4y77pff) is now a manager.

To add a worker to this swarm, run the following command:

    docker swarm join \
    --token SWMTKN-1-1q5pk2o0qbf2o1l6ug6xdw1b9xq1ou8iehsslrl02fs8h1kw15-1d1qm3t15bjn0z4crjuvciadl \
    192.168.99.100:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.

```

8. In another terminal, ssh into another worker node, and join the swarm.
```
docker-machine ssh worker1
docker swarm join \
    --token SWMTKN-1-1q5pk2o0qbf2o1l6ug6xdw1b9xq1ou8iehsslrl02fs8h1kw15-1d1qm3t15bjn0z4crjuvciadl \
    192.168.99.100:2377
```

Do this for both nodes. To verify that they have joined the swarm, run `docker node ls` in manager1 to see all the nodes. 

9. ssh into the manager1, and modify the docker configs to allow our insecure registry: 
```
sudo vi /etc/docker/daemon.json
```
And add in the following, where the ip address is the ip address of your local host running the registry.
```
{ "insecure-registries":["192.168.0.74:5000"] }

```
And then restart the daemon:
```
sudo /etc/init.d/docker restart
```

Test that the container can be fetched inside a worker node from your local repository (replacing the ip address with your local host ip address):
```
docker run -d -p 9000:9000 --name swarm-jmeter-demo 192.168.0.74:5000/swarm-jmeter-demo
```
And make sure it is accessable locally on that node: 
```
curl localhost:9000/random
```

10. Now you can start your service with the manager. First, we want to create an overlay network so the different nodes are accessible, and then we want to create the service in that network.
```
docker network create -d overlay swarm-demo

docker service create --replicas 1 --name swarm-jmeter-demo --network swarm-demo -p "9000:9000" 192.168.0.74:5000/swarm-jmeter-demo
```
You can check it out to see information by running:
```
docker service inspect --pretty swarm-jmeter-demo
```

And see which nodes are running the service by running:
```
docker service ps swarm-jmeter-demo
```

We want to scale the service. Let's do five instances.
```
docker service scale swarm-jmeter-demo=5
```

And to see what nodes are running (as an example)
```
$ docker service ps swarm-jmeter-demo
3l7vx4b14zozr9v8cvkqrx5e6  swarm-jmeter-demo.1  192.168.0.74:5000/swarm-jmeter-demo  worker1   Running        Running 22 seconds ago  
boomt2wwm3d0jrrgzeuwmg488  swarm-jmeter-demo.2  192.168.0.74:5000/swarm-jmeter-demo  manager1  Running        Running 9 seconds ago   
0g56w8he4zkdmt39simdjyqm4  swarm-jmeter-demo.3  192.168.0.74:5000/swarm-jmeter-demo  worker2   Running        Running 8 seconds ago   
35scnhi2m5hyie8qflvqpdkc6  swarm-jmeter-demo.4  192.168.0.74:5000/swarm-jmeter-demo  worker2   Running        Running 8 seconds ago   
01gvf46qmn0y7zhvmnic7bwxx  swarm-jmeter-demo.5  192.168.0.74:5000/swarm-jmeter-demo  worker1   Running        Running 9 seconds ago 
```

