import { WaylineState } from '/@/types/pinia';
import { TemplateTypeEnum } from '/@/types/wayline/waylineEnus';
import * as Cesium from 'cesium';

export function initWaylineState(): WaylineState {
	return {
		curCreateWayline: {
			waylineName: '创建航线',
			droneModel: '',
			domainTypeSubType: '',
			acc: '',
			templateType: TemplateTypeEnum.waypoint,
			templateStr: '航点航线',
			missionConfig: {
				flyToWaylineMode: 'safely',
				takeOffSecurityHeight: 20,
				takeOffRefPointAGLHeight: 60,
				globalTransitionalSpeed: 14,
				finishAction: 'goHome',
				autoRerouteInfoVal: true,
			},
			folder: {
				autoFlightSpeed: 14,
				globalWaypointTurnMode: 'toPointAndStopWithDiscontinuityCurvature',
				gimbalPitchMode: 'manual',
				globalWaypointHeadingParam: {
					waypointHeadingMode: 'followWayline',
					waypointHeadingPathMode: 'clockwise',
				},
				//如“<wpml:imageFormat>wide,ir</wpml:imageFormat>”
				payloadParam: {
					imageFormat: ['wide', 'zoom', 'ir'],
				},
			},
		},
		curCreateWaylineExt: {
			waylinePointHeightMode: 'hb',
			orientedPhotoMode: 'normalPhoto',
		},
		setHome: true,
		selectedPointIndex: null,
		selectedActionIndex: null,
	};
}
