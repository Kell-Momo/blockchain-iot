// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IoTCircuitBreaker {

    enum Status { ACTIVE, REVOKED }

    struct Sensor {
        uint anomalyCount;
        Status status;
    }

    mapping(address => Sensor) public sensors;

    uint constant MAX_TEMP = 50;
    uint constant MIN_TEMP = 0;

    event SensorRevoked(address sensor);

    function sendData(uint temperature) public {
        Sensor storage sensor = sensors[msg.sender];

        require(sensor.status != Status.REVOKED, "Sensor is revoked");

        if (!isValid(temperature)) {
            sensor.anomalyCount++;

            if (sensor.anomalyCount >= 3) {
                sensor.status = Status.REVOKED;
                emit SensorRevoked(msg.sender);
            }
        } else {
            sensor.anomalyCount = 0;
        }
    }

    function isValid(uint temp) internal pure returns (bool) {
        return temp >= MIN_TEMP && temp <= MAX_TEMP;
    }

    function getStatus(address sensorAddr) public view returns (Status) {
        return sensors[sensorAddr].status;
    }
}