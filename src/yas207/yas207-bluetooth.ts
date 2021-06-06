import BluetoothSerialPort from "../serial/bluetooth-serial-port";
import Yas207Encoder, { Status } from "./yas207-encoder";

class Yas207Bluetooth {
  private bluetooth: BluetoothSerialPort;

  constructor(path: string) {
    this.bluetooth = new BluetoothSerialPort(path);
  }

  async sendCommand(command: string): Promise<void> {
    if (Yas207Encoder.isSupportedCommand(command)) {
      const hexCommand = Yas207Encoder.encode(command);
      await this.bluetooth.send(Buffer.from(hexCommand, "hex"));
    } else {
      throw new Error("Unknown command");
    }
  }

  getStatus(): Promise<Status> {
    return new Promise<Status>(async (res, rej) => {
      this.bluetooth.once("data", (buffer: Buffer) => {
        const status = Yas207Encoder.decode(buffer.toString("hex"));
        res(status);
      });

      try {
        const statusCommand = Yas207Encoder.encode("report_status");
        await this.bluetooth.send(Buffer.from(statusCommand, "hex"));
      } catch (err) {
        rej(err);
      }
    });
  }
}

export default Yas207Bluetooth;
