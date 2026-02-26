import coordinateTurn from '/@/assets/wayline/coordinateTurn.svg';
import toPointAndStopWithDiscontinuityCurvature from '/@/assets/wayline/toPointAndStopWithDiscontinuityCurvature.svg';
import toPointAndStopWithContinuityCurvature from '/@/assets/wayline/toPointAndStopWithContinuityCurvature.svg';
import toPointAndPassWithContinuityCurvature from '/@/assets/wayline/toPointAndPassWithContinuityCurvature.svg';

import coordinateTurnLittle from '/@/assets/wayline/coordinateTurnLittle.png';
import toPointAndStopWithDiscontinuityCurvatureLittle from '/@/assets/wayline/toPointAndStopWithDiscontinuityCurvatureLittle.png';
import toPointAndStopWithContinuityCurvatureLittle from '/@/assets/wayline/toPointAndStopWithContinuityCurvatureLittle.png';
import toPointAndPassWithContinuityCurvatureLittle from '/@/assets/wayline/toPointAndPassWithContinuityCurvatureLittle.png';

import followWayline from '/@/assets/wayline/followWayline.png';
import manually from '/@/assets/wayline/manually.png';
import fixed from '/@/assets/wayline/fixed.png';
import smoothTransition from '/@/assets/wayline/smoothTransition.png';

export const globalWaypointTurnModeOptions = [
	{
		label: '协调转弯，不过点，提前转弯',
		value: 'coordinateTurn',
		img: coordinateTurn,
		littleImg: coordinateTurnLittle,
	},
	{
		label: '直线飞行，飞行器到点停',
		value: 'toPointAndStopWithDiscontinuityCurvature',
		img: toPointAndStopWithDiscontinuityCurvature,
		littleImg: toPointAndStopWithDiscontinuityCurvatureLittle,
	},
	{
		label: '曲线飞行，飞行器到点停',
		value: 'toPointAndStopWithContinuityCurvature',
		img: toPointAndStopWithContinuityCurvature,
		littleImg: toPointAndStopWithContinuityCurvatureLittle,
	},
	{
		label: '曲线飞行，飞行器过点不停',
		value: 'toPointAndPassWithContinuityCurvature',
		img: toPointAndPassWithContinuityCurvature,
		littleImg: toPointAndPassWithContinuityCurvatureLittle,
	},
];
export const waypointHeadingModeOptions = [
	{
		label: '跟随航线',
		value: 'followWayline',
		img: followWayline,
	},
	{
		label: '手动指定',
		value: 'manually',
		img: manually,
	},
	{
		label: '固定偏航角',
		value: 'fixed',
		img: fixed,
	},
	{
		label: '平滑过渡',
		value: 'smoothTransition',
		img: smoothTransition,
	},
];
