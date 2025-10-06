<div align="center">
DRISHTI (दृष्टि): Intelligent Safety Stick for the Visually Impaired

An open-source, smart electronic travel aid to enhance the mobility and safety of visually impaired individuals.

</div>

Project DRISHTI acts as an intelligent guardian by integrating multiple sensors to provide real-time environmental awareness and an automated emergency alert system.
The Problem

Traditional aids for the visually impaired have key limitations: they cannot detect head-level obstacles or ground-level hazards like puddles. Furthermore, summoning help quickly after a fall is a critical challenge. Commercial smart canes that solve these issues are often economically inaccessible, costing anywhere from ₹1500 to over ₹2000.
Our Solution

By leveraging an ESP32 microcontroller and common off-the-shelf components, DRISHTI offers a powerful, low-cost, and reliable open-source safety device that anyone can build.
✨ Key Features

    👁️ Proactive Obstacle Detection: An ultrasonic sensor detects forward obstacles within a 1-meter range, providing a 2-second haptic (vibration) warning.

    🤸 Automated Fall Detection: An integrated MPU-6050 accelerometer accurately detects the unique G-force signature associated with a user fall.

    🆘 Multi-Stage SOS System: Upon detecting a fall, a dual-alert system is immediately activated:

        Local Alarm: A loud, continuous buzzer sounds to alert people nearby.

        Remote Alert: Simultaneously, a Bluetooth LE signal is sent to a companion app, which automatically sends a pre-written emergency SMS to a designated contact.

    💬 Intuitive Feedback: The system uses distinct haptic feedback (vibration) for obstacles and audible alerts (buzzer) for emergencies.

    🔋 Rechargeable Power: Powered by a standard 3.7V 18650 Li-ion battery with a TP4056 module for safe and easy USB charging.

🛠️ Hardware & Software
Hardware Components

Component
	

Purpose

Microcontroller
	


ESP32
	

Main processing unit

Sensors
	


Ultrasonic Sensor
	

Obstacle detection

MPU-6050 Accelerometer & Gyroscope
	

Fall detection

Actuators
	


Vibration Motor
	

Haptic feedback

Buzzer
	

Audible alerts

Connectivity & Power
	


Bluetooth Low Energy (BLE)
	

App communication

3.7V 18650 Li-ion Battery & TP4056
	

Power & Charging
Software Stack

    Firmware: Developed in C++ (Arduino Framework) for the ESP32.

    Companion App: A mobile application that receives Bluetooth signals to trigger emergency SMS alerts.

🚀 Future Scope

    GPS Navigation: Integrating a GPS module to provide haptic turn-by-turn directions.

    Advanced Ground Sensing: Upgrading to Time-of-Flight (ToF) laser sensors for more accurate detection of potholes and puddles.

    AI on the Edge: Using an ESP32-CAM to run a lightweight machine learning model to recognize and announce specific objects like 'stairs' or 'motorcycle'.

📜 Conclusion

Project DRISHTI is more than a prototype; it is a platform for empowerment. It successfully demonstrates an affordable, reliable, and feature-rich safety device that offers a tangible increase in safety, confidence, and independence for its users. Its offline-first design and use of low-cost components make it a practical and scalable solution to real-world challenges.
