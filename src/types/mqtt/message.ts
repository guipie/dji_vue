/**
 * 云端通过 SignalR 推送给前端的 MQTT 报文信封。
 * 与后端 `CloudMqData<T>` 一一对应（camelCase 序列化）。
 */
export interface Message<D extends BaseModel, M extends MethodType> {
	data: D; // 消息内容
	topic: string;
	method: M;
	/** 网关（机场）SN；飞行器 OSD 报文中为所属机场 SN */
	gateway: string;
	/** 飞行器 SN，仅 OSD / state 类报文有值 */
	droneSn?: string;
	tid: string;
	bid: string;
	/** 设备昵称 */
	ext: string;
}

/**
 * 消息类型（决定前端由哪个处理器消费）。
 *
 * 保留 `(string & {})` 以便后端新增 method 时无需同步改前端类型，
 * 未注册处理器的消息只会打印告警，不会中断其它消息的派发。
 */
export type MethodType = 'dockOsd' | 'droneOsd' | (string & {});
