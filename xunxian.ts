//% weight=100 color=#000000 icon="\uf043" block="xunxian:Bit"
namespace xunxian {

    let nums: number[] = [0, 0, 0, 0]  //pid计算存储
    let pin_order: number[] = [19, 15, 9, 23, 22, 24, 25] //存储引脚顺序
    let PPID = 0.66
    let IPID = 0.044
    let DPID = 0.13
    let pin_nums = 5
  
    export function setup(): void {
        
        pins.setPull(DigitalPin.P0, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P1, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P2, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P8, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P12, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
        pins.setPull(DigitalPin.P16, PinPullMode.PullUp)
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
        if (nums[3] < -100) {
            nums[3] = -100
        }
        else if (nums[3] > 100) {
            nums[3] = 100
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
    //% block="CONTROL"
    export function control(): number {
        let i = gitpinstatus()
       return gitchangpid(3,i)
        
    }
   

}
