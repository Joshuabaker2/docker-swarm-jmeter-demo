Tests done on:
Yoga 2 Pro, Intel i5 Core, 8 GB memory.

JMeter test used: 300 threads. 

#### With swarm mode - 5 nodes:
1) First fail occurred on Sample # 480. `worker1` (which had two instances running) failed, causing `worker2` to pick up those two instances. Latency reached a high of 164199ms, compared to the latency at the beginning of the test at 1448ms. Note that we were recording the screen so there was very high background CPU/RAM usage. Results can be disregarded, but demonstrate the swarm's ability to recover from failure. To see what this looked like, view the `before-test.png` to see the swarm before running the test, and the `after-crashed-test.png` to see how the Docker Swarm detected the failure and redistributed the load. 

2) No fail occurred. Average latency over 1000 samples: 
Average latency: 20458
Deviation: 28453

3) No fail occurred. Average latency over 1000 samples: 
Average latency: 18101
Deviation: 30138

#### With swarm mode - 3 nodes: 
1) No fail occured. Average latency over 1000 samples: 
Average latency: 16700
Deviation: 6500

2) No fail occured. Average latency over 1000 samples: 
Average latency: 21031
Deviation: 2400

3) No fail occured. Average latency over 1000 samples: 
Average latency: 22579
Deviation: 9056

4) No fail occured. Average latency over 1000 samples: 
Average latency: 25344
Deviation: 6704

#### Single instance - no swarm mode.

1) No fail occurred. Average latency over 1000 samples: 
Average latency: 36173
Deviation: 19465

2) No fail occurred. Average latency over 1000 samples: 
Average latency: 33162
Deviation: 17725

3) No fail occurred. Average latency over 1000 samples: 
Average latency: 29517
Deviation: 16314



## Conclusions
The swarm with 3 nodes performed the best.

Beating the single instance in terms of average latency by almost 10000ms and the deviation by almost 10000ms

Beating the 5 node instance by being significantly more reliable in latency (difference in deviation was almost 20000ms!). 

Thoughts: It was expected that the swarm would beat the single instance, however the large discrepancy between the 3 and 5 node was surprising. it is likely due to the extra overhead needed combined with the small amount of memory privisioned to each node (600 mb). The small amount of memory likely interfered with the extra tasks that the swarm master (manager1) had to do to manage the extra nodes. Presumably, if more memory was provisioned for each node, having multiple instances on a single node running (up to the number of cores available) would in fact improve latency.