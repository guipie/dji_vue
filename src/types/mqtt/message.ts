export interface Message<D extends BaseModel, M extends MethodType> {
	data: D; // 消息内容
	topic: string;
	method: M;
	gateway: string;
	tid: string;
	bid: string;
	ext: string;
}

export type MethodType = 'dockOsd' | 'droneOsd';
