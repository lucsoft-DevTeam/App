export type DeviceState = "on" | "off" | "lock" | "unlock" | "unknown" | "ring";
export type DeviceType = "unknown" | "lamp" | "switch" | "usbdeivce" | "outlet" | "door" | "ring";

export type UserDevices = {
    id: string,
    address: string,
    state: DeviceState,
    type: DeviceType,
    allowed: DeviceState[],
    name: string
};