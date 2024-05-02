export interface SystemNetworkStore {
    accessPoints: Array<AccessPoint>
}

export interface AccessPoint {
    m_DeviceInfo: AccessPointInfo
}
export interface AccessPointInfo {
    mac: string
    ip4: ip4,
    wired: WiredInfo
    wireless: WirelessInfo
}
export interface ip4 {
    addresses: Array<Address>;
    dns_ip: Array<number>;
}
export interface Address {
    ip: number
    netmask: number
}
export interface WiredInfo {
    friendly_name: string
    is_cable_present: boolean
}
export interface WirelessInfo {
    aps: Array<WirelessAccessPointInfo>
}
export interface WirelessAccessPointInfo {
    ssid: string
    is_active: boolean
}
