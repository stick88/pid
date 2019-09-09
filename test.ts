
// tests go here; this will not be compiled when this package is used as a library

while (1) { 

    let num = xunxian.control() * 6.8 //(xunxian.control() - 2.5) * 300 

    //serial.writeString(" H:")
    //serial.writeNumber(num)
    
     
    pins.servoSetPulse(AnalogPin.P0, 1790 + num)
    
    pins.servoSetPulse(AnalogPin.P1, 1220 + num)
}
basic.pause(2000)

//pins.servoSetPulse(AnalogPin.P1, 500)