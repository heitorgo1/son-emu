#!/bin/bash

docker build -t cloud_img cloud/
docker build -t fog_img fog/
docker build -t sensor_img sensor/

son-emu-cli compute start -d iot_instance_1 -n sensor1 --image sensor_img # 10.0.0.2
son-emu-cli compute start -d iot_instance_1 -n sensor2 --image sensor_img # 10.0.0.4

son-emu-cli compute start -d iot_instance_2 -n sensor3 --image sensor_img # 10.0.0.6
son-emu-cli compute start -d iot_instance_2 -n sensor4 --image sensor_img # 10.0.0.8

son-emu-cli compute start -d iot_instance_3 -n sensor5 --image sensor_img # 10.0.0.10
son-emu-cli compute start -d iot_instance_3 -n sensor6 --image sensor_img # 10.0.0.12

son-emu-cli compute start -d iot_instance_4 -n sensor7 --image sensor_img # 10.0.0.14
son-emu-cli compute start -d iot_instance_4 -n sensor8 --image sensor_img # 10.0.0.16

son-emu-cli compute start -d fog_instance_1 -n fog1 --image fog_img # 10.0.0.18
son-emu-cli compute start -d fog_instance_2 -n fog2 --image fog_img # 10.0.0.20
son-emu-cli compute start -d fog_instance_3 -n fog3 --image fog_img # 10.0.0.22

son-emu-cli compute start -d cloud_instance -n cloud --image cloud_img # 10.0.0.24

docker exec -d mn.cloud /bin/bash -c "export FOG_ADDRESS_1=10.0.0.18 && export FOG_ADDRESS_2=10.0.0.20 && export FOG_ADDRESS_3=10.0.0.22 && npm start"
docker exec -d mn.fog1 /bin/bash -c "export SENSOR_ADDRESS_1=10.0.0.2 && export SENSOR_ADDRESS_2=10.0.0.4 && export SENSOR_ADDRESS_3=10.0.0.6 && npm start"
docker exec -d mn.fog2 /bin/bash -c "export SENSOR_ADDRESS_1=10.0.0.8 && export SENSOR_ADDRESS_2=10.0.0.10 && export SENSOR_ADDRESS_3=10.0.0.12 && npm start"
docker exec -d mn.fog3 /bin/bash -c "export SENSOR_ADDRESS_1=10.0.0.14 && export SENSOR_ADDRESS_2=10.0.0.16 && npm start"
docker exec -d mn.sensor1 npm start
docker exec -d mn.sensor2 npm start
docker exec -d mn.sensor3 npm start
docker exec -d mn.sensor4 npm start
docker exec -d mn.sensor5 npm start
docker exec -d mn.sensor6 npm start
docker exec -d mn.sensor7 npm start
docker exec -d mn.sensor8 npm start

docker ps