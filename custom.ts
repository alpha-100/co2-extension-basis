enum SensorStatus {
    //% block="Error"
    Error,
    //% block="Warming up"
    Warmup,
    //% block="Calibrating"
    Calibration,
    //% block="Idle"
    Idle,
    //% block="Uknown status"
    Unknown,
    //% block="Performing self-test"
    SelfTest
}

const DEBUGGING = false;


namespace CO2 {
    //% block="on PPM reading"
    //% draggableParameters=reporter
    export function ppm(cb: (latestPPM: number) => void): void {
        control.setInterval(function () {
            cb(Math.random());
        }, 1e3, control.IntervalMode.Interval)
    }

    //% block="PPM reading"
    export function getPPM(): number {
        let response_buffer: Buffer = null
        function bufferFromArray(arr: number[]) {
            return Buffer.fromArray(arr);
        }
        serial.redirect(
        SerialPin.P0,
        SerialPin.P1,
        BaudRate.BaudRate19200
        )
        let READ_PPM = [255, 254, 2, 2, 3]
        let b = bufferFromArray(READ_PPM)
        serial.readBuffer(0)   // flush any extra
        serial.writeBuffer(b)
        basic.pause(100)
        response_buffer = serial.readBuffer(0)

        // WORKAROUND: weird data
        // TODO: figure out why!
        let response_buffer_length = response_buffer.length;
        if (
            response_buffer_length == 6 &&
            response_buffer.getNumber(NumberFormat.Int8BE, 0) == 0
        ) {
            if (DEBUGGING) {
                basic.showString("FIXING")
            }
            response_buffer.shift(0)
            --response_buffer_length;
        }

        if (response_buffer_length == 5) {
            let co2_ppm = response_buffer.getNumber(NumberFormat.UInt16BE, 3);
            return co2_ppm
        } else {
            if (DEBUGGING) {
                basic.showString("E/")
                basic.showNumber(response_buffer.length)
                basic.showString(":")
                for (let i = 0; i < response_buffer.length; ++i) {
                    if (i) basic.showString("|")
                    basic.showNumber(response_buffer.getNumber(NumberFormat.UInt8BE, i))
                }
                basic.showString("/E")
            }
            return -1
        }
    }

    //% block="sensor status"
    // TODO: return a `SensorStatus` if possible?
    export function getStatus(): number {
        return 0;
    }

    //% block="altitude setting"
    export function getAltitude(): number {
        return Math.random();
    }

    //% block="tell sensor that %x is our altitude"
    export function setAltitude(alt: number): void {
        console.log(`setAlt: ${alt}`);
    }
}