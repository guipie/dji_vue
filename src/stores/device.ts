import { defineStore } from 'pinia';
import { DockOsd } from '../types/mqtt/osd/dockOsd';
import { DroneOsd } from '../types/mqtt/osd/droneOsd';

export const useStoreDevice = defineStore('device', {
	state: (): DeviceState => ({ dockOsds: new Map<String, DockOsd>(), droneOsds: new Map<String, DroneOsd>() }),

	actions: {
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
