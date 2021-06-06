export type Status = {
  power: boolean;
  input: Input;
  muted: boolean;
  volume: number;
  subwoofer: number;
  surround: Surround;
  bass_ext: boolean;
  clear_voice: boolean;
};

type Input = "hdmi" | "analog" | "bluetooth" | "tv" | "unknown";
type Surround =
  | "3d"
  | "tv"
  | "stereo"
  | "movie"
  | "music"
  | "sports"
  | "game"
  | "unknown";

const INPUT_NAMES: Map<string, Input> = new Map([
  ["00", "hdmi"],
  ["0c", "analog"],
  ["05", "bluetooth"],
  ["07", "tv"],
]);

const SURROUND_NAMES: Map<string, Surround> = new Map([
  ["000d", "3d"],
  ["000a", "tv"],
  ["0100", "stereo"],
  ["0003", "movie"],
  ["0008", "music"],
  ["0009", "sports"],
  ["000c", "game"],
]);

const COMMANDS = {
  // power management
  power_toggle: "4078cc",
  power_on: "40787e",
  power_off: "40787f",

  // input management
  set_input_hdmi: "40784a",
  set_input_analog: "4078d1",
  set_input_bluetooth: "407829",
  set_input_tv: "4078df",

  // surround management
  set_surround_3d: "4078c9", // -- 3d surround
  set_surround_tv: "407ef1", // -- tv program
  set_surround_stereo: "407850",
  set_surround_movie: "4078d9",
  set_surround_music: "4078da",
  set_surround_sports: "4078db",
  set_surround_game: "4078dc",
  surround_toggle: "4078b4", // -- sets surround to `:movie` (or `:"3d"` if already `:movie`)
  clearvoice_toggle: "40785c",
  clearvoice_on: "407e80",
  clearvoice_off: "407e82",
  bass_ext_toggle: "40788b",
  bass_ext_on: "40786e",
  bass_ext_off: "40786f",

  // volume management
  subwoofer_up: "40784c",
  subwoofer_down: "40784d",
  mute_toggle: "40789c",
  mute_on: "407ea2",
  mute_off: "407ea3",
  volume_up: "40781e",
  volume_down: "40781f",

  // extra -- IR -- don't use?
  bluetooth_standby_toggle: "407834",
  dimmer: "4078ba",

  // status report (query, soundbar returns a message)
  report_status: "0305",
} as const;

export type Command = keyof typeof COMMANDS;

// length is always 0x0d (signifying 13B payload)
// type is always 0x05 (status)
// <00> was so far always 0x00, but no idea what it is
// power is 1B, either 00 (power off), or 01 (power on)
// input is 1B, 0x0 (hdmi), 0xc (analog), 0x5 (bluetooth), 0x7 (tv)
// muted is 1B, either 00 (not muted), or 01 (muted)
// volume is 1B, int value from 0x00 to 0x32
// subwoofer is 1B, int value from 0x00 to 0x20 in steps of 4, with 0x10 being neutral
// <202000> was so far always the three bytes 0x202000, but no idea what it is
// surround is 2B, values: 0x0d (3d), 0x0a (tv), 0x0100 (stereo), 0x03 (movie), 0x08 (music), 0x09 (sports), 0x0c (game)
// be+cv is 1B, bitfield (values ORed together): 0x20 (bass ext), 0x4 (clearvoice)

class Yas207Encoder {
  static decode(hex: string): Status {
    const isStatus = hex.slice(7, 8) === "05";

    const power = hex.slice(10, 12) === "01";

    const inputBit = hex.slice(12, 14);
    const input = INPUT_NAMES.get(inputBit) || "unknown";

    const muted = hex.slice(14, 16) === "01";

    const subwooferBit = hex.slice(18, 20);
    const subwoofer = Number.parseInt(subwooferBit, 16);

    const volumeBit = hex.slice(16, 18);
    const volume = Number.parseInt(volumeBit, 16);

    const surroundBit = hex.slice(26, 30);
    const surround = SURROUND_NAMES.get(surroundBit) || "unknown";

    const bass_ext = hex.slice(30, 31) === "2";
    const clear_voice = hex.slice(31, 32) === "4";

    return {
      power,
      input,
      muted,
      volume,
      subwoofer,
      surround,
      bass_ext,
      clear_voice,
    };
  }

  static encode(command: Command): string {
    const payload = COMMANDS[command];

    const buffer = Buffer.from(payload, "hex");

    const sum = (
      -(buffer.length + buffer.reduce((acc, v) => acc + v, 0)) & 0xff
    )
      .toString(16)
      .padStart(2, "0");
    const length = (buffer.length & 0xff).toString(16).padStart(2, "0");
    return "ccaa" + length + payload + sum;
  }

  static isSupportedCommand(command: string): command is Command {
    return command in COMMANDS;
  }
}

export default Yas207Encoder;
