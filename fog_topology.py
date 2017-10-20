"""
Copyright (c) 2015 SONATA-NFV
ALL RIGHTS RESERVED.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Neither the name of the SONATA-NFV [, ANY ADDITIONAL AFFILIATION]
nor the names of its contributors may be used to endorse or promote
products derived from this software without specific prior written
permission.

This work has been performed in the framework of the SONATA project,
funded by the European Commission under Grant number 671517 through
the Horizon 2020 and 5G-PPP programmes. The authors would like to
acknowledge the contributions of their colleagues of the SONATA
partner consortium (www.sonata-nfv.eu).
"""
"""
This is an example that shows how a user of the emulation tool can
define network topologies with multiple emulated cloud data centers.

The definition is done with a Python API which looks very similar to the
Mininet API (in fact it is a wrapper for it).

We only specify the topology *between* data centers not within a single
data center (data center internal setups or placements are not of interest,
we want to experiment with VNF chains deployed across multiple PoPs).

The original Mininet API has to be completely hidden and not be used by this
script.
"""
import logging
from mininet.log import setLogLevel
from emuvim.dcemulator.net import DCNetwork
from emuvim.api.rest.rest_api_endpoint import RestApiEndpoint
from mininet.node import RemoteController

logging.basicConfig(level=logging.INFO)


def create_topology1():
    """
    1. Create a data center network object (DCNetwork)
    """
    net = DCNetwork(controller=RemoteController, monitor=False, enable_learning=True)
    
    """
    2. Add (logical) data centers to the topology
       (each data center is one "bigswitch" in our simplified
        first prototype)
    """
    ci = net.addDatacenter("cloud_instance")

    fi1 = net.addDatacenter("fog_instance_1")
    fi2 = net.addDatacenter("fog_instance_2")

    ii1 = net.addDatacenter("iot_instance_1")
    ii2 = net.addDatacenter("iot_instance_2")
    ii3 = net.addDatacenter("iot_instance_3")
    ii4 = net.addDatacenter("iot_instance_4")

    """
    3. You can add additional SDN switches for data center
       interconnections to the network.
    """
    """
    cis1 = net.addSwitch("cis1")
    cis2 = net.addSwitch("cis2")
    fi1s = net.addSwitch("fi1s")
    fi2s = net.addSwitch("fi2s")
    ii1s = net.addSwitch("ii1s")
    ii2s = net.addSwitch("ii2s")
    ii3s = net.addSwitch("ii3s")
    ii4s = net.addSwitch("ii4s")
    """
    

    """
    4. Add links between your data centers and additional switches
       to define you topology.
       These links can use Mininet's features to limit bw, add delay or jitter.
    """
    net.addLink(ii1, fi1, delay="10ms")
    net.addLink(ii2, fi1, delay="10ms")
    net.addLink(ii3, fi2, delay="10ms")
    net.addLink(ii4, fi2, delay="10ms")
    net.addLink(fi1, ci, delay="100ms")
    net.addLink(fi2, ci, delay="100ms")

    """
    5. We want to access and control our data centers from the outside,
       e.g., we want to connect an orchestrator to start/stop compute
       resources aka. VNFs (represented by Docker containers in the emulated)

       So we need to instantiate API endpoints (e.g. a zerorpc or REST
       interface). Depending on the endpoint implementations, we can connect
       one or more data centers to it, which can then be controlled through
       this API, e.g., start/stop/list compute instances.
    """
    # create a new instance of a endpoint implementation
    rapi1 = RestApiEndpoint("127.0.0.1", 5001, net)
    # connect data centers to this endpoint
    rapi1.connectDatacenter(ci)
    rapi1.connectDatacenter(fi1)
    rapi1.connectDatacenter(fi2)
    rapi1.connectDatacenter(ii1)
    rapi1.connectDatacenter(ii2)
    rapi1.connectDatacenter(ii3)
    rapi1.connectDatacenter(ii4)
    # run API endpoint server (in another thread, don't block)

    rapi1.start()

    """
    6. Finally we are done and can start our network (the emulator).
       We can also enter the Mininet CLI to interactively interact
       with our compute resources (just like in default Mininet).
       But we can also implement fully automated experiments that
       can be executed again and again.
    """
    net.start()
    net.CLI()
    # when the user types exit in the CLI, we stop the emulator
    net.stop()


def main():
    setLogLevel('info')  # set Mininet loglevel
    create_topology1()


if __name__ == '__main__':
    main()
