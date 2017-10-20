

* Commands:

```
# terminal 1
$ cd son-emu/items/
$ sudo chmod +x start.sh
$ sudo python ../fog_topology.py 
# terminal 2
$ cd son-emu/items/
$ sudo ./start.sh
```

* Test:

```
# terminal 1
containernet> cloud curl localhost:3000/temps
containernet> cloud cat info.log
``` 