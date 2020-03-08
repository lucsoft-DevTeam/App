import { DeviceType } from '../../types/devices';

export function getIcon(type: DeviceType, state: boolean)
{
    if (type == "lamp")
        if (state == true)
            return "https://hmsys.de/lightOn"
        else
            return "https://hmsys.de/lightOff"
    else if (type == "ring")
        if (state == true)
            return "https://hmsys.de/RingOn"
        else
            return "https://hmsys.de/RingOff"
    else if (type == "outlet")
        if (state == true)
            return "https://hmsys.de/outletOn"
        else
            return "https://hmsys.de/outletOff"
    else
        return undefined;

}