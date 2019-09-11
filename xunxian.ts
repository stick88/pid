//% weight=100 color=#ff0000 icon="\uf043" block="xunxian:Bit"
namespace xunxian {
    let _DEBUG: boolean = false
    const debug = (msg: string) => {
        if (_DEBUG === true) {
            serial.writeLine(msg)
        }
    }
    const chipaddress_x = 0x70
    const MIN_CHIP_ADDRESS = 0x40
    const MAX_CHIP_ADDRESS = MIN_CHIP_ADDRESS + 62
    const chipResolution = 4096;
    const PrescaleReg = 0xFE //the prescale register address
    const modeRegister1 = 0x00 // modeRegister1
    const modeRegister1Default = 0x01
    const modeRegister2 = 0x01 // MODE2
    const modeRegister2Default = 0x04
    const sleep = modeRegister1Default | 0x10; // Set sleep bit to 1
    const wake = modeRegister1Default & 0xEF; // Set sleep bit to 0
    const restart = wake | 0x80; // Set restart bit to 1
    const allChannelsOnStepLowByte = 0xFA // ALL_LED_ON_L
    const allChannelsOnStepHighByte = 0xFB // ALL_LED_ON_H
    const allChannelsOffStepLowByte = 0xFC // ALL_LED_OFF_L
    const allChannelsOffStepHighByte = 0xFD // ALL_LED_OFF_H
    const PRESCALE = 0xFE
    const PinRegDistance = 4
    const channel0OnStepLowByte = 0x06 // LED0_ON_L
    const channel0OnStepHighByte = 0x07 // LED0_ON_H
    const channel0OffStepLowByte = 0x08 // LED0_OFF_L
    const channel0OffStepHighByte = 0x09 // LED0_OFF_H




    let nums: number[] = [0, 0, 0, 0]  //pid计算存储
    //let pin_order: number[] = [19, 15, 9, 23, 22, 24, 25] //存储引脚顺序
    let pin_order: number[] = [7,8, 9, 15, 19] //存储引脚顺序
    let PPID = 2.5
    let IPID = 0.01
    let DPID = 0.55
    let pin_nums = 5



    export function SetPid(): void{
    }
    export function setup(): void {
        
        pins.setPull(DigitalPin.P0, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P1, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P2, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
        //pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
        //pins.setPull(DigitalPin.P16, PinPullMode.PullUp)
        //pins.setPull(DigitalPin.P19, PinPullMode.PullUp)
       // pins.setPull(DigitalPin.P20, PinPullMode.PullUp)
        
    }
    //0 误差 1微分量 2前一次误差 3积分量
    export function gitchangpid(target: number, measure: number): number {
        nums[0] = target - measure
        nums[1] = nums[0] - nums[2] //微分
        let Pout = PPID * nums[0]  //比例控制
        let Iout = IPID * nums[3]  //积分控制
        let Dout = DPID * nums[1]  //微分控制
        let pidout = Pout  + Dout + Iout

        nums[2] = nums[0]
        if (nums[3] < -80) {
            nums[3] = -80
        }
        else if (nums[3] > 80) {
            nums[3] = 80
        } else { 
            nums[3] += nums[0]  //积分
        }
        return pidout 
    }
    let last_num = 0
    export function  gitpinstatus(): number {
        let pin_num = 0
        let tar_times = 0
        let mea_num = 0
        let re_num = 0
        let last_nums = 0
        setup()
        while (pin_num < pin_nums) {
            //读取引脚值
            if (pins.digitalReadPin(pin_order[pin_num]) != 1) {   //过滤符合条件的值
                tar_times++
                mea_num = pin_num + 1 + mea_num //符合条件值之和
                re_num = mea_num / tar_times //均值
                if (pin_num == 0 || pin_num == (pin_nums - 1)) { 
                    last_nums = pin_num+1
                }
            }
            pin_num++
        }
        if (re_num == 0 && last_num !=0 ) {
            re_num = last_num
        } else if (re_num == 0) {
            re_num = 3
        }  
        if (last_nums != 0) { 
            last_num = last_nums   
        } else last_num = 0
        
        
        return re_num
    }
     /**
     * Get the amount of red the colour sensor sees
     */
    //% blockId=envirobit_get_light_color
    
    export function control_xu(): number {
        let i = gitpinstatus()
       return gitchangpid(3,i)
        
    }
    export enum moter_num {
        one  =  0,
        two =  1,
        three = 2,
        four = 3
        
    }
   /**
     * Get the amount of red the colour sensor sees
     */
    //% blockId=envirobit_get_light_color
    //% block="CONTROL_mator"
    export function control_mator(left: moter_num=0, right: moter_num = 1): void {
        let num = xunxian.control_xu() * 2.3 //(xunxian.control() - 2.5) * 300 
        xunxian.setmotor(left, 32 + num)
        xunxian.setmotor(right, 35 - num)
    }
    export function setPinPulseRange(pinNumber: number, onStep: number = 0, offStep: number = 2048 ): void {
        pinNumber = Math.max(0, Math.min(15, pinNumber))
        //const buffer = pins.createBuffer(2)
        const pinOffset = PinRegDistance * pinNumber
        onStep = Math.max(0, Math.min(4095, onStep))
        offStep = Math.max(0, Math.min(4095, offStep))

        debug(`setPinPulseRange (${pinNumber}, ${onStep}, ${offStep})`)
        debug(`  pinOffset ${pinOffset}`)

        // Low byte of onStep
        write(chipaddress_x, pinOffset + channel0OnStepLowByte, onStep & 0xFF)

        // High byte of onStep
        write(chipaddress_x, pinOffset + channel0OnStepHighByte, (onStep >> 8) & 0x0F)

        // Low byte of offStep
        write(chipaddress_x, pinOffset + channel0OffStepLowByte, offStep & 0xFF)

        // High byte of offStep
        write(chipaddress_x, pinOffset + channel0OffStepHighByte, (offStep >> 8) & 0x0F)
    }
    //向芯片写入值
    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = channel0OnStepLowByte + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(chipaddress_x, buf, false);
        debug(`stepperdegree3 (${chipaddress_x}, ${channel}, ${on}, ${off})`)
    }
    //向芯片写入两个8位值
    function write(chipAddress: number, register: number, value: number): void {
        const buffer = pins.createBuffer(2)
        buffer[0] = register
        buffer[1] = value
        pins.i2cWriteBuffer(chipAddress, buffer, false)
    }
    //将频率转为特定值以写入缓存区
    function calcFreqPrescaler(freq: number): number {
        return (25000000 / (freq * chipResolution)) - 1;
    }
    //初始化扩展芯片地址：x 频率：x
    /**
     * Get the amount of red the colour sensor sees
     */
    //% blockId=envirobit_get_light_color
    //% block="init_CONTROL"
    export function init(chipAddress: number = 0x70, newFreq: number = 1000) {
        debug(`Init chip at address ${chipAddress} to ${newFreq}Hz`)
        //const buf = pins.createBuffer(2)
        const freq = (newFreq > 1000 ? 1000 : (newFreq < 40 ? 40 : newFreq))
        const prescaler = calcFreqPrescaler(freq)

        write(chipAddress, modeRegister1, sleep)

        write(chipAddress, PrescaleReg, prescaler)

        write(chipAddress, allChannelsOnStepLowByte, 0x00)
        write(chipAddress, allChannelsOnStepHighByte, 0x00)
        write(chipAddress, allChannelsOffStepLowByte, 0x00)
        write(chipAddress, allChannelsOffStepHighByte, 0x00)

        write(chipAddress, modeRegister1, wake)

        control.waitMicros(1000)
        write(chipAddress, modeRegister1, restart)
    }

      /**
     * 设置pin口的占空比
     * @param PinNumber The number (1-16) of the LED to set the duty cycle on
     * @param dutyCycle The duty cycle (0-100) to set the LED to
     */
    //% block
    export function setPinDutyCycle(ledNum: number, dutyCycle: number): void {
        
        //const chip = getChipConfig(chipaddress_x)
        ledNum = Math.max(1, Math.min(8, ledNum))
        dutyCycle = Math.max(0, Math.min(100, dutyCycle))
        //const servo: ServoConfig = chip.servos[ledNum - 1]
        const pwm = (dutyCycle * (chipResolution - 1)) / 100
        
        debug(`setLedDutyCycle(${ledNum}, ${dutyCycle}, ${chipaddress_x})`)
        return setPinPulseRange(ledNum , 0, pwm)
    }
    //马达转动设置

    let pwm1 = 8
    let pwm2 = 9
    let pwm1_1 = 10
    let pwm2_1 = 11
    let dir1 = 12
    let dir2 = 13
    let dir1_1 = 14
    let dir2_1 = 15

    let motorpin: number[][] = [[dir1,pwm1], [dir2,pwm2],[dir1_1,pwm1_1], [dir2_1,pwm2_1] ]
    export function setmotor(motorNum: number, dutyCycle: number): void { 
        if (dutyCycle < 0) {
                      
            setPinPulseRange(motorpin[motorNum][0], 0, 0)
        } else {
            setPinPulseRange(motorpin[motorNum][0], 0, chipResolution)
        }      
        motorNum = Math.max(0, Math.min(15, motorNum))
        dutyCycle = Math.max(0, Math.min(4096, Math.abs(dutyCycle)))    
        const pwm = (dutyCycle * (chipResolution - 1)) / 100
        setPinPulseRange(motorpin[motorNum][1], 0, pwm)
    }


}
