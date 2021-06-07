import SerialPort from "serialport";
import events from "events";

class BluetoothSerialPort extends events {
  public serialPort: SerialPort;

  constructor(path: string) {
    super();
    this.serialPort = new SerialPort(path, { autoOpen: false });
    this.serialPort.on("error", (err) => {
      console.log("error", err);
    });
    this.serialPort.on("data", (buffer: Buffer) => {
      this.emit("data", buffer);
    });
    this.serialPort.on("close", () => {
      this.emit("close");
    });
    this.serialPort.on("open", () => {
      this.emit("open");
    });
  }

  open() {
    return new Promise<void>((res, rej) => {
      this.serialPort.open((err) => {
        if (err) rej(err);
        else res();
      });
    });
  }

  close() {
    return new Promise<void>((res, rej) => {
      this.serialPort.close((err) => {
        if (err) rej(err);
        else res();
      });
    });
  }

  isOpen() {
    return this.serialPort.isOpen;
  }

  write(buffer: Buffer) {
    return new Promise<number>((res, rej) => {
      this.serialPort.write(buffer, (err, bytesWritten) => {
        if (err) rej(err);
        else res(bytesWritten);
      });
    });
  }

  async ensureConnection() {
    if (!this.isOpen()) {
      await this.open();
    }
  }

  async send(buffer: Buffer) {
    await this.ensureConnection();
    await this.write(buffer);
  }
}

export default BluetoothSerialPort;
