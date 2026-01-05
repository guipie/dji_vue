import coordinateTurn from '/@/assets/wayline/coordinateTurn.svg';
import toPointAndStopWithDiscontinuityCurvature from '/@/assets/wayline/toPointAndStopWithDiscontinuityCurvature.svg';
import toPointAndStopWithContinuityCurvature from '/@/assets/wayline/toPointAndStopWithContinuityCurvature.svg';
import toPointAndPassWithContinuityCurvature from '/@/assets/wayline/toPointAndPassWithContinuityCurvature.svg';
export const globalWaypointTurnModeOptions = [
	{
		label: '协调转弯，不过点，提前转弯',
		value: 'coordinateTurn',
		img: coordinateTurn,
	},
	{
		label: '直线飞行，飞行器到点停',
		value: 'toPointAndStopWithDiscontinuityCurvature',
		img: toPointAndStopWithDiscontinuityCurvature,
	},
	{
		label: '曲线飞行，飞行器到点停',
		value: 'toPointAndStopWithContinuityCurvature',
		img: toPointAndStopWithContinuityCurvature,
	},
	{
		label: '曲线飞行，飞行器过点不停',
		value: 'toPointAndPassWithContinuityCurvature',
		img: toPointAndPassWithContinuityCurvature,
	},
];
