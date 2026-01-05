import { defineStore } from 'pinia';
import { DockOsd } from '../types/mqtt/osd/dockOsd';
import { DroneOsd } from '../types/mqtt/osd/droneOsd';
import { DeviceState } from '../types/pinia';
import { getDjiDeviceEnums } from '../api/main/djiDeviceEnum';

export const useDeviceStore = defineStore('device', {
	state: (): DeviceState => ({ dockOsds: new Map<String, DockOsd>(), droneOsds: new Map<String, DroneOsd>(), droneModels: new Map<String, string>() }),

	actions: {
		getDroneModels() {
			if (this.droneModels.size == 0)
				getDjiDeviceEnums().then((res) => {
					res.data.result.forEach((item: any) => {
						this.droneModels.set(item.name, item.domain + '-' + item.type + '-' + item.subType);
					});
				});
			return this.droneModels;
		},
		addDockOsd(sn: string, osd: DockOsd) {
			osd.sn = sn;
			if (this.dockOsds.has(sn)) {
				this.dockOsds.set(sn, { ...this.dockOsds.get(sn), ...osd });
			} else this.dockOsds.set(sn, osd);
		},
		addDroneOsd(sn: string, osd: DroneOsd) {
			osd.sn = sn;
			if (this.droneOsds.has(sn)) {
				this.droneOsds.set(sn, { ...this.droneOsds.get(sn), ...osd });
			} else this.droneOsds.set(sn, osd);
		},
	},
});
